const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'node_modules', 'maplibre-gl', 'dist');
const destDir = path.join(__dirname, '..', 'public', 'maplibre');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = [
  'maplibre-gl-worker.mjs',
  'maplibre-gl-worker.mjs.map',
  'maplibre-gl-worker-dev.mjs',
  'maplibre-gl-worker-dev.mjs.map',
  'maplibre-gl-shared.mjs',
  'maplibre-gl-shared.mjs.map',
  'maplibre-gl-shared-dev.mjs',
  'maplibre-gl-shared-dev.mjs.map'
];

let copied = 0;
for (const file of files) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copied++;
  }
}

console.log(`[sync-maplibre] Synced ${copied} files from node_modules/maplibre-gl/dist to public/maplibre.`);
