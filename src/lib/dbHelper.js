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
   RIDERS
   ═══════════════════════════════════════════════════ */
export const getRiders = async () => {
  if (isDemo) {
    return JSON.parse(localStorage.getItem('demo_riders') || '[]');
  }
  try {
    const res = await fetch('/api/riders');
    if (!res.ok) throw new Error('Failed to fetch riders');
    return await res.json();
  } catch (error) {
    console.error("Error fetching riders:", error);
    return [];
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
