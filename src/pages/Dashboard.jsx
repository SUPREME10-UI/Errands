import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMessages, sendMessage } from '../lib/dbHelper';
import './dashboard.css';

// ── Helper: category data ─────────────────────────
const CATEGORIES = [
  { value: 'Personal & Corporate Errands', base: 50, icon: '🏢', desc: 'Filing, administrative support, runs' },
  { value: 'Parcel Pickup & Delivery',     base: 50, icon: '📦', desc: 'Secure documents, package transfers' },
  { value: 'Travel & Support',             base: 80, icon: '✈️', desc: 'Airport protocols, meet-and-greets' },
  { value: 'Shopping & Vendor Services',   base: 60, icon: '🛒', desc: 'Grocery shopping, vendor payouts' },
  { value: 'House Management',             base: 120, icon: '🏠', desc: 'Artisan oversight, domestic supervision' },
  { value: 'Documentation & Compliance',   base: 150, icon: '📋', desc: 'Notary, corporate company filings' },
  { value: 'Site Inspection Updates',      base: 250, icon: '🔍', desc: 'Diaspora developers construction audits' },
];

const URGENCY_OPTIONS = [
  { value: 'Standard', label: 'Standard',     sub: 'Within 24 hours', price: 0,   icon: '🐢', colour: '#64748b' },
  { value: 'Urgent',   label: 'Urgent',       sub: 'Within 3 hours',  price: 45,  icon: '⚡', colour: '#d97706' },
  { value: 'Express',  label: 'Express Direct', sub: '90 minutes',    price: 100, icon: '🚀', colour: '#dc2626' },
];

// ── Status helpers ─────────────────────────────────
const STATUS_STEPS = ['Pending Assignment', 'Order Ready', 'Out for Delivery', 'Completed'];
const getStepIdx   = (s) => STATUS_STEPS.indexOf(s);
const getStatusKey = (s) => {
  if (s === 'Pending Assignment') return 'pending';
  if (s === 'Order Ready')        return 'ready';
  if (s === 'Out for Delivery')   return 'delivering';
  if (s === 'Completed')          return 'completed';
  return 'pending';
};
const STEP_LABELS = ['Submitted', 'Prepared', 'En Route', 'Delivered'];
const STEP_ICONS  = ['📝',        '📦',       '🏍️',      '✅'];

const getETA = (status, urgency) => {
  if (status === 'Completed')        return { label: 'Delivered', cls: 'done' };
  if (status === 'Out for Delivery') return { label: '10–20 mins away', cls: 'live' };
  if (status === 'Order Ready') {
    const t = urgency === 'Express' ? '~5 min' : urgency === 'Urgent' ? '~15 min' : '~30 min';
    return { label: `Pickup in ${t}`, cls: 'soon' };
  }
  const t = urgency === 'Express' ? '~5 min' : urgency === 'Urgent' ? '~20 min' : '~60 min';
  return { label: `Assigned in ${t}`, cls: '' };
};

// ── Icon svgs ─────────────────────────────────────
const Icon = ({ name, size = 18, className = '' }) => {
  const paths = {
    map:    <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    plus:   <><path d="M12 5v14M5 12h14"/></>,
    clock:  <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    check:  <><polyline points="20 6 9 17 4 12"/></>,
    search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    bell:   <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zm-8 13a2 2 0 0 0 4 0"/></>,
    chat:   <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    user:   <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    down:   <><polyline points="6 9 12 15 18 9"/></>,
    up:     <><polyline points="18 15 12 9 6 15"/></>,
    print:  <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
    send:   <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    file:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    pin:    <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    phone:  <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></>,
    x:      <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// ═══════════════════════════════════════════════════
export default function Dashboard() {
  const { currentUser } = useAuth();
  const location = useLocation();

  // ── Tab / navigation ──────────────────────────────
  const [activeTab, setActiveTab] = useState('tracking');

  // ── Orders ────────────────────────────────────────
  const [orders, setOrders]             = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedId, setExpandedId]     = useState(null);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ── Notifications ─────────────────────────────────
  const [alertHistory, setAlertHistory] = useState([]);
  const [bellOpen, setBellOpen]         = useState(false);
  const [toast, setToast]               = useState(null);

  // ── Chat ─────────────────────────────────────────
  const [chatOrderId, setChatOrderId] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [newMessage, setNewMessage]   = useState('');
  const chatBodyRef = useRef(null);

  // ── Booking wizard ────────────────────────────────
  const [currentStep, setCurrentStep]   = useState(1);
  const [category, setCategory]         = useState('');
  const [pickup, setPickup]             = useState('');
  const [dropoff, setDropoff]           = useState('');
  const [description, setDescription]   = useState('');
  const [urgency, setUrgency]           = useState('Standard');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Cost calc ─────────────────────────────────────
  const costs = (() => {
    const cat = CATEGORIES.find(c => c.value === category);
    const base = cat ? cat.base : 50;
    const urg  = URGENCY_OPTIONS.find(u => u.value === urgency);
    const surcharge = urg ? urg.price : 0;
    const sub  = base + surcharge;
    const tax  = sub * 0.05;
    return { base, surcharge, tax, total: sub + tax };
  })();

  // ── Helpers ───────────────────────────────────────
  const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.VITE_FIREBASE_API_KEY.includes('YOUR_API_KEY') ||
    currentUser?.uid?.startsWith('demo-');

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const addAlert = (text) => {
    setAlertHistory(prev => [{ text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: Date.now() }, ...prev]);
  };

  // ── Fetch orders ──────────────────────────────────
  const fetchOrders = async () => {
    if (!currentUser) return;
    if (isDemo) {
      const all = JSON.parse(localStorage.getItem('demo_orders') || '[]');
      const mine = all.filter(o => o.userId === currentUser.uid)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(prev => {
        mine.forEach(o => {
          const old = prev.find(x => x.id === o.id);
          if (old && old.status !== o.status) {
            triggerToast(`Errand status: ${o.status}`, 'warning');
            addAlert(`Order ${o.id} → ${o.status}`);
          }
        });
        return mine;
      });
      setOrdersLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(currentUser.uid)}`);
      const data = await res.json();
      setOrders(prev => {
        data.forEach(o => {
          const old = prev.find(x => x.id === o.id);
          if (old && old.status !== o.status) {
            triggerToast(`Errand status updated → ${o.status}`, 'warning');
            addAlert(`Order ${o.id} is now: ${o.status}. Rider: ${o.riderName || 'Pending'}`);
          }
        });
        return data;
      });
    } catch (e) {
      console.error('fetchOrders error:', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 6000);
    return () => clearInterval(iv);
  }, [currentUser]);

  // Pre-select service from URL param
  useEffect(() => {
    const p = new URLSearchParams(location.search).get('service');
    if (p) {
      const match = CATEGORIES.find(c => c.value === p);
      if (match) { setCategory(match.value); setActiveTab('book'); }
    }
  }, [location.search]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages]);

  // ── Filtered orders ───────────────────────────────
  const filterOrders = (tab) => {
    let list = orders;
    if (tab === 'tracking') list = list.filter(o => o.status !== 'Completed');
    if (tab === 'history')  list = list.filter(o => o.status === 'Completed');
    if (filterStatus !== 'all' && tab === 'tracking') {
      const map = { pending: 'Pending Assignment', ready: 'Order Ready', delivering: 'Out for Delivery' };
      if (map[filterStatus]) list = list.filter(o => o.status === map[filterStatus]);
    }
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      list = list.filter(o =>
        (o.id || '').toLowerCase().includes(t) ||
        (o.category || '').toLowerCase().includes(t) ||
        (o.pickupLocation || '').toLowerCase().includes(t) ||
        (o.dropoffLocation || '').toLowerCase().includes(t)
      );
    }
    return list;
  };

  // ── Chat ─────────────────────────────────────────
  const openChat = async (orderId) => {
    if (chatOrderId === orderId) { setChatOrderId(null); return; }
    setChatOrderId(orderId);
    const msgs = await getMessages(orderId);
    setMessages(msgs);
  };
  const handleSend = async () => {
    if (!newMessage.trim() || !chatOrderId) return;
    await sendMessage(chatOrderId, newMessage, currentUser?.displayName || 'Client', 'client');
    setNewMessage('');
    const msgs = await getMessages(chatOrderId);
    setMessages(msgs);
  };

  // ── Mark Delivered ────────────────────────────────
  const handleMarkDelivered = async (orderId) => {
    setActionLoading(true);
    try {
      if (isDemo) {
        const all = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        localStorage.setItem('demo_orders', JSON.stringify(all.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o)));
      } else {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Completed' }),
        });
      }
      triggerToast('Errand marked as delivered. Thank you!', 'success');
      fetchOrders();
    } catch (e) {
      triggerToast('Failed to confirm delivery. Try again.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Booking ───────────────────────────────────────
  const handleNextStep = () => {
    if (currentStep === 1 && !category) { triggerToast('Please select a service.', 'warning'); return; }
    if (currentStep === 2 && (!pickup.trim() || !dropoff.trim())) { triggerToast('Enter pickup and dropoff locations.', 'warning'); return; }
    if (currentStep === 3 && !description.trim()) { triggerToast('Please describe the errand.', 'warning'); return; }
    if (currentStep < 4) setCurrentStep(s => s + 1);
  };
  const handlePrevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const handleBookErrand = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    const data = {
      category, pickupLocation: pickup, dropoffLocation: dropoff,
      description, urgency,
      clientName:  currentUser.displayName || 'Customer',
      clientEmail: currentUser.email,
      userId:      currentUser.uid,
      status:      'Pending Assignment',
      createdAt:   new Date().toISOString(),
    };
    try {
      let newOrderId;
      if (isDemo) {
        const all = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        newOrderId = `ORD-${Date.now()}`;
        all.push({ id: newOrderId, ...data });
        localStorage.setItem('demo_orders', JSON.stringify(all));
      } else {
        const res   = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const saved = await res.json();
        newOrderId  = saved.id;
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: [currentUser.email, 'support@runmyerrand.com'],
            subject: `New Errand Booked: ${newOrderId} [${urgency}]`,
            html: `<h2>New Errand!</h2><p><b>ID:</b> ${newOrderId}</p><p><b>Category:</b> ${category}</p><p><b>Pickup:</b> ${pickup}</p><p><b>Dropoff:</b> ${dropoff}</p><p><b>Priority:</b> ${urgency}</p><p><b>Client:</b> ${currentUser.email}</p><hr/><p>${description}</p>`,
          }),
        }).catch(() => {});
      }
      triggerToast(`Order ${newOrderId} booked! 🎉`, 'success');
      addAlert(`Rider allocation underway for ${newOrderId}.`);
      setCategory(''); setPickup(''); setDropoff(''); setDescription(''); setUrgency('Standard'); setSelectedFiles([]); setCurrentStep(1);
      setActiveTab('tracking');
      fetchOrders();
    } catch (err) {
      console.error(err);
      triggerToast('Booking failed. Please try again.', 'danger');
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Stats ─────────────────────────────────────────
  const activeCount    = orders.filter(o => o.status !== 'Completed').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const totalSpent     = orders.filter(o => o.status === 'Completed').length * 52; // approx

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  const initials = (currentUser?.displayName || currentUser?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="dash-root">
      {/* ── Toast ── */}
      {toast && (
        <div className={`dash-toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="dash-grid">
        {/* ════ SIDEBAR ════ */}
        <aside className="dash-sidebar">
          {/* User card */}
          <div className="dash-user-card">
            <div className="dash-user-avatar">{initials}</div>
            <div>
              <div className="dash-user-name">{currentUser?.displayName || 'Client'}</div>
              <div className="dash-user-role">Premium Member</div>
            </div>
          </div>

          <div className="dash-sidebar-label">Navigation</div>

          <div className={`dash-nav-item ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}>
            <Icon name="map" size={18} />
            <span>Active Errands</span>
            {activeCount > 0 && <span className="nav-badge">{activeCount}</span>}
          </div>

          <div className={`dash-nav-item ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
            <Icon name="plus" size={18} />
            <span>Book an Errand</span>
          </div>

          <div className={`dash-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <Icon name="clock" size={18} />
            <span>Order History</span>
            {completedCount > 0 && <span className="nav-badge" style={{ background: '#10b981' }}>{completedCount}</span>}
          </div>

          <div className="dash-sidebar-label" style={{ marginTop: '0.5rem' }}>Alerts</div>

          {/* Bell */}
          <div className="dash-bell-wrap">
            <div
              className={`dash-nav-item ${bellOpen ? 'active' : ''}`}
              onClick={() => setBellOpen(o => !o)}
            >
              <div style={{ position: 'relative' }}>
                <Icon name="bell" size={18} />
                {alertHistory.length > 0 && (
                  <div style={{ position:'absolute', top:'-3px', right:'-3px', width:'9px', height:'9px', background:'#f59e0b', borderRadius:'50%', border:'2px solid var(--bg-card)' }} />
                )}
              </div>
              <span>Notifications</span>
              {alertHistory.length > 0 && <span className="nav-badge" style={{ background: '#f59e0b' }}>{alertHistory.length}</span>}
            </div>

            {bellOpen && (
              <div className="dash-bell-dropdown">
                <div style={{ padding:'0.875rem 1rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:700, fontSize:'0.85rem' }}>Notifications</span>
                  <button
                    onClick={() => { setAlertHistory([]); setBellOpen(false); }}
                    style={{ background:'none', border:'none', color:'var(--primary)', fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}
                  >Clear all</button>
                </div>
                <div style={{ maxHeight:'280px', overflowY:'auto' }}>
                  {alertHistory.length === 0 ? (
                    <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)', fontSize:'0.8rem' }}>No alerts yet</div>
                  ) : alertHistory.map(a => (
                    <div key={a.id} style={{ padding:'0.75rem 1rem', borderBottom:'1px solid var(--border)', display:'flex', gap:'0.6rem' }}>
                      <div style={{ width:'7px', height:'7px', background:'#f59e0b', borderRadius:'50%', marginTop:'0.45rem', flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--text-main)' }}>{a.text}</div>
                        <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'0.15rem' }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <main className="dash-main">

          {/* Page header */}
          <div className="dash-page-header">
            <h1 className="dash-page-title">
              {activeTab === 'tracking' && '📍 Active Errands'}
              {activeTab === 'book'     && '📝 Book an Errand'}
              {activeTab === 'history'  && '🧾 Order History'}
            </h1>
            <p className="dash-page-sub">
              {activeTab === 'tracking' && 'Real-time tracking for all your active errand requests.'}
              {activeTab === 'book'     && 'Fill out the wizard to dispatch a rider in minutes.'}
              {activeTab === 'history'  && 'Browse and download invoices for completed errands.'}
            </p>
          </div>

          {/* Stats row — always visible */}
          <div className="dash-stats-row">
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background:'rgba(0,82,255,0.1)' }}>
                <Icon name="map" size={20} style={{ color:'var(--primary)' }} />
              </div>
              <div>
                <div className="dash-stat-num">{activeCount}</div>
                <div className="dash-stat-lbl">Active</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background:'rgba(16,185,129,0.1)' }}>
                <Icon name="check" size={20} style={{ color:'#10b981' }} />
              </div>
              <div>
                <div className="dash-stat-num">{completedCount}</div>
                <div className="dash-stat-lbl">Completed</div>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background:'rgba(245,158,11,0.1)' }}>
                <span style={{ fontSize:'1.1rem' }}>₵</span>
              </div>
              <div>
                <div className="dash-stat-num">{completedCount * 52}</div>
                <div className="dash-stat-lbl">GHS Spent</div>
              </div>
            </div>
          </div>

          {/* ─────────── TAB: TRACKING ─────────── */}
          {activeTab === 'tracking' && (
            <div>
              {/* Filter bar */}
              <div className="dash-filter-bar">
                <div className="dash-search-wrap">
                  <Icon name="search" size={16} />
                  <input
                    id="errand-search"
                    className="dash-search-input"
                    type="text"
                    placeholder="Search by ID, category, or location…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="dash-filter-chips">
                  {[['all','All'],['pending','Pending'],['ready','Ready'],['delivering','En Route']].map(([v, l]) => (
                    <button key={v} className={`filter-chip ${filterStatus === v ? 'active' : ''}`} onClick={() => setFilterStatus(v)}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Orders list */}
              {ordersLoading ? (
                <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--text-muted)' }}>
                  <div style={{ width:36, height:36, border:'3px solid var(--border)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }} />
                  <p>Loading errands…</p>
                </div>
              ) : filterOrders('tracking').length === 0 ? (
                <div className="empty-state">
                  <span style={{ fontSize:'3rem' }}>📭</span>
                  <h3>No Active Errands</h3>
                  <p>{searchTerm || filterStatus !== 'all' ? 'No results match your filters.' : 'Book your first errand to get started!'}</p>
                  <button
                    className="order-btn primary"
                    style={{ margin:'0 auto' }}
                    onClick={() => setActiveTab('book')}
                  >
                    <Icon name="plus" size={15} /> Book an Errand
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                  {filterOrders('tracking').map(order => {
                    const stepIdx   = getStepIdx(order.status);
                    const statusKey = getStatusKey(order.status);
                    const eta       = getETA(order.status, order.urgency);
                    const isExp     = expandedId === order.id;
                    const urgOpt    = URGENCY_OPTIONS.find(u => u.value === order.urgency);

                    return (
                      <div key={order.id} className={`order-card status-${statusKey}`} id={`card-${order.id}`}>
                        {/* Top row */}
                        <div className="order-card-top">
                          <div>
                            <div className="order-id-row" style={{ marginBottom:'0.5rem' }}>
                              <span className="order-id-badge">#{String(order.id).slice(-8).toUpperCase()}</span>
                              <span className={`status-pill ${statusKey}`}>
                                <span className="status-pill-dot" />
                                {order.status}
                              </span>
                              <span className={`urgency-pill ${urgOpt?.value?.toLowerCase() || 'standard'}`}>
                                {urgOpt?.icon} {order.urgency}
                              </span>
                            </div>
                            <div style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-main)' }}>{order.category}</div>
                            {order.description && (
                              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'0.25rem', maxWidth:'480px' }}>
                                {order.description.slice(0, 90)}{order.description.length > 90 ? '…' : ''}
                              </div>
                            )}
                          </div>
                          <div className={`eta-badge ${eta.cls}`} title="Estimated arrival time">
                            ⏱ {eta.label}
                          </div>
                        </div>

                        {/* Route */}
                        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', margin:'0.875rem 0', padding:'0.875rem 1rem', background:'var(--bg-light)', borderRadius:'10px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.82rem', flex:1, minWidth:'160px' }}>
                            <span style={{ fontSize:'0.9rem' }}>📍</span>
                            <div>
                              <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Pickup</div>
                              <div style={{ fontWeight:600, color:'var(--text-main)' }}>{order.pickupLocation}</div>
                            </div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', color:'var(--text-muted)', fontSize:'0.85rem' }}>→</div>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.82rem', flex:1, minWidth:'160px' }}>
                            <span style={{ fontSize:'0.9rem' }}>🎯</span>
                            <div>
                              <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Dropoff</div>
                              <div style={{ fontWeight:600, color:'var(--text-main)' }}>{order.dropoffLocation}</div>
                            </div>
                          </div>
                        </div>

                        {/* Progress timeline */}
                        <div className="track-timeline">
                          {STATUS_STEPS.map((step, i) => {
                            const isDone   = stepIdx > i;
                            const isActive = stepIdx === i;
                            const isLast   = i === STATUS_STEPS.length - 1;
                            return (
                              <React.Fragment key={step}>
                                <div className={`track-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                                  <div className="track-step-dot">
                                    {isDone ? <Icon name="check" size={13} /> : <span style={{ fontSize:'0.7rem' }}>{STEP_ICONS[i]}</span>}
                                  </div>
                                  <div className="track-step-lbl">{STEP_LABELS[i]}</div>
                                </div>
                                {!isLast && (
                                  <div className={`track-connector ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Rider panel */}
                        {isExp && (
                          <div className="rider-panel">
                            <div className="rider-panel-head">
                              <span>🏍️</span> Assigned Courier
                            </div>
                            {order.riderName ? (
                              <div className="rider-info-row">
                                <div className="rider-avatar">{order.riderName.charAt(0).toUpperCase()}</div>
                                <div style={{ flex: 1 }}>
                                  <div className="rider-name">{order.riderName}</div>
                                  {order.riderVehicleType && (
                                    <div className="rider-vehicle-chip">
                                      🚗 {order.riderColor} {order.riderVehicleType} • {order.riderPlate}
                                    </div>
                                  )}
                                  <div className="rider-meta">
                                    {new Date(order.createdAt).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' })}
                                    {' · '}
                                    GHS {costs.total.toFixed(2)} est.
                                  </div>
                                </div>
                                {order.riderPhone && (
                                  <a href={`tel:${order.riderPhone}`} className="rider-phone-btn">
                                    <Icon name="phone" size={13} /> Call
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="no-rider-msg">
                                <div className="no-rider-spinner" />
                                Allocating a rider to your errand…
                              </div>
                            )}
                          </div>
                        )}

                        {/* Chat */}
                        {chatOrderId === order.id && (
                          <div className="chat-panel">
                            <div className="chat-head">
                              <Icon name="chat" size={14} /> Support Chat — #{String(order.id).slice(-6).toUpperCase()}
                            </div>
                            <div className="chat-body" ref={chatBodyRef}>
                              {messages.length === 0 && (
                                <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', textAlign:'center', margin:'auto' }}>Send a message to your rider or support team…</p>
                              )}
                              {messages.map(m => (
                                <div key={m.id} className={`chat-msg ${m.senderType === 'client' ? 'client' : 'rider'}`}>
                                  <div className="chat-msg-name">{m.senderName}</div>
                                  {m.text}
                                </div>
                              ))}
                            </div>
                            <div className="chat-footer">
                              <input
                                className="chat-input"
                                placeholder="Type a message…"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                              />
                              <button className="chat-send-btn" onClick={handleSend}>
                                <Icon name="send" size={14} /> Send
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="order-actions">
                          <button className="order-btn" onClick={() => setExpandedId(isExp ? null : order.id)}>
                            <Icon name={isExp ? 'up' : 'down'} size={14} />
                            {isExp ? 'Hide Details' : 'Rider Details'}
                          </button>
                          <button className="order-btn" onClick={() => openChat(order.id)}>
                            <Icon name="chat" size={14} />
                            {chatOrderId === order.id ? 'Close Chat' : 'Chat'}
                          </button>
                          {order.status === 'Out for Delivery' && (
                            <button className="order-btn success" onClick={() => handleMarkDelivered(order.id)} disabled={actionLoading}>
                              <Icon name="check" size={14} />
                              Confirm Delivery
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─────────── TAB: BOOK ─────────── */}
          {activeTab === 'book' && (
            <div className="wizard-grid">
              {/* Wizard form card */}
              <div className="wizard-card">
                {/* Stepper */}
                <div className="stepper-container">
                  {[1,2,3,4].map((s, i) => (
                    <React.Fragment key={s}>
                      <div
                        className={`step-node ${currentStep === s ? 'active' : ''} ${currentStep > s ? 'completed' : ''}`}
                        onClick={() => currentStep > s && setCurrentStep(s)}
                        style={{ cursor: currentStep > s ? 'pointer' : 'default' }}
                      >
                        <div className="step-num">
                          {currentStep > s ? <Icon name="check" size={14} /> : s}
                        </div>
                        <span className="step-label">{['Category','Route','Details','Confirm'][i]}</span>
                      </div>
                      {i < 3 && <div className={`step-connector ${currentStep > s ? 'done' : ''}`} />}
                    </React.Fragment>
                  ))}
                </div>

                <form onSubmit={handleBookErrand} id="errand-wizard-form">

                  {/* Step 1: Category */}
                  <div className={`wizard-panel ${currentStep === 1 ? 'active' : ''}`}>
                    <h2 style={{ fontSize:'1.15rem', fontWeight:800, marginBottom:'0.35rem' }}>What service do you need?</h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'1.25rem' }}>Choose the category that best fits your errand.</p>
                    <div className="cat-grid">
                      {CATEGORIES.map(cat => (
                        <div
                          key={cat.value}
                          className={`cat-card ${category === cat.value ? 'selected' : ''}`}
                          onClick={() => setCategory(cat.value)}
                          id={`cat-${cat.value.replace(/\W/g,'-')}`}
                        >
                          <div className="cat-icon">{cat.icon}</div>
                          <div className="cat-name">{cat.value}</div>
                          <div className="cat-desc">{cat.desc}</div>
                          <div className="cat-price">From GHS {cat.base}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Route */}
                  <div className={`wizard-panel ${currentStep === 2 ? 'active' : ''}`}>
                    <h2 style={{ fontSize:'1.15rem', fontWeight:800, marginBottom:'0.35rem' }}>Where are we going?</h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'1.5rem' }}>Enter pickup and dropoff addresses in Accra.</p>

                    <div className="form-group">
                      <label className="form-label" htmlFor="pickup-input">📍 Pickup Location *</label>
                      <div className="route-input-wrap">
                        <Icon name="pin" size={16} />
                        <input
                          id="pickup-input"
                          className="route-input"
                          type="text"
                          placeholder="E.g., Plot 12, East Legon, Accra"
                          value={pickup}
                          onChange={e => setPickup(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display:'flex', justifyContent:'center', color:'var(--text-muted)', margin:'0.5rem 0', fontSize:'1.25rem' }}>↓</div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="dropoff-input">🎯 Dropoff Location *</label>
                      <div className="route-input-wrap">
                        <Icon name="target" size={16} />
                        <input
                          id="dropoff-input"
                          className="route-input"
                          type="text"
                          placeholder="E.g., Airport Residential Area, Accra"
                          value={dropoff}
                          onChange={e => setDropoff(e.target.value)}
                        />
                      </div>
                    </div>

                    {pickup && dropoff && (
                      <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'10px', padding:'0.75rem 1rem', fontSize:'0.82rem', color:'#059669', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <Icon name="check" size={14} /> Route saved: <strong>{pickup}</strong> → <strong>{dropoff}</strong>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Priority & Details */}
                  <div className={`wizard-panel ${currentStep === 3 ? 'active' : ''}`}>
                    <h2 style={{ fontSize:'1.15rem', fontWeight:800, marginBottom:'0.35rem' }}>Priority & Instructions</h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'1.25rem' }}>Set urgency and describe the errand clearly.</p>

                    <div className="urgency-grid" style={{ marginBottom:'1.5rem' }}>
                      {URGENCY_OPTIONS.map(opt => (
                        <div
                          key={opt.value}
                          className={`urgency-option ${urgency === opt.value ? 'selected' : ''}`}
                          onClick={() => setUrgency(opt.value)}
                          id={`urgency-${opt.value}`}
                        >
                          <span className="urgency-option-icon">{opt.icon}</span>
                          <div>
                            <div className="urgency-option-name">{opt.label}</div>
                            <div className="urgency-option-desc">{opt.sub}</div>
                          </div>
                          <span className="urgency-option-price" style={{ color: opt.price > 0 ? '#d97706' : '#059669' }}>
                            {opt.price > 0 ? `+GHS ${opt.price}` : 'Included'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="errand-desc">Detailed Instructions *</label>
                      <textarea
                        id="errand-desc"
                        className="route-input"
                        rows={4}
                        style={{ resize:'vertical', paddingLeft:'1rem' }}
                        placeholder="E.g., 'Collect a document from the notary on the 2nd floor. Ask for Mrs. Asante, show this reference: XY-2024…'"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={500}
                      />
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'0.35rem', textAlign:'right' }}>{description.length}/500</div>
                    </div>
                  </div>

                  {/* Step 4: Confirm */}
                  <div className={`wizard-panel ${currentStep === 4 ? 'active' : ''}`}>
                    <h2 style={{ fontSize:'1.15rem', fontWeight:800, marginBottom:'0.35rem' }}>Attach Files & Confirm</h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'1.25rem' }}>Optional documents, then review your order.</p>

                    <div className="drop-zone" id="drop-zone" onClick={() => fileInputRef.current?.click()} style={{ marginBottom:'1.25rem' }}>
                      <input type="file" multiple ref={fileInputRef} style={{ display:'none' }}
                        onChange={e => {
                          const f = Array.from(e.target.files);
                          setSelectedFiles(prev => [...prev, ...f]);
                          triggerToast(`${f.length} file(s) attached`, 'success');
                        }}
                      />
                      <Icon name="upload" size={28} style={{ margin:'0 auto 0.75rem', display:'block' }} />
                      <p style={{ margin:'0 0 0.25rem', fontWeight:600, fontSize:'0.9rem' }}>Click to browse files</p>
                      <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>PDF, JPG, PNG — max 10MB each</span>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'1.25rem' }}>
                        {selectedFiles.map((f, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'rgba(0,82,255,0.07)', border:'1px solid rgba(0,82,255,0.2)', borderRadius:'8px', padding:'0.35rem 0.65rem', fontSize:'0.75rem', fontWeight:500, color:'var(--primary)' }}>
                            <Icon name="file" size={12} />
                            {f.name.slice(0,18)}{f.name.length > 18 ? '…' : ''}
                            <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_,j)=>j!==i))}
                              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0, display:'flex', alignItems:'center' }}>
                              <Icon name="x" size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Review summary */}
                    <div style={{ background:'var(--bg-light)', borderRadius:'12px', padding:'1.1rem 1.25rem', border:'1px solid var(--border)' }}>
                      <div style={{ fontWeight:700, fontSize:'0.85rem', marginBottom:'0.875rem', color:'var(--text-main)' }}>📋 Order Summary</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', fontSize:'0.82rem' }}>
                        {[
                          ['Service', category],
                          ['Priority', urgency],
                          ['Pickup', pickup],
                          ['Dropoff', dropoff],
                        ].map(([k,v]) => (
                          <div key={k}>
                            <div style={{ color:'var(--text-muted)', fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.15rem' }}>{k}</div>
                            <div style={{ fontWeight:600, color:'var(--text-main)' }}>{v || '—'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Wizard nav buttons */}
                  <div className="wizard-actions">
                    {currentStep > 1 && (
                      <button type="button" className="order-btn" onClick={handlePrevStep}>
                        ← Back
                      </button>
                    )}
                    <div style={{ marginLeft:'auto' }}>
                      {currentStep < 4 ? (
                        <button type="button" className="order-btn primary" onClick={handleNextStep}>
                          Continue →
                        </button>
                      ) : (
                        <button type="submit" className="order-btn primary" disabled={bookingLoading} id="confirm-book-btn"
                          style={{ opacity: bookingLoading ? 0.7 : 1 }}>
                          {bookingLoading ? '⏳ Booking…' : '✓ Confirm & Book'}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Live estimate sidebar */}
              <div className="wizard-sidebar-card">
                <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'1rem' }}>💰 Live Estimate</div>
                <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'1.25rem', lineHeight:1.5 }}>Dynamic pricing based on service & priority.</p>

                <div className="estimate-row">
                  <span>Base Rate</span>
                  <strong>GHS {costs.base.toFixed(2)}</strong>
                </div>
                <div className="estimate-row">
                  <span>Urgency Add-on</span>
                  <strong style={{ color: costs.surcharge > 0 ? '#d97706' : 'var(--text-muted)' }}>+GHS {costs.surcharge.toFixed(2)}</strong>
                </div>
                <div className="estimate-row">
                  <span>VAT (5%)</span>
                  <strong>GHS {costs.tax.toFixed(2)}</strong>
                </div>
                <div className="estimate-total-box" style={{ marginTop:'1rem' }}>
                  <span style={{ fontWeight:600, fontSize:'0.9rem' }}>Total</span>
                  <strong style={{ fontSize:'1.4rem' }}>GHS {costs.total.toFixed(2)}</strong>
                </div>

                {/* ETA preview */}
                {urgency && (
                  <div style={{ marginTop:'1rem', background:'rgba(0,82,255,0.06)', border:'1px solid rgba(0,82,255,0.15)', borderRadius:'10px', padding:'0.875rem', fontSize:'0.8rem' }}>
                    <div style={{ fontWeight:700, color:'var(--primary)', marginBottom:'0.35rem' }}>⏱ Dispatch ETA</div>
                    <div style={{ color:'var(--text-muted)' }}>
                      {urgency === 'Express'  ? 'Your errand will be dispatched in ~5 minutes.' : ''}
                      {urgency === 'Urgent'   ? 'Rider assigned within ~20 minutes.' : ''}
                      {urgency === 'Standard' ? 'Handled within the next 24 hours.' : ''}
                    </div>
                  </div>
                )}

                <div style={{ marginTop:'0.875rem', padding:'0.75rem', background:'rgba(16,185,129,0.07)', borderRadius:'10px', border:'1px solid rgba(16,185,129,0.2)', fontSize:'0.75rem', color:'var(--text-main)', lineHeight:1.5 }}>
                  💡 <strong>Tip:</strong> Express pricing is ideal for time-critical errands like visa or courier runs.
                </div>
              </div>
            </div>
          )}

          {/* ─────────── TAB: HISTORY ─────────── */}
          {activeTab === 'history' && (
            <div>
              <div className="dash-filter-bar">
                <div className="dash-search-wrap">
                  <Icon name="search" size={16} />
                  <input
                    id="history-search"
                    className="dash-search-input"
                    type="text"
                    placeholder="Search completed orders…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filterOrders('history').length === 0 ? (
                <div className="empty-state">
                  <span style={{ fontSize:'3rem' }}>🧾</span>
                  <h3>No Completed Errands</h3>
                  <p>{searchTerm ? 'No results for that search.' : 'Once your errands are delivered, they appear here as invoices.'}</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                  {filterOrders('history').map(order => {
                    const urgOpt = URGENCY_OPTIONS.find(u => u.value === order.urgency);
                    const base   = CATEGORIES.find(c => c.value === order.category)?.base || 50;
                    const sup    = urgOpt?.price || 0;
                    const total  = (base + sup) * 1.05;
                    return (
                      <div key={order.id} className="history-card">
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.875rem', flexWrap:'wrap', gap:'0.5rem' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                            <span className="order-id-badge">#{String(order.id).slice(-8).toUpperCase()}</span>
                            <span className="status-pill completed">
                              <span className="status-pill-dot" />Completed
                            </span>
                          </div>
                          <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                            {new Date(order.createdAt).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' })}
                            {' · '}
                            {new Date(order.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                          </span>
                        </div>

                        <div style={{ fontWeight:700, color:'var(--text-main)', marginBottom:'0.1rem' }}>{order.category}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.875rem' }}>
                          {order.description?.slice(0,90)}{order.description?.length > 90 ? '…' : ''}
                        </div>

                        <div className="history-meta-grid">
                          <div className="history-meta-item">
                            <span className="history-meta-label">Pickup</span>
                            <span className="history-meta-value">📍 {order.pickupLocation}</span>
                          </div>
                          <div className="history-meta-item">
                            <span className="history-meta-label">Dropoff</span>
                            <span className="history-meta-value">🎯 {order.dropoffLocation}</span>
                          </div>
                          <div className="history-meta-item">
                            <span className="history-meta-label">Courier</span>
                            <span className="history-meta-value">👤 {order.riderName || '—'}</span>
                          </div>
                          <div className="history-meta-item">
                            <span className="history-meta-label">Amount</span>
                            <span className="history-meta-value" style={{ color:'var(--primary)', fontWeight:800 }}>GHS {total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="order-actions">
                          <button
                            className="order-btn"
                            onClick={() => { document.title = `Invoice_${order.id}`; window.print(); setTimeout(() => document.title = 'Run My Errand', 1200); }}
                          >
                            <Icon name="print" size={14} /> Download Invoice
                          </button>
                          <button
                            className="order-btn"
                            onClick={() => window.open(`mailto:${order.clientEmail}?subject=Invoice for ${order.id}&body=Please find your invoice for order ${order.id}.`)}
                          >
                            <Icon name="send" size={14} /> Email Invoice
                          </button>
                          <button
                            className="order-btn primary"
                            onClick={() => {
                              setCategory(order.category);
                              setPickup(order.pickupLocation);
                              setDropoff(order.dropoffLocation);
                              setDescription('');
                              setCurrentStep(3);
                              setActiveTab('book');
                            }}
                          >
                            <Icon name="plus" size={14} /> Rebook
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
