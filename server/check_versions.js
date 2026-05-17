const axios = require('axios');
const fs = require('fs');

async function checkExcelVersions() {
    const token = process.argv[2];
    const projectId = 'b.04697a63-6349-4946-b928-9d5a05be99b0';
    const itemId = 'urn:adsk.wipprod:dm.lineage:9BC1wdwbT2W18FADZ1tZCw';

    try {
        console.log('Fetching all versions for the spreadsheet...');
        const res = await axios.get(`https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${encodeURIComponent(itemId)}/versions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const versions = res.data.data;
        console.log(`\nFound ${versions.length} versions:`);
        versions.forEach(v => {
            console.log(`- Version ${v.attributes.versionNumber}: ${v.id} (Modified: ${v.attributes.lastModifiedTime})`);
        });

        const tip = res.data.data[0];
        console.log('\nTip Version from List:', tip.id);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

checkExcelVersions();
