import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import pg from 'pg';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import admin from 'firebase-admin';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Headers with Helmet ─────────────────────────────────────────
app.use(helmet());

// ─── Rate Limiting ────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit sensitive endpoints to 5 requests per hour
  message: 'Too many attempts, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit auth attempts to 10 per hour
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.'
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter); // Apply general rate limit to all routes

// ─── Firebase Admin Initialization ────────────────────────────────────────
try {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
} catch (err) {
  console.warn('⚠️ Firebase Admin not fully configured (acceptable in dev)', err.message);
}

// Serve from dist/ (production Vite build) if it exists, otherwise fall back to public/
const staticDir = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'public');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ─── Authentication & Authorization Middleware ─────────────────────────────
async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has admin role in database
    const result = await pool.query('SELECT role FROM users WHERE uid = $1', [req.user.uid]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error.message);
    return res.status(403).json({ error: 'Forbidden' });
  }
}

// ─── Input Validation Schemas ────────────────────────────────────────────
const schemas = {
  user: Joi.object({
    uid: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('user', 'admin').default('user'),
    name: Joi.string().max(255),
    phone: Joi.string().max(100),
    address: Joi.string().max(500)
  }),
  order: Joi.object({
    category: Joi.string().required().max(255),
    pickupLocation: Joi.string().required().max(500),
    dropoffLocation: Joi.string().required().max(500),
    description: Joi.string().required().max(2000),
    urgency: Joi.string().valid('Standard', 'Urgent', 'Express').default('Standard'),
    clientName: Joi.string().max(255),
    clientEmail: Joi.string().email(),
    userId: Joi.string().required(),
    status: Joi.string().max(100)
  }),
  service: Joi.object({
    id: Joi.string().max(255),
    title: Joi.string().required().max(255),
    badge: Joi.string().max(100),
    desc: Joi.string().max(2000),
    iconName: Joi.string().max(100),
    basePrice: Joi.number().positive(),
    bullets: Joi.array().items(Joi.string())
  }),
  contactMessage: Joi.object({
    name: Joi.string().required().max(255),
    email: Joi.string().email().required(),
    phone: Joi.string().max(100),
    subject: Joi.string().required().max(255),
    message: Joi.string().required().max(5000)
  })
};

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: 'Invalid input', details: error.details.map(d => d.message) });
  }
  req.validatedBody = value;
  next();
};

// ─── Centralized Error Handler ────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const handleError = (err, res) => {
  console.error('Error:', err);
  if (isDev) {
    res.status(500).json({ error: err.message, stack: err.stack });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Neon PostgreSQL connection error:', err);
  } else {
    console.log('✅ Connected to Neon PostgreSQL at:', res.rows[0].now);
  }
});

// Database initialization
async function initDb() {
  try {
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        name VARCHAR(255),
        phone VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Services Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        badge VARCHAR(100),
        desc_text TEXT,
        icon_name VARCHAR(100),
        base_price NUMERIC(10,2) DEFAULT 0,
        bullets JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        pickup_location TEXT,
        dropoff_location TEXT,
        description TEXT,
        urgency VARCHAR(100),
        client_name VARCHAR(255),
        client_email VARCHAR(255),
        user_id VARCHAR(255),
        status VARCHAR(100) DEFAULT 'Pending Assignment',
        rider_name VARCHAR(255),
        rider_phone VARCHAR(100),
        rider_vehicle_type VARCHAR(100),
        rider_plate VARCHAR(100),
        rider_color VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Contact Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'unread',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Chat Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        sender_name VARCHAR(255),
        sender_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Riders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS riders (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        vehicle_type VARCHAR(100),
        plate VARCHAR(100),
        color VARCHAR(100),
        status VARCHAR(100) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ All database tables verified / created.');

    // Seed services if empty
    const checkServices = await pool.query('SELECT COUNT(*) FROM services');
    if (parseInt(checkServices.rows[0].count) === 0) {
      console.log('🌱 Seeding initial services catalogue...');
      const defaultServices = [
        {
          id: "service-1",
          title: "Personal & Corporate Errands",
          badge: "Corporate",
          desc: "Day-to-day corporate workflow operations and office administration support tasks for local startups and multi-nationals.",
          bullets: ["Corporate document filing", "Office supplies sourcing & deliveries", "Premium administrative runs"],
          iconName: "Briefcase",
          basePrice: 50
        },
        {
          id: "service-2",
          title: "Parcel Pickup & Delivery",
          badge: "Logistics",
          desc: "Highly secure, trackable city-wide delivery solutions for corporate boxes, document packets, and critical customer parcels.",
          bullets: ["Same-day document delivery", "Multi-point parcel pickups", "Fragile product courier"],
          iconName: "Truck",
          basePrice: 50
        },
        {
          id: "service-3",
          title: "Travel & Support",
          badge: "Support",
          desc: "Logistics planning, ticket collections, luggage pickups, and hospitality greeting services at Kotoka International Airport.",
          bullets: ["Luggage pickup & routing", "Kotoka Airport meet-and-greet", "Hotel protocol coordination"],
          iconName: "Plane",
          basePrice: 80
        },
        {
          id: "service-4",
          title: "Shopping & Vendor Services",
          badge: "Personal",
          desc: "Careful grocery shopping, local vendor coordination, purchase procurement, and fresh farm-produce supply runs.",
          bullets: ["Makola / Melcom grocery runs", "Vendor payment delivery", "Bulky item purchase logistics"],
          iconName: "ShoppingCart",
          basePrice: 60
        },
        {
          id: "service-5",
          title: "House Management",
          badge: "Property",
          desc: "Supervise maintenance teams, coordinate meter updates, arrange key handovers, and manage domestic task schedules.",
          bullets: ["Artisan & repair oversight", "Electricity meter prepayments", "Key collection & security drops"],
          iconName: "Home",
          basePrice: 120
        },
        {
          id: "service-6",
          title: "Documentation & Compliance Assistance",
          badge: "Compliance",
          desc: "Professional administrative queues at registrar of companies (RGD), immigration offices, and municipality registries.",
          bullets: ["RGD business permit filings", "Permit submission queues", "Document notary processing"],
          iconName: "FileText",
          basePrice: 150
        },
        {
          id: "service-7",
          title: "Site Inspection Updates",
          badge: "Inspections",
          desc: "Ideal for Diaspora developers. We visit real-estate projects, supply check updates, and provide certified photo reports.",
          bullets: ["High-res visual site recording", "Material delivery verification", "Formal inspection PDF logs"],
          iconName: "Camera",
          basePrice: 250
        }
      ];

      for (const service of defaultServices) {
        await pool.query(
          `INSERT INTO services (id, title, badge, desc_text, icon_name, base_price, bullets)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [service.id, service.title, service.badge, service.desc, service.iconName, service.basePrice, JSON.stringify(service.bullets)]
        );
      }
      console.log('🌱 Services catalogue successfully seeded.');
    }

    // Seed admin users if none exist
    const checkAdmins = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (parseInt(checkAdmins.rows[0].count) === 0) {
      console.log('🔐 Seeding admin users...');
      const adminUsers = [
        {
          uid: 'admin-master-001',
          email: 'admin@runmyerrand.com',
          name: 'Admin Master',
          phone: '+233 24 000 0001'
        },
        {
          uid: 'admin-support-001',
          email: 'support@runmyerrand.com',
          name: 'Support Admin',
          phone: '+233 24 000 0002'
        }
      ];

      for (const admin of adminUsers) {
        await pool.query(
          `INSERT INTO users (uid, email, role, name, phone, address)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (uid) DO NOTHING`,
          [admin.uid, admin.email, 'admin', admin.name, admin.phone, 'Admin Office, Accra']
        );
      }
      console.log('🔐 Admin users seeded successfully.');
      console.log('📧 Admin Credentials:');
      console.log('   Email: admin@runmyerrand.com (uid: admin-master-001)');
      console.log('   Email: support@runmyerrand.com (uid: admin-support-001)');
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

initDb();

// ─── Email Transporter Setup ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Send Email Endpoint ────────────────────────────────────────────────────
app.post('/api/send-email', limiter, async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const recipients = Array.isArray(to) ? to.join(', ') : to;
      
      const mailOptions = {
        from: `"Errands Support" <${process.env.SMTP_USER}>`,
        to: recipients,
        subject,
        html,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } else {
      console.warn("⚠️ SMTP Credentials not configured! Email skipped.");
      res.status(200).json({ success: true, message: 'Skipped (No SMTP credentials)' });
    }
  } catch (error) {
    handleError(error, res);
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

// ─── Postgres API Endpoints ──────────────────────────────────────────────────

// 1. Users Profile
app.get('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Validate uid format
    if (!/^[a-zA-Z0-9_-]+$/.test(uid)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const result = await pool.query('SELECT uid, email, role, name, phone, address, created_at FROM users WHERE uid = $1', [uid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/users', authLimiter, validate(schemas.user), async (req, res) => {
  try {
    const { uid, email, role, name, phone, address } = req.validatedBody;
    
    const result = await pool.query(
      `INSERT INTO users (uid, email, role, name, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (uid) DO UPDATE SET
         email = EXCLUDED.email,
         role = COALESCE(users.role, EXCLUDED.role),
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address
       RETURNING uid, email, role, name, phone, address, created_at`,
      [uid, email, role || 'user', name || '', phone || '', address || '']
    );
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

// 2. Services Catalogue
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, badge, desc_text as desc, icon_name as "iconName", base_price as "basePrice", bullets FROM services ORDER BY created_at ASC');
    const services = result.rows.map(row => {
      let bullets = row.bullets;
      if (typeof bullets === 'string') {
        try { bullets = JSON.parse(bullets); } catch (e) {}
      }
      return { ...row, bullets: Array.isArray(bullets) ? bullets : [] };
    });
    res.json(services);
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/services', strictLimiter, verifyFirebaseToken, requireAdmin, validate(schemas.service), async (req, res) => {
  try {
    const { id, title, badge, desc, iconName, basePrice, bullets } = req.validatedBody;
    const serviceId = id || `service-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO services (id, title, badge, desc_text, icon_name, base_price, bullets)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         badge = EXCLUDED.badge,
         desc_text = EXCLUDED.desc_text,
         icon_name = EXCLUDED.icon_name,
         base_price = EXCLUDED.base_price,
         bullets = EXCLUDED.bullets
       RETURNING id, title, badge, desc_text as desc, icon_name as "iconName", base_price as "basePrice", bullets`,
      [serviceId, title, badge, desc, iconName, Number(basePrice) || 0, JSON.stringify(bullets || [])]
    );
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

app.delete('/api/services/:id', strictLimiter, verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate id format
    if (!/^service-/.test(id)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }
    
    await pool.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
});

// 3. Orders Management
app.get('/api/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    let result;
    if (userId) {
      result = await pool.query(
        `SELECT id, category, pickup_location as "pickupLocation", dropoff_location as "dropoffLocation",
                description, urgency, client_name as "clientName", client_email as "clientEmail",
                user_id as "userId", status, created_at as "createdAt", rider_name as "riderName",
                rider_phone as "riderPhone", rider_vehicle_type as "riderVehicleType",
                rider_plate as "riderPlate", rider_color as "riderColor"
         FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
    } else {
      result = await pool.query(
        `SELECT id, category, pickup_location as "pickupLocation", dropoff_location as "dropoffLocation",
                description, urgency, client_name as "clientName", client_email as "clientEmail",
                user_id as "userId", status, created_at as "createdAt", rider_name as "riderName",
                rider_phone as "riderPhone", rider_vehicle_type as "riderVehicleType",
                rider_plate as "riderPlate", rider_color as "riderColor"
         FROM orders ORDER BY created_at DESC`
      );
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', validate(schemas.order), async (req, res) => {
  try {
    const { category, pickupLocation, dropoffLocation, description, urgency, clientName, clientEmail, userId, status, createdAt } = req.validatedBody;
    
    const id = `order-${Date.now()}`;
    const dateStr = createdAt || new Date().toISOString();

    const result = await pool.query(
      `INSERT INTO orders (id, category, pickup_location, dropoff_location, description, urgency, client_name, client_email, user_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, category, pickup_location as "pickupLocation", dropoff_location as "dropoffLocation",
                 description, urgency, client_name as "clientName", client_email as "clientEmail",
                 user_id as "userId", status, created_at as "createdAt"`,
      [id, category, pickupLocation, dropoffLocation, description, urgency, clientName, clientEmail, userId, status || 'Pending Assignment', dateStr]
    );
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, riderName, riderPhone, riderVehicleType, riderPlate, riderColor } = req.body;

    const result = await pool.query(
      `UPDATE orders SET
         status = COALESCE($1, status),
         rider_name = $2,
         rider_phone = $3,
         rider_vehicle_type = $4,
         rider_plate = $5,
         rider_color = $6
       WHERE id = $7
       RETURNING id, category, pickup_location as "pickupLocation", dropoff_location as "dropoffLocation",
                 description, urgency, client_name as "clientName", client_email as "clientEmail",
                 user_id as "userId", status, created_at as "createdAt", rider_name as "riderName",
                 rider_phone as "riderPhone", rider_vehicle_type as "riderVehicleType",
                 rider_plate as "riderPlate", rider_color as "riderColor"`,
      [status, riderName, riderPhone, riderVehicleType, riderPlate, riderColor, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Support Tickets (Contact Messages)
app.get('/api/contact-messages', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, subject, message, status, created_at as "createdAt"
       FROM contact_messages ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/contact-messages', authLimiter, validate(schemas.contactMessage), async (req, res) => {
  try {
    const { name, email, phone, subject, message, status } = req.validatedBody;
    const id = `msg-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO contact_messages (id, name, email, phone, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, subject, message, status, created_at as "createdAt"`,
      [id, name, email, phone || '', subject, message, status || 'unread']
    );
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

app.put('/api/contact-messages/:id', strictLimiter, verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !/^(unread|read|resolved)$/.test(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const result = await pool.query(
      `UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact message not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

app.delete('/api/contact-messages/:id', strictLimiter, verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM contact_messages WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
});

// 5. Order Chat Messages
app.get('/api/orders/:orderId/messages', async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await pool.query(
      `SELECT id, order_id as "orderId", text, sender_name as "senderName", sender_type as "senderType", created_at as "createdAt"
       FROM chat_messages WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId]
    );
    res.json(result.rows);
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/orders/:orderId/messages', limiter, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { text, senderName, senderType, createdAt } = req.body;
    
    if (!text || !senderName || !senderType) {
      return res.status(400).json({ error: 'Missing required fields: text, senderName, senderType' });
    }
    
    if (!/^order-/.test(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const id = `chatmsg-${Date.now()}`;
    const dateStr = createdAt || new Date().toISOString();
    const result = await pool.query(
      `INSERT INTO chat_messages (id, order_id, text, sender_name, sender_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, order_id as "orderId", text, sender_name as "senderName", sender_type as "senderType", created_at as "createdAt"`,
      [id, orderId, text, senderName, senderType, dateStr]
    );
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

// 6. Riders Management
app.get('/api/riders', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, phone, vehicle_type as "vehicleType", plate, color, status FROM riders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    handleError(error, res);
  }
});

app.post('/api/riders', strictLimiter, verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { id, name, phone, vehicleType, plate, color, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Rider name is required' });
    }
    
    const riderId = id || `rider-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO riders (id, name, phone, vehicle_type, plate, color, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         vehicle_type = EXCLUDED.vehicle_type,
         plate = EXCLUDED.plate,
         color = EXCLUDED.color,
         status = EXCLUDED.status
       RETURNING id, name, phone, vehicle_type as "vehicleType", plate, color, status`,
      [riderId, name, phone, vehicleType || '', plate || '', color || '', status || 'active']
    );
    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

app.delete('/api/riders/:id', strictLimiter, verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!/^rider-/.test(id)) {
      return res.status(400).json({ error: 'Invalid rider ID' });
    }
    
    await pool.query('DELETE FROM riders WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
});

// ─── Order Approval / Rejection / Status Updates ────────────────────────────
app.put('/api/orders/:id/approve', strictLimiter, verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { riderName, riderPhone, riderVehicleType, riderPlate, riderColor } = req.body;

    // Validate input
    if (!id || !/^order-/.test(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const result = await pool.query(
      `UPDATE orders SET
         status = 'Assigned',
         rider_name = COALESCE($1, rider_name),
         rider_phone = COALESCE($2, rider_phone),
         rider_vehicle_type = COALESCE($3, rider_vehicle_type),
         rider_plate = COALESCE($4, rider_plate),
         rider_color = COALESCE($5, rider_color)
       WHERE id = $6
       RETURNING id, category, pickup_location as "pickupLocation", dropoff_location as "dropoffLocation",
                 description, urgency, client_name as "clientName", client_email as "clientEmail",
                 user_id as "userId", status, created_at as "createdAt", rider_name as "riderName",
                 rider_phone as "riderPhone", rider_vehicle_type as "riderVehicleType",
                 rider_plate as "riderPlate", rider_color as "riderColor"`,
      [riderName || null, riderPhone || null, riderVehicleType || null, riderPlate || null, riderColor || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send approval email to client
    await fetch('http://localhost:' + PORT + '/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: result.rows[0].clientEmail,
        subject: `Errand ${id} Approved! 🎉`,
        html: `<p>Your errand <strong>${id}</strong> has been approved!</p>
               <p>Rider Assigned: <strong>${riderName || 'TBD'}</strong></p>
               <p>Expected arrival: Soon!</p>`
      })
    }).catch(err => console.log('Email notification skipped:', err.message));

    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

app.put('/api/orders/:id/reject', strictLimiter, verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    // Validate input
    if (!id || !/^order-/.test(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const result = await pool.query(
      `UPDATE orders SET
         status = 'Rejected'
       WHERE id = $1
       RETURNING id, category, pickup_location as "pickupLocation", dropoff_location as "dropoffLocation",
                 description, urgency, client_name as "clientName", client_email as "clientEmail",
                 user_id as "userId", status, created_at as "createdAt", rider_name as "riderName",
                 rider_phone as "riderPhone", rider_vehicle_type as "riderVehicleType",
                 rider_plate as "riderPlate", rider_color as "riderColor"`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send rejection email to client
    await fetch('http://localhost:' + PORT + '/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: result.rows[0].clientEmail,
        subject: `Errand ${id} Status Update`,
        html: `<p>Your errand <strong>${id}</strong> could not be fulfilled at this time.</p>
               <p>Reason: ${rejectionReason || 'Service temporarily unavailable'}</p>
               <p>Please contact support for more information.</p>`
      })
    }).catch(err => console.log('Email notification skipped:', err.message));

    res.json(result.rows[0]);
  } catch (error) {
    handleError(error, res);
  }
});

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
