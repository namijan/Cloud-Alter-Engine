# Enterprise Titleblock Automation & Cloud Synchronization (v2.3.0 Stable)

An agentic, premium, multi-language cloud synchronization engine built on the **Autodesk Platform Services (APS)** API. This system automates the synchronization of Autodesk Construction Cloud (ACC) and BIM 360 drawing sheet titleblocks with live Excel spreadsheet records in real-time.

---

## 🚀 Key Features in v2.3.0 Stable

- **Exhaustive Multi-Language (i18n) Support**: Dynamically switch the entire user interface, operations manuals, telemetry feedback registries, and system logs across **English, Spanish, French, German, Japanese, Chinese, and Hindi**.
- **Robust Concurrency Locking**: Sequentially processes ACC to Excel write-backs using an internal execution scheduler queue, preventing race conditions and auto-updating target URN spreadsheet versions.
- **Dynamic Database Telemetry**: Features seamless persistence for operational history and feedback telemetry across **PostgreSQL, MongoDB, and local JSON file-based storage fallback**.
- **Chronological Date Groupings**: Operations logs are automatically grouped by native locale-aware date headers (e.g., *Thursday, May 28, 2026*).
- **Responsive Premium Interface**: Curated modern HSL palettes, glassmorphic UI cards, subtle micro-animations, and full-screen cloud model inspections via the integrated **APS Viewer**.

---

## 🌐 Protocols for External Publishing (Railway, Azure DevOps, Custom Servers)

To publish this application to external cloud environments (such as Railway or Azure DevOps pipelines), follow these integration protocols:

### 1. Autodesk Developer Application Setup
1. Log in to the [Autodesk Developer Portal](https://developer.autodesk.com/).
2. Create a new APS Application with access to the **Data Management API**, **Design Automation API**, and **BIM 360 API**.
3. **CRITICAL Callback URL configuration**:
   - In the APS Developer Console, configure the **Redirect URL** (Callback) to point to your external publishing host:
     ```text
     https://<your-external-app-domain>.com/api/auth/callback
     ```
   - For local development, register an additional callback pointing to `http://localhost:5173/api/auth/callback`.

### 2. Environment Variables Configuration
Set the following environment variables in your deployment environment (e.g. Railway Variables, Azure Pipelines variables, or a secure production `.env` file):

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `APS_CLIENT_ID` | Your APS App Client ID | `ZroG86fKk5oQ...PtU3F6rF` |
| `APS_CLIENT_SECRET` | Your APS App Client Secret | `mMt1O1HMd3PO...Aq0zgrVfID` |
| `APS_CALLBACK_URL` | The external OAuth callback URL | `https://your-domain.com/api/auth/callback` |
| `SESSION_SECRET` | Secure cryptographic seed for Express sessions | `super_secure_crypto_hash` |
| `PORT` | Running port for the Node.js Express server | `5173` |
| `DATABASE_URL` | (Optional) Secure connection string for PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `MONGODB_URI` | (Optional) Secure connection string for MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/db` |

*Note: If neither `DATABASE_URL` nor `MONGODB_URI` are provided, the system seamlessly falls back to local persistent JSON file storage under `server/data/` for history and feedback.*

### 3. Autodesk Construction Cloud Hub Provisioning (Step 0)
Before your team can establish server handshakes and fetch drawings:
1. Log in to your **Autodesk Construction Cloud (ACC)** or **BIM 360 Account Admin** portal.
2. Navigate to **Custom Integrations** -> **Add Custom Integration**.
3. Select **Account Administration** and **Document Management** scopes.
4. Input your `APS_CLIENT_ID` and finalize authorization.

---

## 🛠️ Local Development & Running

### Prerequisites
- Node.js (v18+)
- npm

### Installation
Install dependencies for both client and server:
```bash
npm run install:all
```

### Dev Execution
Start the server and client concurrently:
```bash
npm run dev
```
The server will boot on Port `5173` (proxied), and the hot-reloading client will run concurrently.

### Production Build & Launch
Build client assets and spin up the Express production listener:
```bash
npm run build
npm start
```
Alternatively, on local Mac systems, you can execute the automated clean-rebuild deployment script:
```bash
./restart_server.sh
```

---

## 📂 Project Structure

```text
├── client/                 # Frontend React SPA
│   ├── src/
│   │   ├── App.jsx         # Main console, Translations Dict, Feedback Registry
│   │   ├── DocumentationPage.jsx # Operations Manual
│   │   └── ReleaseNotesPage.jsx   # What's New & Version Changelog
│   └── vite.config.js      # Dev Server & API proxy routing
├── server/                 # Express REST Backend API & Database Fallbacks
│   ├── index.js            # Main Express Server
│   └── data/               # Persistent JSON fallback database
└── restart_server.sh       # Automated compilation & server restart control script
```

---

## 📄 License
Enterprise Proprietary Software - All rights reserved. Powered by Autodesk Platform Services.
