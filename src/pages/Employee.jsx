import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrder, getMessages, sendMessage } from '../lib/dbHelper';
import './employee.css';

/* ── Inline SVG Icons ─────────────────────────────── */
const Icon = ({ name, size = 18 }) => {
  const icons = {
    Truck: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    Package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    CheckCircle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    Phone: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    MessageSquare: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    MapPin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
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
    Check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  };
  return icons[name] || <span />;
};

export default function Employee() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'available', 'history'
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [toast, setToast] = useState(null);

  // Chat modal state
  const [chatOrder, setChatOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const courierName = userData?.name || currentUser?.displayName || 'Kofi Mensah';
  const courierPhone = userData?.phone || '+233 24 123 4567';
  const courierVehicle = 'Motorcycle (Honda 150cc)';
  const courierPlate = 'GW-4521-23';

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrderList = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders for employee:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderList();
    const interval = setInterval(fetchOrderList, 7000);
    return () => clearInterval(interval);
  }, [fetchOrderList]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrder(orderId, {
        status: newStatus,
        riderName: courierName,
        riderPhone: courierPhone,
        riderVehicleType: 'Motorcycle',
        riderPlate: courierPlate,
        riderColor: 'Black'
      });
      triggerToast(`Order updated to: ${newStatus}`, 'success');
      fetchOrderList();
    } catch (err) {
      console.error('Failed to update order status:', err);
      triggerToast('Failed to update status', 'danger');
    }
  };

  const handleClaimOrder = async (order) => {
    try {
      await updateOrder(order.id, {
        status: 'Order Ready',
        riderName: courierName,
        riderPhone: courierPhone,
        riderVehicleType: 'Motorcycle',
        riderPlate: courierPlate,
        riderColor: 'Black'
      });
      triggerToast(`Errand claimed! Moved to My Deliveries`, 'success');
      setActiveTab('assigned');
      fetchOrderList();
    } catch (err) {
      console.error('Failed to claim order:', err);
      triggerToast('Failed to claim order', 'danger');
    }
  };

  const openChat = async (order) => {
    setChatOrder(order);
    const msgs = await getMessages(order.id);
    setMessages(msgs);
  };

  const handleSendChat = async () => {
    if (!newMessage.trim() || !chatOrder) return;
    await sendMessage(chatOrder.id, newMessage, courierName, 'courier');
    setNewMessage('');
    const msgs = await getMessages(chatOrder.id);
    setMessages(msgs);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter lists
  const myAssignedOrders = orders.filter(o => 
    (o.riderName === courierName || (!o.riderName && o.status === 'Order Ready')) &&
    o.status !== 'Completed' && o.status !== 'Rejected'
  );

  const availableOrders = orders.filter(o =>
    (o.status === 'Pending Assignment' || !o.status) && !o.riderName
  );

  const completedOrders = orders.filter(o =>
    o.status === 'Completed' && (o.riderName === courierName || !o.riderName)
  );

  const activeDeliveriesCount = orders.filter(o => 
    o.riderName === courierName && o.status === 'Out for Delivery'
  ).length;

  const badgeClass = s => ({
    'Pending Assignment': 'badge-pending',
    'Order Ready': 'badge-assigned',
    'Out for Delivery': 'badge-progress',
    Completed: 'badge-completed',
  }[s] || 'badge-pending');

  return (
    <div className="employee-wrapper">
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside className="employee-sidebar">
        <div className="employee-brand">
          <h2>Run My Errand</h2>
          <p>Courier Operations Portal</p>
        </div>

        {/* Courier Profile Info */}
        <div className="employee-courier-card">
          <div className="employee-courier-name">{courierName}</div>
          <div className="employee-courier-meta">
            <span>🏍️ {courierVehicle}</span>
            <span>🏷️ Plate: <strong>{courierPlate}</strong></span>
            <span>📞 {courierPhone}</span>
          </div>

          <button
            type="button"
            className={`employee-status-toggle ${isOnDuty ? 'online' : 'offline'}`}
            onClick={() => setIsOnDuty(!isOnDuty)}
          >
            <span style={{ fontSize: '10px' }}>{isOnDuty ? '🟢' : '⚪'}</span>
            {isOnDuty ? 'On Duty / Available' : 'Off Duty'}
          </button>
        </div>

        {/* Navigation */}
        <ul className="employee-nav">
          <li>
            <button
              className={`employee-nav-btn ${activeTab === 'assigned' ? 'active' : ''}`}
              onClick={() => setActiveTab('assigned')}
            >
              <Icon name="Truck" size={17} />
              My Deliveries
              {myAssignedOrders.length > 0 && (
                <span className="employee-nav-badge">{myAssignedOrders.length}</span>
              )}
            </button>
          </li>
          <li>
            <button
              className={`employee-nav-btn ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              <Icon name="Package" size={17} />
              Available Runs
              {availableOrders.length > 0 && (
                <span className="employee-nav-badge">{availableOrders.length}</span>
              )}
            </button>
          </li>
          <li>
            <button
              className={`employee-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Icon name="CheckCircle" size={17} />
              Delivery History
              <span className="employee-nav-badge">{completedOrders.length}</span>
            </button>
          </li>
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="employee-content">
        <div className="employee-header">
          <div>
            <h1>
              {activeTab === 'assigned' && 'My Active Deliveries'}
              {activeTab === 'available' && 'Available Errands to Claim'}
              {activeTab === 'history' && 'Completed Deliveries Log'}
            </h1>
            <p>
              {activeTab === 'assigned' && 'Manage your active dispatch assignments, pickup stops, and customer status.'}
              {activeTab === 'available' && 'Browse newly submitted errands and claim ones along your route.'}
              {activeTab === 'history' && 'Review all successfully delivered errands.'}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchOrderList} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Icon name="Refresh" size={14} /> Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="employee-stats-grid">
          <div className="employee-stat-card">
            <div className="employee-stat-title">My Assigned Runs</div>
            <div className="employee-stat-val">{myAssignedOrders.length}</div>
            <div className="employee-stat-sub">Active tasks</div>
          </div>
          <div className="employee-stat-card">
            <div className="employee-stat-title">Out for Delivery</div>
            <div className="employee-stat-val" style={{ color: 'var(--secondary)' }}>{activeDeliveriesCount}</div>
            <div className="employee-stat-sub">En route currently</div>
          </div>
          <div className="employee-stat-card">
            <div className="employee-stat-title">Unclaimed Pool</div>
            <div className="employee-stat-val" style={{ color: '#d97706' }}>{availableOrders.length}</div>
            <div className="employee-stat-sub">Available to claim</div>
          </div>
          <div className="employee-stat-card">
            <div className="employee-stat-title">Completed Today</div>
            <div className="employee-stat-val" style={{ color: '#059669' }}>{completedOrders.length}</div>
            <div className="employee-stat-sub">Delivered successfully</div>
          </div>
        </div>

        {/* Tab 1: My Deliveries */}
        {activeTab === 'assigned' && (
          <div className="employee-card-list">
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading assignments…</p>
            ) : myAssignedOrders.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><Icon name="Truck" size={24} /></div>
                <h3>No active runs assigned</h3>
                <p>Check the "Available Runs" tab to pick up unassigned errands.</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('available')}>
                  View Available Errands
                </button>
              </div>
            ) : (
              myAssignedOrders.map(order => (
                <div key={order.id} className={`errand-job-card ${order.status === 'Out for Delivery' ? 'active-run' : ''}`}>
                  <div className="job-card-header">
                    <div className="job-category-tag">
                      <span>📦</span> {order.category}
                      <span className="job-id-code">#{String(order.id).slice(0, 8)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${order.urgency === 'Express' ? 'badge-urgent' : 'badge-progress'}`}>
                        ⚡ {order.urgency || 'Standard'}
                      </span>
                      <span className={`badge ${badgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Route details: Pickup & Dropoff */}
                  <div className="job-route-box">
                    <div className="job-route-stop">
                      <div className="job-route-icon">📍</div>
                      <div className="job-route-info">
                        <div className="job-route-label">Pickup Location</div>
                        <div className="job-route-address">{order.pickupLocation || 'Accra Central'}</div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.pickupLocation || 'Accra')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        Map ↗
                      </a>
                    </div>
                    <div className="job-route-stop">
                      <div className="job-route-icon">🎯</div>
                      <div className="job-route-info">
                        <div className="job-route-label">Dropoff Location</div>
                        <div className="job-route-address">{order.dropoffLocation || 'Airport Residential Area'}</div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.dropoffLocation || 'Accra')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        Map ↗
                      </a>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="job-client-row">
                    <div className="job-client-details">
                      <div className="job-client-avatar">
                        {(order.clientName || 'C')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.clientName || 'Client'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.clientEmail || 'No email provided'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {order.clientPhone && (
                        <>
                          <a href={`tel:${order.clientPhone}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Icon name="Phone" size={13} /> Call
                          </a>
                          <a href={`https://wa.me/${order.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ color: '#10b981' }}>
                            WhatsApp
                          </a>
                        </>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => openChat(order)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon name="MessageSquare" size={13} /> Chat
                      </button>
                    </div>
                  </div>

                  {/* Errand Notes */}
                  {order.description && (
                    <div className="job-instructions-box">
                      <strong>Instructions:</strong> {order.description}
                    </div>
                  )}

                  {/* Actions to progress status */}
                  <div className="job-actions-row">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Assigned to: <strong>{order.riderName || courierName}</strong>
                    </div>
                    <div className="job-action-buttons">
                      {order.status === 'Pending Assignment' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleUpdateStatus(order.id, 'Order Ready')}
                        >
                          Confirm & Ready Package
                        </button>
                      )}

                      {order.status === 'Order Ready' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}
                        >
                          🚴 Start Delivery Run
                        </button>
                      )}

                      {order.status === 'Out for Delivery' && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ background: '#059669', borderColor: '#059669' }}
                          onClick={() => handleUpdateStatus(order.id, 'Completed')}
                        >
                          ✅ Mark Delivered & Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Available Runs */}
        {activeTab === 'available' && (
          <div className="employee-card-list">
            {availableOrders.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><Icon name="Package" size={24} /></div>
                <h3>All caught up!</h3>
                <p>There are no unassigned errands in the queue at the moment.</p>
              </div>
            ) : (
              availableOrders.map(order => (
                <div key={order.id} className="errand-job-card">
                  <div className="job-card-header">
                    <div className="job-category-tag">
                      <span>📦</span> {order.category}
                      <span className="job-id-code">#{String(order.id).slice(0, 8)}</span>
                    </div>
                    <span className={`badge ${order.urgency === 'Express' ? 'badge-urgent' : 'badge-progress'}`}>
                      ⚡ {order.urgency || 'Standard'}
                    </span>
                  </div>

                  <div className="job-route-box">
                    <div className="job-route-stop">
                      <div className="job-route-icon">📍</div>
                      <div className="job-route-info">
                        <div className="job-route-label">Pickup Location</div>
                        <div className="job-route-address">{order.pickupLocation || 'Accra Central'}</div>
                      </div>
                    </div>
                    <div className="job-route-stop">
                      <div className="job-route-icon">🎯</div>
                      <div className="job-route-info">
                        <div className="job-route-label">Dropoff Location</div>
                        <div className="job-route-address">{order.dropoffLocation || 'Airport Residential'}</div>
                      </div>
                    </div>
                  </div>

                  {order.description && (
                    <div className="job-instructions-box">
                      <strong>Notes:</strong> {order.description}
                    </div>
                  )}

                  <div className="job-actions-row">
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Requested by: <strong>{order.clientName || 'Customer'}</strong>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleClaimOrder(order)}
                    >
                      🚀 Accept & Claim This Errand
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Completed History */}
        {activeTab === 'history' && (
          <div className="employee-card-list">
            {completedOrders.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><Icon name="CheckCircle" size={24} /></div>
                <h3>No completed runs yet</h3>
                <p>Deliveries you complete will appear here with confirmation logs.</p>
              </div>
            ) : (
              completedOrders.map(order => (
                <div key={order.id} className="errand-job-card">
                  <div className="job-card-header">
                    <div className="job-category-tag">
                      <span>✅</span> {order.category}
                      <span className="job-id-code">#{String(order.id).slice(0, 8)}</span>
                    </div>
                    <span className="badge badge-completed">Delivered</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <strong>Route:</strong> {order.pickupLocation} → {order.dropoffLocation}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    Client: {order.clientName} &bull; Delivered on: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* In-app Chat Modal */}
      {chatOrder && (
        <div className="admin-modal-overlay open" onClick={() => setChatOrder(null)}>
          <div className="admin-modal" style={{ maxWidth: 500, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Order Chat: #{String(chatOrder.id).slice(0, 8)}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Client: {chatOrder.clientName}</span>
              </div>
              <button className="btn-icon" onClick={() => setChatOrder(null)}><Icon name="X" size={16} /></button>
            </div>

            <div style={{ height: '320px', overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-main)' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '3rem' }}>
                  No messages yet. Send a message to client or admin.
                </div>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.senderType === 'courier' ? 'flex-end' : 'flex-start',
                      background: m.senderType === 'courier' ? 'var(--secondary)' : 'var(--bg-card)',
                      color: m.senderType === 'courier' ? '#fff' : 'var(--text-main)',
                      padding: '0.7rem 1rem',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      fontSize: '0.85rem',
                      border: m.senderType === 'courier' ? 'none' : '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', opacity: 0.8, marginBottom: '0.2rem' }}>{m.senderName}</div>
                    {m.text}
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', background: 'var(--bg-card)' }}>
              <input
                className="form-input"
                placeholder="Type an update or question…"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              />
              <button className="btn btn-primary" onClick={handleSendChat}>
                <Icon name="Check" size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
