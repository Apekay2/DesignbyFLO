import cors from 'cors';

// Origins allowed to call this API from the Capacitor-wrapped app / local dev.
// Never use '*' here — the webview sends an Origin header that must be matched
// explicitly, same rationale as the client-side CSP connect-src allow-list.
const ALLOWED_ORIGINS = [
  'capacitor://localhost',   // iOS WKWebView
  'http://localhost',        // Android WebView
  'http://localhost:3000',   // npx serve www (npm run dev)
  'http://localhost:5000',
  ...(process.env.CORS_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean),
];

export const apiCors = cors({
  origin(origin, cb){
    // no Origin header (native fetch in some contexts, curl, health checks) — allow
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`Origin not allowed: ${origin}`));
  }
});
