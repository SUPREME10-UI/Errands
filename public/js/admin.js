import { auth, db, onAuthStateChanged, signOut, collection, getDocs, doc, updateDoc, query, orderBy } from "./firebaseConfig.js";

let currentOrders = [];
let selectedOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Very basic admin check based on email or custom claim (for demo we just let them in if logged in, but ideally protect via rules)
      fetchAdminOrders();
    } else {
      window.location.href = "/login.html";
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
      window.location.href = "/login.html";
    });
  });

  // Modal logic
  const modal = document.getElementById('status-modal');
  const closeModal = document.querySelector('.close-modal');
  const saveBtn = document.getElementById('modal-save-btn');

  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  saveBtn.addEventListener('click', async () => {
    if (!selectedOrderId) return;
    
    const newStatus = document.getElementById('modal-status-select').value;
    const newRider = document.getElementById('modal-rider-input').value;
    
    try {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
      
      const orderRef = doc(db, "orders", selectedOrderId);
      await updateDoc(orderRef, {
        status: newStatus,
        riderName: newRider || null
      });
      
      modal.classList.remove('active');
      fetchAdminOrders(); // Refresh table
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  });
});

async function fetchAdminOrders() {
  const tbody = document.getElementById('admin-orders-list');
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    currentOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (currentOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No orders found.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = currentOrders.map(order => `
      <tr>
        <td><strong>${order.id || 'N/A'}</strong></td>
        <td>
          <div style="font-weight: 600;">${order.clientName}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${order.clientEmail}</div>
        </td>
        <td>${order.category}</td>
        <td><span class="badge ${order.urgency === 'Express' ? 'badge-urgent' : 'badge-progress'}">${order.urgency}</span></td>
        <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
        <td>${new Date(order.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openEditModal('${order.id}')">Update</button>
        </td>
      </tr>
    `).join('');
    
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Failed to load orders. You may not have admin permissions.</td></tr>`;
  }
}

window.openEditModal = function(orderId) {
  selectedOrderId = orderId;
  const order = currentOrders.find(o => o.id === orderId);
  if (!order) return;
  
  document.getElementById('modal-order-id').innerText = `Editing Order: ${orderId}`;
  document.getElementById('modal-status-select').value = order.status;
  document.getElementById('modal-rider-input').value = order.riderName || "";
  
  document.getElementById('status-modal').classList.add('active');
};

function getStatusBadgeClass(status) {
  if (status === 'Pending Assignment') return 'badge-pending';
  if (status === 'Assigned') return 'badge-assigned';
  if (status === 'In Progress') return 'badge-progress';
  if (status === 'Completed') return 'badge-completed';
  return 'badge-pending';
}
