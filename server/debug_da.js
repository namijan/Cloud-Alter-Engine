const axios = require('axios');
const fs = require('fs');

async function debugDA() {
    try {
        console.log('Fetching projects...');
        const hubsRes = await axios.get('http://localhost:5175/api/acc/hubs');
        if (!hubsRes.data.length) return console.log('No hubs found');
        const hubId = hubsRes.data[0].id;

        const projectsRes = await axios.get(`http://localhost:5175/api/acc/projects?hubId=${hubId}`);
        const projectId = projectsRes.data[0].id;

        console.log(`Using Project: ${projectId}`);
        const excelRes = await axios.get(`http://localhost:5175/api/acc/excel-files?projectId=${projectId}`);
        const excelFiles = excelRes.data;
        if (!excelFiles.length) return console.log('No excel files found');

        const excelId = excelFiles[0].versionId;
        console.log(`Using Excel: ${excelId}`);

        const matchRes = await axios.post('http://localhost:5175/api/automation/match', {
            hubId, projectId, excelVersionId: excelId
        });

        const matchData = matchRes.data;
        console.log(`[Diagnostic] Match returned ${matchData.length} entries.`);

        const dwg4 = matchData.find(m => m.excelRow && m.excelRow.DrawingName && m.excelRow.DrawingName.includes('Drawing4'));

        if (!dwg4) {
            return console.log('D4C_Sample_Drawing4 not found in Excel dataset!');
        }

        console.log('--- FOUND D4C_Sample_Drawing4 IN EXCEL ---');
        console.log('Excel Row Data:');
        console.log(JSON.stringify(dwg4.excelRow, null, 2));

        // Now, let's see how the payload looks for the DA engine
        const paramsBase64 = Buffer.from(JSON.stringify({ BlockName: dwg4.excelRow.BlockName, ...dwg4.excelRow })).toString('base64');
        const decodedParams = Buffer.from(paramsBase64, 'base64').toString('ascii');

        console.log('\n--- PAYLOAD TO BE SENT TO DESIGN AUTOMATION ---');
        console.log(decodedParams);

    } catch (e) {
        console.error(e.message);
    }
}

debugDA();
