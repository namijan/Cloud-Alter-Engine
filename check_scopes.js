const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env.local') });
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;

async function testScope(scope) {
    try {
        await axios.post('https://developer.api.autodesk.com/authentication/v2/token', 
            new URLSearchParams({
                client_id: APS_CLIENT_ID,
                client_secret: APS_CLIENT_SECRET,
                grant_type: 'client_credentials',
                scope: scope
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        console.log(`[PASS] ${scope}`);
    } catch (err) {
        console.log(`[FAIL] ${scope}: ${err.response?.data?.error || err.message}`);
    }
}

async function run() {
    const scopes = ['data:read', 'data:write', 'data:create', 'bucket:read', 'bucket:create', 'viewables:read', 'code:all'];
    for (const scope of scopes) {
        await testScope(scope);
    }
    
    // Test the combined string used in the app (2-legged)
    await testScope('data:read data:write data:create bucket:create bucket:read code:all');
}

run();
