import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../../public/css/admin.css';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [modalActive, setModalActive] = useState(false);
  const [modalStatus, setModalStatus] = useState('Pending Assignment');
  const [modalRider, setModalRider] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all orders in CMS in real-time
  const fetchAllOrders = async () => {
    try {
      const q = query(collection(db, "orders"));
      const querySnapshot = await getDocs(q);
      let fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort descending by createdAt
      fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      setErrorMsg("Failed to load orders. Check your security permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    // Periodic sync
    const interval = setInterval(fetchAllOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const openEditModal = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    setSelectedOrderId(orderId);
    setModalStatus(order.status || 'Pending Assignment');
    setModalRider(order.riderName || '');
    setModalActive(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrderId) return;
    setSaving(true);

    try {
      const orderRef = doc(db, "orders", selectedOrderId);
      await updateDoc(orderRef, {
        status: modalStatus,
        riderName: modalRider.trim() || null
      });

      setModalActive(false);
      triggerToast('Order updated successfully!', 'success');
      fetchAllOrders(); // Reload table
    } catch (err) {
      console.error("Error updating order:", err);
      triggerToast('Failed to update order.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const [toast, setToast] = useState(null);
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Pending Assignment') return 'badge-pending';
    if (status === 'Assigned') return 'badge-assigned';
    if (status === 'In Progress') return 'badge-progress';
    if (status === 'Completed') return 'badge-completed';
    return 'badge-pending';
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
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          {toast.message}
        </div>
      )}

      <main className="admin-main">
        <div className="admin-header">
          <h1>All Errands CMS</h1>
          <p>Manage and dispatch user orders in real-time.</p>
        </div>

        {errorMsg && (
          <div style={{ color: 'var(--danger)', margin: '1rem 0', fontWeight: 'bold' }}>
            {errorMsg}
          </div>
        )}

        <div className="admin-card">
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
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.id || 'N/A'}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.clientName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.clientEmail}</div>
                    </td>
                    <td>{order.category}</td>
                    <td>
                      <span className={`badge ${order.urgency === 'Express' ? 'badge-urgent' : 'badge-progress'}`}>
                        {order.urgency}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => openEditModal(order.id)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Edit modal popup overlay */}
      <div className={`modal ${modalActive ? 'active' : ''}`} id="status-modal" onClick={() => setModalActive(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="close-modal" onClick={() => setModalActive(false)}>&times;</span>
          <h2>Update Order Status</h2>
          <p id="modal-order-id" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Editing Order: {selectedOrderId}
          </p>
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              id="modal-status-select" 
              className="form-select"
              value={modalStatus}
              onChange={(e) => setModalStatus(e.target.value)}
            >
              <option value="Pending Assignment">Pending Assignment</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Assign Rider (Optional)</label>
            <input 
              type="text" 
              id="modal-rider-input" 
              className="form-input" 
              placeholder="e.g. Kwame Mensah"
              value={modalRider}
              onChange={(e) => setModalRider(e.target.value)}
            />
          </div>
          
          <button 
            id="modal-save-btn" 
            className="btn btn-primary" 
            disabled={saving}
            onClick={handleSaveChanges}
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
