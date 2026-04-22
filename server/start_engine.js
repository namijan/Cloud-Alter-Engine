const { execSync, spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting Cloud Alter Engine Stabilization...');

// 1. Kill old engines
try {
    console.log('Stopping old processes...');
    execSync('pkill -9 node || true');
} catch (e) { }

// 2. Start new engine on 5175 (IPv4 Loopback)
console.log('Launching Unified Engine on Port 5175...');
const out = require('fs').openSync('./server_log.txt', 'a');
const err = require('fs').openSync('./server_log.txt', 'a');

const server = spawn('node', ['index.js'], {
    detached: true,
    stdio: ['ignore', out, err]
});
server.unref();

// 3. Health check loop
let attempts = 0;
const check = () => {
    attempts++;
    if (attempts > 10) {
        console.error('❌ Engine failed to start after 10 seconds. Check server_log.txt');
        process.exit(1);
    }

    http.get('http://127.0.0.1:5175', (res) => {
        if (res.statusCode === 200) {
            console.log('✅ ENGINE IS ACTIVE AND REACHABLE!');
            console.log('👉 Open your browser at: http://localhost:5175');
            process.exit(0);
        } else {
            console.log(`...waiting for response (${res.statusCode})`);
            setTimeout(check, 1000);
        }
    }).on('error', (e) => {
        console.log(`...waiting for port (${e.message})`);
        setTimeout(check, 1000);
    });
};

setTimeout(check, 2000);
