#!/bin/bash
# Definitive Restart Script for Cloud Alter Engine

# 1. Kill any existing instances
echo "[1/4] Purging existing processes on Port 5175..."
lsof -ti:5175 | xargs kill -9 2>/dev/null || true
pkill -9 node 2>/dev/null || true

# 2. Clean build
echo "[2/4] Executing clean production build..."
rm -rf client/dist
cd client
npm run build
cd ..

# 3. Start server in detached mode
echo "[3/4] Launching server on Port 5175 (0.0.0.0)..."
nohup node server/index.js > server_log.txt 2>&1 &
disown

# 4. Verification
sleep 3
echo "[4/4] Final reachability check..."
curl -I http://127.0.0.1:5175
echo "Deployment Complete."
