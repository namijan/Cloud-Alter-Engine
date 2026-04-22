const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const { APS_CLIENT_ID, APS_CLIENT_SECRET, PROJECT_ID } = process.env;

async function getInternalToken() {
    const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token',
        new URLSearchParams({
            client_id: APS_CLIENT_ID,
            client_secret: APS_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'data:read'
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
}

async function inspectItem(versionId) {
    const token = await getInternalToken();
    try {
        const res = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${PROJECT_ID}/versions/${encodeURIComponent(versionId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.response?.data || e.message);
    }
}

// Replace with a known successful versionId from logs
inspectItem('urn:adsk.wipprod:fs.file:vf.5mg_kov3QEy0D0FOiV09Bg?version=1');
