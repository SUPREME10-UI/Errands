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
app.use(express.static(staticDir));

// Simple mock in-memory database
let orders = [
  {
    id: "RME-9021",
    clientName: "Abena Osei",
    clientEmail: "abena@example.com",
    clientPhone: "+233 24 412 3456",
    category: "Parcel Pickup & Delivery",
    description: "Pick up corporate delivery from East Legon and deliver to Airport Residential Area.",
    pickupLocation: "Plot 12, East Legon, Accra",
    dropoffLocation: "Airport Residential Area, Accra",
    urgency: "Urgent",
    status: "In Progress",
    riderName: "Kwame Mensah",
    riderPhone: "+233 591 355 179",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    documents: []
  },
  {
    id: "RME-8742",
    clientName: "David Mensah",
    clientEmail: "david@ventures.co",
    clientPhone: "+233 50 123 4567",
    category: "Personal & Corporate Errands",
    description: "Submit annual returns forms and registration renewals at the Registrar General's Department.",
    pickupLocation: "RME HQ Office, Airport Area",
    dropoffLocation: "Registrar General's Department, Ministries",
    urgency: "Standard",
    status: "Completed",
    riderName: "Ama Serwaa",
    riderPhone: "+233 504 979 620",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    documents: []
  },
  {
    id: "RME-9104",
    clientName: "Ekow Taylor",
    clientEmail: "ekow.t@outlook.com",
    clientPhone: "+233 54 999 8888",
    category: "Site Inspection Updates",
    description: "Take high-res photos and video verification of concrete foundation pouring at construction site.",
    pickupLocation: "Oyarifa Green Hill Estates, Phase 2",
    dropoffLocation: "Digital Delivery via Dashboard",
    urgency: "Standard",
    status: "Pending Assignment",
    riderName: null,
    riderPhone: null,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    documents: []
  },
  {
    id: "RME-9105",
    clientName: "Akosua Addo",
    clientEmail: "akosua.a@gmail.com",
    clientPhone: "+233 27 555 4433",
    category: "Shopping & Vendor Services",
    description: "Purchase fresh groceries from Makola Market (tomatoes, peppers, onions, smoked fish) and deliver home.",
    pickupLocation: "Makola Market, Accra",
    dropoffLocation: "Dzorwulu Residential area, Accra",
    urgency: "Express",
    status: "Assigned",
    riderName: "Kofi Asante",
    riderPhone: "+233 591 355 179",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    documents: []
  }
];

// Available riders list
const RIDERS = [
  { name: "Kwame Mensah", phone: "+233 591 355 179", status: "Active" },
  { name: "Ama Serwaa", phone: "+233 504 979 620", status: "Active" },
  { name: "Kofi Asante", phone: "+233 591 355 179", status: "Active" },
  { name: "Yaw Boateng", phone: "+233 504 979 620", status: "Active" }
];

// Submissions from contact page
let contactMessages = [];

// API Endpoints

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Create new order
app.post('/api/orders', (req, res) => {
  const { category, description, pickupLocation, dropoffLocation, urgency, clientName, clientEmail, clientPhone } = req.body;

  if (!category || !description || !pickupLocation || !dropoffLocation || !urgency) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const newId = `RME-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: newId,
    clientName: clientName || "Anonymous Customer",
    clientEmail: clientEmail || "guest@example.com",
    clientPhone: clientPhone || "+233 00 000 0000",
    category,
    description,
    pickupLocation,
    dropoffLocation,
    urgency,
    status: "Pending Assignment",
    riderName: null,
    riderPhone: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documents: []
  };

  orders.unshift(newOrder); // Add to beginning
  res.status(201).json(newOrder);
});

// Update order status or assign rider
app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status, riderName } = req.body;

  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found." });
  }

  const order = orders[orderIndex];

  if (status) {
    order.status = status;
  }

  if (riderName !== undefined) {
    if (riderName === null) {
      order.riderName = null;
      order.riderPhone = null;
    } else {
      const rider = RIDERS.find(r => r.name === riderName);
      if (rider) {
        order.riderName = rider.name;
        order.riderPhone = rider.phone;
        if (order.status === "Pending Assignment") {
          order.status = "Assigned";
        }
      }
    }
  }

  order.updatedAt = new Date().toISOString();
  orders[orderIndex] = order;

  res.json(order);
});


// Post contact messages
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  const newMessage = {
    id: `MSG-${Date.now()}`,
    name,
    email,
    phone: phone || "Not provided",
    subject: subject || "General Inquiry",
    message,
    createdAt: new Date().toISOString()
  };

  contactMessages.push(newMessage);
  res.status(201).json({ success: true, message: "Thank you! We'll get back to you shortly." });
});

// Serves specific HTML views to maintain clean friendly routing URLs
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(staticDir, 'services.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(staticDir, 'dashboard.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(staticDir, 'contact.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Run My Errand server is running beautifully at http://localhost:${PORT}`);
});
