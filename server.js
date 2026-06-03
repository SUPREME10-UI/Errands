import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve from dist/ (production Vite build) if it exists, otherwise fall back to public/
const staticDir = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Dynamic env-config endpoint ─────────────────────────────────────────────
// Exposes only VITE_* env vars to the browser as window.__ENV__
// This allows the static JS files to read Firebase config without hardcoding it.
app.get('/js/env-config.js', (req, res) => {
  const env = {
    VITE_FIREBASE_API_KEY:              process.env.VITE_FIREBASE_API_KEY              || '',
    VITE_FIREBASE_AUTH_DOMAIN:          process.env.VITE_FIREBASE_AUTH_DOMAIN          || '',
    VITE_FIREBASE_PROJECT_ID:           process.env.VITE_FIREBASE_PROJECT_ID           || '',
    VITE_FIREBASE_STORAGE_BUCKET:       process.env.VITE_FIREBASE_STORAGE_BUCKET       || '',
    VITE_FIREBASE_MESSAGING_SENDER_ID:  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID  || '',
    VITE_FIREBASE_APP_ID:               process.env.VITE_FIREBASE_APP_ID               || '',
  };

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store'); // Never cache — env can change on redeploy
  res.send(`window.__ENV__ = ${JSON.stringify(env)};`);
});
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.static(staticDir));

// Serves the client SPA index.html on wildcard routes to support client-side routing
app.get('*', (req, res) => res.sendFile(path.join(staticDir, 'index.html')));

// Start server (skipped on Vercel — it uses the exported app directly)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Run My Errand running at http://localhost:${PORT}`);
    console.log(`🔒 Firebase config served dynamically via /js/env-config.js`);
  });
}

export default app;
