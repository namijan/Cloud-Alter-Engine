require('dotenv').config({ path: 'server/.env' });
const axios = require('axios');
const qs = require('querystring');

const APS_CLIENT_ID = process.env.APS_CLIENT_ID;
const APS_CLIENT_SECRET = process.env.APS_CLIENT_SECRET;

async function getToken() {
    const res = await axios.post('https://developer.api.autodesk.com/authentication/v2/token',
        qs.stringify({
            client_id: APS_CLIENT_ID,
            client_secret: APS_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'code:all'
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return res.data.access_token;
}

async function run() {
    const token = await getToken();
    const id = process.argv[2];
    try {
        const wiRes = await axios.get(`https://developer.api.autodesk.com/da/us-east/v3/workitems/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(JSON.stringify(wiRes.data, null, 2));
        if (wiRes.data.reportUrl) {
            const rep = await axios.get(wiRes.data.reportUrl);
            const fs = require('fs');
            fs.writeFileSync('latest_wi_report.txt', rep.data);
            console.log('Report saved to latest_wi_report.txt');
        }
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
run();
