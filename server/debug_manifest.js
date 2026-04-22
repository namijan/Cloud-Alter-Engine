const axios = require('axios');
const fs = require('fs');

async function debugM() {
    try {
        const token = JSON.parse(fs.readFileSync('server/data/tracker.json', 'utf8')).access_token;
        const urn = 'dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLjVtZ19rb3YzUUV5MEQwRk9pVjA5Qmc_dmVyc2lvbj0xMg'; // Drawing 1

        console.log("Fetching manifest...");
        const res = await axios.get(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`, { headers: { Authorization: `Bearer ${token}` } });
        console.log(JSON.stringify(res.data, null, 2));

    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
debugM();
