import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getServices, saveService, deleteService, getContactMessages, updateContactStatus, deleteContactMessage, getMessages, sendMessage } from '../lib/dbHelper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const isDemo =
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY.includes('YOUR_API_KEY');

/* ── Lucide-style inline SVG icons ─────────────────── */
const Icon = ({ name, size = 18 }) => {
  const icons = {
    Package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    Wrench: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    Mail: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    Plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    Edit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    Trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
    Eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    Check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    Archive: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    ),
    Refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    X: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    Briefcase: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    Search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  };
  return icons[name] || <svg width={size} height={size} viewBox="0 0 24 24" />;
};

/* ── Toast component ──────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`admin-toast ${toast.type}`}>
      {toast.message}
    </div>
  );
}

/* ── Confirm Dialog ───────────────────────────────── */
function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="admin-modal-overlay open" onClick={onCancel}>
      <div className="admin-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ORDERS TAB
═══════════════════════════════════════════════════ */
function OrdersTab({ triggerToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [modalRider, setModalRider] = useState('');
  const [saving, setSaving] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Rider vehicle detail fields for the modal
  const [modalRiderPhone, setModalRiderPhone] = useState('');
  const [modalRiderVehicle, setModalRiderVehicle] = useState('');
  const [modalRiderPlate, setModalRiderPlate] = useState('');
  const [modalRiderColor, setModalRiderColor] = useState('');

  const fetchOrders = useCallback(async () => {
    if (isDemo) {
      const all = JSON.parse(localStorage.getItem('demo_orders') || '[]');
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(all);
      setLoading(false);
      return;
    }
    try {
      const snap = await getDocs(query(collection(db, 'orders')));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 8000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  const openModal = async order => {
    setSelectedOrder(order);
    setModalStatus(order.status || 'Pending Assignment');
    setModalRider(order.riderName || '');
    setModalRiderPhone(order.riderPhone || '');
    setModalRiderVehicle(order.riderVehicleType || '');
    setModalRiderPlate(order.riderPlate || '');
    setModalRiderColor(order.riderColor || '');
    setModalOpen(true);
    const msgs = await getMessages(order.id);
    setMessages(msgs);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder) return;
    await sendMessage(selectedOrder.id, newMessage, 'Admin', 'admin');
    setNewMessage('');
    const msgs = await getMessages(selectedOrder.id);
    setMessages(msgs);
  };

  const saveOrder = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const riderData = {
        riderName: modalRider.trim() || null,
        riderPhone: modalRiderPhone.trim() || null,
        riderVehicleType: modalRiderVehicle.trim() || null,
        riderPlate: modalRiderPlate.trim() || null,
        riderColor: modalRiderColor.trim() || null,
      };

      if (isDemo) {
        const all = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        const updated = all.map(o =>
          o.id === selectedOrder.id
            ? { ...o, status: modalStatus, ...riderData }
            : o
        );
        localStorage.setItem('demo_orders', JSON.stringify(updated));
      } else {
        await updateDoc(doc(db, 'orders', selectedOrder.id), {
          status: modalStatus,
          ...riderData,
        });
      }

      if (selectedOrder.status !== modalStatus) {
        let riderHtml = '';
        if (riderData.riderName) {
          riderHtml = `
             <p><strong>Your Assigned Courier:</strong> ${riderData.riderName}</p>
             <p><strong>Contact:</strong> ${riderData.riderPhone || 'N/A'}</p>
             <p><strong>Vehicle:</strong> ${riderData.riderColor || ''} ${riderData.riderVehicleType || ''} &mdash; ${riderData.riderPlate || 'N/A'}</p>
           `;
        }

        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: selectedOrder.clientEmail,
            subject: `Update on your Errand: ${selectedOrder.id}`,
            html: `<p>Hello ${selectedOrder.clientName},</p>
                   <p>The status of your errand has been updated to <strong>${modalStatus}</strong>.</p>
                   ${riderHtml}
                   <p>Thank you for using Run My Errand.</p>`
          })
        }).catch(err => console.warn('Email trigger failed', err));
      }

      triggerToast('Order updated successfully!', 'success');
      setModalOpen(false);
      fetchOrders();
    } catch (err) {
      triggerToast('Failed to update order.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const badgeClass = s => ({
    'Pending Assignment': 'badge-pending',
    'Order Ready': 'badge-assigned',
    'Out for Delivery': 'badge-progress',
    Completed: 'badge-completed',
  }[s] || 'badge-pending');

  const statusEmoji = s => ({
    'Pending Assignment': '⏳',
    'Order Ready': '✅',
    'Out for Delivery': '🚴',
    Completed: '📦',
  }[s] || '⏳');

  const filtered = orders.filter(o => {
    const matchSearch =
      !search ||
      (o.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.clientEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.category || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending Assignment').length,
    inProgress: orders.filter(o => o.status === 'Out for Delivery').length,
    completed: orders.filter(o => o.status === 'Completed').length,
  };

  return (
    <>
      {/* Stats */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{counts.total}</span>
          <span className="stat-sub">All time</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{counts.pending}</span>
          <span className="stat-sub">Awaiting assignment</span>
        </div>
        <div className="admin-stat-card accent">
          <span className="stat-label">Out for Delivery</span>
          <span className="stat-value">{counts.inProgress}</span>
          <span className="stat-sub">Active runs</span>
        </div>
        <div className="admin-stat-card success">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{counts.completed}</span>
          <span className="stat-sub">Delivered</span>
        </div>
      </div>

      {/* Table card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Orders</h2>
          <div className="admin-filter-row">
            <div className="admin-search-wrapper">
              <span className="admin-search-icon">
                <Icon name="Search" size={15} />
              </span>
              <input
                className="admin-search"
                placeholder="Search client, category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="admin-filter-select" style={{ width: '160px', height: '38px' }}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending Assignment">Pending Assignment</SelectItem>
                <SelectItem value="Order Ready">Order Ready</SelectItem>
                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <button className="btn btn-secondary btn-sm" onClick={fetchOrders} style={{ height: '38px', padding: '0 1rem' }}>
              <Icon name="Refresh" size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client</th>
                <th>Category</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="admin-empty">
                      <div className="admin-empty-icon"><Icon name="Package" size={24} /></div>
                      <h3>No orders found</h3>
                      <p>Orders will appear here once clients submit bookings.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.id}>
                    <td>
                      <code style={{ fontSize: '0.78rem', background: 'var(--bg-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {String(order.id).slice(0, 10)}…
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.clientName || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.clientEmail}</div>
                    </td>
                    <td>{order.category}</td>
                    <td>
                      <span className={`badge ${order.urgency === 'Express' ? 'badge-urgent' : 'badge-progress'}`}>
                        {order.urgency}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass(order.status)}`}>{order.status}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openModal(order)}>
                        <Icon name="Edit" size={13} /> Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      <div className={`admin-modal-overlay ${modalOpen ? 'open' : ''}`} onClick={() => setModalOpen(false)}>
        <div className="admin-modal" style={{ maxWidth: 850, padding: 0, overflow: 'hidden', display: 'flex', minHeight: 450 }} onClick={e => e.stopPropagation()}>

          <div style={{ flex: 1, padding: '2rem 2.5rem', borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
            <button className="admin-modal-close" onClick={() => setModalOpen(false)}><Icon name="X" size={16} /></button>
            <h2>Update Order</h2>
            <p className="modal-subtitle">ID: {selectedOrder?.id}</p>
            <div className="form-group">
              <label className="form-label">Status</label>
              <Select value={modalStatus} onValueChange={setModalStatus}>
                <SelectTrigger className="form-select">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending Assignment">Pending Assignment</SelectItem>
                  <SelectItem value="Order Ready">Order Ready</SelectItem>
                  <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {modalStatus === 'Out for Delivery' && (
              <div style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginTop: '1.25rem', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Enter Courier Details
                </p>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Rider Name</label>
                  <input className="form-input" placeholder="e.g. John Doe" value={modalRider} onChange={e => setModalRider(e.target.value)} />
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="e.g. 0244000000" value={modalRiderPhone} onChange={e => setModalRiderPhone(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Vehicle Type</label>
                    <Select value={modalRiderVehicle || 'none'} onValueChange={v => setModalRiderVehicle(v === 'none' ? '' : v)}>
                      <SelectTrigger className="form-select">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select…</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Tricycle">Tricycle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Plate / Reg. Number</label>
                    <input className="form-input" placeholder="e.g. GT-1234-22" value={modalRiderPlate} onChange={e => setModalRiderPlate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Vehicle Color</label>
                    <input className="form-input" placeholder="e.g. Red" value={modalRiderColor} onChange={e => setModalRiderColor(e.target.value)} />
                  </div>
                </div>
              </div>
            )}


            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={saveOrder} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.95rem' }}>Order Chat</div>
            <div style={{ flex: 1, padding: '1rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px' }}>
              {messages.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>No messages yet. Send a message to the client.</p> : null}
              {messages.map(m => (
                <div key={m.id} style={{ alignSelf: m.senderType === 'admin' ? 'flex-end' : 'flex-start', background: m.senderType === 'admin' ? 'var(--primary)' : 'var(--bg-card)', color: m.senderType === 'admin' ? '#fff' : 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', maxWidth: '85%', border: m.senderType === 'admin' ? 'none' : '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '0.2rem' }}>{m.senderName}</div>
                  {m.text}
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', background: 'var(--bg-card)' }}>
              <input className="form-input" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
              <button className="btn btn-primary" onClick={handleSendMessage}><Icon name="Check" size={16} /></button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   SERVICES TAB
═══════════════════════════════════════════════════ */
const ICON_OPTIONS = ['Briefcase', 'Truck', 'Plane', 'ShoppingCart', 'Home', 'FileText', 'Camera', 'Wrench', 'Package', 'Mail'];
const BADGE_OPTIONS = ['Corporate', 'Logistics', 'Support', 'Personal', 'Property', 'Compliance', 'Inspections', 'Premium'];

const emptyService = { title: '', badge: 'Corporate', desc: '', iconName: 'Briefcase', basePrice: 50, bullets: ['', '', ''] };

function ServicesTab({ triggerToast }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadServices = useCallback(async () => {
    try {
      const list = await getServices();
      setServices(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  const openAddModal = () => {
    setEditingService(null);
    setForm({ ...emptyService, bullets: ['', '', ''] });
    setModalOpen(true);
  };

  const openEditModal = svc => {
    setEditingService(svc);
    setForm({
      ...svc,
      bullets: svc.bullets?.length ? [...svc.bullets] : ['', '', ''],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { triggerToast('Service title is required.', 'danger'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice) || 0,
        bullets: form.bullets.filter(b => b.trim()),
        id: editingService?.id,
      };
      await saveService(payload);
      triggerToast(editingService ? 'Service updated!' : 'Service added!', 'success');
      setModalOpen(false);
      loadServices();
    } catch (err) {
      triggerToast('Failed to save service.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    try {
      await deleteService(id);
      triggerToast('Service deleted.', 'info');
      loadServices();
    } catch {
      triggerToast('Failed to delete service.', 'danger');
    } finally {
      setConfirmDelete(null);
    }
  };

  const updateBullet = (i, val) => {
    const bullets = [...form.bullets];
    bullets[i] = val;
    setForm(f => ({ ...f, bullets }));
  };

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Services Catalogue <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>({services.length} services)</span></h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Icon name="Plus" size={15} /> Add Service
          </button>
        </div>

        {loading ? (
          <div className="admin-empty"><p>Loading services…</p></div>
        ) : services.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><Icon name="Wrench" size={24} /></div>
            <h3>No services yet</h3>
            <p>Click "Add Service" to create your first offering.</p>
            <button className="btn btn-primary" onClick={openAddModal}><Icon name="Plus" size={15} /> Add Service</button>
          </div>
        ) : (
          <div className="service-grid">
            {services.map(svc => (
              <div key={svc.id} className="service-item-card">
                <div className="service-item-card-top">
                  <div className="service-item-icon"><Icon name={svc.iconName || 'Briefcase'} size={20} /></div>
                  <div style={{ flex: 1 }}>
                    <h3>{svc.title}</h3>
                    <span className="badge badge-progress" style={{ marginTop: '0.25rem', display: 'inline-flex' }}>{svc.badge}</span>
                  </div>
                  <div className="action-group" style={{ flexShrink: 0 }}>
                    <button className="btn-icon" title="Edit" onClick={() => openEditModal(svc)}><Icon name="Edit" size={14} /></button>
                    <button className="btn-icon danger" title="Delete" onClick={() => setConfirmDelete(svc.id)}><Icon name="Trash" size={14} /></button>
                  </div>
                </div>
                <p className="service-item-desc">{svc.desc}</p>
                {svc.bullets?.length > 0 && (
                  <ul style={{ margin: 0, padding: '0 0 0 1.1rem', listStyle: 'disc' }}>
                    {svc.bullets.map((b, i) => b && <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{b}</li>)}
                  </ul>
                )}
                <div className="service-item-price">
                  GHS {svc.basePrice} <span>/ base price</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <div className={`admin-modal-overlay ${modalOpen ? 'open' : ''}`} onClick={() => setModalOpen(false)}>
        <div className="admin-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <button className="admin-modal-close" onClick={() => setModalOpen(false)}><Icon name="X" size={16} /></button>
          <h2>{editingService ? 'Edit Service' : 'New Service'}</h2>
          <p className="modal-subtitle">{editingService ? 'Update the service details below.' : 'Fill in the details for your new service offering.'}</p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="e.g. Parcel Delivery" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Badge / Category</label>
              <Select value={form.badge} onValueChange={v => setForm(f => ({ ...f, badge: v }))}>
                <SelectTrigger className="form-select">
                  <SelectValue placeholder="Select Badge" />
                </SelectTrigger>
                <SelectContent>
                  {BADGE_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Icon</label>
              <Select value={form.iconName} onValueChange={v => setForm(f => ({ ...f, iconName: v }))}>
                <SelectTrigger className="form-select">
                  <SelectValue placeholder="Select Icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="form-group">
              <label className="form-label">Base Price (GHS)</label>
              <input className="form-input" type="number" min="0" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} placeholder="Short description of the service…" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Bullet Points (up to 3)</label>
            {[0, 1, 2].map(i => (
              <input
                key={i}
                className="form-input"
                style={{ marginBottom: '0.5rem' }}
                placeholder={`Point ${i + 1}…`}
                value={form.bullets[i] || ''}
                onChange={e => updateBullet(i, e.target.value)}
              />
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editingService ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        message="This service will be permanently deleted and removed from the website. This cannot be undone."
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   CONTACT TICKETS TAB
═══════════════════════════════════════════════════ */
function ContactTab({ triggerToast, setBadgeCount }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const loadMessages = useCallback(async () => {
    try {
      const list = await getContactMessages();
      setMessages(list);
      setBadgeCount(list.filter(m => m.status === 'unread' || !m.status).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setBadgeCount]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const markStatus = async (id, status) => {
    try {
      await updateContactStatus(id, status);
      // Optimistic update
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      if (selected?.id === id) setSelected(m => ({ ...m, status }));
      triggerToast(`Marked as ${status}.`, 'success');
      loadMessages();
    } catch {
      triggerToast('Failed to update ticket.', 'danger');
    }
  };

  const handleDelete = async id => {
    try {
      await deleteContactMessage(id);
      triggerToast('Ticket deleted.', 'info');
      if (selected?.id === id) setSelected(null);
      setConfirmDelete(null);
      loadMessages();
    } catch {
      triggerToast('Failed to delete ticket.', 'danger');
    }
  };

  const openTicket = async msg => {
    setSelected(msg);
    if (!msg.status || msg.status === 'unread') {
      await markStatus(msg.id, 'read');
    }
  };

  const filtered = messages.filter(m => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Unread') return !m.status || m.status === 'unread';
    return m.status === filterStatus.toLowerCase();
  });

  const unreadCount = messages.filter(m => !m.status || m.status === 'unread').length;

  const statusBadge = status => {
    if (!status || status === 'unread') return <span className="badge badge-unread">Unread</span>;
    if (status === 'read') return <span className="badge badge-read">Read</span>;
    if (status === 'archived') return <span className="badge badge-archived">Archived</span>;
    return null;
  };

  const initials = name => (name || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  const formatDate = dt => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Stats */}
      <div className="admin-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div className="admin-stat-card">
          <span className="stat-label">Total Tickets</span>
          <span className="stat-value">{messages.length}</span>
        </div>
        <div className="admin-stat-card danger">
          <span className="stat-label">Unread</span>
          <span className="stat-value">{unreadCount}</span>
        </div>
        <div className="admin-stat-card success">
          <span className="stat-label">Read</span>
          <span className="stat-value">{messages.filter(m => m.status === 'read').length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Archived</span>
          <span className="stat-value" style={{ color: 'var(--text-muted)' }}>{messages.filter(m => m.status === 'archived').length}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Inbox list */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Inbox {unreadCount > 0 && <span className="badge badge-unread" style={{ marginLeft: '0.5rem' }}>{unreadCount} new</span>}</h2>
            <div className="admin-filter-row">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="admin-filter-select" style={{ minWidth: '150px' }}>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Unread">Unread</SelectItem>
                  <SelectItem value="Read">Read</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <button className="btn btn-secondary btn-sm" onClick={loadMessages}><Icon name="Refresh" size={14} /></button>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty"><p>Loading tickets…</p></div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"><Icon name="Mail" size={24} /></div>
              <h3>No messages yet</h3>
              <p>Contact form submissions will appear here.</p>
            </div>
          ) : (
            <div className="ticket-list">
              {filtered.map(msg => (
                <div
                  key={msg.id}
                  className={`ticket-item ${(!msg.status || msg.status === 'unread') ? 'unread' : ''} ${selected?.id === msg.id ? 'active' : ''}`}
                  style={selected?.id === msg.id ? { background: 'rgba(0,82,255,0.06)' } : {}}
                  onClick={() => openTicket(msg)}
                >
                  <div className="ticket-avatar">{initials(msg.name)}</div>
                  <div className="ticket-body">
                    <div className="ticket-sender">{msg.name || 'Anonymous'}</div>
                    <div className="ticket-preview">{msg.subject ? `${msg.subject} — ` : ''}{msg.message}</div>
                  </div>
                  <div className="ticket-meta">
                    <div className="ticket-date">{formatDate(msg.createdAt)}</div>
                    {statusBadge(msg.status)}
                  </div>
                  <div className="action-group" onClick={e => e.stopPropagation()}>
                    {(!msg.status || msg.status === 'unread') && (
                      <button className="btn-icon" title="Mark as read" onClick={() => markStatus(msg.id, 'read')}><Icon name="Check" size={13} /></button>
                    )}
                    <button className="btn-icon" title="Archive" onClick={() => markStatus(msg.id, 'archived')}><Icon name="Archive" size={13} /></button>
                    <button className="btn-icon danger" title="Delete" onClick={() => setConfirmDelete(msg.id)}><Icon name="Trash" size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail pane */}
        {selected && (
          <div className="admin-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 1rem)' }}>
            <div className="admin-card-header" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '0.95rem' }}>Message Detail</h2>
              <button className="btn-icon" onClick={() => setSelected(null)}><Icon name="X" size={14} /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="ticket-avatar" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>{initials(selected.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selected.name}</div>
                  <a href={`mailto:${selected.email}`} style={{ fontSize: '0.82rem', color: 'var(--secondary)', textDecoration: 'none' }}>{selected.email}</a>
                  {selected.phone && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selected.phone}</div>}
                </div>
              </div>

              {selected.subject && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Subject</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{selected.subject}</div>
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Message</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.7, margin: 0, padding: '1rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap' }}>
                  {selected.message}
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                Received: {formatDate(selected.createdAt)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your Enquiry'}`} className="btn btn-primary" style={{ width: '100%' }}>
                  Reply via Email
                </a>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-success" style={{ flex: 1 }} onClick={() => markStatus(selected.id, 'read')}>
                    <Icon name="Check" size={14} /> Mark Read
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => markStatus(selected.id, 'archived')}>
                    <Icon name="Archive" size={14} /> Archive
                  </button>
                  <button className="btn btn-danger" onClick={() => setConfirmDelete(selected.id)}>
                    <Icon name="Trash" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        message="This contact message will be permanently deleted."
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}


/* ═══════════════════════════════════════════════════
   MAIN ADMIN PAGE
═══════════════════════════════════════════════════ */
export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders');
  const [toast, setToast] = useState(null);
  const [contactBadge, setContactBadge] = useState(0);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: 'Package' },
    { id: 'services', label: 'Services', icon: 'Wrench' },
    { id: 'contact', label: 'Contact', icon: 'Mail', badge: contactBadge },
  ];

  return (
    <div className="admin-wrapper">
      <Toast toast={toast} />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>Errands CMS</h2>
          <p>Admin Panel</p>
        </div>
        <ul className="admin-nav">
          {tabs.map(tab => (
            <li key={tab.id} className="admin-nav-item">
              <button
                className={`admin-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon} size={17} />
                {tab.label}
                {tab.badge > 0 && <span className="admin-nav-badge">{tab.badge}</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>
              {activeTab === 'orders' && 'Orders Management'}
              {activeTab === 'services' && 'Services Management'}
              {activeTab === 'contact' && 'Contact Tickets'}
            </h1>
            <p>
              {activeTab === 'orders' && 'View, filter and dispatch all incoming client orders.'}
              {activeTab === 'services' && 'Add, edit, or remove services displayed on the website.'}
              {activeTab === 'contact' && 'Manage client enquiries and contact form submissions.'}
            </p>
          </div>
        </div>

        {activeTab === 'orders' && <OrdersTab triggerToast={triggerToast} />}
        {activeTab === 'services' && <ServicesTab triggerToast={triggerToast} />}
        {activeTab === 'contact' && <ContactTab triggerToast={triggerToast} setBadgeCount={setContactBadge} />}
      </main>
    </div>
  );
}
