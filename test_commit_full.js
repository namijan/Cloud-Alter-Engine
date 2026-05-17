const axios = require('axios');
const xlsx = require('xlsx');
require('dotenv').config({ path: './server/.env.local' });
require('dotenv').config({ path: './server/.env' });

async function run() {
  try {
    const internalRes = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: process.env.APS_CLIENT_ID, client_secret: process.env.APS_CLIENT_SECRET, grant_type: 'client_credentials', scope: 'data:read data:write data:create bucket:create bucket:read viewables:read code:all' }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const token = internalRes.data.access_token;
    
    const projectId = 'b.04697a63-6349-4946-b928-9d5a05be99b0';
    const excelVersionId = 'urn:adsk.wipprod:fs.file:vf.vcXiYLBrRjOqvDIFbiirlQ?version=44';
    const drawingName = 'D4C_Sample_Drawing5';
    const updates = [{key: 'LayoutName', proposed: 'A1 Sheet1'}];

    console.log("Fetching version details...");
    const excelVersionDetails = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(excelVersionId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const excelItemId = excelVersionDetails.data.data.relationships.item.data.id;
    
    console.log("Fetching parent folder...");
    const parentRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(excelItemId)}`, { headers: { Authorization: `Bearer ${token}` } });
    const excelParentFolderId = parentRes.data.data.relationships.parent.data.id;
    
    console.log("Downloading excel...");
    const storageIdOld = excelVersionDetails.data.data.relationships.storage.data.id;
    const bucketKeyOld = storageIdOld.split('/')[0].split(':').pop();
    const objectKeyOld = storageIdOld.split('/')[1];
    const dlRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKeyOld}/objects/${encodeURIComponent(objectKeyOld)}`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'arraybuffer' });
    const wb = xlsx.read(dlRes.data);
    const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    
    const targetIdx = rows.findIndex(r => String(r.DrawingName) === String(drawingName));
    if(targetIdx === -1) throw new Error("Not found");
    updates.forEach(upd => { rows[targetIdx][upd.key] = upd.proposed; });
    
    console.log("Creating new workbook...");
    const newWorkbook = xlsx.utils.book_new(); xlsx.utils.book_append_sheet(newWorkbook, xlsx.utils.json_to_sheet(rows), "Sheet1");
    const outBuffer = xlsx.write(newWorkbook, { type: 'buffer' });
    
    console.log("Creating storage...");
    const storageRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`, { jsonapi: { version: '1.0' }, data: { type: 'objects', attributes: { name: excelVersionDetails.data.data.attributes.displayName }, relationships: { target: { data: { type: 'folders', id: excelParentFolderId } } } } }, { headers: { Authorization: `Bearer ${token}` } });
    const storageId = storageRes.data.data.id; const bucketKey = storageId.split('/')[0].split(':').pop(); const objectKey = storageId.split('/')[1];
    
    console.log("Getting signed URL...");
    const signedRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3upload`, { headers: { Authorization: `Bearer ${token}` } });
    
    console.log("Uploading to S3...");
    await axios.put(signedRes.data.urls[0], outBuffer);
    
    console.log("Completing S3 upload...");
    await axios.post(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3upload`, { uploadKey: signedRes.data.uploadKey }, { headers: { Authorization: `Bearer ${token}` } });
    
    console.log("Creating new version...");
    const versionsRes = await axios.post(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions`, { jsonapi: { version: '1.0' }, data: { type: 'versions', attributes: { name: excelVersionDetails.data.data.attributes.displayName, displayName: excelVersionDetails.data.data.attributes.displayName, extension: { type: 'versions:autodesk.bim360:File', version: '1.0' } }, relationships: { item: { data: { type: 'items', id: excelItemId } }, storage: { data: { type: 'objects', id: storageId } } } } }, { headers: { Authorization: `Bearer ${token}` } });
    
    console.log("Success! New version:", versionsRes.data.data.attributes.versionNumber);
  } catch(e) { console.error(e.response ? JSON.stringify(e.response.data) : e.message); }
}
run();
