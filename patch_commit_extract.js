const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');
code = code.replace(/} catch \(err\) { res\.status\(500\)\.send\(err\.message\); }/g, "} catch (err) { console.error('[Commit Extract Error]', err.response ? err.response.data : err.message); res.status(500).send(err.message); }");
fs.writeFileSync('server/index.js', code);
