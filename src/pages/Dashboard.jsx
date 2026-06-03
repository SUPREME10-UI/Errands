import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { getMessages, sendMessage } from '../lib/dbHelper';
import "./dashboard.css";
import "./booking.css";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking', 'book', 'history'

  // Booking Wizard states
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Standard');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Cost estimation details
  const [costs, setCosts] = useState({ base: 50, surcharge: 0, tax: 2.5, total: 52.5 });

  // Client Orders list state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [alertHistory, setAlertHistory] = useState([]);
  const [bellActive, setBellActive] = useState(false);
  const [toast, setToast] = useState(null);

  // Chat state
  const [chatOrderId, setChatOrderId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const loadChat = async (orderId) => {
    if (chatOrderId === orderId) {
      setChatOrderId(null); // toggle off
      return;
    }
    setChatOrderId(orderId);
    const msgs = await getMessages(orderId);
    setMessages(msgs);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatOrderId) return;
    await sendMessage(chatOrderId, newMessage, currentUser?.displayName || 'Client', 'client');
    setNewMessage('');
    const msgs = await getMessages(chatOrderId);
    setMessages(msgs);
  };

  const fileInputRef = useRef(null);
  const categoryWrapperRef = useRef(null);

  const categories = [
    { value: "Personal & Corporate Errands", base: 50, desc: "Filing, administrative support, runs" },
    { value: "Parcel Pickup & Delivery", base: 50, desc: "Secure documents, package transfers" },
    { value: "Travel & Support", base: 80, desc: "Airport protocols, meet-and-greets" },
    { value: "Shopping & Vendor Services", base: 60, desc: "Grocery shopping, vendor payouts" },
    { value: "House Management", base: 120, desc: "Artisan oversight, domestic supervision" },
    { value: "Documentation & Compliance Assistance", base: 150, desc: "Notary, corporate company filings" },
    { value: "Site Inspection Updates", base: 250, desc: "Diaspora developers construction audits" }
  ];

  // Load and sync user orders
  const fetchUserOrders = async () => {
    if (!currentUser) return;
    const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('YOUR_API_KEY') || currentUser.uid.startsWith('demo-');
    
    if (isDemo) {
      const allOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
      const userOrders = allOrders.filter(o => o.userId === currentUser.uid);
      userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      if (orders.length > 0) {
        userOrders.forEach(order => {
          const matchingOld = orders.find(o => o.id === order.id);
          if (matchingOld && matchingOld.status !== order.status) {
            triggerToast(`Errand ${order.id} status updated to: ${order.status}!`, 'warning');
            addSystemAlert(`Errand ${order.id} is now [${order.status}]. Rider assigned: ${order.riderName || 'Pending'}.`);
          }
        });
      }
      setOrders(userOrders);
      setOrdersLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      let fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Compare status difference for notification alerts
      if (orders.length > 0) {
        fetchedOrders.forEach(order => {
          const matchingOld = orders.find(o => o.id === order.id);
          if (matchingOld && matchingOld.status !== order.status) {
            triggerToast(`Errand ${order.id} status updated to: ${order.status}!`, 'warning');
            addSystemAlert(`Errand ${order.id} is now [${order.status}]. Rider assigned: ${order.riderName || 'Pending'}.`);
          }
        });
      }

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 4000);
    return () => clearInterval(interval);
  }, [currentUser, orders]);

  // Check URL query parameters for pre-selected service
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceParam = params.get('service');
    if (serviceParam) {
      const matchingCat = categories.find(cat => cat.value === serviceParam);
      if (matchingCat) {
        setCategory(matchingCat.value);
        setActiveTab('book');
        setCurrentStep(1);
        triggerToast(`Auto-selected: ${matchingCat.value}`, 'info');
      }
    }
  }, [location.search]);

  // Close category select on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryWrapperRef.current && !categoryWrapperRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update cost calculations whenever category/urgency changes
  useEffect(() => {
    const activeCatObj = categories.find(cat => cat.value === category);
    const baseVal = activeCatObj ? activeCatObj.base : 50;
    
    let urgencySurcharge = 0;
    if (urgency === 'Urgent') urgencySurcharge = 45;
    if (urgency === 'Express') urgencySurcharge = 100;

    const subtotal = baseVal + urgencySurcharge;
    const taxVal = subtotal * 0.05;
    const totalVal = subtotal + taxVal;

    setCosts({
      base: baseVal,
      surcharge: urgencySurcharge,
      tax: taxVal,
      total: totalVal
    });
  }, [category, urgency]);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addSystemAlert = (text) => {
    setAlertHistory(prev => [
      { text, time: 'Just now', id: Date.now() },
      ...prev
    ]);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !category) {
      triggerToast('Please select a service category.', 'warning');
      return;
    }
    if (currentStep === 2 && (!pickup.trim() || !dropoff.trim())) {
      triggerToast('Please provide pickup and dropoff locations.', 'warning');
      return;
    }
    if (currentStep === 3 && !description.trim()) {
      triggerToast('Please enter errand details.', 'warning');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    triggerToast(`Attached ${files.length} document(s) successfully!`, 'success');
  };

  const handleRemoveFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBookErrand = async (e) => {
    e.preventDefault();
    setLoading(true);
    triggerToast("Submitting your errand booking...", "info");

    const data = {
      category,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      description,
      urgency,
      clientName: currentUser.displayName || "Customer",
      clientEmail: currentUser.email,
      userId: currentUser.uid,
      status: "Pending Assignment",
      createdAt: new Date().toISOString()
    };

    const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('YOUR_API_KEY') || currentUser.uid.startsWith('demo-');
    if (isDemo) {
      try {
        const allOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        const newOrderId = `order-${Date.now()}`;
        const newOrder = { id: newOrderId, ...data };
        allOrders.push(newOrder);
        localStorage.setItem('demo_orders', JSON.stringify(allOrders));

        triggerToast(`Errand ${newOrderId} booked successfully!`, 'success');
        addSystemAlert(`Rider allocation underway for your new order ${newOrderId}.`);

        setCategory('');
        setPickup('');
        setDropoff('');
        setDescription('');
        setUrgency('Standard');
        setSelectedFiles([]);
        setCurrentStep(1);
        setActiveTab('tracking');
        fetchUserOrders();
      } catch (error) {
        console.error("Error booking errand:", error);
        triggerToast("Error processing your errand. Please try again.", "danger");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // Save directly to Firestore
      const docRef = await addDoc(collection(db, "orders"), data);
      const newOrderId = docRef.id;

      // Submit via Backend Email API
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [currentUser.email, 'support@runmyerrand.com'],
          subject: `New Errand Booked: ${newOrderId} [${urgency}]`,
          html: `
            <h2>New Errand Booked!</h2>
            <p><b>Order ID:</b> ${newOrderId}</p>
            <p><b>Category:</b> ${category}</p>
            <p><b>Pickup:</b> ${pickup}</p>
            <p><b>Dropoff:</b> ${dropoff}</p>
            <p><b>Urgency:</b> ${urgency}</p>
            <p><b>Client:</b> ${currentUser.displayName || "Customer"} (${currentUser.email})</p>
            <hr />
            <p><b>Instructions:</b><br/>${description.replace(/\\n/g, '<br/>')}</p>
          `
        })
      }).catch(err => console.warn("Email alert failed but order saved.", err));

      triggerToast(`Errand ${newOrderId} booked successfully!`, 'success');
      addSystemAlert(`Rider allocation underway for your new order ${newOrderId}.`);

      // Reset Form fields
      setCategory('');
      setPickup('');
      setDropoff('');
      setDescription('');
      setUrgency('Standard');
      setSelectedFiles([]);
      setCurrentStep(1);
      
      // Switch back to tracking
      setActiveTab('tracking');
      fetchUserOrders();
    } catch (error) {
      console.error("Error booking errand:", error);
      triggerToast("Error processing your errand. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setLoading(true);
    try {
      const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('YOUR_API_KEY') || currentUser?.uid.startsWith('demo-');
      if (isDemo) {
        const allOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        const updated = allOrders.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o);
        localStorage.setItem('demo_orders', JSON.stringify(updated));
      } else {
        await updateDoc(doc(db, 'orders', orderId), { status: 'Completed' });
      }
      triggerToast('Errand marked as completed. Thank you!', 'success');
      fetchUserOrders();
    } catch (error) {
      console.error("Error marking delivered:", error);
      triggerToast('Failed to mark delivered. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Status mapping functions
  const getStatusStepIndex = (status) => {
    if (status === 'Pending Assignment') return 0;
    if (status === 'Order Ready') return 1;
    if (status === 'Out for Delivery') return 2;
    if (status === 'Completed') return 3;
    return 0;
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Pending Assignment') return 'badge-pending';
    if (status === 'Order Ready') return 'badge-assigned';
    if (status === 'Out for Delivery') return 'badge-progress';
    if (status === 'Completed') return 'badge-completed';
    return 'badge-pending';
  };

  const getUrgencyBadgeClass = (urgency) => {
    if (urgency === 'Standard') return 'badge-progress';
    if (urgency === 'Urgent') return 'badge-warning';
    if (urgency === 'Express') return 'badge-urgent';
    return 'badge-progress';
  };

  return (
    <div className="admin-container" style={{ paddingTop: '100px' }}>
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            background: toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Main Grid */}
      <div className="db-layout-grid container">
        {/* Sidebar Nav */}
        <aside className="db-sidebar">
          <div 
            onClick={() => setActiveTab('tracking')} 
            className={`db-menu-item ${activeTab === 'tracking' ? 'active' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Active Errands</span>
          </div>

          <div 
            onClick={() => setActiveTab('book')} 
            className={`db-menu-item ${activeTab === 'book' ? 'active' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>Book an Errand</span>
          </div>

          <div 
            onClick={() => setActiveTab('history')} 
            className={`db-menu-item ${activeTab === 'history' ? 'active' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 8v4l3 3M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z"></path>
            </svg>
            <span>Order History</span>
          </div>

          {/* Notifications bell widget */}
          <div className="noti-bell-wrapper" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div 
              className="bell-container" 
              onClick={(e) => { e.stopPropagation(); setBellActive(!bellActive); }}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', position: 'relative' }}
            >
              <div style={{ position: 'relative' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zm-8 13a2 2 0 0 0 4 0"></path>
                </svg>
                {alertHistory.length > 0 && <div className="bell-badge"></div>}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>Alerts</span>
              
              {/* Notification drop */}
              <div className={`noti-dropdown ${bellActive ? 'active' : ''}`} style={{ right: 0, left: 'auto', top: '40px' }} onClick={(e) => e.stopPropagation()}>
                <div className="noti-header">
                  <h4>Alert Log</h4>
                  <span 
                    onClick={() => { setAlertHistory([]); triggerToast('Notifications cleared!', 'success'); }} 
                    style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Clear All
                  </span>
                </div>
                <div className="noti-list">
                  {alertHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-light)', fontSize: '0.75rem' }}>
                      No unread alerts
                    </div>
                  ) : (
                    alertHistory.map(alert => (
                      <div key={alert.id} className="db-noti-item">
                        <div className="db-noti-item-dot"></div>
                        <div className="db-noti-item-content">
                          <span className="db-noti-item-title">{alert.text}</span>
                          <span className="db-noti-item-time">{alert.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Dashboard Main Workspace */}
        <main className="db-main-content">
          <div className="db-header-content">
            <h1 className="db-title-text">
              {activeTab === 'tracking' && 'Active Errands & Tracking'}
              {activeTab === 'book' && 'Book a New Errand'}
              {activeTab === 'history' && 'Completed Errands & Invoices'}
            </h1>
            <p className="db-subtitle-text">
              {activeTab === 'tracking' && 'Track the live delivery progress and courier state in real time.'}
              {activeTab === 'book' && 'Fill out our custom logistics form to get dispatched in real time.'}
              {activeTab === 'history' && 'View your past errands and download professional invoices.'}
            </p>
          </div>

          {/* Tab 1: Tracking View */}
          {activeTab === 'tracking' && (
            <div id="my-errands-section" style={{ display: 'block' }}>
              <div className="orders-list" id="orders-list-container">
                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="splash-pulse" style={{ margin: '0 auto 1.5rem', width: '40px', height: '40px' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading active errands...</p>
                  </div>
                ) : orders.filter(o => o.status !== 'Completed').length === 0 ? (
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <line x1="15" y1="3" x2="15" y2="21"></line>
                    </svg>
                    <h3>No Active Errands</h3>
                    <p>Create your very first logistics errand request using the Book an Errand tab.</p>
                  </div>
                ) : (
                  orders.filter(o => o.status !== 'Completed').map(order => {
                    const stepIndex = getStatusStepIndex(order.status);
                    return (
                      <div className="card order-card" id={`card-${order.id}`} key={order.id}>
                        <div className="order-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>{order.id}</h3>
                            <span className={`badge ${getUrgencyBadgeClass(order.urgency)}`}>{order.urgency}</span>
                          </div>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
                        </div>

                        <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>{order.category}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{order.description}</p>
                        
                        <div className="order-meta-info" style={{ marginBottom: '1.5rem' }}>
                          <div className="order-meta-item">Pickup: <strong>{order.pickupLocation}</strong></div>
                          <div className="order-meta-item">Dropoff: <strong>{order.dropoffLocation}</strong></div>
                        </div>

                        {/* Tracking timeline */}
                        <div className="order-tracker-panel">
                          <div className="timeline-horizontal">
                            <div className={`timeline-h-step ${stepIndex >= 0 ? 'completed' : ''} ${stepIndex === 0 ? 'active' : ''}`}>
                              <div className="timeline-h-dot"></div>
                              <span className="timeline-h-label">Submitted</span>
                            </div>
                            <div className={`timeline-h-step ${stepIndex >= 1 ? 'completed' : ''} ${stepIndex === 1 ? 'active' : ''}`}>
                              <div className="timeline-h-dot"></div>
                              <span className="timeline-h-label">Order Ready</span>
                            </div>
                            <div className={`timeline-h-step ${stepIndex >= 2 ? 'completed' : ''} ${stepIndex === 2 ? 'active' : ''}`}>
                              <div className="timeline-h-dot"></div>
                              <span className="timeline-h-label">Out for Delivery</span>
                            </div>
                            <div className={`timeline-h-step ${stepIndex >= 3 ? 'completed' : ''} ${stepIndex === 3 ? 'active' : ''}`}>
                              <div className="timeline-h-dot"></div>
                              <span className="timeline-h-label">Completed</span>
                            </div>
                          </div>

                          {/* Dynamic SVG Accra courier map */}
                          <div className="map-placeholder">
                            <div className="map-grid-overlay"></div>
                            <div className="map-route-line"></div>
                            <div className="map-pin"></div> {/* pickup */}
                            {order.status === 'Out for Delivery' && <div className="map-pin rider"></div>}
                            <div className="map-pin dropoff"></div> {/* dropoff */}
                            
                            <div className="map-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontWeight: 600 }}>{order.riderName ? `Courier: ${order.riderName}` : 'Assigning Courier...'}</span>
                              {order.riderPhone && <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>📞 {order.riderPhone}</span>}
                              {order.riderVehicleType && (
                                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                  🚗 {order.riderColor} {order.riderVehicleType} &mdash; {order.riderPlate}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => loadChat(order.id)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                              {chatOrderId === order.id ? 'Close Chat' : 'Chat Support'}
                            </button>
                            
                            {order.status === 'Out for Delivery' && (
                              <button 
                                className="btn btn-primary btn-sm" 
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => handleMarkDelivered(order.id)}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                          
                          {chatOrderId === order.id && (
                            <div style={{ marginTop: '1rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.85rem' }}>Live Support Chat</div>
                              <div style={{ height: '220px', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {messages.length === 0 ? <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', textAlign: 'center' }}>Start the conversation...</p> : null}
                                {messages.map(m => (
                                  <div key={m.id} style={{ alignSelf: m.senderType === 'client' ? 'flex-end' : 'flex-start', background: m.senderType === 'client' ? 'var(--primary)' : 'var(--bg-card)', color: m.senderType === 'client' ? '#fff' : 'var(--text-main)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', maxWidth: '85%', border: m.senderType === 'client' ? 'none' : '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.8, marginBottom: '0.15rem' }}>{m.senderName}</div>
                                    {m.text}
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                <input className="form-input" style={{ border: 'none', borderRadius: 0 }} placeholder="Type message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                                <button className="btn btn-primary" style={{ borderRadius: 0 }} onClick={handleSendMessage}>Send</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Book an Errand Wizard */}
          {activeTab === 'book' && (
            <div id="booking-flow-section" className="booking-grid">
              {/* Left Column: Form Steps */}
              <div className="card booking-card glass-card">
                {/* Stepper bar */}
                <div className="stepper-container">
                  {[1, 2, 3, 4].map(step => (
                    <div 
                      key={step}
                      className={`step-node ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                    >
                      <div className="step-num">{step}</div>
                      <span className="step-label">
                        {step === 1 ? 'Category' : step === 2 ? 'Route' : step === 3 ? 'Urgency' : 'Summary'}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleBookErrand} id="errand-wizard-form">
                  {/* Step 1 Panel */}
                  <div className={`wizard-panel ${currentStep === 1 ? 'active' : ''}`}>
                    <h2 className="step-title">Select Errand Service Category</h2>
                    
                    <div className="form-group" ref={categoryWrapperRef}>
                      <label className="form-label">Service Category</label>
                      
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Service" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                    </div>
                  </div>

                  {/* Step 2 Panel */}
                  <div className={`wizard-panel ${currentStep === 2 ? 'active' : ''}`}>
                    <h2 className="step-title">Specify Route Details</h2>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="field-pickup">Pickup Address / Location</label>
                      <input 
                        className="form-input" 
                        id="field-pickup" 
                        type="text" 
                        required={currentStep === 2}
                        placeholder="E.g., Plot 12, East Legon, Accra"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <label className="form-label" htmlFor="field-dropoff">Dropoff Address / Location</label>
                      <input 
                        className="form-input" 
                        id="field-dropoff" 
                        type="text" 
                        required={currentStep === 2}
                        placeholder="E.g., Airport Residential Area, Accra"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Step 3 Panel */}
                  <div className={`wizard-panel ${currentStep === 3 ? 'active' : ''}`}>
                    <h2 className="step-title">Select Urgency & Errand Description</h2>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="field-urgency">Urgency Priority</label>
                      <Select value={urgency} onValueChange={setUrgency}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard (Within 24 Hours)</SelectItem>
                          <SelectItem value="Urgent">Urgent (Within 3 Hours) (+GHS 45.00)</SelectItem>
                          <SelectItem value="Express">Express direct dispatch (90 Mins) (+GHS 100.00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <label className="form-label" htmlFor="field-description">Detailed Instructions</label>
                      <textarea 
                        className="form-textarea" 
                        id="field-description" 
                        rows="4" 
                        required={currentStep === 3}
                        placeholder="Provide details. E.g., Ask for notary clerk, obtain signed duplicate..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Step 4 Panel */}
                  <div className={`wizard-panel ${currentStep === 4 ? 'active' : ''}`}>
                    <h2 className="step-title">Attach Documents & Confirm Order</h2>
                    
                    {/* Drag and Drop Zone */}
                    <div 
                      className="drop-zone" 
                      id="drop-zone"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ cursor: 'pointer' }}
                    >
                      <input 
                        type="file" 
                        id="file-upload" 
                        multiple 
                        style={{ display: 'none' }} 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                      />
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p>Drag files here or <span>browse files</span> to upload document slips</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>PDF, JPG, PNG (Max 10MB per file)</span>
                    </div>

                    {/* File chips */}
                    <div className="file-list-preview" id="file-list-preview" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedFiles.map((file, idx) => (
                        <div 
                          key={idx} 
                          style={{
                            background: 'rgba(0, 82, 255, 0.08)',
                            border: '1px solid rgba(0, 82, 255, 0.2)',
                            color: 'var(--secondary)',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          <span 
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }} 
                            style={{ cursor: 'pointer', fontWeight: 700 }}
                          >
                            &times;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stepper Wizard Actions */}
                  <div className="wizard-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      id="wizard-prev-btn"
                      onClick={handlePrevStep}
                      style={{ display: currentStep > 1 ? 'block' : 'none' }}
                    >
                      Back
                    </button>
                    
                    {currentStep < 4 ? (
                      <button 
                        type="button" 
                        className="btn btn-primary glass-btn" 
                        id="wizard-next-btn"
                        onClick={handleNextStep}
                        style={{ marginLeft: 'auto' }}
                      >
                        Next Step
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        className="btn btn-primary glass-btn" 
                        id="wizard-submit-btn"
                        disabled={loading}
                        style={{ marginLeft: 'auto' }}
                      >
                        {loading ? 'Submitting...' : 'Confirm & Book Errand'}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: Live Estimate Breakdown */}
              <div className="card cost-card glass-card">
                <h3>Live Estimate</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Dynamic rates calculated based on category base fees and priority dispatch multipliers.</p>

                <div className="cost-breakdown">
                  <div className="cost-row">
                    <span>Category Base</span>
                    <strong id="summary-base-val">GHS {costs.base.toFixed(2)}</strong>
                  </div>
                  <div className="cost-row">
                    <span>Urgency Level (<span id="summary-urgency-label" style={{ fontWeight: 600 }}>{urgency}</span>)</span>
                    <strong id="summary-urgency-val">GHS {costs.surcharge.toFixed(2)}</strong>
                  </div>
                  <div className="cost-row">
                    <span>V.A.T (5% logistics duty)</span>
                    <strong id="summary-tax-val">GHS {costs.tax.toFixed(2)}</strong>
                  </div>
                  
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />
                  
                  <div className="cost-row total">
                    <span>Total Estimate</span>
                    <strong id="summary-total-val" style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 800 }}>
                      GHS {costs.total.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: History & Invoices */}
          {activeTab === 'history' && (
            <div id="history-section" style={{ display: 'block' }}>
              <div className="orders-list">
                {orders.filter(o => o.status === 'Completed').length === 0 ? (
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line>
                    </svg>
                    <h3>No Completed Errands</h3>
                    <p>Once your active errands are delivered, they will appear here as invoices.</p>
                  </div>
                ) : (
                  orders.filter(o => o.status === 'Completed').map(order => (
                    <div className="card order-card" key={order.id}>
                      <div className="order-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>{order.id}</h3>
                          <span className="badge badge-completed">Completed</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>{order.category}</p>
                      
                      <div className="order-meta-info" style={{ marginBottom: '1.5rem', background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                        <div className="order-meta-item">Pickup: <strong>{order.pickupLocation}</strong></div>
                        <div className="order-meta-item">Dropoff: <strong>{order.dropoffLocation}</strong></div>
                        <div className="order-meta-item">Courier: <strong>{order.riderName || '—'}</strong></div>
                      </div>

                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          // Simple window print approach for invoice
                          document.title = `Invoice_${order.id}`;
                          window.print();
                          setTimeout(() => document.title = 'Run My Errand', 1000);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download Invoice
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
