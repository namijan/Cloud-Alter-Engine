const express = require('express');
const session = require('cookie-session');
const axios = require('axios');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const dotenv = require('dotenv');
const fs = require('fs');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '.env') });

// Simple JSON persistence for change tracking & user preferences
const DATA_DIR = path.join(__dirname, 'data');
const TRACKER_PATH = path.join(DATA_DIR, 'tracker.json');
const PREFS_PATH = path.join(DATA_DIR, 'preferences.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(TRACKER_PATH)) fs.writeFileSync(TRACKER_PATH, JSON.stringify({}));
if (!fs.existsSync(PREFS_PATH)) fs.writeFileSync(PREFS_PATH, JSON.stringify({}));

function getTracker() {
    try {
        return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    } catch (e) { return {}; }
}

function saveTracker(data) {
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(data, null, 2));
}

function getPreferences() {
    try {
        return JSON.parse(fs.readFileSync(PREFS_PATH, 'utf8'));
    } catch (e) { return {}; }
}

function savePreferences(data) {
    fs.writeFileSync(PREFS_PATH, JSON.stringify(data, null, 2));
}

function calculateHash(data) {
    if (!data) return '';
    // Sort keys to ensure deterministic stringification
    const sorted = Object.keys(data).sort().reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
    }, {});
    return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
}

// In-memory cache for Excel rows to speed up per-row refreshes
const excelCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds (prevent stale drift during active sessions)

async function getCachedExcelRows(projectId, versionId, token) {
    const cached = excelCache.get(versionId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.rows;
    }

    // Fetch and parse
    const excelVersionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const storageId = excelVersionRes.data.data.relationships.storage.data.id;
    const bucketKey = storageId.split('/')[0].split(':').pop();
    const objectKey = storageId.split('/')[1];

    const signedRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3download`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const downloadRes = await axios.get(signedRes.data.url, { responseType: 'arraybuffer' });
    const workbook = xlsx.read(downloadRes.data, { type: 'buffer' });
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    excelCache.set(versionId, { rows, timestamp: Date.now() });
    return rows;
}

const {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_CALLBACK_URL,
    SERVER_PORT,
    SESSION_SECRET,
    HUB_NAME,
    PROJECT_NAME,
    HUB_ID,
    PROJECT_ID
} = process.env;

const app = express();
const upload = multer({ dest: 'uploads/' });

// In-memory store for pending commits
const pendingCommits = new Map();

app.use(express.json());
app.use(session({
    name: 'aps_session',
    keys: [SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000
}));

app.use((req, res, next) => {
    console.log(`[Backend Log] ${req.method} ${req.url}`);
    next();
});

// --- Authentication ---

app.get('/api/auth/login', (req, res) => {
    // Legacy route redirecting to new one to bypass cache
    res.redirect('/api/auth/renew-login');
});

app.get('/api/auth/renew-login', (req, res) => {
    const scopes = 'data:read data:write data:create bucket:create bucket:read';
    const url = `https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${APS_CLIENT_ID}&redirect_uri=${encodeURIComponent(APS_CALLBACK_URL)}&scope=${encodeURIComponent(scopes)}`;
    console.log(`[Auth Renew] Redirecting to: ${url}`);

    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.redirect(url);
});

app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token',
            new URLSearchParams({
                client_id: APS_CLIENT_ID,
                client_secret: APS_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: APS_CALLBACK_URL
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        req.session.token = response.data.access_token;
        req.session.refresh_token = response.data.refresh_token;
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Login failed');
    }
});

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/test', (req, res) => res.send('Server is alive'));

async function refreshToken(req) {
    if (!req.session.refresh_token) throw new Error('No refresh token');
    console.log('[Backend Log] Refreshing token...');
    const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token',
        new URLSearchParams({
            client_id: APS_CLIENT_ID,
            client_secret: APS_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: req.session.refresh_token
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    req.session.token = response.data.access_token;
    req.session.refresh_token = response.data.refresh_token;
    return response.data.access_token;
}

app.get('/api/auth/profile', async (req, res) => {
    try {
        const token = await getUserToken(req);
        if (!token) return res.json({ status: 'Logged Out' });

        const response = await axios.get('https://developer.api.autodesk.com/userprofile/v1/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { firstName, lastName, profileImages, userName, emailId } = response.data;
        const name = (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : (userName || emailId || 'User');

        res.json({
            name,
            email: emailId,
            userName,
            picture: profileImages?.sizeX40,
            status: 'Logged In'
        });
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.json({ status: 'Error', message: err.message });
    }
});

app.get('/api/auth/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

app.get('/api/auth/token', async (req, res) => {
    try {
        const token = await getUserToken(req);
        res.json({
            access_token: token,
            expires_in: 3600
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- Data Management ---

async function getInternalToken() {
    const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token',
        new URLSearchParams({
            client_id: APS_CLIENT_ID,
            client_secret: APS_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'data:read data:write data:create bucket:create bucket:read code:all'
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
}

async function getUserToken(req) {
    if (!req.session.token) {
        if (req.session.refresh_token) {
            console.log('[Backend Log] No active token, attempting refresh...');
            return await refreshToken(req);
        }
        throw new Error('Unauthorized');
    }
    return req.session.token;
}

app.get('/api/acc/hubs', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const response = await axios.get('https://developer.api.autodesk.com/project/v1/hubs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        res.json(response.data.data.map(h => ({
            id: h.id,
            name: h.attributes.name
        })));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/acc/projects', async (req, res) => {
    const { hubId } = req.query;
    try {
        const token = await getUserToken(req);
        const response = await axios.get(`https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        res.json(response.data.data.map(p => ({
            id: p.id,
            name: p.attributes.name
        })));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/user/preferences', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const profileRes = await axios.get('https://developer.api.autodesk.com/userprofile/v1/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const userId = profileRes.data.emailId || profileRes.data.userName;
        const prefs = getPreferences();
        res.json(prefs[userId] || {});
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/user/preferences', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const profileRes = await axios.get('https://developer.api.autodesk.com/userprofile/v1/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const userId = profileRes.data.emailId || profileRes.data.userName;
        const currentPrefs = getPreferences();
        currentPrefs[userId] = { ...currentPrefs[userId], ...req.body };
        savePreferences(currentPrefs);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/acc/excel-files', async (req, res) => {
    const { projectId } = req.query;
    console.log('--- Debug: Excel Discovery ---');
    console.log('Project ID:', projectId);

    async function fetchData(attempt = 1) {
        try {
            const token = await getUserToken(req);
            let hubId = HUB_ID;
            if (!hubId) {
                const hubsRes = await axios.get('https://developer.api.autodesk.com/project/v1/hubs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const hub = hubsRes.data.data.find(h => h.attributes.name.trim() === HUB_NAME.trim());
                if (!hub) throw new Error('Hub not found');
                hubId = hub.id;
            }

            const foldersRes = await axios.get(`https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects/${projectId}/topFolders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Top Folders Found:', foldersRes.data.data.map(f => f.attributes.displayName));
            const projectFiles = foldersRes.data.data.find(f => f.attributes.displayName === 'Project Files');
            if (!projectFiles) {
                console.error('Project Files folder NOT found');
                throw new Error('Project Files not found');
            }

            async function getFilesRecursive(folderId, currentToken, depth = 0) {
                if (depth > 3) return []; // Limit depth
                console.log('  '.repeat(depth) + 'Scanning folder:', folderId);
                const res = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${folderId}/contents`, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });

                let excels = res.data.data.filter(i => i.type === 'items' && i.attributes.displayName.toLowerCase().endsWith('.xlsx'));
                const subfolders = res.data.data.filter(i => i.type === 'folders');

                for (const sub of subfolders) {
                    const subFiles = await getFilesRecursive(sub.id, currentToken, depth + 1);
                    excels = excels.concat(subFiles);
                }
                return excels;
            }

            const allExcels = await getFilesRecursive(projectFiles.id, token);
            console.log('Total Excels Found:', allExcels.length);

            return allExcels.map(i => {
                const tipVersionId = i.relationships.tip.data.id;
                // Robust version extraction: try attributes, then regex, then fallback
                let v = i.attributes.versionNumber;
                if (!v) {
                    const match = tipVersionId.match(/[?&]version=(\d+)/);
                    v = match ? match[1] : null;
                }
                if (!v) v = '1';

                if (v === '1') console.log(`[Excel Discovery Debug] ${i.attributes.displayName} defaulted to V1. Full URN: ${tipVersionId}`);

                console.log(`[Excel Discovery] ${i.attributes.displayName} -> V${v}`);
                return {
                    id: i.id,
                    name: i.attributes.displayName,
                    versionId: tipVersionId,
                    version: v
                };
            });
        } catch (err) {
            if (err.response?.status === 401 && attempt < 2) {
                console.log('[Backend Log] 401 detected in excel-files, retrying with fresh token...');
                try {
                    await refreshToken(req);
                    return await fetchData(attempt + 1);
                } catch (refreshErr) {
                    console.error('[Backend Log] Token refresh failed:', refreshErr.message);
                    throw err; // Throw original 401 if refresh fails
                }
            }
            throw err;
        }
    }

    try {
        const results = await fetchData();
        res.json(results);
    } catch (err) {
        console.error('Error in excel-files:', err.message);
        if (err.response?.status === 401) {
            return res.status(401).send('Unauthorized');
        }
        res.status(err.response?.status || 500).send(err.message);
    }
});

app.get('/api/acc/excel-data', async (req, res) => {
    try {
        const { projectId, versionId } = req.query;
        if (!projectId || !versionId) return res.status(400).send('Missing params');

        const token = await getUserToken(req);
        const rows = await getCachedExcelRows(projectId, versionId, token);
        res.json(rows);
    } catch (err) {
        console.error('Excel Data Fetch Error:', err.message);
        res.status(500).send(err.message);
    }
});

app.post('/api/automation/match', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const { hubId, projectId, excelVersionId } = req.body;
        console.log('Match request:', { projectId, excelVersionId });

        // 1. Fetch Excel Rows (with caching)
        console.log('1. Fetching Excel rows...');
        const rows = await getCachedExcelRows(projectId, excelVersionId, token);
        console.log('   Rows found:', rows.length);

        // 3. Get Drawings Folder
        console.log('4. Searching for Drawings folder...');
        const foldersRes = await axios.get(`https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects/${projectId}/topFolders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const projectFiles = foldersRes.data.data.find(f => f.attributes.displayName === 'Project Files');

        const contentsRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${projectFiles.id}/contents`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const drawingsFolder = contentsRes.data.data.find(f => f.attributes.displayName === 'Drawings');
        let files = [];
        if (drawingsFolder) {
            console.log('   Drawings folder found. Listing contents...');
            const drgContentsRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${drawingsFolder.id}/contents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            files = drgContentsRes.data.data.filter(i => i.type === 'items' && i.attributes.displayName.endsWith('.dwg'));
        } else {
            console.warn('   Drawings folder NOT found');
        }

        console.log('5. Matching rows...');
        const tracker = getTracker();
        const matches = rows.map(row => {
            const match = files.find(f => f.attributes.displayName.split('.')[0] === row.DrawingName);
            let syncStatus = 'Pending Changes';

            if (match) {
                const currentHash = calculateHash(row);
                // Tip version ID looks like "...?version=3"
                const latestVersion = match.relationships.tip.data.id.split('version=')[1] || '1';
                const record = tracker[match.id];

                if (record) {
                    const isHashMatch = record.excelHash === currentHash;
                    const isVersionMatch = String(record.version) === String(latestVersion);
                    syncStatus = (isHashMatch && isVersionMatch) ? 'Up to date' : 'Pending Changes';

                    if (syncStatus === 'Pending Changes') {
                        console.log(`[Sync Debug] ${row.DrawingName}: Pending. HashMatch: ${isHashMatch} (Stored: ${record.excelHash}, Current: ${currentHash}), VerMatch: ${isVersionMatch} (Stored: ${record.version}, Current: ${latestVersion})`);
                    }
                }
            }

            return {
                excelRow: row,
                matchedFile: match ? {
                    id: match.id,
                    name: match.attributes.displayName,
                    versionId: match.relationships.tip.data.id,
                    version: match.relationships.tip.data.id.split('version=')[1] || '1'
                } : null,
                syncStatus: match ? syncStatus : 'No Match'
            };
        });

        console.log('Match complete. Matches found:', matches.filter(m => m.matchedFile).length);
        res.json(matches);
    } catch (err) {
        console.error('Error in automation-match:', err.message);
        if (err.message === 'Unauthorized' || err.response?.status === 401) {
            return res.status(401).send('Unauthorized');
        }
        res.status(500).send(err.response?.data || err.message);
    }
});

app.post('/api/automation/sync-item', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const { projectId, itemId, drawingName, excelVersionId } = req.body;

        // 1. Get latest Drawing info
        // 1. Get latest Drawing info
        const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const latestVersionId = itemRes.data.data.relationships.tip.data.id;
        const latestVersion = latestVersionId.split('version=')[1] || '1';

        // 2. Resolve the LATEST Excel version for the lineage
        // First get the itemId of the spreadsheet from the provided versionId
        const excelVersionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(excelVersionId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const excelItemId = excelVersionRes.data.data.relationships.item.data.id;

        // Now get the current tip of that spreadsheet
        const excelItemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(excelItemId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const currentExcelTipId = excelItemRes.data.data.relationships.tip.data.id;

        // 3. Get latest Excel data from the TRULY latest version
        const excelRows = await getCachedExcelRows(projectId, currentExcelTipId, token);
        const latestExcelRow = excelRows.find(r => r.DrawingName === drawingName);

        if (!latestExcelRow) {
            return res.json({ syncStatus: 'Excel Row Missing', latestVersion, versionId: latestVersionId });
        }

        const currentHash = calculateHash(latestExcelRow);
        const tracker = getTracker();
        const record = tracker[itemId];

        let syncStatus = 'Pending Changes';
        if (record) {
            const isHashMatch = record.excelHash === currentHash;
            const isVersionMatch = String(record.version) === String(latestVersion);
            console.log(`[Sync-Item Debug] ${drawingName}: HashMatch: ${isHashMatch}, VerMatch: ${isVersionMatch} (StoredVer: ${record.version}, Latest: ${latestVersion})`);
            if (isHashMatch && isVersionMatch) {
                syncStatus = 'Up to date';
            }
        }

        res.json({
            syncStatus,
            latestVersion,
            versionId: latestVersionId,
            excelRow: latestExcelRow // Return updated row data if it changed
        });
    } catch (err) {
        console.error('Error in sync-item:', err.message);
        res.status(500).send(err.message);
    }
});

// --- Design Automation ---

app.post('/api/automation/update', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const internalToken = await getInternalToken();
        const { projectId, versionId, excelRow, excelVersionId } = req.body;
        const drawingName = excelRow.DrawingName;
        console.log('--- Update Request (JIT Enabled) ---', { versionId, drawingName, excelVersionId });

        let finalExcelRow = excelRow;

        // JIT Data Retrieval: If excelVersionId is provided, fetch the TRULY latest data
        if (excelVersionId) {
            try {
                console.log(`[JIT] Fetching latest row for ${drawingName} from Excel version: ${excelVersionId}`);
                const latestRows = await getCachedExcelRows(projectId, excelVersionId, token);
                const freshRow = latestRows.find(r => String(r.DrawingName) === String(drawingName));
                if (freshRow) {
                    console.log(`[JIT] Successfully retrieved fresh data for ${drawingName}`);
                    finalExcelRow = freshRow;
                } else {
                    console.warn(`[JIT] Could not find row for ${drawingName} in Excel version ${excelVersionId}. Falling back to client-provided data.`);
                }
            } catch (jitErr) {
                console.error(`[JIT Error] Failed to fetch fresh data: ${jitErr.message}. Falling back to client-provided data.`);
            }
        }

        if (process.env.MOCK_MODE === 'true') {
            console.log('Mocking automation update...');
            return res.json({ workItemId: 'mock-id' });
        }

        // 1. Get Source Version Details
        const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const itemId = versionRes.data.data.relationships.item.data.id;
        const sourceStorageId = versionRes.data.data.relationships.storage.data.id;
        const sourceExtensionType = versionRes.data.data.attributes.extension.type;

        // 1.5 Get Parent Folder of Item
        const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const folderId = itemRes.data.data.relationships.parent.data.id;

        // 2. Create NEW storage in ACC for the result
        console.log('2. Creating result storage in ACC in folder:', folderId);
        const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, {
            jsonapi: { version: '1.0' },
            data: {
                type: 'objects',
                attributes: {
                    name: versionRes.data.data.attributes.displayName
                },
                relationships: {
                    target: {
                        data: {
                            type: 'folders',
                            id: folderId
                        }
                    }
                }
            }
        }, { headers: { Authorization: `Bearer ${token}` } });

        const accStorageId = storageRes.data.data.id;
        console.log('2. Storage created:', accStorageId);

        // 3. Prepare WorkItem
        const bucketKey = sourceStorageId.split('/')[0].split(':').pop();
        const objectKey = sourceStorageId.split('/')[1];

        const signedDownload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3download`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const accBucket = accStorageId.split('/')[0].split(':').pop();
        const accObject = accStorageId.split('/')[1];
        const signedUpload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const paramsJson = {
            BlockName: finalExcelRow.BlockName,
            ...finalExcelRow
        };

        const workItem = {
            activityId: `${APS_CLIENT_ID}.TitleBlockActivity+prod`,
            arguments: {
                hostDwg: {
                    url: signedDownload.data.url,
                    localName: 'input.dwg'
                },
                params: {
                    url: `data:application/json;base64,${Buffer.from(JSON.stringify(paramsJson)).toString('base64')}`,
                    localName: 'params.json'
                },
                result: {
                    verb: 'put',
                    url: signedUpload.data.urls[0],
                    localName: 'input.dwg'
                }
            }
        };

        const wiRes = await axios.post('https://developer.api.autodesk.com/da/us-east/v3/workitems', workItem, {
            headers: { Authorization: `Bearer ${internalToken}` }
        });

        pendingCommits.set(wiRes.data.id, {
            projectId,
            itemId,
            versionId,
            excelRow: finalExcelRow,
            storageId: accStorageId,
            uploadKey: signedUpload.data.uploadKey,
            extensionType: sourceExtensionType,
            fileName: versionRes.data.data.attributes.displayName,
            extension: versionRes.data.data.attributes.extension,
            logs: [
                { time: new Date().toISOString(), message: 'Task submitted to AutoCAD engine.' },
                { time: new Date().toISOString(), message: `ACC Storage created: ${accStorageId}` }
            ]
        });
        res.json({ workItemId: wiRes.data.id });
    } catch (err) {
        console.error('Error in automation/update:', err.response?.data || err.message);
        res.status(500).send(err.response?.data || err.message);
    }
});

// Helper to perform the actual ACC commitment
async function commitVersionInternal(workItemId, req) {
    const commitInfo = pendingCommits.get(workItemId);
    if (!commitInfo || commitInfo.committed) return;

    try {
        commitInfo.logs.push({ time: new Date().toISOString(), message: 'Finalizing storage and saving new version to ACC...' });
        const userToken = await getUserToken(req);

        // 1. Finalize OSS Upload if needed
        const accBucketKey = 'wip.dm.prod';
        const accObjectKey = commitInfo.storageId.split('/')[1];

        if (commitInfo.uploadKey) {
            try {
                console.log('[OSS] Finalizing upload for auto-commit:', commitInfo.uploadKey);
                await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucketKey}/objects/${encodeURIComponent(accObjectKey)}/signeds3upload`, {
                    uploadKey: commitInfo.uploadKey
                }, { headers: { Authorization: `Bearer ${userToken}` } });
                console.log('[OSS] Finalization SUCCESS.');
            } catch (e) {
                // Ignore "Already completed" errors
            }
        }

        // 2. Commit Version (using high-reliability global endpoint)
        const versionsUrl = `https://developer.api.autodesk.com/data/v1/projects/${commitInfo.projectId}/versions`;
        const payload = {
            jsonapi: { version: '1.0' },
            data: {
                type: 'versions',
                attributes: {
                    name: commitInfo.fileName,
                    displayName: commitInfo.fileName,
                    extension: {
                        type: commitInfo.extensionType || 'versions:autodesk.bim360:File',
                        version: '1.0'
                    }
                },
                relationships: {
                    item: { data: { type: 'items', id: commitInfo.itemId } },
                    storage: { data: { type: 'objects', id: commitInfo.storageId } }
                }
            }
        };

        let commitRes;
        let retries = 10;
        let delay = 10000;

        while (retries > 0) {
            try {
                commitRes = await axios.post(versionsUrl, payload, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
                console.log('[Auto-Commit] SUCCESS:', commitRes.data.data.id);
                commitInfo.committed = true;
                commitInfo.newVersion = commitRes.data.data.attributes.versionNumber;

                // PERSIST TO TRACKER
                const tracker = getTracker();
                tracker[commitInfo.itemId] = {
                    excelHash: calculateHash(commitInfo.excelRow),
                    version: commitRes.data.data.attributes.versionNumber,
                    updatedAt: new Date().toISOString()
                };
                saveTracker(tracker);

                commitInfo.logs.push({ time: new Date().toISOString(), message: `Successfully updated to ACC Version ${commitRes.data.data.attributes.versionNumber}` });
                break;
            } catch (err) {
                if (err.response?.status === 404 && retries > 1) {
                    console.log(`[Auto-Commit] 404 lag, waiting ${delay / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    retries--;
                } else {
                    throw err;
                }
            }
        }
    } catch (err) {
        const errorMsg = err.response?.data?.developerMessage || err.message;
        console.error('[Auto-Commit Error]', JSON.stringify(err.response?.data || err.message, null, 2));
        commitInfo.logs.push({ time: new Date().toISOString(), message: `Auto-Commit Failed: ${errorMsg}` });
    }
}

app.get('/api/automation/status/:id', async (req, res) => {
    if (req.params.id === 'mock-id') {
        return res.json({ status: 'success' });
    }
    try {
        const internalToken = await getInternalToken();
        const response = await axios.get(`https://developer.api.autodesk.com/da/us-east/v3/workitems/${req.params.id}`, {
            headers: { Authorization: `Bearer ${internalToken}` }
        });

        const status = response.data.status;
        const commitInfo = pendingCommits.get(req.params.id);

        if (commitInfo) {
            if (status === 'inprogress' && !commitInfo.logs.find(l => l.message.includes('Processing'))) {
                commitInfo.logs.push({ time: new Date().toISOString(), message: 'AutoCAD engine is processing the drawing...' });
            }

            if (status === 'success' && !commitInfo.committed && !commitInfo.committing) {
                commitInfo.committing = true; // Guard against concurrent poll triggers
                commitVersionInternal(req.params.id, req); // Run in background but state is updated in commitInfo
            } else if (status === 'failed') {
                commitInfo.logs.push({ time: new Date().toISOString(), message: 'AutoCAD engine reported a failure.' });
            }
        }

        let finalStatus = status;
        if (commitInfo?.committed) {
            finalStatus = 'finished';
        } else if (commitInfo?.committing) {
            finalStatus = 'committing';
        }

        res.json({
            status: finalStatus,
            committed: commitInfo?.committed || false,
            newVersion: commitInfo?.newVersion,
            logs: commitInfo?.logs || []
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/automation/commit', async (req, res) => {
    // Keep this endpoint as manual fallback if needed
    try {
        const { workItemId } = req.body;
        await commitVersionInternal(workItemId, req);
        const commitInfo = pendingCommits.get(workItemId);
        res.json({ success: commitInfo?.committed, logs: commitInfo?.logs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown', err);
});

const PORT = 5175;
const HOST = '0.0.0.0'; // Use explicit IPv4 for better compatibility

// Catch-all handler for the SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
    console.log(`Cloud Alter Engine Unified on Port ${PORT} (Dual-Stack)`);
});
