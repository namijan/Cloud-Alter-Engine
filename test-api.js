const axios = require('axios');

async function getInternalToken() {
    const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: process.env.APS_CLIENT_ID, client_secret: process.env.APS_CLIENT_SECRET, grant_type: 'client_credentials', scope: 'data:read data:write data:create bucket:create bucket:read code:all' }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    return response.data.access_token;
}

(async () => {
    require('dotenv').config({path: './server/.env.local'});
    require('dotenv').config({path: './server/.env'});
    const token = await getInternalToken();
    const cleanProjectId = '04697a63-6349-4946-b928-9d5a05be99b0';
    const folderId = 'urn:adsk.wipprod:fs.folder:co.kpsOSG10THC61Z1y3gH9nw'; // Sample drawings folder
    try {
        const res = await axios.post(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderId)}/custom-attribute-definitions`, [{
            name: "TEST_ATTR_ARRAY",
            type: "string",
            description: "Testing array format"
        }], { headers: { Authorization: `Bearer ${token}` } });
        console.log("Success with Array:", res.data);
    } catch(e) {
        console.error("Array format failed:", e.response?.data);
    }
    
    try {
        const res = await axios.post(`https://developer.api.autodesk.com/bim360/docs/v1/projects/${cleanProjectId}/folders/${encodeURIComponent(folderId)}/custom-attribute-definitions`, {
            name: "TEST_ATTR_OBJ",
            type: "string",
            description: "Testing object format"
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Success with Object:", res.data);
    } catch(e) {
        console.error("Object format failed:", e.response?.data);
    }
})();
