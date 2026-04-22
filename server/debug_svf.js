const axios = require('axios');
const fs = require('fs');

async function debug() {
    try {
        const tokenData = JSON.parse(fs.readFileSync('server/data/tracker.json', 'utf8'));
        const token = tokenData.access_token;
        const urn = 'dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLjVtZ19rb3YzUUV5MEQwRk9pVjA5Qmc_dmVyc2lvbj0xMg'; // Drawing 1 v12

        console.log("Fetching metadata...");
        const metadataRes = await axios.get(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata`, { headers: { Authorization: `Bearer ${token}` } });
        const views = metadataRes.data.data?.metadata || [];

        let allObjects = [];
        for (const view of views) {
            console.log(`Fetching properties for view ${view.guid}...`);
            const propRes = await axios.get(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${view.guid}/properties`, { headers: { Authorization: `Bearer ${token}` } });
            if (propRes.data?.data?.collection?.length > 0) {
                allObjects = propRes.data.data.collection;
                break;
            }
        }

        console.log(`Found ${allObjects.length} objects.`);
        for (const obj of allObjects.slice(0, 15)) {
            console.log(`Object: ${obj.name || '<no-name>'}, Props: ${Object.keys(obj.properties || {}).join(', ')}`);
        }

    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
debug();
