const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const axios = require('axios');
require('dotenv').config({ path: './server/.env.local' });
require('dotenv').config({ path: './server/.env' });

async function run() {
  try {
    const internalRes = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', new URLSearchParams({ client_id: process.env.APS_CLIENT_ID, client_secret: process.env.APS_CLIENT_SECRET, grant_type: 'client_credentials', scope: 'data:read data:write data:create bucket:create bucket:read viewables:read code:all' }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const token = internalRes.data.access_token;
    
    const urn = "dXJuOmFkc2sud2lwcHJvZGFuejpmcy5maWxlOnZmLkV4Z2VxSWpsVEFxWUlIYzNCM3piTVE_dmVyc2lvbj0z";
    
    const res = await axios.get(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`, { headers: { Authorization: `Bearer ${token}` } });
    console.log("Success with no region:", res.data.status);
  } catch(e) {
    console.error("Error with no region:", e.response?.status, e.response?.data || e.message);
  }
}
run();
