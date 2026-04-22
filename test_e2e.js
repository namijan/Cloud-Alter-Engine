require('dotenv').config({ path: 'server/.env' });
const axios = require('axios');
const fs = require('fs');

async function testPipeline() {
    console.log('Testing End-to-End Pipeline...');
    try {
        // 1. Simulate Match
        console.log('--- Matching ---');
        const matchRes = await axios.post('http://localhost:8080/api/automation/match', {
            projectId: process.env.HUB_ID.split('-')[1] ? `b.${process.env.HUB_ID.split('-')[1]}` : process.env.PROJECT_ID, // Use the proper project ID
            excelVersionId: 'urn:adsk.wipprod:fs.file:vf.vcXiYLBrRjOqvDIFbiirlQ?version=2' // Hardcoded from server log
        });

        const match = matchRes.data.find(m => m.matchedFile);
        if (!match) {
            console.error('No matched drawing found!');
            return;
        }

        console.log(`Matched row: ${match.excelRow.DrawingName} -> ${match.matchedFile.name}`);

        // 2. Simulate Update
        console.log('--- Triggering Update ---');
        const updateRes = await axios.post('http://localhost:8080/api/automation/update', {
            versionId: match.matchedFile.versionId,
            drawingName: match.excelRow.DrawingName
        });

        const workItemId = updateRes.data.workItemId;
        console.log(`WorkItem started: ${workItemId}`);

        // 3. Poll Status
        console.log('--- Polling Status ---');
        let status = 'pending';
        let downloadUrl = null;
        while (status !== 'success' && status !== 'failed') {
            await new Promise(r => setTimeout(r, 4000));
            const statusRes = await axios.get(`http://localhost:8080/api/automation/status/${workItemId}`);
            status = statusRes.data.status;
            downloadUrl = statusRes.data.downloadUrl;
            console.log(`Status: ${status}`);
        }

        if (status === 'success' && downloadUrl) {
            console.log(`Test passed! Download URL: ${downloadUrl}`);
            const wiRep = await axios.get(`https://developer.api.autodesk.com/da/us-east/v3/workitems/${workItemId}`, {
                headers: {
                    // we need token if we want report.. skip
                }
            }).catch(() => null);
        } else {
            console.error('Test failed or no download URL');
        }

    } catch (e) {
        console.error('Pipeline failed:', e.response?.data || e.message);
    }
}
testPipeline();
