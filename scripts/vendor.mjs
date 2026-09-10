import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const PINNED_SHA = '';   // optional: paste a trusted sha256 here to pin the model in your supply chain
const www = 'www';

mkdirSync(`${www}/vendor/three/addons`, { recursive: true });
mkdirSync(`${www}/vendor/mediapipe/wasm`, { recursive: true });
mkdirSync(`${www}/assets/models`, { recursive: true });

// --- three.js core
cpSync('node_modules/three/build/three.module.js', `${www}/vendor/three/three.module.js`);

// --- addons: follow relative imports recursively so nothing is silently missing  [C4]
const copied = new Set();
function copyAddon(rel) {
  if (copied.has(rel)) return; copied.add(rel);
  const src = path.join('node_modules/three/examples/jsm', rel);
  const dst = path.join(www, 'vendor/three/addons', rel);
  mkdirSync(path.dirname(dst), { recursive: true });
  let js = readFileSync(src, 'utf8');
  const depth = rel.split('/').length - 1;
  js = js.replace(/from\s+'three'/g, `from '${'../'.repeat(depth + 1)}three.module.js'`);
  writeFileSync(dst, js);
  for (const m of js.matchAll(/from\s+'(\.\.?\/[^']+)'/g)) {
    const t = path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1]));
    if (existsSync(path.join('node_modules/three/examples/jsm', t))) copyAddon(t);
  }
  console.log('addon:', rel);
}
copyAddon('controls/OrbitControls.js');
copyAddon('environments/RoomEnvironment.js');

// --- mediapipe (ESM + wasm, offline)
cpSync('node_modules/@mediapipe/tasks-vision/vision_bundle.mjs', `${www}/vendor/mediapipe/vision_bundle.mjs`);
cpSync('node_modules/@mediapipe/tasks-vision/wasm', `${www}/vendor/mediapipe/wasm`, { recursive: true });

// --- pose model: fetched ONCE here; runtime verifies the shipped file against the manifest  [H1]
const res = await fetch(MODEL_URL);
if (!res.ok) throw new Error(`model download failed: HTTP ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
if (buf.length < 1000000) throw new Error(`model suspiciously small (${buf.length} bytes) — refusing`);
const sha = createHash('sha256').update(buf).digest('hex');
if (PINNED_SHA && sha !== PINNED_SHA) throw new Error('downloaded model does not match PINNED_SHA');
writeFileSync(`${www}/assets/models/pose_landmarker_lite.task`, buf);
writeFileSync(`${www}/assets/models/model-manifest.json`,
  JSON.stringify({ file: 'pose_landmarker_lite.task', sha256: sha, bytes: buf.length, source: MODEL_URL, pinned: !!PINNED_SHA }, null, 2));
console.log('model sha256:', sha);

// --- fonts (self-hosted, no runtime requests)  [M5]
const FONTS = {
  fraunces: ['400', '600', '700', '400-italic', '600-italic'],
  archivo: ['400', '500', '600'],
  'ibm-plex-mono': ['400', '500']
};
for (const [f, weights] of Object.entries(FONTS)) {
  mkdirSync(`${www}/fonts/${f}/files`, { recursive: true });
  cpSync(`node_modules/@fontsource/${f}/files`, `${www}/fonts/${f}/files`,
    { recursive: true, filter: s => !/\.[a-z0-9]+$/i.test(s) || s.endsWith('.woff2') || s.endsWith('.woff') });
  for (const w of weights) cpSync(`node_modules/@fontsource/${f}/${w}.css`, `${www}/fonts/${f}/${w}.css`);
}
console.log(`vendored ${copied.size + 1} three files, mediapipe wasm, model (${(buf.length / 1048576).toFixed(1)} MB), fonts → www/`);
console.log('next: npx cap sync (once native platforms exist)');