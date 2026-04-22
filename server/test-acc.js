const axios = require('axios');
const fs = require('fs');

async function test() {
    const tokenRes = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: process.env.APS_CLIENT_ID, client_secret: process.env.APS_CLIENT_SECRET, grant_type: 'client_credentials', scope: 'data:read data:write data:create bucket:create bucket:read code:all' }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const token = tokenRes.data.access_token;

    // Project and Folder from our known state
    const cleanProjectId = '04697a63-6349-4946-b928-9d5a05be99b0';
    const folderId = 'urn:adsk.wipprod:fs.folder:co.yZMO8EXeR5KlGQOIphOlxQ';

    try {
        const createRes = await axios.post(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderId)}/custom-attribute-definitions`, {
            name: "Name ",
            type: "string",
            description: "Testing trailing space"
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Success:", createRes.data);
    } catch (e) {
        console.error("Error for 'Name ':", e.response?.data);
    }
}
require('dotenv').config({ path: './.env.local' });
require('dotenv').config({ path: './.env' });
test();
