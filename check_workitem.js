const axios = require('axios');
const path = require('path');
const fs = require('fs');
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

async function checkWorkItem(id) {
    try {
        const token = await getInternalToken();
        const DA_URL = 'https://developer.api.autodesk.com/da/us-east/v3';

        const res = await axios.get(`${DA_URL}/workitems/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        fs.writeFileSync('workitem_status.json', JSON.stringify(res.data, null, 2));

        if (res.data.reportUrl) {
            const reportRes = await axios.get(res.data.reportUrl);
            fs.writeFileSync('workitem_report.txt', reportRes.data);
            console.log('Report saved to workitem_report.txt');
        }

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

const wiId = process.argv[2] || '0a08aa8c31ad4f7f916fa93544decf43';
checkWorkItem(wiId);
