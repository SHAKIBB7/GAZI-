const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

let spawnedServer = null;

function checkServerHealth(port = 4000) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.status === 'ok');
        } catch (_) {
          resolve(res.statusCode === 200);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startServerIfNeeded(port = 4000) {
  const isHealthy = await checkServerHealth(port);
  if (isHealthy) {
    return null; // Already running externally
  }

  console.log(`📡 Test server not detected on port ${port}. Spawning background instance...`);
  const serverScript = path.join(__dirname, '../server/server.js');
  spawnedServer = spawn(process.execPath, [serverScript], {
    env: { ...process.env, PORT: String(port), NODE_ENV: 'test' },
    stdio: 'ignore',
  });

  // Wait up to 15 seconds for server to be responsive
  const start = Date.now();
  while (Date.now() - start < 15000) {
    await new Promise(r => setTimeout(r, 400));
    const healthy = await checkServerHealth(port);
    if (healthy) {
      console.log(`✅ Test server successfully started and healthy on port ${port}.\n`);
      return spawnedServer;
    }
  }

  throw new Error(`Failed to start test server on port ${port} within 15 seconds.`);
}

function stopServer() {
  if (spawnedServer && !spawnedServer.killed) {
    try {
      spawnedServer.kill('SIGTERM');
    } catch (_) {}
    spawnedServer = null;
  }
}

// Clean up child process if main process exits
process.on('exit', stopServer);
process.on('SIGINT', () => { stopServer(); process.exit(1); });
process.on('SIGTERM', () => { stopServer(); process.exit(1); });

module.exports = {
  checkServerHealth,
  startServerIfNeeded,
  stopServer,
};
