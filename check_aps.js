const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET
} = process.env;

async function getInternalToken() {
    const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token',
        new URLSearchParams({
            client_id: APS_CLIENT_ID,
            client_secret: APS_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'code:all'
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
}

async function checkActivities() {
    try {
        const token = await getInternalToken();
        const DA_URL = 'https://developer.api.autodesk.com/da/us-east/v3';

        console.log('--- Listing Activities ---');
        const res = await axios.get(`${DA_URL}/activities`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Registered Activities:', res.data);

        console.log('\n--- Listing AppBundles ---');
        const res2 = await axios.get(`${DA_URL}/appbundles`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Registered AppBundles:', res2.data);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

checkActivities();
