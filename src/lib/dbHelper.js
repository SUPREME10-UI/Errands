import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('YOUR_API_KEY');

const defaultServices = [
  {
    id: "service-1",
    title: "Personal & Corporate Errands",
    badge: "Corporate",
    desc: "Day-to-day corporate workflow operations and office administration support tasks for local startups and multi-nationals.",
    bullets: [
      "Corporate document filing",
      "Office supplies sourcing & deliveries",
      "Premium administrative runs"
    ],
    iconName: "Briefcase",
    basePrice: 50
  },
  {
    id: "service-2",
    title: "Parcel Pickup & Delivery",
    badge: "Logistics",
    desc: "Highly secure, trackable city-wide delivery solutions for corporate boxes, document packets, and critical customer parcels.",
    bullets: [
      "Same-day document delivery",
      "Multi-point parcel pickups",
      "Fragile product courier"
    ],
    iconName: "Truck",
    basePrice: 50
  },
  {
    id: "service-3",
    title: "Travel & Support",
    badge: "Support",
    desc: "Logistics planning, ticket collections, luggage pickups, and hospitality greeting services at Kotoka International Airport.",
    bullets: [
      "Luggage pickup & routing",
      "Kotoka Airport meet-and-greet",
      "Hotel protocol coordination"
    ],
    iconName: "Plane",
    basePrice: 80
  },
  {
    id: "service-4",
    title: "Shopping & Vendor Services",
    badge: "Personal",
    desc: "Careful grocery shopping, local vendor coordination, purchase procurement, and fresh farm-produce supply runs.",
    bullets: [
      "Makola / Melcom grocery runs",
      "Vendor payment delivery",
      "Bulky item purchase logistics"
    ],
    iconName: "ShoppingCart",
    basePrice: 60
  },
  {
    id: "service-5",
    title: "House Management",
    badge: "Property",
    desc: "Supervise maintenance teams, coordinate meter updates, arrange key handovers, and manage domestic task schedules.",
    bullets: [
      "Artisan & repair oversight",
      "Electricity meter prepayments",
      "Key collection & security drops"
    ],
    iconName: "Home",
    basePrice: 120
  },
  {
    id: "service-6",
    title: "Documentation & Compliance Assistance",
    badge: "Compliance",
    desc: "Professional administrative queues at registrar of companies (RGD), immigration offices, and municipality registries.",
    bullets: [
      "RGD business permit filings",
      "Permit submission queues",
      "Document notary processing"
    ],
    iconName: "FileText",
    basePrice: 150
  },
  {
    id: "service-7",
    title: "Site Inspection Updates",
    badge: "Inspections",
    desc: "Ideal for Diaspora developers. We visit real-estate projects, supply check updates, and provide certified photo reports.",
    bullets: [
      "High-res visual site recording",
      "Material delivery verification",
      "Formal inspection PDF logs"
    ],
    iconName: "Camera",
    basePrice: 250
  }
];

// Helper to seed localStorage
const seedLocalStorage = () => {
  const existing = localStorage.getItem('demo_services');
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem('demo_services', JSON.stringify(defaultServices));
  }
};

export const getServices = async () => {
  if (isDemo) {
    seedLocalStorage();
    return JSON.parse(localStorage.getItem('demo_services') || '[]');
  }

  try {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return await res.json();
  } catch (error) {
    console.error("Error fetching services from Postgres:", error);
    return defaultServices;
  }
};

export const saveService = async (service) => {
  if (isDemo) {
    const list = JSON.parse(localStorage.getItem('demo_services') || '[]');
    if (service.id) {
      // Update
      const idx = list.findIndex(s => s.id === service.id);
      if (idx !== -1) {
        list[idx] = service;
      }
    } else {
      // Add
      service.id = `service-${Date.now()}`;
      list.push(service);
    }
    localStorage.setItem('demo_services', JSON.stringify(list));
    return service;
  }

  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });
  if (!res.ok) throw new Error('Failed to save service');
  return await res.json();
};

export const deleteService = async (id) => {
  if (isDemo) {
    const list = JSON.parse(localStorage.getItem('demo_services') || '[]');
    const filtered = list.filter(s => s.id !== id);
    localStorage.setItem('demo_services', JSON.stringify(filtered));
    return;
  }

  const res = await fetch(`/api/services/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete service');
};

export const getContactMessages = async () => {
  if (isDemo) {
    const msgs = JSON.parse(localStorage.getItem('demo_contact_messages') || '[]');
    msgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return msgs;
  }

  try {
    const res = await fetch('/api/contact-messages');
    if (!res.ok) throw new Error('Failed to fetch contact messages');
    return await res.json();
  } catch (error) {
    console.error("Error fetching contact messages from Postgres:", error);
    return [];
  }
};

export const updateContactStatus = async (id, status) => {
  if (isDemo) {
    const list = JSON.parse(localStorage.getItem('demo_contact_messages') || '[]');
    const updated = list.map(m => m.id === id ? { ...m, status } : m);
    localStorage.setItem('demo_contact_messages', JSON.stringify(updated));
    return;
  }

  const res = await fetch(`/api/contact-messages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update contact status');
};

export const deleteContactMessage = async (id) => {
  if (isDemo) {
    const list = JSON.parse(localStorage.getItem('demo_contact_messages') || '[]');
    const filtered = list.filter(m => m.id !== id);
    localStorage.setItem('demo_contact_messages', JSON.stringify(filtered));
    return;
  }

  const res = await fetch(`/api/contact-messages/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete contact message');
};

/* ═══════════════════════════════════════════════════
   ORDERS & MOCK DATA
   ═══════════════════════════════════════════════════ */
const defaultOrders = [
  {
    id: "order-101",
    category: "Parcel Pickup & Delivery",
    pickupLocation: "East Legon, Lagos Avenue, Accra",
    dropoffLocation: "Airport Residential Area, 5th Circular Rd, Accra",
    description: "Urgent contract documents and flash drive delivery. Call upon arrival.",
    urgency: "Urgent",
    clientName: "Abena Osei",
    clientEmail: "abena@example.com",
    clientPhone: "+233 24 555 1234",
    userId: "demo-user-1",
    status: "Out for Delivery",
    riderName: "Kofi Mensah",
    riderPhone: "+233 24 123 4567",
    riderVehicleType: "Motorcycle",
    riderPlate: "GW-4521-23",
    riderColor: "Black",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "order-102",
    category: "Personal & Corporate Errands",
    pickupLocation: "Ridge Towers, 4th Floor, Accra",
    dropoffLocation: "Registrar General's Department, Accra",
    description: "Submit certified true copy filings and collect registration stamp receipts.",
    urgency: "Standard",
    clientName: "David Mensah",
    clientEmail: "david@example.com",
    clientPhone: "+233 20 777 9876",
    userId: "demo-user-2",
    status: "Order Ready",
    riderName: "Kofi Mensah",
    riderPhone: "+233 24 123 4567",
    riderVehicleType: "Motorcycle",
    riderPlate: "GW-4521-23",
    riderColor: "Black",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "order-103",
    category: "Shopping & Vendor Services",
    pickupLocation: "Makola Market, Row B-14, Accra",
    dropoffLocation: "Cantonments, Embassy Gardens, Accra",
    description: "Procure organic produce and deliver with receipt.",
    urgency: "Standard",
    clientName: "Sarah Addo",
    clientEmail: "sarah@example.com",
    clientPhone: "+233 50 333 4444",
    userId: "demo-user-3",
    status: "Pending Assignment",
    riderName: null,
    riderPhone: null,
    riderVehicleType: null,
    riderPlate: null,
    riderColor: null,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: "order-104",
    category: "Travel & Support",
    pickupLocation: "Kotoka International Airport, Terminal 3",
    dropoffLocation: "Kempinski Hotel Gold Coast City, Accra",
    description: "Luggage reception protocol and transfer for international guest.",
    urgency: "Express",
    clientName: "Michael Owusu",
    clientEmail: "michael@example.com",
    clientPhone: "+233 27 111 2222",
    userId: "demo-user-4",
    status: "Completed",
    riderName: "Kwame Asante",
    riderPhone: "+233 20 987 6543",
    riderVehicleType: "Van",
    riderPlate: "GE-8902-22",
    riderColor: "White",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const getOrders = async () => {
  if (isDemo) {
    const existing = localStorage.getItem('demo_orders');
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem('demo_orders', JSON.stringify(defaultOrders));
      return defaultOrders;
    }
    const all = JSON.parse(existing);
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return all;
  }
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    const list = await res.json();
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
};

export const updateOrder = async (id, data) => {
  if (isDemo) {
    const all = JSON.parse(localStorage.getItem('demo_orders') || '[]');
    const updated = all.map(o => o.id === id ? { ...o, ...data } : o);
    localStorage.setItem('demo_orders', JSON.stringify(updated));
    return updated.find(o => o.id === id);
  }
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update order');
  return await res.json();
};

export const deleteOrder = async (id) => {
  if (isDemo) {
    const all = JSON.parse(localStorage.getItem('demo_orders') || '[]');
    const filtered = all.filter(o => o.id !== id);
    localStorage.setItem('demo_orders', JSON.stringify(filtered));
    return;
  }
  const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete order');
};

/* ═══════════════════════════════════════════════════
   RIDERS
   ═══════════════════════════════════════════════════ */
const defaultRiders = [
  {
    id: "rider-1",
    name: "Kofi Mensah",
    email: "employee@demo.com",
    phone: "+233 24 123 4567",
    vehicleType: "Motorcycle",
    plate: "GW-4521-23",
    color: "Black",
    status: "active"
  },
  {
    id: "rider-2",
    name: "Kwame Asante",
    email: "kwame@errands.com",
    phone: "+233 20 987 6543",
    vehicleType: "Van",
    plate: "GE-8902-22",
    color: "White",
    status: "active"
  },
  {
    id: "rider-3",
    name: "Ama Boateng",
    email: "ama@errands.com",
    phone: "+233 55 456 7890",
    vehicleType: "Car",
    plate: "GT-3312-24",
    color: "Blue",
    status: "active"
  }
];

export const getRiders = async () => {
  if (isDemo) {
    const existing = localStorage.getItem('demo_riders');
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem('demo_riders', JSON.stringify(defaultRiders));
      return defaultRiders;
    }
    return JSON.parse(existing);
  }
  try {
    const res = await fetch('/api/riders');
    if (!res.ok) throw new Error('Failed to fetch riders');
    return await res.json();
  } catch (error) {
    console.error("Error fetching riders:", error);
    return defaultRiders;
  }
};

export const saveRider = async (rider) => {
  if (isDemo) {
    const list = JSON.parse(localStorage.getItem('demo_riders') || '[]');
    if (rider.id) {
      const idx = list.findIndex(r => r.id === rider.id);
      if (idx !== -1) list[idx] = rider;
      else list.push(rider);
    } else {
      rider.id = `rider-${Date.now()}`;
      list.push(rider);
    }
    localStorage.setItem('demo_riders', JSON.stringify(list));
    return rider;
  }

  const res = await fetch('/api/riders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rider)
  });
  if (!res.ok) throw new Error('Failed to save rider');
  return await res.json();
};

export const deleteRider = async (id) => {
  if (isDemo) {
    const list = JSON.parse(localStorage.getItem('demo_riders') || '[]');
    localStorage.setItem('demo_riders', JSON.stringify(list.filter(r => r.id !== id)));
    return;
  }

  const res = await fetch(`/api/riders/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete rider');
};

/* ═══════════════════════════════════════════════════
   USERS MANAGEMENT
   ═══════════════════════════════════════════════════ */
export const getUsers = async () => {
  if (isDemo) {
    const demoUsers = [
      { uid: 'demo-admin-uid', name: 'Demo Administrator', email: 'admin@demo.com', role: 'admin', phone: '+233 24 000 0000', createdAt: '2025-01-15T10:00:00Z' },
      { uid: 'demo-employee-uid', name: 'Kofi Mensah (Courier)', email: 'employee@demo.com', role: 'employee', phone: '+233 24 123 4567', createdAt: '2025-02-01T12:00:00Z' },
      { uid: 'demo-user-1', name: 'Abena Osei', email: 'abena@example.com', role: 'user', phone: '+233 24 555 1234', createdAt: '2025-02-10T14:30:00Z' },
      { uid: 'demo-user-2', name: 'David Mensah', email: 'david@example.com', role: 'user', phone: '+233 20 777 9876', createdAt: '2025-02-12T09:15:00Z' },
      { uid: 'demo-user-3', name: 'Sarah Addo', email: 'sarah@example.com', role: 'user', phone: '+233 50 333 4444', createdAt: '2025-02-14T11:45:00Z' }
    ];
    const saved = localStorage.getItem('demo_users_list');
    if (!saved) {
      localStorage.setItem('demo_users_list', JSON.stringify(demoUsers));
      return demoUsers;
    }
    return JSON.parse(saved);
  }
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
};

export const updateUserRole = async (uid, role) => {
  if (isDemo) {
    const list = JSON.parse(localStorage.getItem('demo_users_list') || '[]');
    const updated = list.map(u => u.uid === uid ? { ...u, role } : u);
    localStorage.setItem('demo_users_list', JSON.stringify(updated));
    return;
  }
  const res = await fetch(`/api/users/${uid}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error('Failed to update user role');
};


/* ═══════════════════════════════════════════════════
   CHAT MESSAGES
   ═══════════════════════════════════════════════════ */
export const sendMessage = async (orderId, text, senderName, senderType) => {
  const payload = {
    text,
    senderName,
    senderType, // 'admin' or 'client'
    createdAt: new Date().toISOString()
  };

  if (isDemo) {
    const messages = JSON.parse(localStorage.getItem(`demo_chat_${orderId}`) || '[]');
    messages.push({ id: `msg-${Date.now()}`, ...payload });
    localStorage.setItem(`demo_chat_${orderId}`, JSON.stringify(messages));
    return;
  }

  const res = await fetch(`/api/orders/${orderId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to send message');
};

export const getMessages = async (orderId) => {
  if (isDemo) {
    return JSON.parse(localStorage.getItem(`demo_chat_${orderId}`) || '[]');
  }
  try {
    const res = await fetch(`/api/orders/${orderId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};
