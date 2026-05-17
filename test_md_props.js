const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: './server/.env.local' });
require('dotenv').config({ path: './server/.env' });

async function run() {
  try {
    const internalRes = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: process.env.APS_CLIENT_ID, client_secret: process.env.APS_CLIENT_SECRET, grant_type: 'client_credentials', scope: 'data:read data:write data:create bucket:create bucket:read viewables:read code:all' }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const token = internalRes.data.access_token;
    
    const urn = "dXJuOmFkc2sud2lwcHJvZGFuejpmcy5maWxlOnZmLkV4Z2VxSWpsVEFxWUlIYzNCM3piTVE_dmVyc2lvbj0z";
    const mdBaseUrl = `https://developer.api.autodesk.com/modelderivative/v2/regions/apac/designdata`;

    const metaRes = await axios.get(`${mdBaseUrl}/${urn}/metadata`, { headers: { Authorization: `Bearer ${token}` } });
    const views = metaRes.data.data.metadata;
    
    let collection;
    for(let i=0; i<10; i++) {
        const propRes = await axios.get(`${mdBaseUrl}/${urn}/metadata/${views[0].guid}/properties?forceget=true`, { headers: { Authorization: `Bearer ${token}` } });
        if(propRes.status === 200 && propRes.data.data) {
            collection = propRes.data.data.collection;
            break;
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    
    if(!collection) return console.log("No collection");
    
    const tbs = collection.filter(obj => {
        const n = (obj.name || "").toLowerCase();
        return n.includes('titleblock') || n.includes('title block') || n.includes('tb');
    });
    
    fs.writeFileSync('tbs.json', JSON.stringify(tbs, null, 2));
    console.log(`Found ${tbs.length} title blocks.`);
    
  } catch(e) {
    console.error(e.message);
  }
}
run();
