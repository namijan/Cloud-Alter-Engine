const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const xlsx = require('xlsx');
const dotenv = require('dotenv');
const fs = require('fs');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5173;

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

// DB Persistence Architecture for Railway
let pgClient = null;
let mongoDb = null;

async function initDB() {
    if (process.env.DATABASE_URL) {
        try {
            const { Client } = require('pg');
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });
            await client.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_preferences (
                    user_id VARCHAR(100) PRIMARY KEY,
                    prefs JSONB NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            pgClient = client;
            console.log('[DB Architecture] PostgreSQL connected successfully on Railway');
            return;
        } catch (e) {
            console.error('[DB Architecture] PostgreSQL connection failed, falling back...', e.message);
        }
    }
    
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            mongoDb = client.db();
            console.log('[DB Architecture] MongoDB connected successfully on Railway');
            return;
        } catch (e) {
            console.error('[DB Architecture] MongoDB connection failed, falling back...', e.message);
        }
    }
}

initDB();

async function getPreferencesAsync(userId = 'default_user') {
    if (pgClient) {
        try {
            const res = await pgClient.query('SELECT prefs FROM user_preferences WHERE user_id = $1', [userId]);
            if (res.rows.length > 0) return res.rows[0].prefs;
            return {};
        } catch (e) {
            console.error('[DB Read Error]', e.message);
        }
    }
    
    if (mongoDb) {
        try {
            const col = mongoDb.collection('user_preferences');
            const doc = await col.findOne({ userId });
            return doc ? doc.prefs : {};
        } catch (e) {
            console.error('[DB Read Error]', e.message);
        }
    }
    
    // File fallback
    try {
        const fileContent = JSON.parse(fs.readFileSync(PREFS_PATH, 'utf8'));
        return fileContent[userId] || {};
    } catch (e) {
        return {};
    }
}

async function savePreferencesAsync(userId = 'default_user', prefs) {
    if (pgClient) {
        try {
            await pgClient.query(`
                INSERT INTO user_preferences (user_id, prefs, updated_at)
                VALUES ($1, $2, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id)
                DO UPDATE SET prefs = $2, updated_at = CURRENT_TIMESTAMP
            `, [userId, JSON.stringify(prefs)]);
            return;
        } catch (e) {
            console.error('[DB Write Error]', e.message);
        }
    }
    
    if (mongoDb) {
        try {
            const col = mongoDb.collection('user_preferences');
            await col.updateOne({ userId }, { $set: { prefs, updatedAt: new Date() } }, { upsert: true });
            return;
        } catch (e) {
            console.error('[DB Write Error]', e.message);
        }
    }
    
    // File fallback
    try {
        const fileContent = JSON.parse(fs.readFileSync(PREFS_PATH, 'utf8'));
        fileContent[userId] = prefs;
        fs.writeFileSync(PREFS_PATH, JSON.stringify(fileContent, null, 2));
    } catch (e) {
        console.error('[File Write Error]', e.message);
    }
}

function calculateHash(data) {
    if (!data) return '';
    const sorted = Object.keys(data).sort().reduce((obj, key) => { obj[key] = data[key]; return obj; }, {});
    return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
}

function getAttributesForBlock(blockName) {
    if (!blockName) return [];
    try {
        const tbsPath = path.join(__dirname, '../tbs.json');
        if (fs.existsSync(tbsPath)) {
            const tbs = JSON.parse(fs.readFileSync(tbsPath, 'utf8'));
            const cleanName = String(blockName).toLowerCase().trim();
            const matched = tbs.find(tb => {
                const tbName = String(tb.name || '').toLowerCase().trim();
                return tbName.includes(cleanName) || cleanName.includes(tbName);
            });
            if (matched && matched.properties && matched.properties.Attributes) {
                return Object.keys(matched.properties.Attributes);
            }
        }
    } catch (e) {
        console.error('[getAttributesForBlock] Error:', e.message);
    }
    return [];
}

const FEEDBACK_FILE = path.join(__dirname, 'data/feedback.json');
if (!fs.existsSync(path.dirname(FEEDBACK_FILE))) {
    fs.mkdirSync(path.dirname(FEEDBACK_FILE), { recursive: true });
}

async function saveFeedback(feedback) {
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            const db = client.db();
            await db.collection('feedbacks').insertOne(feedback);
            await client.close();
            return;
        } catch (e) {
            console.error('[DB Storage Error] MongoDB failed, falling back to local storage', e);
        }
    } else if (process.env.DATABASE_URL) {
        try {
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS feedbacks (
                    id TEXT PRIMARY KEY,
                    userName TEXT,
                    userEmail TEXT,
                    rating INTEGER,
                    category TEXT,
                    comment TEXT,
                    screenshot TEXT,
                    metadata TEXT,
                    createdAt TEXT
                )
            `);
            await client.query(`
                INSERT INTO feedbacks (id, userName, userEmail, rating, category, comment, screenshot, metadata, createdAt)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                feedback.id,
                feedback.userName,
                feedback.userEmail,
                feedback.rating,
                feedback.category,
                feedback.comment,
                feedback.screenshot,
                JSON.stringify(feedback.metadata),
                feedback.createdAt
            ]);
            await client.end();
            return;
        } catch (e) {
            console.error('[DB Storage Error] Postgres failed, falling back to local storage', e);
        }
    }

    let feedbacks = [];
    if (fs.existsSync(FEEDBACK_FILE)) {
        try { feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8')); } catch (e) {}
    }
    feedbacks.push(feedback);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));
}

async function getFeedbacks() {
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            const db = client.db();
            const list = await db.collection('feedbacks').find({}).sort({ createdAt: -1 }).toArray();
            await client.close();
            return list;
        } catch (e) {
            console.error('[DB Fetch Error] MongoDB failed, falling back to local storage', e);
        }
    } else if (process.env.DATABASE_URL) {
        try {
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS feedbacks (
                    id TEXT PRIMARY KEY,
                    userName TEXT,
                    userEmail TEXT,
                    rating INTEGER,
                    category TEXT,
                    comment TEXT,
                    screenshot TEXT,
                    metadata TEXT,
                    createdAt TEXT
                )
            `);
            const res = await client.query('SELECT * FROM feedbacks ORDER BY createdAt DESC');
            await client.end();
            return res.rows.map(r => ({
                ...r,
                metadata: r.metadata ? JSON.parse(r.metadata) : {}
            }));
        } catch (e) {
            console.error('[DB Fetch Error] Postgres failed, falling back to local storage', e);
        }
    }

    if (fs.existsSync(FEEDBACK_FILE)) {
        try {
            const list = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
            return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (e) {}
    }
    return [];
}

async function deleteFeedback(feedbackId) {
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            const db = client.db();
            await db.collection('feedbacks').deleteOne({ id: feedbackId });
            await client.close();
            return;
        } catch (e) {
            console.error('[DB Storage Error] MongoDB delete failed, falling back to local', e);
        }
    } else if (process.env.DATABASE_URL) {
        try {
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            await client.query('DELETE FROM feedbacks WHERE id = $1', [feedbackId]);
            await client.end();
            return;
        } catch (e) {
            console.error('[DB Storage Error] Postgres delete failed, falling back to local', e);
        }
    }

    if (fs.existsSync(FEEDBACK_FILE)) {
        try {
            let feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
            feedbacks = feedbacks.filter(f => f.id !== feedbackId);
            fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));
        } catch (e) {
            console.error('[Local Storage Delete Error]', e);
        }
    }
}

const HISTORY_FILE = path.join(__dirname, 'data/history.json');
if (!fs.existsSync(path.dirname(HISTORY_FILE))) {
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
}

async function saveHistory(job) {
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            const db = client.db();
            await db.collection('history').insertOne(job);
            await client.close();
            return;
        } catch (e) {
            console.error('[DB Storage Error] MongoDB history failed, falling back to local', e);
        }
    } else if (process.env.DATABASE_URL) {
        try {
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS history (
                    id TEXT PRIMARY KEY,
                    status TEXT,
                    completedAt TEXT,
                    fileName TEXT,
                    actionType TEXT,
                    message TEXT,
                    lastSyncDiff TEXT,
                    payload TEXT
                )
            `);
            await client.query(`
                INSERT INTO history (id, status, completedAt, fileName, actionType, message, lastSyncDiff, payload)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                job.id,
                job.status,
                job.completedAt,
                job.fileName,
                job.actionType,
                job.message || '',
                JSON.stringify(job.lastSyncDiff || {}),
                JSON.stringify(job.payload || {})
            ]);
            await client.end();
            return;
        } catch (e) {
            console.error('[DB Storage Error] Postgres history failed, falling back to local', e);
        }
    }

    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
        try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (e) {}
    }
    history.push(job);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

async function getHistory() {
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            const db = client.db();
            const list = await db.collection('history').find({}).sort({ completedAt: -1 }).toArray();
            await client.close();
            return list;
        } catch (e) {
            console.error('[DB Fetch Error] MongoDB history failed, falling back to local', e);
        }
    } else if (process.env.DATABASE_URL) {
        try {
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS history (
                    id TEXT PRIMARY KEY,
                    status TEXT,
                    completedAt TEXT,
                    fileName TEXT,
                    actionType TEXT,
                    message TEXT,
                    lastSyncDiff TEXT,
                    payload TEXT
                )
            `);
            const res = await client.query('SELECT * FROM history ORDER BY completedAt DESC');
            await client.end();
            return res.rows.map(r => ({
                id: r.id,
                status: r.status,
                completedAt: r.completedat || r.completedAt,
                fileName: r.filename || r.fileName,
                actionType: r.actiontype || r.actionType,
                message: r.message,
                lastSyncDiff: r.lastsyncdiff ? JSON.parse(r.lastsyncdiff) : (r.lastSyncDiff ? JSON.parse(r.lastSyncDiff) : {}),
                payload: r.payload ? JSON.parse(r.payload) : {}
            }));
        } catch (e) {
            console.error('[DB Fetch Error] Postgres history failed, falling back to local', e);
        }
    }

    if (fs.existsSync(HISTORY_FILE)) {
        try {
            const list = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
            return list.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        } catch (e) {}
    }
    return [];
}

async function clearHistory() {
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            const db = client.db();
            await db.collection('history').deleteMany({});
            await client.close();
            return;
        } catch (e) {
            console.error('[DB Storage Error] MongoDB clear history failed, falling back to local', e);
        }
    } else if (process.env.DATABASE_URL) {
        try {
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            await client.query('DELETE FROM history');
            await client.end();
            return;
        } catch (e) {
            console.error('[DB Storage Error] Postgres clear history failed, falling back to local', e);
        }
    }

    if (fs.existsSync(HISTORY_FILE)) {
        try {
            fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
        } catch (e) {
            console.error('[Local Storage Clear History Error]', e);
        }
    }
}

async function deleteHistoryItem(historyId) {
    if (process.env.MONGODB_URI) {
        try {
            const { MongoClient } = require('mongodb');
            const client = new MongoClient(process.env.MONGODB_URI);
            await client.connect();
            const db = client.db();
            await db.collection('history').deleteOne({ id: historyId });
            await client.close();
            return;
        } catch (e) {
            console.error('[DB Storage Error] MongoDB delete history item failed, falling back to local', e);
        }
    } else if (process.env.DATABASE_URL) {
        try {
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            await client.query('DELETE FROM history WHERE id = $1', [historyId]);
            await client.end();
            return;
        } catch (e) {
            console.error('[DB Storage Error] Postgres delete history item failed, falling back to local', e);
        }
    }

    if (fs.existsSync(HISTORY_FILE)) {
        try {
            let history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
            history = history.filter(h => h.id !== historyId);
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
        } catch (e) {
            console.error('[Local Storage Delete History Item Error]', e);
        }
    }
}

const excelCache = new Map();
const CACHE_TTL = 1000;

async function getCachedExcelRows(projectId, versionId, token) {
    // Force tip version discovery to avoid stale selection
    const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const itemId = versionRes.data.data.relationships.item.data.id;
    const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const latestVersionId = itemRes.data.data.relationships.tip.data.id;
    
    const cached = excelCache.get(latestVersionId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) return cached.rows;
    
    console.log(`[Excel Sync] Fetching absolute tip version: ${latestVersionId}`);
    const excelVersionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(latestVersionId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const storageId = excelVersionRes.data.data.relationships.storage.data.id;
    const bucketKey = storageId.split('/')[0].split(':').pop();
    const objectKey = storageId.split('/')[1];
    const signedRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3download`, { headers: { Authorization: `Bearer ${token}` } });
    const downloadRes = await axios.get(signedRes.data.url, { responseType: 'arraybuffer' });
    const workbook = xlsx.read(downloadRes.data, { type: 'buffer' });
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    console.log(`[Excel Debug] Raw Rows Fetched: ${rawRows.length}`);
    rawRows.forEach((r, i) => console.log(`  Row ${i}: ${JSON.stringify(r)}`));
    
    // Normalize keys to ensure consistency (DrawingName, BlockName, LayoutName)
    const rows = rawRows.map(r => {
        const normalized = {};
        Object.keys(r).forEach(k => {
            const cleanKey = k.replace(/\s+/g, '').trim();
            normalized[cleanKey] = r[k];
        });
        return normalized;
    });

    excelCache.set(latestVersionId, { rows, timestamp: Date.now() });
    return rows;
}

const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_CALLBACK_URL, SESSION_SECRET, HUB_NAME, HUB_ID, CLIENT_URL } = process.env;

const app = express();
const pendingCommits = new Map();
const pendingPrints = new Map();
const pendingBulkJobs = new Map();

app.use(express.json());
app.set('trust proxy', 1);
app.use(session({
    name: 'aps_session',
    secret: SESSION_SECRET || 'aps-secret-key-final',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax', secure: false }
}));

app.use((req, res, next) => { 
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    console.log(`[Backend Log] ${req.method} ${req.url} - Session: ${req.session?.token ? 'ACTIVE' : 'MISSING'}`); 
    next(); 
});

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

    const cadData = { BlockName: titleBlockObj.name };
    Object.values(titleBlockObj.properties || {}).forEach(cat => { if (typeof cat === 'object') Object.assign(cadData, cat); });
    console.log(`[MD Extract] Identified ${Object.keys(cadData).length} properties for ${titleBlockObj.name}:`, Object.keys(cadData));
    return cadData;
}

async function getACCAttributesInternal(projectId, versionId, token) {
    try {
        const cleanProjectId = projectId.startsWith('b.') ? projectId.substring(2) : projectId;
        const decodedVersionId = versionId.includes('%') ? decodeURIComponent(versionId) : versionId;
        
        // JIT VERSION DISCOVERY: Always find the absolute tip version of the drawing item
        const initialVersionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(decodedVersionId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const itemId = initialVersionRes.data.data.relationships.item.data.id;
        const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, { headers: { Authorization: `Bearer ${token}` } });
        
        const latestVersionId = itemRes.data.data.relationships.tip.data.id;
        const folderUrn = itemRes.data.data.relationships.parent.data.id;
        
        console.log(`[ACC JIT] Discovered absolute tip for drawing: ${latestVersionId}`);
        const cleanVersionId = latestVersionId;
        const defUrl = `https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderUrn)}/custom-attribute-definitions`;
        const defsRes = await axios.get(defUrl, { headers: { Authorization: `Bearer ${token}` } }).catch(async (e) => {
            const folderId = folderUrn.split(':').pop();
            return await axios.get(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderId)}/custom-attribute-definitions`, { headers: { Authorization: `Bearer ${token}` } });
        });
        const defs = defsRes.data.results || [];
        console.log(`[ACC Push Definitions] PUSH Target Definitions: ${defs.map(d => `${d.name} (${d.id})`).join(', ')}`);
        console.log(`[ACC Push Definitions] Found ${defs.length} attributes in folder: ${defs.map(d => `${d.name} (${d.id})`).join(', ')}`);

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
            if (!excelVersionId) {
                sourceData = {};
            } else {
                const rows = await getCachedExcelRows(projectId, excelVersionId, token);
                sourceData = rows.find(r => String(r.DrawingName) === String(drawingName)) || {};
            }
        } else if (sourceType === 'acc') {
            sourceData = await getACCAttributesInternal(projectId, drawingVersionId, token);
        } else if (sourceType === 'drawing') { sourceData = await extractDrawingAttributes(drawingVersionId, token); }
        
        if (targetType === 'drawing') {
            // Optimization: Skip interrogation if pushing to drawing
            console.log(`[Preview Sync] Skipping interrogation for drawing target: ${drawingName}`);
            targetData = {};
        } else if (targetType === 'excel') {
            if (!excelVersionId) {
                targetData = {};
            } else {
                const rows = await getCachedExcelRows(projectId, excelVersionId, token);
                targetData = rows.find(r => String(r.DrawingName) === String(drawingName)) || {};
            }
        } else if (targetType === 'acc') {
            targetData = await getACCAttributesInternal(projectId, drawingVersionId, token);
        }

        // Determine the specified BlockName for the target drawing
        let blockName = '';
        if (excelVersionId) {
            try {
                const rows = await getCachedExcelRows(projectId, excelVersionId, token);
                const row = rows.find(r => String(r.DrawingName) === String(drawingName));
                if (row) {
                    blockName = row.BlockName || row.blockName || row.BLOCKNAME;
                }
            } catch (e) {
                console.error('Failed to get blockName from Excel', e);
            }
        }
        if (!blockName) {
            blockName = sourceData.BlockName || sourceData.blockName || sourceData.BLOCKNAME ||
                        targetData.BlockName || targetData.blockName || targetData.BLOCKNAME;
        }

        const allowedAttributes = getAttributesForBlock(blockName);
        console.log(`[Preview Sync] BlockName: '${blockName}', Allowed Attributes:`, allowedAttributes);

        const keys = Object.keys(sourceData).concat(Object.keys(targetData)).filter((v, i, a) => a.indexOf(v) === i);
        const filteredKeys = keys.filter(k => {
            if (['DrawingName', 'BlockName', 'LayoutName'].includes(k)) return false;
            if (allowedAttributes.length > 0) {
                return allowedAttributes.includes(k);
            }
            return true;
        });

        const diff = filteredKeys.map(key => {
            const sVal = String(sourceData[key] || ''); const tVal = String(targetData[key] || '');
            return { key, source: sVal, target: tVal, changed: sVal !== tVal };
        });
        res.json({ success: true, drawingName, diff, sourceData, targetData });
    } catch (err) {
        console.error('[Preview Sync Error]', err.response ? JSON.stringify(err.response.data) : err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/automation/titleblocks', (req, res) => {
    try {
        const tbsPath = path.join(__dirname, '../tbs.json');
        if (fs.existsSync(tbsPath)) {
            const tbs = JSON.parse(fs.readFileSync(tbsPath, 'utf8'));
            res.json(tbs);
        } else {
            res.json([]);
        }
    } catch (e) {
        console.error('[TitleBlocks API Error]', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/feedback', async (req, res) => {
    try {
        const { userName, userEmail, rating, category, comment, screenshot, metadata } = req.body;
        if (!rating || !category) {
            return res.status(400).json({ error: 'Rating and Category are required.' });
        }
        const feedback = {
            id: Math.random().toString(36).substr(2, 9),
            userName: userName || 'Anonymous',
            userEmail: userEmail || 'anonymous@example.com',
            rating: parseInt(rating),
            category,
            comment: comment || '',
            screenshot: screenshot || '',
            metadata: metadata || {},
            createdAt: new Date().toISOString()
        };
        await saveFeedback(feedback);
        res.json({ success: true, feedback });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/feedback', async (req, res) => {
    const adminSecret = req.headers['x-admin-secret'];
    const expectedSecret = process.env.FEEDBACK_ADMIN_SECRET || 'admin123';
    
    if (adminSecret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
    }
    
    try {
        const list = await getFeedbacks();
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/feedback/:id', async (req, res) => {
    const adminSecret = req.headers['x-admin-secret'];
    const expectedSecret = process.env.FEEDBACK_ADMIN_SECRET || 'admin123';
    
    if (adminSecret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
    }
    
    try {
        await deleteFeedback(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const list = await getHistory();
        res.json(list);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/history', async (req, res) => {
    try {
        const job = req.body;
        if (!job.id || !job.status) {
            return res.status(400).json({ error: 'Job ID and Status are required.' });
        }
        await saveHistory(job);
        res.json({ success: true, job });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/history', async (req, res) => {
    try {
        await clearHistory();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/history/:id', async (req, res) => {
    try {
        await deleteHistoryItem(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/login', (req, res) => res.redirect('/api/auth/renew-login'));
app.get('/api/auth/renew-login', (req, res) => {
    const scopes = 'data:read data:write data:create bucket:create bucket:read user-profile:read user:read';
    const url = `https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${APS_CLIENT_ID}&redirect_uri=${encodeURIComponent(APS_CALLBACK_URL)}&scope=${encodeURIComponent(scopes)}`;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.redirect(url);
});

app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', 
            new URLSearchParams({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: APS_CALLBACK_URL }).toString(), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        req.session.token = response.data.access_token;
        req.session.refresh_token = response.data.refresh_token;
        req.session.expires_at = Date.now() + (response.data.expires_in * 1000);
        req.session.save((err) => {
            if (err) console.error('Session Save Error:', err);
            res.redirect(CLIENT_URL || '/');
        });
    } catch (err) { 
        console.error('[Callback Auth Error]', err.response?.data || err.message);
        res.status(500).send('Login failed'); 
    }
});

app.use(express.static(path.join(__dirname, '../client/dist')));

async function refreshToken(req) {
    if (!req.session.refresh_token) throw new Error('No refresh token');
    try {
        const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', 
            new URLSearchParams({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: req.session.refresh_token }).toString(), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        req.session.token = response.data.access_token;
        req.session.refresh_token = response.data.refresh_token;
        req.session.expires_at = Date.now() + (response.data.expires_in * 1000);
        return new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) return reject(err);
                resolve(response.data.access_token);
            });
        });
    } catch (e) {
        req.session = null;
        throw new Error('Failed to refresh token: Unauthorized');
    }
}

async function getUserToken(req) {
    if (!req.session?.token || !req.session?.expires_at || Date.now() >= req.session.expires_at - 60000) { 
        if (req.session?.refresh_token) {
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
        let profile = { name: 'Namit Ranjan', email: '', picture: null };
        
        try {
            const profileRes = await axios.get('https://developer.api.autodesk.com/userprofile/v1/users/@me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            profile.name = `${profileRes.data.firstName} ${profileRes.data.lastName}`;
            profile.email = profileRes.data.emailId;
            profile.picture = profileRes.data.profileImages.sizeX40 || profileRes.data.profileImages.sizeX20;
        } catch (profileErr) {
            console.warn('[Profile Discovery Fallback] Attempting Hub identification...');
            try {
                const hubsRes = await axios.get('https://developer.api.autodesk.com/project/v1/hubs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const hubs = hubsRes.data.data;
                const personalHub = hubs.find(h => h.attributes?.extension?.type === 'hubs:autodesk.a360:PersonalHub');
                const premiumHub = hubs.find(h => h.attributes?.name?.includes('Premium Support'));
                
                if (personalHub) {
                    profile.name = personalHub.attributes.name;
                } else if (premiumHub || hubs.length > 0) {
                    // Personalized fallback for Namit Ranjan in the Premium Support environment
                    profile.name = "Namit Ranjan";
                    console.log('[Profile Discovery] Assigned identity based on environment context: Namit Ranjan');
                }
            } catch (hubErr) {
                console.error('[Profile Discovery] Hub fallback failed:', hubErr.message);
            }
        }
        
        res.json({ ...profile, status: 'Logged In' });
    } catch (tokenErr) { 
        console.error('[Profile Auth Error]', tokenErr.message);
        res.json({ status: 'Logged Out' }); 
    }
});

app.get('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('[Logout Error]', err);
        res.clearCookie('aps_session');
        res.redirect(CLIENT_URL || '/');
    });
});

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

app.get('/api/acc/folders', async (req, res) => {
    try {
        const t = await getUserToken(req);
        const { projectId, hubId } = req.query;
        const r = await axios.get(`https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects/${projectId}/topFolders`, { headers: { Authorization: `Bearer ${t}` } });
        const topFolders = r.data.data.map(f => ({ id: f.id, name: f.attributes.displayName || f.attributes.name, children: [] }));
        
        async function buildTree(folders) {
            for (let f of folders) {
                try {
                    const cRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${f.id}/contents`, { headers: { Authorization: `Bearer ${t}` } });
                    const childFolders = cRes.data.data.filter(i => i.type === 'folders').map(c => ({ id: c.id, name: c.attributes.displayName || c.attributes.name, children: [] }));
                    if (childFolders.length > 0) {
                        f.children = await buildTree(childFolders);
                    }
                } catch(e) { }
            }
            return folders;
        }
        
        const tree = await buildTree(topFolders);
        res.json(tree);
    } catch (e) {
        console.error('[Folder Tree Error]', e.response?.data || e.message);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/user/preferences', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const prefs = await getPreferencesAsync('default_user');
        res.json(prefs);
    } catch (err) { console.error('[Preferences Get Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.post('/api/user/preferences', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const userId = 'default_user';
        const currentPrefs = await getPreferencesAsync(userId);
        const newPrefs = { ...currentPrefs, ...req.body };
        await savePreferencesAsync(userId, newPrefs);
        res.json({ success: true });
    } catch (err) { console.error('[Preferences Post Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }
});

app.get('/api/acc/excel-files', async (req, res) => {
    const { projectId, hubId: queryHubId, folderIds } = req.query;
    try {
        const token = await getUserToken(req);
        const selectedFolderIds = folderIds ? folderIds.split(',').filter(id => id) : [];
        if (selectedFolderIds.length === 0) return res.json([]);

        async function getFilesRecursive(folderId, currentToken) {
            try {
                const contentsUrl = `https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${folderId}/contents`;
                const res = await axios.get(contentsUrl, { headers: { Authorization: `Bearer ${currentToken}` } });
                let excels = res.data.data.filter(i => i.type === 'items' && i.attributes.displayName.toLowerCase().endsWith('.xlsx') && i.attributes.displayName.toUpperCase().includes('D4C'));
                for (const sub of res.data.data.filter(i => i.type === 'folders')) excels = excels.concat(await getFilesRecursive(sub.id, currentToken));
                return excels;
            } catch (e) {
                return [];
            }
        }

        let files = [];
        for (const folderId of selectedFolderIds) {
            files = files.concat(await getFilesRecursive(folderId, token));
        }

        // Deduplicate by ID
        const uniqueFiles = [];
        const seen = new Set();
        for (const file of files) {
            if (!seen.has(file.id)) {
                seen.add(file.id);
                uniqueFiles.push(file);
            }
        }

        const result = uniqueFiles.map(i => ({
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
        const { hubId, projectId, excelVersionId, folderIds } = req.body;
        
        let rows = [];
        if (excelVersionId) {
            rows = await getCachedExcelRows(projectId, excelVersionId, token);
        }
        
        const selectedFolderIds = folderIds ? folderIds.filter(id => id) : [];
        if (selectedFolderIds.length === 0) return res.json({ success: true, matches: [] });

        async function getDwgFilesRecursive(folderId, currentToken) {
            try {
                const contentsUrl = `https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${folderId}/contents`;
                const res = await axios.get(contentsUrl, { headers: { Authorization: `Bearer ${currentToken}` } });
                let dwgs = res.data.data.filter(i => i.type === 'items' && i.attributes.displayName.toLowerCase().endsWith('.dwg'));
                for (const sub of res.data.data.filter(i => i.type === 'folders')) dwgs = dwgs.concat(await getDwgFilesRecursive(sub.id, currentToken));
                return dwgs;
            } catch (e) { return []; }
        }

        let files = [];
        for (const folderId of selectedFolderIds) {
            files = files.concat(await getDwgFilesRecursive(folderId, token));
        }

        const tracker = getTracker();
        
        let matches = [];
        if (excelVersionId) {
            // Standard Mode: Match Excel Rows to Files
            matches = rows.map(row => {
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
                        version: (match.relationships.tip?.data?.id || '').split('version=')[1] || '1',
                        folderPath: match.folderPath // We could pass this back if we added it in the recursive step
                    } : null,
                    syncStatus: match ? syncStatus : 'No Match',
                    matchStatus: match ? 'Found' : 'Not Found'
                };
            });
        } else {
            // Lite Mode: Show all DWGs as potential targets
            matches = files.map(f => {
                const drawingName = f.attributes.displayName.split('.')[0];
                return {
                    excelRow: { DrawingName: drawingName }, // Virtual row
                    matchedFile: {
                        id: f.id,
                        name: f.attributes.displayName,
                        versionId: f.relationships.tip?.data?.id || f.id,
                        version: (f.relationships.tip?.data?.id || '').split('version=')[1] || '1'
                    },
                    syncStatus: 'Ready for Sync',
                    matchStatus: 'ACC Direct'
                };
            });
        }
        res.json({ success: true, matches });
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

async function pushAttributesInternal(projectId, versionId, attributes, token) {
    const cleanProjectId = projectId.startsWith('b.') ? projectId.substring(2) : projectId;
    const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const itemId = versionRes.data.data.relationships.item.data.id;
    const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const folderUrn = itemRes.data.data.relationships.parent.data.id;
    
    // Get Definitions
    let defsRes;
    try {
        defsRes = await axios.get(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderUrn)}/custom-attribute-definitions`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        const folderId = folderUrn.split(':').pop();
        defsRes = await axios.get(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderId)}/custom-attribute-definitions`, { headers: { Authorization: `Bearer ${token}` } });
    }
    const defs = defsRes.data.results || [];

    // Map Attributes by ID and Deduplicate
    const payloadMap = new Map();
    for (let key of Object.keys(attributes)) {
        if (['DrawingName', 'BlockName', 'LayoutName'].includes(key)) continue;
        
        let def = defs.find(d => d.name === key);
        if (!def) {
            console.log(`[ACC Discovery] Attribute '${key}' missing. Attempting creation in folder: ${folderUrn}`);
            try {
                // TRY 1: Use Full URN (Most common for ACC)
                const createRes = await axios.post(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderUrn)}/custom-attribute-definitions`, {
                    name: key,
                    type: 'string',
                    description: 'Auto-created by Cloud Alter Engine'
                }, { headers: { Authorization: `Bearer ${token}` } });
                def = createRes.data;
            } catch (err) {
                console.warn(`[ACC Discovery] Full URN failed for '${key}', trying short ID...`);
                try {
                    // TRY 2: Use Short ID (BIM 360 Legacy)
                    const shortFolderId = folderUrn.split(':').pop();
                    const createRes2 = await axios.post(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(shortFolderId)}/custom-attribute-definitions`, {
                        name: key,
                        type: 'string',
                        description: 'Auto-created by Cloud Alter Engine'
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    def = createRes2.data;
                } catch (err2) {
                    console.error(`[ACC Discovery Error] Final failure for '${key}':`, err2.response?.data || err2.message);
                    continue;
                }
            }
            if (def) console.log(`[ACC Discovery] Successfully created definition for '${key}' (ID: ${def.id})`);
        }
        
        if (def) payloadMap.set(def.id, String(attributes[key] || ""));
    }

    const payload = Array.from(payloadMap.entries()).map(([id, value]) => ({ id, value }));
    if (payload.length === 0) return 0;

    console.log(`[ACC Push] Pushing ${payload.length} attributes to version: ${versionId}`);
    try {
        const updateUrl = `https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/versions/${encodeURIComponent(versionId)}/custom-attributes:batch-update`;
        const res = await axios.post(updateUrl, payload, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        console.log(`[ACC Push Success]`, JSON.stringify(res.data));
        return payload.length;
    } catch (err) {
        // Fallback: If full URN fails, try the short version ID
        const shortVersionId = versionId.split('?')[0].split(':').pop();
        const fallbackUrl = `https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/versions/${encodeURIComponent(shortVersionId)}/custom-attributes:batch-update`;
        const res = await axios.post(fallbackUrl, payload, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        console.log(`[ACC Push Fallback Success]`, JSON.stringify(res.data));
        return payload.length;
    }
}

app.post('/api/automation/acc-push', async (req, res) => {
    try {
        const token = await getUserToken(req);
        const { projectId, versionId, attributes } = req.body;
        const updatedCount = await pushAttributesInternal(projectId, versionId, attributes, token);
        res.json({ success: true, updated: updatedCount });
    } catch (err) {
        console.error('[ACC Attributes Error]', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data || err.message });
    }
});

app.post('/api/automation/update', async (req, res) => {
    try {
        const token = await getUserToken(req); const internalToken = await getInternalToken();
        const { projectId, versionId, excelVersionId, drawingName, excelRow, sourceType } = req.body;
        
        let finalExcelRow = excelRow;
        // JIT Data Retrieval & Hybrid Merging
        if (excelVersionId && (drawingName || excelRow?.DrawingName)) {
            try {
                const targetName = drawingName || excelRow?.DrawingName;
                console.log(`[JIT] Fetching locator data for ${targetName} from Excel version: ${excelVersionId}`);
                const freshRows = await getCachedExcelRows(projectId, excelVersionId, token);
                const freshRow = freshRows.find(r => {
                    const rName = (r.DrawingName || r.drawingName || r['Drawing Name'] || '').toString().trim();
                    return rName === targetName.toString().trim();
                });
                
                if (freshRow) {
                    if (sourceType === 'excel') {
                        console.log(`[JIT] Full row refresh from Excel for ${targetName}`);
                        finalExcelRow = freshRow;
                    } else {
                        console.log(`[JIT] Hybrid Merge: Injecting locators from Excel into ${sourceType} data`);
                        // Keep current attributes (from ACC) but inject locators from Excel
                        finalExcelRow = {
                            ...freshRow, // Locators (BlockName, LayoutName, etc.)
                            ...excelRow  // Values (PROJECTNAME1, etc.)
                        };
                    }
                } else {
                    console.warn(`[JIT] Could not find row for ${targetName} in Excel. Using provided data.`);
                }
            } catch (e) { console.error(`[JIT Error] ${e.message}`); }
        }

        const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const sourceStorageId = versionRes.data.data.relationships.storage.data.id;
        const itemId = versionRes.data.data.relationships.item.data.id;
        const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, { jsonapi: { version: '1.0' }, data: { type: 'objects', attributes: { name: versionRes.data.data.attributes.displayName }, relationships: { target: { data: { type: 'folders', id: itemRes.data.data.relationships.parent.data.id } } } } }, { headers: { Authorization: `Bearer ${token}` } });
        const accStorageId = storageRes.data.data.id; const accBucket = accStorageId.split('/')[0].split(':').pop(); const accObject = accStorageId.split('/')[1];
        const srcBucket = sourceStorageId.split('/')[0].split(':').pop(); const srcObject = sourceStorageId.split('/')[1];
        const signedDownload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${srcBucket}/objects/${encodeURIComponent(srcObject)}/signeds3download`, { headers: { Authorization: `Bearer ${token}` } });
        const signedUpload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, { headers: { Authorization: `Bearer ${token}` } });

        console.log(`\n\n[DA Update Target] Dispatching update for ${drawingName}`);

        if (!finalExcelRow.LayoutName || finalExcelRow.LayoutName.trim() === '') {
            console.log(`[DA Target Fix] Injecting default 'A1 Sheet1' LayoutName for ${drawingName}`);
            finalExcelRow.LayoutName = 'A1 Sheet1';
        }

        console.log(`[DA Payload] Raw Excel Row Properties:`, JSON.stringify(finalExcelRow, null, 2));

        const wrappedPayload = [finalExcelRow];
        
        // AutoCAD Engine Script - Added REGENALL and ATTSYNC for visual persistence
        const script = `NETLOAD "$(appbundles[TitleBlockAppBundle].path)\\\\Contents\\\\TitleBlockAutomation.dll"\nUpdateAttributes\nATTSYNC Name "${finalExcelRow.BlockName || 'ISO A1 Title Block'}"\nREGENALL\nQSAVE\n`;

        const wiRes = await axios.post('https://developer.api.autodesk.com/da/us-east/v3/workitems', {
            activityId: `${APS_CLIENT_ID}.TitleBlockActivity+prod`,
            settings: { script: { value: script } },
            arguments: { 
                hostDwg: { url: signedDownload.data.url, localName: 'input.dwg' }, 
                params: { url: `data:application/json;base64,${Buffer.from(JSON.stringify(wrappedPayload)).toString('base64')}`, localName: 'params.json' }, 
                result: { verb: 'put', url: signedUpload.data.urls[0], localName: 'input.dwg' } 
            }
        }, { headers: { Authorization: `Bearer ${internalToken}` } });
        pendingCommits.set(wiRes.data.id, { projectId, itemId, versionId, excelRow: finalExcelRow, storageId: accStorageId, uploadKey: signedUpload.data.uploadKey, extensionType: versionRes.data.data.attributes.extension.type, fileName: versionRes.data.data.attributes.displayName });
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
        const newVersionId = commitRes.data.data.id;
        try {
            await pushAttributesInternal(commitInfo.projectId, newVersionId, commitInfo.excelRow, userToken);
        } catch (pushErr) {
            console.error('[Commit Push Attributes Error]', pushErr);
        }
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

// --- Premium Design Automation PDF Printing API Routes ---

async function createACCFileItem(projectId, folderId, fileName, storageId, userToken) {
    try {
        const payload = {
            jsonapi: { version: "1.0" },
            data: {
                type: "items",
                attributes: {
                    displayName: fileName,
                    extension: {
                        type: "items:autodesk.bim360:File",
                        version: "1.0"
                    }
                },
                relationships: {
                    tip: {
                        data: {
                            type: "versions",
                            id: "1"
                        }
                    },
                    parent: {
                        data: {
                            type: "folders",
                            id: folderId
                        }
                    }
                }
            },
            included: [
                {
                    type: "versions",
                    id: "1",
                    attributes: {
                        name: fileName,
                        extension: {
                            type: "versions:autodesk.bim360:File",
                            version: "1.0"
                        }
                    },
                    relationships: {
                        storage: {
                            data: {
                                type: "objects",
                                id: storageId
                            }
                        }
                    }
                }
            ]
        };

        const res = await axios.post(
            `https://developer.api.autodesk.com/data/v1/projects/${projectId}/items`,
            payload,
            { headers: { Authorization: `Bearer ${userToken}` } }
        );
        return res.data;
    } catch (err) {
        if (err.response && err.response.status === 409) {
            console.log(`[ACC Create Item Conflict] File ${fileName} already exists. Searching folderContents...`);
            const folderContentsRes = await axios.get(
                `https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${folderId}/contents`,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            const existingItem = folderContentsRes.data.data.find(
                item => item.attributes.displayName === fileName || item.attributes.name === fileName
            );
            if (existingItem) {
                console.log(`[ACC Create Item Conflict] Found existing item ID: ${existingItem.id}. Creating new version...`);
                const versionPayload = {
                    jsonapi: { version: "1.0" },
                    data: {
                        type: "versions",
                        attributes: {
                            name: fileName,
                            displayName: fileName,
                            extension: {
                                type: "versions:autodesk.bim360:File",
                                version: "1.0"
                            }
                        },
                        relationships: {
                            item: {
                                data: {
                                    type: "items",
                                    id: existingItem.id
                                }
                            },
                            storage: {
                                data: {
                                    type: "objects",
                                    id: storageId
                                }
                            }
                        }
                    }
                };
                const versionRes = await axios.post(
                    `https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions`,
                    versionPayload,
                    { headers: { Authorization: `Bearer ${userToken}` } }
                );
                return versionRes.data;
            }
        }
        throw err;
    }
}

app.post('/api/acc/print', async (req, res) => {
    const { versionId, projectId, hubId, paperSize, plotStyle, orientation, scale, plotArea, lineweights, transparency, destination, targetFolderId, targetFolderName } = req.body;

    try {
        const token = await getUserToken(req);
        const internalToken = await getInternalToken();

        const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(versionId)}`, { headers: { Authorization: `Bearer ${token}` } });
        const sourceStorageId = versionRes.data.data.relationships.storage.data.id;
        const drawingName = versionRes.data.data.attributes.displayName;

        const srcBucket = sourceStorageId.split('/')[0].split(':').pop(); 
        const srcObject = sourceStorageId.split('/')[1];
        const signedDownload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${srcBucket}/objects/${encodeURIComponent(srcObject)}/signeds3download`, { headers: { Authorization: `Bearer ${token}` } });

        let signedUploadUrl;
        let uploadKey;
        let accStorageId;

        if (destination === 'acc') {
            const pdfName = `${drawingName.replace(/\.[^/.]+$/, "")}.pdf`;
            const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, {
                jsonapi: { version: '1.0' },
                data: {
                    type: 'objects',
                    attributes: { name: pdfName },
                    relationships: { target: { data: { type: 'folders', id: targetFolderId } } }
                }
            }, { headers: { Authorization: `Bearer ${token}` } });

            accStorageId = storageRes.data.data.id;
            const accBucket = accStorageId.split('/')[0].split(':').pop(); 
            const accObject = accStorageId.split('/')[1];

            const signedUpload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, { headers: { Authorization: `Bearer ${token}` } });
            signedUploadUrl = signedUpload.data.urls[0];
            uploadKey = signedUpload.data.uploadKey;
        } else {
            const pdfName = `temp_print_${Date.now()}_${drawingName.replace(/\.[^/.]+$/, "")}.pdf`;
            const itemId = versionRes.data.data.relationships.item.data.id;
            const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, { headers: { Authorization: `Bearer ${token}` } });
            const parentFolderId = itemRes.data.data.relationships.parent.data.id;

            const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, {
                jsonapi: { version: '1.0' },
                data: {
                    type: 'objects',
                    attributes: { name: pdfName },
                    relationships: { target: { data: { type: 'folders', id: parentFolderId } } }
                }
            }, { headers: { Authorization: `Bearer ${token}` } });

            accStorageId = storageRes.data.data.id;
            const accBucket = accStorageId.split('/')[0].split(':').pop(); 
            const accObject = accStorageId.split('/')[1];

            const signedUpload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, { headers: { Authorization: `Bearer ${token}` } });
            signedUploadUrl = signedUpload.data.urls[0];
            uploadKey = signedUpload.data.uploadKey;
        }

        const paperSizeMap = {
            'ISO_A0': 'ISO expand A0 (841.00 x 1189.00 MM)',
            'ISO_A1': 'ISO expand A1 (594.00 x 841.00 MM)',
            'ISO_A2': 'ISO expand A2 (420.00 x 594.00 MM)',
            'ISO_A3': 'ISO expand A3 (420.00 x 297.00 MM)',
            'ISO_A4': 'ISO expand A4 (210.00 x 297.00 MM)',
            'ANSI_D': 'ANSI expand D (22.00 x 34.00 Inches)',
            'ANSI_Letter': 'ANSI expand A (8.50 x 11.00 Inches)'
        };
        const canonicalPaperSize = paperSizeMap[paperSize] || 'ISO expand A3 (420.00 x 297.00 MM)';
        const units = canonicalPaperSize.includes('Inches') ? 'Inches' : 'Millimeters';
        const canonicalOrientation = orientation === 'Landscape' ? 'Landscape' : 'Portrait';
        const canonicalPlotArea = plotArea === 'Layout' ? 'Layout' : (plotArea === 'Display' ? 'Display' : 'Extents');
        const canonicalScale = scale === 'Fit' ? 'Fit' : (scale || 'Fit');
        const canonicalPlotStyle = plotStyle || 'monochrome.ctb';
        const canonicalLineweights = lineweights ? 'Yes' : 'No';

        const plotScript = `(vl-load-com)
(defun c:CloudPlot ()
  (setvar "FILEDIA" 0)
  (setvar "CMDECHO" 1)
  (if (= (getvar "CTAB") "Model")
    (command "-PLOT"
      "Yes"                               ; Detailed plot configuration?
      "Model"                             ; Layout name
      "DWG To PDF.pc3"                    ; Output device name
      "${canonicalPaperSize}"             ; Paper size
      "${units}"                          ; Paper units
      "${canonicalOrientation}"           ; Drawing orientation
      "No"                                ; Plot upside down?
      "${canonicalPlotArea}"              ; Plot area (Extents/Display/Limits)
      "${canonicalScale}"                 ; Plot scale (Fit or scale string like 1:1)
      "Center"                            ; Plot offset (x,y) or [Center]
      "Yes"                               ; Plot with plot styles?
      "${canonicalPlotStyle}"             ; Plot style table name
      "${canonicalLineweights}"           ; Plot with lineweights?
      "As displayed"                      ; Plot with shading style? (Model space only!)
      "Yes"                               ; Write the plot to a file?
      "result.pdf"                        ; Enter file name
      "No"                                ; Save changes to page setup?
      "Yes"                               ; Proceed with plot?
    )
    (command "-PLOT"
      "Yes"                               ; Detailed plot configuration?
      (getvar "CTAB")                     ; Layout name
      "DWG To PDF.pc3"                    ; Output device name
      "${canonicalPaperSize}"             ; Paper size
      "${units}"                          ; Paper units
      "${canonicalOrientation}"           ; Drawing orientation
      "No"                                ; Plot upside down?
      "Layout"                            ; Plot area (Layout)
      "1:1"                               ; Plot scale
      "0,0"                               ; Plot offset
      "Yes"                               ; Plot with plot styles?
      "${canonicalPlotStyle}"             ; Plot style table name
      "${canonicalLineweights}"           ; Plot with lineweights?
      "No"                                ; Scale lineweights with plot scale?
      "No"                                ; Plot paper space first?
      "No"                                ; Hide paper space objects?
      "Yes"                               ; Write the plot to a file?
      "result.pdf"                        ; Enter file name
      "No"                                ; Save changes to page setup?
      "Yes"                               ; Proceed with plot?
    )
  )
  (if (findfile "result.pdf")
    (progn
      (vl-file-delete "input.dwg")
      (vl-file-rename "result.pdf" "input.dwg")
      (princ "\nSUCCESS: PDF printed and renamed successfully!")
    )
    (progn
      (princ "\nFATAL ERROR: result.pdf was not created by the plot command!")
      (exit)
    )
  )
  (princ)
)
(c:CloudPlot)
`;

        const wiRes = await axios.post('https://developer.api.autodesk.com/da/us-east/v3/workitems', {
            activityId: `${APS_CLIENT_ID}.TitleBlockActivity+prod`,
            settings: { script: { value: plotScript } },
            arguments: { 
                hostDwg: { url: signedDownload.data.url, localName: 'input.dwg' }, 
                params: { url: `data:application/json;base64,${Buffer.from(JSON.stringify([{ BlockName: "Dummy" }])).toString('base64')}`, localName: 'params.json' }, 
                result: { verb: 'put', url: signedUploadUrl, localName: 'input.dwg' } 
            }
        }, { headers: { Authorization: `Bearer ${internalToken}` } });

        const workItemId = wiRes.data.id;
        pendingPrints.set(workItemId, {
            status: 'executing',
            destination,
            projectId,
            targetFolderId,
            targetFolderName,
            uploadKey,
            storageId: accStorageId,
            drawingName,
            token,
            internalToken
        });

        res.json({ workItemId });
    } catch (err) {
        console.error('[Print Job Error]', err.response?.data || err.message);
        res.status(500).json({ message: err.response?.data?.message || err.message });
    }
});

app.post('/api/acc/print/bulk', async (req, res) => {
    const { files, projectId, hubId, paperSize, plotStyle, orientation, scale, plotArea, lineweights, transparency, destination, targetFolderId, targetFolderName } = req.body;
    
    try {
        const token = await getUserToken(req);
        const internalToken = await getInternalToken();

        const workItemIds = [];
        const bulkJobId = crypto.randomUUID();

        for (const file of files) {
            const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(file.versionId)}`, { headers: { Authorization: `Bearer ${token}` } });
            const sourceStorageId = versionRes.data.data.relationships.storage.data.id;
            const drawingName = versionRes.data.data.attributes.displayName;

            const srcBucket = sourceStorageId.split('/')[0].split(':').pop(); 
            const srcObject = sourceStorageId.split('/')[1];
            const signedDownload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${srcBucket}/objects/${encodeURIComponent(srcObject)}/signeds3download`, { headers: { Authorization: `Bearer ${token}` } });

            let signedUploadUrl;
            let uploadKey;
            let accStorageId;

            if (destination === 'acc') {
                const pdfName = `${drawingName.replace(/\.[^/.]+$/, "")}.pdf`;
                const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, {
                    jsonapi: { version: '1.0' },
                    data: {
                        type: 'objects',
                        attributes: { name: pdfName },
                        relationships: { target: { data: { type: 'folders', id: targetFolderId } } }
                    }
                }, { headers: { Authorization: `Bearer ${token}` } });

                accStorageId = storageRes.data.data.id;
                const accBucket = accStorageId.split('/')[0].split(':').pop(); 
                const accObject = accStorageId.split('/')[1];

                const signedUpload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, { headers: { Authorization: `Bearer ${token}` } });
                signedUploadUrl = signedUpload.data.urls[0];
                uploadKey = signedUpload.data.uploadKey;
            } else {
                const pdfName = `temp_print_${bulkJobId}_${drawingName.replace(/\.[^/.]+$/, "")}.pdf`;
                const itemId = versionRes.data.data.relationships.item.data.id;
                const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, { headers: { Authorization: `Bearer ${token}` } });
                const parentFolderId = itemRes.data.data.relationships.parent.data.id;

                const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, {
                    jsonapi: { version: '1.0' },
                    data: {
                        type: 'objects',
                        attributes: { name: pdfName },
                        relationships: { target: { data: { type: 'folders', id: parentFolderId } } }
                    }
                }, { headers: { Authorization: `Bearer ${token}` } });

                accStorageId = storageRes.data.data.id;
                const accBucket = accStorageId.split('/')[0].split(':').pop(); 
                const accObject = accStorageId.split('/')[1];

                const signedUpload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, { headers: { Authorization: `Bearer ${token}` } });
                signedUploadUrl = signedUpload.data.urls[0];
                uploadKey = signedUpload.data.uploadKey;
            }

            const paperSizeMap = {
                'ISO_A0': 'ISO expand A0 (841.00 x 1189.00 MM)',
                'ISO_A1': 'ISO expand A1 (594.00 x 841.00 MM)',
                'ISO_A2': 'ISO expand A2 (420.00 x 594.00 MM)',
                'ISO_A3': 'ISO expand A3 (420.00 x 297.00 MM)',
                'ISO_A4': 'ISO expand A4 (210.00 x 297.00 MM)',
                'ANSI_D': 'ANSI expand D (22.00 x 34.00 Inches)',
                'ANSI_Letter': 'ANSI expand A (8.50 x 11.00 Inches)'
            };
            const canonicalPaperSize = paperSizeMap[paperSize] || 'ISO expand A3 (420.00 x 297.00 MM)';
            const units = canonicalPaperSize.includes('Inches') ? 'Inches' : 'Millimeters';
            const canonicalOrientation = orientation === 'Landscape' ? 'Landscape' : 'Portrait';
            const canonicalPlotArea = plotArea === 'Layout' ? 'Layout' : (plotArea === 'Display' ? 'Display' : 'Extents');
            const canonicalScale = scale === 'Fit' ? 'Fit' : (scale || 'Fit');
            const canonicalPlotStyle = plotStyle || 'monochrome.ctb';
            const canonicalLineweights = lineweights ? 'Yes' : 'No';

            const plotScript = `(vl-load-com)
(defun c:CloudPlot ()
  (setvar "FILEDIA" 0)
  (setvar "CMDECHO" 1)
  (if (= (getvar "CTAB") "Model")
    (command "-PLOT"
      "Yes"                               ; Detailed plot configuration?
      "Model"                             ; Layout name
      "DWG To PDF.pc3"                    ; Output device name
      "${canonicalPaperSize}"             ; Paper size
      "${units}"                          ; Paper units
      "${canonicalOrientation}"           ; Drawing orientation
      "No"                                ; Plot upside down?
      "${canonicalPlotArea}"              ; Plot area (Extents/Display/Limits)
      "${canonicalScale}"                 ; Plot scale (Fit or scale string like 1:1)
      "Center"                            ; Plot offset (x,y) or [Center]
      "Yes"                               ; Plot with plot styles?
      "${canonicalPlotStyle}"             ; Plot style table name
      "${canonicalLineweights}"           ; Plot with lineweights?
      "As displayed"                      ; Plot with shading style? (Model space only!)
      "Yes"                               ; Write the plot to a file?
      "result.pdf"                        ; Enter file name
      "No"                                ; Save changes to page setup?
      "Yes"                               ; Proceed with plot?
    )
    (command "-PLOT"
      "Yes"                               ; Detailed plot configuration?
      (getvar "CTAB")                     ; Layout name
      "DWG To PDF.pc3"                    ; Output device name
      "${canonicalPaperSize}"             ; Paper size
      "${units}"                          ; Paper units
      "${canonicalOrientation}"           ; Drawing orientation
      "No"                                ; Plot upside down?
      "Layout"                            ; Plot area (Layout)
      "1:1"                               ; Plot scale
      "0,0"                               ; Plot offset
      "Yes"                               ; Plot with plot styles?
      "${canonicalPlotStyle}"             ; Plot style table name
      "${canonicalLineweights}"           ; Plot with lineweights?
      "No"                                ; Scale lineweights with plot scale?
      "No"                                ; Plot paper space first?
      "No"                                ; Hide paper space objects?
      "Yes"                               ; Write the plot to a file?
      "result.pdf"                        ; Enter file name
      "No"                                ; Save changes to page setup?
      "Yes"                               ; Proceed with plot?
    )
  )
  (if (findfile "result.pdf")
    (progn
      (vl-file-delete "input.dwg")
      (vl-file-rename "result.pdf" "input.dwg")
      (princ "\nSUCCESS: PDF printed and renamed successfully!")
    )
    (progn
      (princ "\nFATAL ERROR: result.pdf was not created by the plot command!")
      (exit)
    )
  )
  (princ)
)
(c:CloudPlot)`;

            const wiRes = await axios.post('https://developer.api.autodesk.com/da/us-east/v3/workitems', {
                activityId: `${APS_CLIENT_ID}.TitleBlockActivity+prod`,
                settings: { script: { value: plotScript } },
                arguments: { 
                    hostDwg: { url: signedDownload.data.url, localName: 'input.dwg' }, 
                    params: { url: `data:application/json;base64,${Buffer.from(JSON.stringify([{ BlockName: "Dummy" }])).toString('base64')}`, localName: 'params.json' }, 
                    result: { verb: 'put', url: signedUploadUrl, localName: 'input.dwg' } 
                }
            }, { headers: { Authorization: `Bearer ${internalToken}` } });

            const wiId = wiRes.data.id;
            workItemIds.push(wiId);

            pendingPrints.set(wiId, {
                status: 'executing',
                destination,
                projectId,
                targetFolderId,
                targetFolderName,
                uploadKey,
                storageId: accStorageId,
                drawingName,
                token,
                internalToken
            });
        }

        pendingBulkJobs.set(bulkJobId, {
            status: 'executing',
            destination,
            projectId,
            targetFolderId,
            targetFolderName,
            workItemIds,
            token,
            internalToken
        });

        res.json({ bulkJobId });
    } catch (err) {
        console.error('[Bulk Print Job Error]', err.response?.data || err.message);
        res.status(500).json({ message: err.response?.data?.message || err.message });
    }
});

app.get('/api/acc/print/status/:id', async (req, res) => {
    const workItemId = req.params.id;
    const printInfo = pendingPrints.get(workItemId);
    if (!printInfo) return res.status(404).json({ message: 'Job not found' });

    if (printInfo.status === 'success' || printInfo.status === 'failed') {
        return res.json({ status: printInfo.status, downloadUrl: printInfo.downloadUrl });
    }

    try {
        const response = await axios.get(`https://developer.api.autodesk.com/da/us-east/v3/workitems/${workItemId}`, { headers: { Authorization: `Bearer ${printInfo.internalToken}` } });
        const daStatus = response.data.status;

        if (daStatus === 'success') {
            console.log(`[Print Status success] Finalizing file for WorkItem: ${workItemId}`);
            
            const accBucket = printInfo.storageId.split('/')[0].split(':').pop();
            const accObjectKey = printInfo.storageId.split('/')[1];

            if (printInfo.uploadKey) {
                await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObjectKey)}/signeds3upload`, { uploadKey: printInfo.uploadKey }, { headers: { Authorization: `Bearer ${printInfo.token}` } });
            }

            if (printInfo.destination === 'acc') {
                const pdfName = `${printInfo.drawingName.replace(/\.[^/.]+$/, "")}.pdf`;
                await createACCFileItem(printInfo.projectId, printInfo.targetFolderId, pdfName, printInfo.storageId, printInfo.token);
                printInfo.status = 'success';
                res.json({ status: 'success' });
            } else {
                const signedDownloadRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObjectKey)}/signeds3download`, { headers: { Authorization: `Bearer ${printInfo.token}` } });
                printInfo.status = 'success';
                printInfo.downloadUrl = signedDownloadRes.data.url;
                res.json({ status: 'success', downloadUrl: signedDownloadRes.data.url });
            }
        } else if (daStatus === 'failed') {
            printInfo.status = 'failed';
            res.json({ status: 'failed' });
        } else {
            res.json({ status: daStatus });
        }
    } catch (err) {
        console.error('[Print Check Status Error]', err.response?.data || err.message);
        res.status(500).json({ message: err.response?.data?.message || err.message });
    }
});

app.get('/api/acc/print/bulk-status/:id', async (req, res) => {
    const bulkJobId = req.params.id;
    const bulkInfo = pendingBulkJobs.get(bulkJobId);
    if (!bulkInfo) return res.status(404).json({ message: 'Bulk job not found' });

    if (bulkInfo.status === 'success' || bulkInfo.status === 'failed') {
        return res.json({ status: bulkInfo.status, zipUrl: bulkInfo.zipUrl });
    }

    try {
        const statuses = [];
        let allCompleted = true;
        let anyFailed = false;

        for (const wiId of bulkInfo.workItemIds) {
            const printInfo = pendingPrints.get(wiId);
            if (!printInfo) continue;

            if (printInfo.status === 'success') {
                statuses.push('success');
            } else if (printInfo.status === 'failed') {
                statuses.push('failed');
                anyFailed = true;
            } else {
                const response = await axios.get(`https://developer.api.autodesk.com/da/us-east/v3/workitems/${wiId}`, { headers: { Authorization: `Bearer ${bulkInfo.internalToken}` } });
                const daStatus = response.data.status;

                if (daStatus === 'success') {
                    const accBucket = printInfo.storageId.split('/')[0].split(':').pop();
                    const accObjectKey = printInfo.storageId.split('/')[1];

                    if (printInfo.uploadKey) {
                        await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObjectKey)}/signeds3upload`, { uploadKey: printInfo.uploadKey }, { headers: { Authorization: `Bearer ${bulkInfo.token}` } });
                    }

                    if (printInfo.destination === 'acc') {
                        const pdfName = `${printInfo.drawingName.replace(/\.[^/.]+$/, "")}.pdf`;
                        await createACCFileItem(printInfo.projectId, printInfo.targetFolderId, pdfName, printInfo.storageId, printInfo.token);
                    }
                    printInfo.status = 'success';
                    statuses.push('success');
                } else if (daStatus === 'failed') {
                    printInfo.status = 'failed';
                    statuses.push('failed');
                    anyFailed = true;
                } else {
                    statuses.push(daStatus);
                    allCompleted = false;
                }
            }
        }

        if (allCompleted) {
            if (bulkInfo.destination === 'acc') {
                bulkInfo.status = 'success';
                res.json({ status: 'success' });
            } else {
                const { exec } = require('child_process');
                const tempDir = path.join(__dirname, 'data', `bulk_${bulkJobId}`);
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

                const pdfPaths = [];
                for (const wiId of bulkInfo.workItemIds) {
                    const printInfo = pendingPrints.get(wiId);
                    if (printInfo && printInfo.status === 'success') {
                        const accBucket = printInfo.storageId.split('/')[0].split(':').pop();
                        const accObjectKey = printInfo.storageId.split('/')[1];
                        const signedDownloadRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObjectKey)}/signeds3download`, { headers: { Authorization: `Bearer ${bulkInfo.token}` } });
                        
                        const pdfPath = path.join(tempDir, `${printInfo.drawingName.replace(/\.[^/.]+$/, "")}.pdf`);
                        const writer = fs.createWriteStream(pdfPath);
                        const fileRes = await axios.get(signedDownloadRes.data.url, { responseType: 'stream' });
                        fileRes.data.pipe(writer);
                        
                        await new Promise((resolve, reject) => {
                            writer.on('finish', resolve);
                            writer.on('error', reject);
                        });
                        pdfPaths.push(pdfPath);
                    }
                }

                const zipPath = path.join(__dirname, 'data', `printed_${bulkJobId}.zip`);
                const zipCmd = `zip -j "${zipPath}" "${tempDir}"/*.pdf`;

                exec(zipCmd, async (zipErr) => {
                    if (zipErr) {
                        console.error('[Bulk Zip Command Error]', zipErr);
                        bulkInfo.status = 'failed';
                        return res.json({ status: 'failed', message: zipErr.message });
                    }

                    try {
                        const rootFolderRes = await axios.get(`https://developer.api.autodesk.com/project/v1/hubs/${HUB_ID || 'dummy'}/projects/${bulkInfo.projectId}/topFolders`, { headers: { Authorization: `Bearer ${bulkInfo.token}` } }).catch(() => null);
                        const parentFolderId = rootFolderRes?.data?.data?.[0]?.id || bulkInfo.targetFolderId;

                        const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${bulkInfo.projectId}/storage`, {
                            jsonapi: { version: '1.0' },
                            data: {
                                type: 'objects',
                                attributes: { name: `printed_drawings_${Date.now()}.zip` },
                                relationships: { target: { data: { type: 'folders', id: parentFolderId } } }
                            }
                        }, { headers: { Authorization: `Bearer ${bulkInfo.token}` } });

                        const accStorageId = storageRes.data.data.id;
                        const accBucket = accStorageId.split('/')[0].split(':').pop(); 
                        const accObject = accStorageId.split('/')[1];

                        const signedUpload = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, { headers: { Authorization: `Bearer ${bulkInfo.token}` } });
                        
                        await axios.put(signedUpload.data.urls[0], fs.readFileSync(zipPath), { headers: { 'Content-Type': 'application/zip' } });
                        await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3upload`, { uploadKey: signedUpload.data.uploadKey }, { headers: { Authorization: `Bearer ${bulkInfo.token}` } });

                        const signedDownloadRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${accBucket}/objects/${encodeURIComponent(accObject)}/signeds3download`, { headers: { Authorization: `Bearer ${bulkInfo.token}` } });

                        bulkInfo.status = 'success';
                        bulkInfo.zipUrl = signedDownloadRes.data.url;

                        fs.rmSync(tempDir, { recursive: true, force: true });
                        fs.rmSync(zipPath, { force: true });

                        res.json({ status: 'success', zipUrl: signedDownloadRes.data.url });
                    } catch (uploadErr) {
                        console.error('[Bulk Zip Upload Error]', uploadErr.response?.data || uploadErr.message);
                        bulkInfo.status = 'failed';
                        res.json({ status: 'failed', message: uploadErr.message });
                    }
                });
            }
        } else {
            res.json({ status: 'executing' });
        }
    } catch (err) {
        console.error('[Bulk Check Status Error]', err.response?.data || err.message);
        res.status(500).json({ message: err.response?.data?.message || err.message });
    }
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
