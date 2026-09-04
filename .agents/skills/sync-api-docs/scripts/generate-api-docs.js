const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();
const modulesDir = path.resolve(rootDir, 'backend/src/modules');

console.log('🔍 Scanning API modules in:', modulesDir);

const modules = fs.readdirSync(modulesDir).filter(f => {
  return fs.statSync(path.join(modulesDir, f)).isDirectory();
});

let endpointsCount = 0;
const scannedModules = [];

modules.forEach(mod => {
  const routesFile = path.join(modulesDir, mod, `${mod.slice(0, -1)}.routes.ts`);
  const altRoutesFile = path.join(modulesDir, mod, `${mod}.routes.ts`);
  const targetFile = fs.existsSync(routesFile) ? routesFile : (fs.existsSync(altRoutesFile) ? altRoutesFile : null);

  if (targetFile) {
    const content = fs.readFileSync(targetFile, 'utf8');
    const routeLines = content.split('\n').filter(line => line.includes('router.'));
    endpointsCount += routeLines.length;
    scannedModules.push({ module: mod, file: targetFile, count: routeLines.length });
  }
});

console.log(`✅ Scanned ${scannedModules.length} modules (${endpointsCount} endpoints total).`);

// 1. Trigger Postman Collection Sync
const syncPostmanScript = path.resolve(__dirname, '../../zayna-postman-api/scripts/sync-postman.js');
if (fs.existsSync(syncPostmanScript)) {
  console.log('🚀 Syncing Postman Collection...');
  try {
    const out = execSync(`node "${syncPostmanScript}"`, { encoding: 'utf8' });
    console.log(out.trim());
  } catch (e) {
    console.error('⚠️ Postman sync warning:', e.message);
  }
}

console.log('✨ API Documentation & Postman Collection successfully updated!');
