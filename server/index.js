const express = require('express');
const session = require('cookie-session');
const axios = require('axios');
const path = require('path');
const xlsx = require('xlsx');
const dotenv = require('dotenv');
const fs = require('fs');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5175;

const DATA_DIR = path.join(__dirname, 'data');
const TRACKER_PATH = path.join(DATA_DIR, 'tracker.json');
const PREFS_PATH = path.join(DATA_DIR, 'preferences.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(TRACKER_PATH)) fs.writeFileSync(TRACKER_PATH, JSON.stringify({}));
if (!fs.existsSync(PREFS_PATH)) fs.writeFileSync(PREFS_PATH, JSON.stringify({}));

function getTracker() { try { return JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8')); } catch (e) { return {}; } }
function saveTracker(data) { fs.writeFileSync(TRACKER_PATH, JSON.stringify(data, null, 2)); }
function getPreferences() { try { return JSON.parse(fs.readFileSync(PREFS_PATH, 'utf8')); } catch (e) { return {}; } }
function savePreferences(data) { fs.writeFileSync(PREFS_PATH, JSON.stringify(data, null, 2)); }

function calculateHash(data) {
    if (!data) return '';
    const sorted = Object.keys(data).sort().reduce((obj, key) => { obj[key] = data[key]; return obj; }, {});
    return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
}

const excelCache = new Map();
const CACHE_TTL = 30 * 1000;

async function getCachedExcelRows(projectId, versionId, token) {
    const cached = excelCache.get(versionId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) return cached.rows;
    const excelVersionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const storageId = excelVersionRes.data.data.relationships.storage.data.id;
    const bucketKey = storageId.split('/')[0].split(':').pop();
    const objectKey = storageId.split('/')[1];
    const signedRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3download`, { headers: { Authorization: `Bearer ${token}` } });
    const downloadRes = await axios.get(signedRes.data.url, { responseType: 'arraybuffer' });
    const workbook = xlsx.read(downloadRes.data, { type: 'buffer' });
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    excelCache.set(versionId, { rows, timestamp: Date.now() });
    return rows;
}

const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_CALLBACK_URL, SESSION_SECRET, HUB_NAME, HUB_ID, CLIENT_URL } = process.env;

const app = express();
const pendingCommits = new Map();

app.use(express.json());
app.use(session({ name: 'aps_session', keys: [SESSION_SECRET], maxAge: 24 * 60 * 60 * 1000 }));

app.use((req, res, next) => { console.log(`[Backend Log] ${req.method} ${req.url}`); next(); });

app.get('/api/test', (req, res) => res.send('OK'));

async function extractDrawingAttributes(versionId, token) {
    const urn = Buffer.from(versionId).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    // Determine regional endpoint based on URN
    let regionPath = '';
    if (versionId.includes('wipprodem')) regionPath = 'regions/eu/';
    else if (versionId.includes('wipprodanz')) regionPath = 'regions/apac/';
    
    const mdBaseUrl = `https://developer.api.autodesk.com/modelderivative/v2/${regionPath}designdata`;
    
    let views = [];
    console.log(`[MD Extract] Starting extraction for URN: ${urn} (Region: ${regionPath || 'US'})`);

    // 1. Ensure Translation is triggered and finished
    try {
        const metadataTest = await axios.get(`${mdBaseUrl}/${urn}/metadata`, { headers: { Authorization: `Bearer ${token}` } });
        views = metadataTest.data.data?.metadata || [];
    } catch (e) { }

    if (views.length === 0) {
        console.log(`[MD Extract] No metadata found. Triggering Translation Job...`);
        try {
            await axios.post(`${mdBaseUrl}/job`, {
                input: { urn },
                output: { formats: [{ type: 'svf', views: ['2d', '3d'], advanced: { convertAutocadDrawingsToV7: true } }] }
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) { }
    }

    // Await success
    console.log(`[MD Extract] Awaiting rigorous SVF Translation...`);
    for (let i = 0; i < 60; i++) {
        try {
            const manifestRes = await axios.get(`${mdBaseUrl}/${urn}/manifest`, { headers: { Authorization: `Bearer ${token}` } });
            if (manifestRes.data.status === 'success') break;
            if (manifestRes.data.status === 'failed') break;
        } catch (manifestErr) {
            console.error(`[MD Extract Manifest Error]`, manifestErr.response?.data || manifestErr.message);
            // If it's a 401 or 403, try with internal token as fallback
            if (manifestErr.response?.status === 401 || manifestErr.response?.status === 403) {
                console.log(`[MD Extract] Falling back to internal token...`);
                try {
                    const internalToken = await getInternalToken();
                    const fallbackRes = await axios.get(`${mdBaseUrl}/${urn}/manifest`, { headers: { Authorization: `Bearer ${internalToken}` } });
                    if (fallbackRes.data.status === 'success') break;
                    if (fallbackRes.data.status === 'failed') break;
                } catch (fallbackErr) {
                    console.error(`[MD Extract Fallback Error]`, fallbackErr.response?.data || fallbackErr.message);
                    throw fallbackErr; // If fallback fails too, throw it
                }
            } else {
                throw manifestErr;
            }
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    if (views.length === 0) {
        const metadataRes = await axios.get(`${mdBaseUrl}/${urn}/metadata`, { headers: { Authorization: `Bearer ${token}` } });
        views = metadataRes.data.data?.metadata || [];
    }

    // 2. Extract properties from all views
    let allObjects = [];
    let discoveryComplete = false;
    await Promise.all(views.map(async (view) => {
        try {
            for (let polls = 0; polls < 15; polls++) {
                if (discoveryComplete) return;
                const propRes = await axios.get(`${mdBaseUrl}/${urn}/metadata/${view.guid}/properties?forceget=true`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: s => s < 500 });
                if (propRes.status === 200 && propRes.data?.data?.collection) {
                    const collection = propRes.data.data.collection;
                    if (collection.length > 10 || polls === 14) {
                        allObjects = allObjects.concat(collection);
                        if (collection.some(o => (o.name || "").toLowerCase().includes('titleblock'))) discoveryComplete = true;
                        break;
                    }
                }
                await new Promise(r => setTimeout(r, 3000));
            }
        } catch (e) { }
    }));

    // 3. Identification
    let titleBlockObj = allObjects.find(obj => {
        const n = (obj.name || "").toLowerCase();
        return n.includes('titleblock') || n.includes('title block') || n.includes('tb');
    });

    if (!titleBlockObj && allObjects.length > 0) {
        console.log(`[MD Extract] Forensic Mode...`);
        for (const skeleton of allObjects.slice(0, 10)) {
            try {
                const singleRes = await axios.get(`${mdBaseUrl}/${urn}/metadata/${views[0].guid}/properties?objectid=${skeleton.objectid}`, { headers: { Authorization: `Bearer ${token}` } });
                const fullObj = singleRes.data?.data?.collection?.[0];
                if (fullObj?.properties && Object.keys(fullObj.properties).length > 5) {
                    const n = (fullObj.name || "").toLowerCase();
                    if (n.includes('titleblock') || n.includes('title block') || n.includes('tb')) { titleBlockObj = fullObj; break; }
                }
            } catch (e) { }
        }
    }

    if (!titleBlockObj) return {};

    const cadData = {};
    Object.values(titleBlockObj.properties || {}).forEach(cat => { if (typeof cat === 'object') Object.assign(cadData, cat); });
    console.log(`[MD Extract] Identified ${Object.keys(cadData).length} properties for ${titleBlockObj.name}:`, Object.keys(cadData));
    return cadData;
}

async function getACCAttributesInternal(projectId, versionId, token) {
    try {
        const cleanProjectId = projectId.startsWith('b.') ? projectId.substring(2) : projectId;
        const decodedVersionId = versionId.includes('%') ? decodeURIComponent(versionId) : versionId;
        const cleanVersionId = decodedVersionId.trim();
        const vUrl = `https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(cleanVersionId)}`;
        const versionRes = await axios.get(vUrl, { headers: { Authorization: `Bearer ${token}` } });
        const itemId = versionRes.data.data.relationships.item.data.id;
        const iUrl = `https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`;
        const itemRes = await axios.get(iUrl, { headers: { Authorization: `Bearer ${token}` } });
        const folderUrn = itemRes.data.data.relationships.parent.data.id;
        const defUrl = `https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderUrn)}/custom-attribute-definitions`;
        const defsRes = await axios.get(defUrl, { headers: { Authorization: `Bearer ${token}` } }).catch(async (e) => {
            const folderId = folderUrn.split(':').pop();
            return await axios.get(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderId)}/custom-attribute-definitions`, { headers: { Authorization: `Bearer ${token}` } });
        });
        const defs = defsRes.data.results || [];

        // Fetch Custom Attribute Values using batch-get (Standard retrieval method)
        const vBatchUrl = `https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/versions:batch-get`;
        const valuesRes = await axios.post(vBatchUrl, { urns: [cleanVersionId] }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        const values = valuesRes.data.results?.[0]?.customAttributes || [];

        const result = {};
        defs.forEach(d => {
            const val = values.find(v => v.id === d.id);
            result[d.name] = val ? val.value : "";
        });
        console.log(`[ACC Internal] Result keys: ${Object.keys(result).length}`);
        return result;
    } catch (err) {
        console.error('[ACC Internal Error]', err.response?.data || err.message);
        throw err;
    }
}

app.get('/api/acc/get-attributes', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const { projectId, versionId } = req.query;
        const result = await getACCAttributesInternal(projectId, versionId, token);
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.response?.data || err.message }); }
});

app.post('/api/automation/preview-sync', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const { projectId, drawingVersionId, excelVersionId, drawingName, sourceType, targetType } = req.body;
        let sourceData = {}; let targetData = {};
        if (sourceType === 'excel') {
            const rows = await getCachedExcelRows(projectId, excelVersionId, token);
            sourceData = rows.find(r => String(r.DrawingName) === String(drawingName)) || {};
        } else if (sourceType === 'acc') {
            sourceData = await getACCAttributesInternal(projectId, drawingVersionId, token);
        } else if (sourceType === 'drawing') { sourceData = await extractDrawingAttributes(drawingVersionId, token); }
        if (targetType === 'drawing') {
            // Optimization: Skip interrogation if pushing to drawing
            console.log(`[Preview Sync] Skipping interrogation for drawing target: ${drawingName}`);
            targetData = {};
        } else if (targetType === 'excel') {
            const rows = await getCachedExcelRows(projectId, excelVersionId, token);
            targetData = rows.find(r => String(r.DrawingName) === String(drawingName)) || {};
        } else if (targetType === 'acc') {
            targetData = await getACCAttributesInternal(projectId, drawingVersionId, token);
        }
        const keys = Object.keys(sourceData).concat(Object.keys(targetData)).filter((v, i, a) => a.indexOf(v) === i);
        const diff = keys.filter(k => k !== 'DrawingName' && k !== 'BlockName').map(key => {
            const sVal = String(sourceData[key] || ''); const tVal = String(targetData[key] || '');
            return { key, source: sVal, target: tVal, changed: sVal !== tVal };
        });
        res.json({ success: true, drawingName, diff, sourceData, targetData });
    } catch (err) {
        console.error('[Preview Sync Error]', err.response ? JSON.stringify(err.response.data) : err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/login', (req, res) => res.redirect('/api/auth/renew-login'));
app.get('/api/auth/renew-login', (req, res) => {
    const scopes = 'data:read data:write data:create bucket:create bucket:read viewables:read';
    const url = `https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${APS_CLIENT_ID}&redirect_uri=${encodeURIComponent(APS_CALLBACK_URL)}&scope=${encodeURIComponent(scopes)}`;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.redirect(url);
});

app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: APS_CALLBACK_URL }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        req.session.token = response.data.access_token;
        req.session.refresh_token = response.data.refresh_token;
        req.session.expires_at = Date.now() + (response.data.expires_in * 1000);
        res.redirect(CLIENT_URL || '/');
    } catch (err) { res.status(500).send('Login failed'); }
});

app.use(express.static(path.join(__dirname, '../client/dist')));

async function refreshToken(req) {
    if (!req.session.refresh_token) throw new Error('No refresh token');
    try {
        const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: req.session.refresh_token }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        req.session.token = response.data.access_token;
        req.session.refresh_token = response.data.refresh_token;
        req.session.expires_at = Date.now() + (response.data.expires_in * 1000);
        return response.data.access_token;
    } catch (e) {
        req.session = null;
        throw new Error('Failed to refresh token: Unauthorized');
    }
}

async function getUserToken(req) {
    if (!req.session.token || !req.session.expires_at || Date.now() >= req.session.expires_at - 60000) { 
        if (req.session.refresh_token) {
            return await refreshToken(req); 
        }
        throw new Error('Unauthorized'); 
    }
    return req.session.token;
}

let cachedInternalToken = null;
let internalTokenExpiresAt = 0;

async function getInternalToken() {
    if (cachedInternalToken && Date.now() < internalTokenExpiresAt - 60000) {
        return cachedInternalToken;
    }
    const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET, grant_type: 'client_credentials', scope: 'data:read data:write data:create bucket:create bucket:read code:all' }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    cachedInternalToken = response.data.access_token;
    internalTokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
    return cachedInternalToken;
}

app.get('/api/auth/token', async (req, res) => {
    try {
        const token = await getUserToken(req);
        res.json({ access_token: token, expires_in: 3599 });
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.get('/api/auth/profile', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const response = await axios.get('https://developer.api.autodesk.com/userprofile/v1/users/@me', { headers: { Authorization: `Bearer ${token}` } });
        const { firstName, lastName, profileImages } = response.data;
        res.json({ name: `${firstName || ''} ${lastName || ''}`.trim(), picture: profileImages?.sizeX40, status: 'Logged In' });
    } catch (err) { res.json({ status: 'Logged Out' }); }
});

app.get('/api/auth/logout', (req, res) => { req.session = null; res.redirect(CLIENT_URL || '/'); });

app.get('/api/acc/hubs', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const response = await axios.get('https://developer.api.autodesk.com/project/v1/hubs', { headers: { Authorization: `Bearer ${token}` } });
        res.json(response.data.data.map(h => ({ id: h.id, name: h.attributes.name })));
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.get('/api/acc/projects', async (req, res) => {
    const { hubId } = req.query;
    try {
        const token = await getUserToken(req);
        const response = await axios.get(`https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects`, { headers: { Authorization: `Bearer ${token}` } });
        res.json(response.data.data.map(p => ({ id: p.id, name: p.attributes.name })));
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.get('/api/user/preferences', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const profileRes = await axios.get('https://developer.api.autodesk.com/userprofile/v1/users/@me', { headers: { Authorization: `Bearer ${token}` } });
        res.json(getPreferences()[profileRes.data.emailId || profileRes.data.userName] || {});
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.post('/api/user/preferences', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const profileRes = await axios.get('https://developer.api.autodesk.com/userprofile/v1/users/@me', { headers: { Authorization: `Bearer ${token}` } });
        const userId = profileRes.data.emailId || profileRes.data.userName;
        const currentPrefs = getPreferences(); currentPrefs[userId] = { ...currentPrefs[userId], ...req.body }; savePreferences(currentPrefs);
        res.json({ success: true });
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.get('/api/acc/excel-files', async (req, res) => {
    const { projectId, hubId: queryHubId } = req.query;
    try {
        const token = await getUserToken(req);
        let hubId = queryHubId || HUB_ID;
        if (!hubId) {
            const hubsRes = await axios.get('https://developer.api.autodesk.com/project/v1/hubs', { headers: { Authorization: `Bearer ${token}` } });
            hubId = hubsRes.data.data.find(h => h.attributes.name.trim() === HUB_NAME.trim())?.id;
        }
        if (!hubId) throw new Error('Hub not found');

        const topFoldersUrl = `https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects/${projectId}/topFolders`;
        const foldersRes = await axios.get(topFoldersUrl, { headers: { Authorization: `Bearer ${token}` } });
        const projectFiles = foldersRes.data.data.find(f => f.attributes.displayName === 'Project Files');
        if (!projectFiles) throw new Error('Project Files folder not found');

        async function getFilesRecursive(folderId, currentToken) {
            const contentsUrl = `https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${folderId}/contents`;
            const res = await axios.get(contentsUrl, { headers: { Authorization: `Bearer ${currentToken}` } });
            let excels = res.data.data.filter(i => i.type === 'items' && i.attributes.displayName.toLowerCase().endsWith('.xlsx') && i.attributes.displayName.toUpperCase().includes('D4C'));
            for (const sub of res.data.data.filter(i => i.type === 'folders')) excels = excels.concat(await getFilesRecursive(sub.id, currentToken));
            return excels;
        }

        const files = await getFilesRecursive(projectFiles.id, token);
        const result = files.map(i => ({
            id: i.id,
            name: i.attributes.displayName,
            versionId: i.relationships.tip?.data?.id || i.id,
            version: (i.relationships.tip?.data?.id || '').split('version=')[1] || '1'
        }));
        res.json(result);
    } catch (err) {
        console.error('[Excel Files Error]', err.response?.data || err.message);
        res.status(500).send(err.message);
    }
});

app.get('/api/acc/excel-data', async (req, res) => {
    try { res.json(await getCachedExcelRows(req.query.projectId, req.query.versionId, await getUserToken(req))); } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.post('/api/automation/match', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const { hubId, projectId, excelVersionId } = req.body;
        const rows = await getCachedExcelRows(projectId, excelVersionId, token);
        const foldersRes = await axios.get(`https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects/${projectId}/topFolders`, { headers: { Authorization: `Bearer ${token}` } });
        const projectFiles = foldersRes.data.data.find(f => f.attributes.displayName === 'Project Files');
        const contentsRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${projectFiles.id}/contents`, { headers: { Authorization: `Bearer ${token}` } });
        const drawingsFolder = contentsRes.data.data.find(f => f.attributes.displayName === 'Drawings');
        let files = [];
        if (drawingsFolder) {
            files = (await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${drawingsFolder.id}/contents`, { headers: { Authorization: `Bearer ${token}` } })).data.data.filter(i => i.type === 'items' && i.attributes.displayName.toLowerCase().endsWith('.dwg') && i.attributes.displayName.toUpperCase().includes('D4C'));
        }
        const tracker = getTracker();
        const matches = rows.map(row => {
            const match = files.find(f => f.attributes.displayName.split('.')[0] === row.DrawingName);
            let syncStatus = 'Pending Changes';
            if (match) {
                const latestVersion = match.relationships.tip?.data?.id?.split('version=')[1] || '1';
                if (tracker[match.id] && tracker[match.id].excelHash === calculateHash(row) && String(tracker[match.id].version) === String(latestVersion)) syncStatus = 'Up to date';
            }
            return {
                excelRow: row,
                matchedFile: match ? {
                    id: match.id,
                    name: match.attributes.displayName,
                    versionId: match.relationships.tip?.data?.id || match.id,
                    version: (match.relationships.tip?.data?.id || '').split('version=')[1] || '1'
                } : null,
                syncStatus: match ? syncStatus : 'No Match'
            };
        });
        res.json(matches);
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});


app.post('/api/automation/preview-extract', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const { projectId, drawingVersionId, excelVersionId, drawingName } = req.body;
        const cadData = await extractDrawingAttributes(drawingVersionId, token);
        if (Object.keys(cadData).length === 0) throw new Error('Could not identify a Title Block properties.');

        const excelRows = await getCachedExcelRows(projectId, excelVersionId, token);
        const targetRow = excelRows.find(r => String(r.DrawingName) === String(drawingName));
        if (!targetRow) throw new Error('Drawing missing in Excel.');
        const diff = Object.keys(targetRow).map(key => {
            if (key === 'DrawingName') return null;
            const cadKey = Object.keys(cadData).find(ck => ck.toLowerCase() === key.toLowerCase());
            return { key, current: String(targetRow[key] || ''), proposed: cadKey ? String(cadData[cadKey]) : String(targetRow[key] || ''), changed: cadKey && String(cadData[cadKey]) !== String(targetRow[key] || '') };
        }).filter(d => d !== null);
        res.json({ success: true, drawingName, diff });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/automation/commit-extract', async (req, res) => {
    try {
        const token = await getUserToken(req); const { projectId, excelVersionId, drawingName, updates } = req.body;
        const rows = await getCachedExcelRows(projectId, excelVersionId, token);
        const targetIdx = rows.findIndex(r => String(r.DrawingName) === String(drawingName));
        updates.forEach(upd => { rows[targetIdx][upd.key] = upd.proposed; });
        const excelVersionDetails = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(excelVersionId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const excelItemId = excelVersionDetails.data.data.relationships.item.data.id;
        const excelParentFolderId = (await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(excelItemId)}`, { headers: { Authorization: `Bearer ${token}` } })).data.data.relationships.parent.data.id;
        const newWorkbook = xlsx.utils.book_new(); xlsx.utils.book_append_sheet(newWorkbook, xlsx.utils.json_to_sheet(rows), "Sheet1");
        const outBuffer = xlsx.write(newWorkbook, { type: 'buffer' });
        const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, { jsonapi: { version: '1.0' }, data: { type: 'objects', attributes: { name: excelVersionDetails.data.data.attributes.displayName }, relationships: { target: { data: { type: 'folders', id: excelParentFolderId } } } } }, { headers: { Authorization: `Bearer ${token}` } });
        const storageId = storageRes.data.data.id; const bucketKey = storageId.split('/')[0].split(':').pop(); const objectKey = storageId.split('/')[1];
        const signedRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3upload`, { headers: { Authorization: `Bearer ${token}` } });
        await axios.put(signedRes.data.urls[0], outBuffer);
        await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3upload`, { uploadKey: signedRes.data.uploadKey }, { headers: { Authorization: `Bearer ${token}` } });
        const versionsRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions`, { jsonapi: { version: '1.0' }, data: { type: 'versions', attributes: { name: excelVersionDetails.data.data.attributes.displayName, displayName: excelVersionDetails.data.data.attributes.displayName, extension: { type: 'versions:autodesk.bim360:File', version: '1.0' } }, relationships: { item: { data: { type: 'items', id: excelItemId } }, storage: { data: { type: 'objects', id: storageId } } } } }, { headers: { Authorization: `Bearer ${token}` } });
        res.json({ success: true, newExcelVersion: versionsRes.data.data.attributes.versionNumber, newExcelVersionId: versionsRes.data.data.id });
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.post('/api/automation/push-attributes', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const { projectId, versionId, attributes } = req.body;
        console.log(`[ACC Push] Incoming request for project ${projectId}, version ${versionId}`);

        // Strip 'b.' for Document Management APIs
        const cleanProjectId = projectId.startsWith('b.') ? projectId.substring(2) : projectId;

        // 1. Get Folder ID
        const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const itemId = versionRes.data.data.relationships.item.data.id;
        const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const folderUrn = itemRes.data.data.relationships.parent.data.id;

        // Using full URNs for ACC compatibility - some environments require them
        const cleanFolderId = folderUrn; // Use full URN

        // Document Management API doesn't like ?version= suffix in the path parameter
        const cleanVersionId = versionId.split('?')[0];

        console.log(`[ACC Push] Resolved IDs - Project: ${cleanProjectId}, Folder: ${cleanFolderId}, Version: ${cleanVersionId}`);

        // 2. Sync Attribute Definitions
        // Note: For custom-attribute-definitions, if full URN fails, we try the stripped version in a catch block
        let definitionsRes;
        try {
            definitionsRes = await axios.get(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(cleanFolderId)}/custom-attribute-definitions`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) {
            console.log(`[ACC Push] GET definitions with URN failed, trying stripped ID...`);
            const strippedFolderId = folderUrn.split(':').pop();
            definitionsRes = await axios.get(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(strippedFolderId)}/custom-attribute-definitions`, { headers: { Authorization: `Bearer ${token}` } });
        }

        console.log(`[ACC Push] Found ${definitionsRes.data.results?.length || 0} existing definitions`);
        const existingDefs = definitionsRes.data.results || [];
        const attributeMap = {}; // name -> id

        for (const attrName of Object.keys(attributes)) {
            if (attrName === 'DrawingName' || attrName === 'BlockName') continue;
            let def = existingDefs.find(d => d.name === attrName);
            if (!def) {
                // Create definition
                try {
                    const createRes = await axios.post(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(cleanFolderId)}/custom-attribute-definitions`, {
                        name: attrName,
                        type: 'string',
                        description: 'Auto-created by Cloud Alter Engine'
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    def = createRes.data;
                } catch (e) {
                    console.error(`[ACC Definitions] Failed to create ${attrName}:`, e.response?.data || e.message);
                    continue;
                }
            }
            attributeMap[attrName] = def.id;
        }

        // 3. Batch Update Values
        const batchUpdates = Object.keys(attributeMap)
            .filter(name => attributes[name] !== undefined && attributes[name] !== null)
            .map(name => ({
                id: attributeMap[name],
                value: String(attributes[name])
            }))
            .filter(item => item.id && item.value !== undefined);

        if (batchUpdates.length > 0) {
            console.log(`[ACC Push] Sending batch-update for ${batchUpdates.length} attributes...`);
            console.log(`[ACC Push] Payload Preview: ${JSON.stringify(batchUpdates.slice(0, 2))}...`);

            async function tryUpdate(vId) {
                const url = `https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/versions/${encodeURIComponent(vId)}/custom-attributes:batch-update`;
                return await axios.post(url, batchUpdates, { headers: { Authorization: `Bearer ${token}` } });
            }

            try {
                // For ACC, the full URN with ?version= seems to be the most viable after latest logs
                console.log(`[ACC Push] Attempting primary update with: ${versionId}`);
                const res = await tryUpdate(versionId);
                console.log(`[ACC Push] Success!`);
            } catch (e) {
                console.warn(`[ACC Push] Primary attempt failed, trying fallbacks...`);
                try {
                    const stripped = versionId.split('?')[0];
                    await tryUpdate(stripped);
                    console.log(`[ACC Push] Success with fallback 1`);
                } catch (e2) {
                    const lastPart = versionId.split(':').pop().split('?')[0];
                    await tryUpdate(lastPart);
                    console.log(`[ACC Push] Success with fallback 2`);
                }
            }
        }

        res.json({ success: true, updated: batchUpdates.length });
    } catch (err) {
        console.error('[ACC Attributes Error]', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data || err.message });
    }
});

app.post('/api/automation/update', async (req, res) => {
    try {
        const token = await getUserToken(req); const internalToken = await getInternalToken();
        const { projectId, versionId, excelRow } = req.body;
        const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const sourceStorageId = versionRes.data.data.relationships.storage.data.id;
        const itemId = versionRes.data.data.relationships.item.data.id;
        const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, { jsonapi: { version: '1.0' }, data: { type: 'objects', attributes: { name: versionRes.data.data.attributes.displayName }, relationships: { target: { data: { type: 'folders', id: itemRes.data.data.relationships.parent.data.id } } } } }, { headers: { Authorization: `Bearer ${token}` } });
        const accStorageId = storageRes.data.data.id; const accBucket = accStorageId.split('/')[0].split(':').pop(); const accObject = accStorageId.split('/')[1];
        const srcBucket = sourceStorageId.split('/')[0].split(':').pop(); const srcObject = sourceStorageId.split('/')[1];
        const signedDownload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${srcBucket}/objects/${encodeURIComponent(srcObject)}/signeds3download`, { headers: { Authorization: `Bearer ${token}` } });
        const signedUpload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, { headers: { Authorization: `Bearer ${token}` } });

        console.log(`\n\n[DA Update Target] Dispatching update for ${excelRow.DrawingName}`);

        // Critical DA Engine Fix: The AutoCAD Title Block Plugin crashes if LayoutName is missing.
        // Excel datasets sometimes leave this column blank.
        if (!excelRow.LayoutName || excelRow.LayoutName.trim() === '') {
            console.log(`[DA Target Fix] Injecting default 'A1 Sheet1' LayoutName for ${excelRow.DrawingName}`);
            excelRow.LayoutName = 'A1 Sheet1';
        }

        console.log(`[DA Payload] Raw Excel Row Properties:`, JSON.stringify(excelRow, null, 2));

        const wrappedPayload = [excelRow]; // The plugin natively expected a List/Array per .NET exception

        const wiRes = await axios.post('https://developer.api.autodesk.com/da/us-east/v3/workitems', {
            activityId: `${APS_CLIENT_ID}.TitleBlockActivity+prod`,
            arguments: { hostDwg: { url: signedDownload.data.url, localName: 'input.dwg' }, params: { url: `data:application/json;base64,${Buffer.from(JSON.stringify(wrappedPayload)).toString('base64')}`, localName: 'params.json' }, result: { verb: 'put', url: signedUpload.data.urls[0], localName: 'input.dwg' } }
        }, { headers: { Authorization: `Bearer ${internalToken}` } });
        pendingCommits.set(wiRes.data.id, { projectId, itemId, versionId, excelRow, storageId: accStorageId, uploadKey: signedUpload.data.uploadKey, extensionType: versionRes.data.data.attributes.extension.type, fileName: versionRes.data.data.attributes.displayName });
        res.json({ workItemId: wiRes.data.id });
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

async function commitVersionInternal(workItemId, req) {
    const commitInfo = pendingCommits.get(workItemId); if (!commitInfo || commitInfo.committed) return;
    try {
        const userToken = await getUserToken(req); 
        const accBucket = commitInfo.storageId.split('/')[0].split(':').pop();
        const accObjectKey = commitInfo.storageId.split('/')[1];
        if (commitInfo.uploadKey) await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObjectKey)}/signeds3upload`, { uploadKey: commitInfo.uploadKey }, { headers: { Authorization: `Bearer ${userToken}` } });
        const commitRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${commitInfo.projectId}/versions`, { jsonapi: { version: '1.0' }, data: { type: 'versions', attributes: { name: commitInfo.fileName, displayName: commitInfo.fileName, extension: { type: commitInfo.extensionType || 'versions:autodesk.bim360:File', version: '1.0' } }, relationships: { item: { data: { type: 'items', id: commitInfo.itemId } }, storage: { data: { type: 'objects', id: commitInfo.storageId } } } } }, { headers: { Authorization: `Bearer ${userToken}` } });
        const tracker = getTracker(); tracker[commitInfo.itemId] = { excelHash: calculateHash(commitInfo.excelRow), version: commitRes.data.data.attributes.versionNumber, updatedAt: new Date().toISOString() }; saveTracker(tracker);
        commitInfo.committed = true; commitInfo.newVersion = commitRes.data.data.attributes.versionNumber;
    } catch (err) { 
        console.error(`[Commit Error]`, err.response?.data || err.message);
        commitInfo.committing = false; 
    }
}

app.get('/api/automation/status/:id', async (req, res) => {
    try {
        const internalToken = await getInternalToken();
        const response = await axios.get(`https://developer.api.autodesk.com/da/us-east/v3/workitems/${req.params.id}`, { headers: { Authorization: `Bearer ${internalToken}` } });
        const status = response.data.status; const commitInfo = pendingCommits.get(req.params.id);

        if (status === 'success' || status === 'failed') {
            if (!commitInfo.loggedReport) {
                console.log(`\n[DA Execution Report] WorkItem ${req.params.id} completed with status: ${status}`);
                console.log(`[DA Execution Report] LOG URL: ${response.data.reportUrl}`);
                commitInfo.loggedReport = true;
            }
        }

        if (status === 'success' && commitInfo && !commitInfo.committed && !commitInfo.committing) { commitInfo.committing = true; commitVersionInternal(req.params.id, req); }
        let finalStatus = status; if (commitInfo?.committed) finalStatus = 'finished'; else if (commitInfo?.committing) finalStatus = 'committing';
        res.json({ status: finalStatus, committed: commitInfo?.committed || false, newVersion: commitInfo?.newVersion });
    } catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

// PORT is defined at the top
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(__dirname, '../client/dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Static build not found. If you are developing locally, please use the Vite dev server port (default 5173).');
    }
});
app.listen(PORT, '0.0.0.0', () => console.log(`Stable Forensic Engine on ${PORT}`));
