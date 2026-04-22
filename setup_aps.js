const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET
} = process.env;

const APP_BUNDLE_NAME = 'TitleBlockAppBundle';
const ACTIVITY_NAME = 'TitleBlockActivity';
const ALIAS = 'prod';
const ENGINE = 'Autodesk.AutoCAD+24_3'; // AutoCAD 2024
const ZIP_PATH = path.join(__dirname, 'bundles', 'TitleBlockAutomation.zip');

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

async function uploadFile(uploadParams, filePath) {
    const endpoint = uploadParams.endpointURL || uploadParams.endpoint;
    console.log('   Uploading to:', endpoint);
    const form = new FormData();
    Object.keys(uploadParams.formData).forEach(key => {
        form.append(key, uploadParams.formData[key]);
    });
    form.append('file', fs.createReadStream(filePath));

    await axios.post(endpoint, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
}

async function setupDesignAutomation() {
    try {
        const token = await getInternalToken();
        const DA_URL = 'https://developer.api.autodesk.com/da/us-east/v3';
        console.log('--- Initializing Design Automation Setup (v3) ---');

        // 1. AppBundle
        console.log('1. Registering AppBundle...');
        const bundleSpec = { id: APP_BUNDLE_NAME, engine: ENGINE, description: 'Title Block Automation Plugin' };
        let uploadParams;
        try {
            const res = await axios.post(`${DA_URL}/appbundles`, bundleSpec, { headers: { Authorization: `Bearer ${token}` } });
            uploadParams = res.data.uploadParameters;
        } catch (e) {
            if (e.response?.status === 409) {
                const { id, ...vSpec } = bundleSpec;
                const res = await axios.post(`${DA_URL}/appbundles/${APP_BUNDLE_NAME}/versions`, vSpec, { headers: { Authorization: `Bearer ${token}` } });
                uploadParams = res.data.uploadParameters;
            } else throw e;
        }
        await uploadFile(uploadParams, ZIP_PATH);

        const appBundleVersionsRes = await axios.get(`${DA_URL}/appbundles/${APP_BUNDLE_NAME}/versions`, { headers: { Authorization: `Bearer ${token}` } });
        // In v3, versions might be returned as an array or { data: [] }
        const versionsArray = Array.isArray(appBundleVersionsRes.data) ? appBundleVersionsRes.data : appBundleVersionsRes.data.data;
        const latestBundleVer = Math.max(...versionsArray);

        try {
            await axios.post(`${DA_URL}/appbundles/${APP_BUNDLE_NAME}/aliases`, { id: ALIAS, version: latestBundleVer }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) {
            await axios.patch(`${DA_URL}/appbundles/${APP_BUNDLE_NAME}/aliases/${ALIAS}`, { version: latestBundleVer }, { headers: { Authorization: `Bearer ${token}` } });
        }

        // 2. Activity
        console.log('2. Defining Activity...');
        const activitySpec = {
            id: ACTIVITY_NAME,
            commandLine: [`$(engine.path)\\accoreconsole.exe /i "$(args[hostDwg].path)" /al "$(appbundles[${APP_BUNDLE_NAME}].path)" /s "$(settings[script].path)"`],
            parameters: {
                hostDwg: { verb: 'get', description: 'Input drawing', localName: 'input.dwg' },
                params: { verb: 'get', description: 'JSON parameters', localName: 'params.json' },
                result: { verb: 'put', description: 'Output drawing', localName: 'input.dwg' }
            },
            settings: { script: { value: `NETLOAD "$(appbundles[${APP_BUNDLE_NAME}].path)\\\\Contents\\\\TitleBlockAutomation.dll"\nUpdateAttributes\nQSAVE\n` } },
            appbundles: [`${APS_CLIENT_ID}.${APP_BUNDLE_NAME}+${ALIAS}`],
            engine: ENGINE,
            description: 'Update AutoCAD Title Block Attributes'
        };

        try {
            await axios.post(`${DA_URL}/activities`, activitySpec, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) {
            if (e.response?.status === 409) {
                const { id, ...vSpec } = activitySpec;
                await axios.post(`${DA_URL}/activities/${ACTIVITY_NAME}/versions`, vSpec, { headers: { Authorization: `Bearer ${token}` } });
            } else throw e;
        }

        const activityVersionsRes = await axios.get(`${DA_URL}/activities/${ACTIVITY_NAME}/versions`, { headers: { Authorization: `Bearer ${token}` } });
        const actVersionsArray = Array.isArray(activityVersionsRes.data) ? activityVersionsRes.data : activityVersionsRes.data.data;
        const latestActivityVer = Math.max(...actVersionsArray);

        console.log('   Latest Activity Version:', latestActivityVer);
        try {
            await axios.post(`${DA_URL}/activities/${ACTIVITY_NAME}/aliases`, { id: ALIAS, version: latestActivityVer }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) {
            await axios.patch(`${DA_URL}/activities/${ACTIVITY_NAME}/aliases/${ALIAS}`, { version: latestActivityVer }, { headers: { Authorization: `Bearer ${token}` } });
        }

        console.log(`\nSUCCESS! Activity ready and aliased: ${APS_CLIENT_ID}.${ACTIVITY_NAME}+${ALIAS}`);

    } catch (err) {
        console.error('Error during setup:', err.response?.data || err.message);
    }
}

setupDesignAutomation();
