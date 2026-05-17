const axios = require('axios');
const xlsx = require('xlsx');
const fs = require('fs');

async function debugExcel() {
    const token = process.argv[2];
    const projectId = 'b.04697a63-6349-4946-b928-9d5a05be99b0';
    const itemId = 'urn:adsk.wipprod:dm.lineage:9BC1wdwbT2W18FADZ1tZCw';

    try {
        console.log('Fetching item details...');
        const itemRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const tipVersion = itemRes.data.data.relationships.tip.data.id;
        console.log('Tip Version:', tipVersion);

        const versionRes = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/versions/${encodeURIComponent(tipVersion)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const storageId = versionRes.data.data.relationships.storage.data.id;
        console.log('Storage ID:', storageId);

        const bucketKey = storageId.split('/')[0].split(':').pop();
        const objectKey = storageId.split('/')[1];
        
        console.log('Downloading file...');
        const downloadRes = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3download`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const fileData = await axios.get(downloadRes.data.url, { responseType: 'arraybuffer' });
        const workbook = xlsx.read(fileData.data, { type: 'buffer' });
        
        console.log('\n--- EXCEL CONTENT DUMP ---');
        workbook.SheetNames.forEach(name => {
            console.log(`\nSheet: ${name}`);
            const rows = xlsx.utils.sheet_to_json(workbook.Sheets[name]);
            console.log(JSON.stringify(rows, null, 2));
        });

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

debugExcel();
