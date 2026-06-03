import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

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

// ─── Email Transporter Setup ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Send Email Endpoint ────────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP Credentials not configured! Email skipped.");
      return res.status(200).json({ success: true, message: 'Skipped (No SMTP credentials)' });
    }

    const recipients = Array.isArray(to) ? to.join(', ') : to;
    
    const mailOptions = {
      from: `"Errands Support" <${process.env.SMTP_USER}>`,
      to: recipients,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
