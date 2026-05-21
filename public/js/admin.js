// Admin Operations Dashboard JS

let selectedOrderId = null;
let selectedRiderName = null;
let allOrders = [];
let allRiders = [
  { name: "Kwame Mensah", phone: "+233 591 355 179", status: "Active" },
  { name: "Ama Serwaa", phone: "+233 504 979 620", status: "Active" },
  { name: "Kofi Asante", phone: "+233 591 355 179", status: "Active" },
  { name: "Yaw Boateng", phone: "+233 504 979 620", status: "Active" }
];

document.addEventListener('DOMContentLoaded', () => {
  setupSidebarNavigation();
  setupRiderDrawer();
  setupSearchFilter();
  
  // Initial data pull
  fetchAdminData();
  
  // Dynamic state sync: pull operational state every 4 seconds!
  setInterval(fetchAdminData, 4000);
});

// 1. Sidebar Navigation Toggles
function setupSidebarNavigation() {
  const menuOrders = document.getElementById('menu-orders');
  const menuAnalytics = document.getElementById('menu-analytics');
  
  const analyticsSection = document.getElementById('analytics-section');
  const tableSection = document.getElementById('orders-table-section');

  if (menuOrders && menuAnalytics) {
    menuOrders.addEventListener('click', () => {
      menuOrders.classList.add('active');
      menuAnalytics.classList.remove('active');
      
      tableSection.style.display = 'block';
      analyticsSection.style.display = 'none';
      closeMobileSidebar();
    });

    menuAnalytics.addEventListener('click', () => {
      menuAnalytics.classList.add('active');
      menuOrders.classList.remove('active');
      
      analyticsSection.style.display = 'grid';
      tableSection.style.display = 'none';
      closeMobileSidebar();
      renderRidersStatus(); // Refresh rider visual lists
    });
  }

  // Mobile sidebar drawer
  const toggleBtn = document.getElementById('admin-sidebar-toggle-btn');
  const sidebar = document.querySelector('.db-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.style.display = 'flex'; // Make visible
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });
    
    document.addEventListener('click', () => sidebar.classList.remove('active'));
  }
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.db-sidebar');
  if (sidebar) {
    sidebar.classList.remove('active');
  }
}

// 2. Load and refresh Admin metrics, charts, and table lists
function fetchAdminData() {
  // Fetch stats details
  fetch('/api/stats')
  .then(res => res.json())
  .then(stats => {
    updateKPIWidgets(stats);
  })
  .catch(err => console.error("Error fetching stats:", err));

  // Fetch orders lists
  fetch('/api/orders')
  .then(res => res.json())
  .then(orders => {
    // Check if new orders arrived to trigger toast alerts
    if (allOrders.length > 0 && orders.length > allOrders.length) {
      const diff = orders.length - allOrders.length;
      showToast(`${diff} new Errand request(s) received!`, 'info');
      addAdminSystemAlert(`${diff} new errand submitted by client.`, 'warning');
    }
    
    allOrders = orders;
    renderErrandsTable(orders);
    updateAnalyticsCharts(orders);
  })
  .catch(err => console.error("Error loading admin ledger:", err));
}

// Update the top KPI widgets
function updateKPIWidgets(stats) {
  document.getElementById('kpi-total').innerText = stats.total;
  document.getElementById('kpi-pending').innerText = stats.pending;
  document.getElementById('kpi-completed').innerText = stats.completed;
  document.getElementById('kpi-revenue').innerText = `GHS ${stats.revenue.toFixed(0)}`;
}

// Render dynamic table rows
function renderErrandsTable(orders) {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  const searchQuery = document.getElementById('table-search').value.toLowerCase().trim();
  
  // Filter list based on search bar
  const filtered = orders.filter(order => {
    return (
      order.id.toLowerCase().includes(searchQuery) ||
      order.clientName.toLowerCase().includes(searchQuery) ||
      order.category.toLowerCase().includes(searchQuery) ||
      order.urgency.toLowerCase().includes(searchQuery) ||
      order.status.toLowerCase().includes(searchQuery)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem 0; color: var(--text-light); font-size: 0.95rem;">
          No operational errands match your filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const formattedDate = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
                          ' - ' + new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    // Status select elements
    const statusSelect = `
      <select class="table-select" onchange="updateOrderStatus('${order.id}', this.value)">
        <option value="Pending Assignment" ${order.status === 'Pending Assignment' ? 'selected' : ''}>Pending Assgn</option>
        <option value="Assigned" ${order.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
        <option value="In Progress" ${order.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
      </select>
    `;

    // Rider button actions
    let riderButton = "";
    if (order.riderName) {
      riderButton = `
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-weight:700; color:var(--primary); font-size:0.8rem;">${order.riderName}</span>
          <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; border-radius: var(--radius-sm);" onclick="openRiderDrawer('${order.id}')">
            Reassign
          </button>
        </div>
      `;
    } else {
      riderButton = `
        <button class="btn btn-primary" style="padding: 0.35rem 0.8rem; font-size: 0.75rem; border-radius: var(--radius-sm); background:var(--warning); border:none;" onclick="openRiderDrawer('${order.id}')">
          Assign Courier
        </button>
      `;
    }

    return `
      <tr id="row-${order.id}">
        <td style="font-weight: 700; color: var(--secondary);">${order.id}</td>
        <td>
          <div style="display:flex; flex-direction:column; line-height:1.3;">
            <span style="font-weight:700;">${order.clientName}</span>
            <span style="font-size:0.75rem; color:var(--text-light);">${order.clientPhone}</span>
          </div>
        </td>
        <td style="font-weight:600; color:var(--primary);">${order.category}</td>
        <td><span class="badge ${getUrgencyBadgeClass(order.urgency)}">${order.urgency}</span></td>
        <td>${statusSelect}</td>
        <td>${riderButton}</td>
        <td style="color: var(--text-muted); font-size: 0.8rem;">${formattedDate}</td>
      </tr>
    `;
  }).join('');
}

function getUrgencyBadgeClass(urgency) {
  if (urgency === 'Standard') return 'badge-progress';
  if (urgency === 'Urgent') return 'badge-warning';
  if (urgency === 'Express') return 'badge-urgent';
  return 'badge-progress';
}

// 3. Update Order Status instantly via dropdowns (API PUT call!)
window.updateOrderStatus = function(id, newStatus) {
  fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  })
  .then(res => {
    if (!res.ok) throw new Error("Status update failed");
    return res.json();
  })
  .then(updated => {
    showToast(`Order ${id} status updated to: ${newStatus}!`, 'success');
    addAdminSystemAlert(`Order ${id} is now [${newStatus}].`, 'success');
    fetchAdminData(); // Refresh UI metrics
  })
  .catch(err => {
    console.error(err);
    showToast("Error updating order status.", "danger");
  });
};

// 4. Drawer modal overlays for Rider Assignment
function setupRiderDrawer() {
  const closeBtn = document.getElementById('drawer-close-btn');
  const backdrop = document.getElementById('rider-drawer-backdrop');
  const confirmBtn = document.getElementById('confirm-assign-btn');

  if (closeBtn && backdrop) {
    [closeBtn, backdrop].forEach(el => {
      el.addEventListener('click', closeRiderDrawer);
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmRiderAssignment);
  }
}

window.openRiderDrawer = function(orderId) {
  selectedOrderId = orderId;
  selectedRiderName = null; // Clear selection
  
  const backdrop = document.getElementById('rider-drawer-backdrop');
  const panel = document.getElementById('rider-drawer-panel');
  const listContainer = document.getElementById('rider-options-list');
  const titleText = document.getElementById('drawer-title-text');

  if (!backdrop || !panel || !listContainer) return;

  titleText.innerText = `Assign Courier for ${orderId}`;

  // Find currently assigned rider if any
  const order = allOrders.find(o => o.id === orderId);
  const currentRider = order ? order.riderName : null;

  // Render rider selection options
  listContainer.innerHTML = allRiders.map(rider => {
    const isSelected = currentRider === rider.name;
    if (isSelected) selectedRiderName = rider.name; // Presave

    return `
      <div class="rider-card-option ${isSelected ? 'selected' : ''}" data-name="${rider.name}" onclick="selectRiderOption(this, '${rider.name}')">
        <div class="rider-avatar">
          ${rider.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div class="rider-info">
          <span>${rider.name}</span>
          <span>Phone: ${rider.phone} | Status: <strong>${rider.status}</strong></span>
        </div>
      </div>
    `;
  }).join('');

  // Open UI widgets
  backdrop.classList.add('active');
  panel.classList.add('active');
};

window.selectRiderOption = function(cardElement, name) {
  document.querySelectorAll('.rider-card-option').forEach(c => c.classList.remove('selected'));
  cardElement.classList.add('selected');
  selectedRiderName = name;
};

function closeRiderDrawer() {
  const backdrop = document.getElementById('rider-drawer-backdrop');
  const panel = document.getElementById('rider-drawer-panel');
  if (backdrop && panel) {
    backdrop.classList.remove('active');
    panel.classList.remove('active');
  }
}

function confirmRiderAssignment() {
  if (!selectedOrderId) return;
  if (!selectedRiderName) {
    showToast("Please pick a courier to assign.", "warning");
    return;
  }

  fetch(`/api/orders/${selectedOrderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ riderName: selectedRiderName })
  })
  .then(res => {
    if (!res.ok) throw new Error("Rider assignment failed");
    return res.json();
  })
  .then(updated => {
    showToast(`Courier ${selectedRiderName} assigned to Errand ${selectedOrderId}!`, 'success');
    addAdminSystemAlert(`Courier ${selectedRiderName} assigned to order ${selectedOrderId}.`, 'info');
    closeRiderDrawer();
    fetchAdminData(); // Refresh UI metrics
  })
  .catch(err => {
    console.error(err);
    showToast("Error assigning courier.", "danger");
  });
}

// 5. Update pure SVG/CSS Analytics charts
function updateAnalyticsCharts(orders) {
  const total = orders.length || 1; // avoid dividing by 0
  const standard = orders.filter(o => o.urgency === 'Standard').length;
  const urgent = orders.filter(o => o.urgency === 'Urgent').length;
  const express = orders.filter(o => o.urgency === 'Express').length;

  const barStandard = document.getElementById('bar-standard');
  const barUrgent = document.getElementById('bar-urgent');
  const barExpress = document.getElementById('bar-express');

  if (barStandard && barUrgent && barExpress) {
    // Standard percentage height
    const pctStd = Math.round((standard / total) * 100);
    const pctUrg = Math.round((urgent / total) * 100);
    const pctExp = Math.round((express / total) * 100);

    barStandard.style.height = `${Math.max(pctStd, 8)}%`;
    barUrgent.style.height = `${Math.max(pctUrg, 8)}%`;
    barExpress.style.height = `${Math.max(pctExp, 8)}%`;

    document.getElementById('bar-standard-val').innerText = standard;
    document.getElementById('bar-urgent-val').innerText = urgent;
    document.getElementById('bar-express-val').innerText = express;
  }
}

// Render Riders list inside Analytics view
function renderRidersStatus() {
  const list = document.getElementById('riders-list-activity');
  if (!list) return;

  list.innerHTML = allRiders.map(rider => {
    // Count active jobs assigned to this rider
    const activeJobs = allOrders.filter(o => o.riderName === rider.name && o.status !== 'Completed').length;
    
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1.5px solid var(--border-color); padding-bottom: 0.75rem;">
        <div style="display:flex; align-items:center; gap: 0.75rem;">
          <div class="rider-avatar" style="width:36px; height:36px; font-size:0.8rem; background: var(--bg-light); color:var(--primary); border: 1px solid var(--border-color);">
            ${rider.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style="display:flex; flex-direction:column; line-height:1.2;">
            <span style="font-weight:700; font-size:0.85rem;">${rider.name}</span>
            <span style="font-size:0.75rem; color:var(--text-light);">${rider.phone}</span>
          </div>
        </div>
        <div style="text-align:right;">
          <span class="badge ${activeJobs > 0 ? 'badge-assigned' : 'badge-completed'}" style="font-size:0.65rem;">
            ${activeJobs > 0 ? `${activeJobs} Active Job(s)` : 'Idle / Available'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// Search bar filters
function setupSearchFilter() {
  const input = document.getElementById('table-search');
  if (input) {
    input.addEventListener('input', () => {
      renderErrandsTable(allOrders);
    });
  }
}

// Alerts feed helper
function addAdminSystemAlert(text, type = 'info') {
  const list = document.getElementById('admin-noti-list');
  const badge = document.getElementById('admin-noti-badge');
  if (!list) return;

  if (badge) badge.style.display = 'block';

  if (list.innerText.includes("No new operational notifications")) {
    list.innerHTML = "";
  }

  const alertItem = document.createElement('div');
  alertItem.className = 'db-noti-item';
  alertItem.innerHTML = `
    <div class="db-noti-item-dot" style="${type === 'success' ? 'background: var(--success);' : 'background: var(--warning);'}"></div>
    <div class="db-noti-item-content">
      <span class="db-noti-item-title">${text}</span>
      <span class="db-noti-item-time">Just now</span>
    </div>
  `;
  list.insertBefore(alertItem, list.firstChild);
  
  // Click listener to toggle badge off
  const bell = document.getElementById('admin-bell-container');
  const dropdown = document.getElementById('admin-noti-dropdown');
  if (bell && dropdown) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      if (badge) badge.style.display = 'none'; // clear badge
    });
    document.addEventListener('click', () => dropdown.classList.remove('active'));
  }
}
