const axios = require('axios');
require('dotenv').config({ path: './server/.env.local' });
require('dotenv').config({ path: './server/.env' });

async function run() {
  try {
    const internalRes = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: process.env.APS_CLIENT_ID, client_secret: process.env.APS_CLIENT_SECRET, grant_type: 'client_credentials', scope: 'data:read data:write data:create bucket:create bucket:read viewables:read code:all' }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const token = internalRes.data.access_token;
    
    // Test creating a storage location
    const projectId = 'b.04697a63-6349-4946-b928-9d5a05be99b0';
    const excelVersionId = 'urn:adsk.wipprod:fs.file:vf.vcXiYLBrRjOqvDIFbiirlQ?version=44';
    
    const excelVersionDetails = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(excelVersionId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const excelItemId = excelVersionDetails.data.data.relationships.item.data.id;
    const excelParentFolderId = (await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(excelItemId)}`, { headers: { Authorization: `Bearer ${token}` } })).data.data.relationships.parent.data.id;
    
    console.log("Folder ID:", excelParentFolderId);
    console.log("Item ID:", excelItemId);
  } catch(e) { console.error(e.response ? e.response.data : e.message); }
}
run();
