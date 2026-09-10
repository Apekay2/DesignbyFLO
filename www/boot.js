(function(){
  const REQUIRED = [
    'style.css', 'app.js', 'boot.js', 'config.js', 'fallback-data.js',
    'vendor/three/three.module.js',
    'vendor/three/addons/controls/OrbitControls.js',
    'vendor/three/addons/environments/RoomEnvironment.js',
    'vendor/mediapipe/vision_bundle.mjs',
    'vendor/mediapipe/wasm/vision_wasm_internal.wasm',
    'assets/models/pose_landmarker_lite.task',
    'assets/models/model-manifest.json',
    'fonts/fraunces/400.css', 'fonts/archivo/400.css', 'fonts/ibm-plex-mono/400.css'
  ];
  const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  function fail(title, detail){
    if (document.getElementById('boot-fail')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div id="boot-fail" style="position:fixed;inset:0;z-index:999;background:#F2EDE3;color:#221E19;'+
      'font-family:ui-monospace,monospace;font-size:12px;line-height:1.7;padding:40px;overflow:auto">'+
      '<div style="max-width:540px;margin:0 auto;border:1.5px solid #BF4520;padding:26px">'+
      '<div style="color:#BF4520;letter-spacing:.15em;font-size:10px">FLO · BOOT DIAGNOSTIC</div>'+
      '<h2 style="font-family:Georgia,serif;font-size:20px;margin:8px 0 14px;font-weight:600">'+esc(title)+'</h2>'+
      '<div style="white-space:pre-wrap">'+esc(detail)+'</div></div></div>');
  }
  if (location.protocol === 'file:') {
    fail('This app must be served, not opened from disk',
      'ES modules and the camera are blocked on file://\n\nRun:\n   npm run dev\nthen open the http://localhost URL it prints.');
    return;
  }
  window.addEventListener('error', e => {
    if (!window.__FLO_BOOTED && e.filename && /app\.js|vendor\//.test(e.filename))
      fail('A startup error occurred', (e.message || '') + '\n\nSee the DevTools console for the full trace.');
  }, true);
  window.addEventListener('unhandledrejection', e => {           // [M4]
    if (!window.__FLO_BOOTED)
      fail('A startup promise failed', ((e.reason && e.reason.message) || String(e.reason)) + '\n\nSee the DevTools console.');
  });
  function boot(){
    const s = document.createElement('script');
    s.type = 'module'; s.src = 'app.js?v=' + Date.now();
    s.onerror = () => fail('app.js failed to load', 'Check the DevTools console.');
    document.head.appendChild(s);
    setTimeout(() => {
      if (!window.__FLO_BOOTED) fail('The app stalled during startup', 'An error was thrown before init finished — check the DevTools console.');
    }, 10000);
  }
  Promise.all(REQUIRED.map(p => fetch(p, { method: 'HEAD' }).then(r => r.ok ? null : p).catch(() => p)))
    .then(missing => {
      const miss = missing.filter(Boolean);
      if (miss.length) return fail('Vendored assets are missing',
        'Missing:\n   ' + miss.join('\n   ') + '\n\nRun:\n   npm install\n   npm run setup\nthen reload.');
      boot();
    })
    .catch(() => fail('Preflight failed', 'Could not check local assets.'));
})();