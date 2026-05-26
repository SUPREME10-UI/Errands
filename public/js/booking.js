// Client Dashboard Booking Flow JS

let currentStep = 1;
const totalSteps = 4;
let ordersHistory = [];
let selectedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
  setupSidebarNavigation();
  setupCustomCategoryDropdown();
  setupCategoryPicker();
  setupWizardStepper();
  setupDragAndDrop();
  setupNotificationCenter();
  
  // Initial cost calculation
  calculateCosts();
  
  // Read any pre-selected service from URL query params
  checkPreselectedService();

  // Load user orders
  fetchUserOrders();
  
  // Set up periodic tracking update (state synchronization!)
  setInterval(fetchUserOrders, 4000);
});

// 1. Navigation tab toggling
function setupSidebarNavigation() {
  const menuNewErrand = document.getElementById('menu-new-errand');
  const menuMyErrands = document.getElementById('menu-my-errands');
  const bookingFlowSection = document.getElementById('booking-flow-section');
  const myErrandsSection = document.getElementById('my-errands-section');
  
  const titleText = document.getElementById('db-title-text');
  const subtitleText = document.getElementById('db-subtitle-text');

  if (menuNewErrand && menuMyErrands) {
    menuNewErrand.addEventListener('click', () => {
      menuNewErrand.classList.add('active');
      menuMyErrands.classList.remove('active');
      bookingFlowSection.style.display = 'grid';
      myErrandsSection.style.display = 'none';
      if (titleText) titleText.innerText = 'Book a New Errand';
      if (subtitleText) subtitleText.innerText = 'Fill out our custom logistics form to get dispatched in real time.';
    });

    menuMyErrands.addEventListener('click', () => {
      menuMyErrands.classList.add('active');
      menuNewErrand.classList.remove('active');
      bookingFlowSection.style.display = 'none';
      myErrandsSection.style.display = 'block';
      if (titleText) titleText.innerText = 'Active Errands & Tracking';
      if (subtitleText) subtitleText.innerText = 'Track the live delivery progress and courier state in real time.';
      fetchUserOrders(); // Reload orders immediately
    });
  }
}

// 1b. Custom Category Dropdown
function setupCustomCategoryDropdown() {
  const wrapper = document.getElementById('category-custom-select');
  const trigger = document.getElementById('category-trigger');
  const dropdown = document.getElementById('category-dropdown');
  const hiddenInput = document.getElementById('field-category');
  const labelEl = document.getElementById('category-label');
  const descEl = document.getElementById('category-desc');
  const iconEl = document.getElementById('category-icon');

  if (!wrapper || !trigger || !dropdown) return;

  const options = dropdown.querySelectorAll('.custom-select-option');

  // Toggle open/close on trigger click
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrapper.classList.contains('open');
    wrapper.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', String(!isOpen));
  });

  // Keyboard support
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger.click();
    }
    if (e.key === 'Escape') {
      wrapper.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Select option on click
  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();

      const value = option.getAttribute('data-value');
      const desc  = option.getAttribute('data-desc') || '';
      const optIconSVG = option.querySelector('.option-icon')?.innerHTML || '';

      // Update trigger display
      if (labelEl) labelEl.textContent = value;
      if (descEl)  descEl.textContent  = desc;
      if (iconEl)  iconEl.innerHTML    = optIconSVG;

      // Update hidden input
      if (hiddenInput) hiddenInput.value = value;

      // Toggle active state
      options.forEach(o => o.classList.remove('active'));
      option.classList.add('active');

      // Close dropdown
      wrapper.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');

      // Recalculate costs
      calculateCosts();
    });
  });

  // Close when clicking outside
  document.addEventListener('click', () => {
    wrapper.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  });
}

// 2. Preselected service from URL query params
function checkPreselectedService() {
  const params = new URLSearchParams(window.location.search);
  const serviceParam = params.get('service');
  if (serviceParam) {
    const categoryField = document.getElementById('field-category');
    if (categoryField) {
      const option = Array.from(categoryField.options).find(opt => opt.value === serviceParam);
      if (option) {
        categoryField.value = serviceParam;
        calculateCosts();
        showToast(`Auto-selected: ${serviceParam}`, 'info');
      }
    }
  }
}

// 3. Category selector picker cards / dropdown
function setupCategoryPicker() {
  const categoryField = document.getElementById('field-category');
  if (categoryField) {
    categoryField.addEventListener('change', () => {
      calculateCosts();
    });
  }

  // Listener to urgency dropdown
  const urgencyField = document.getElementById('field-urgency');
  if (urgencyField) {
    urgencyField.addEventListener('change', () => {
      calculateCosts();
    });
  }
}

// 4. Wizard stepper flow control
function setupWizardStepper() {
  const nextBtn = document.getElementById('wizard-next-btn');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const submitBtn = document.getElementById('wizard-submit-btn');
  const form = document.getElementById('errand-wizard-form');

  if (!nextBtn || !prevBtn || !submitBtn || !form) return;

  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        goToStep(currentStep + 1);
      }
    } else {
      showToast('Please fill out all required fields before continuing.', 'warning');
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitErrandBooking();
  });
}

function goToStep(step) {
  const panels = document.querySelectorAll('.wizard-panel');
  const stepNodes = document.querySelectorAll('.step-node');
  const nextBtn = document.getElementById('wizard-next-btn');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const submitBtn = document.getElementById('wizard-submit-btn');

  currentStep = step;

  // Toggle active panels
  panels.forEach(p => {
    p.classList.remove('active');
    if (parseInt(p.getAttribute('data-step')) === step) {
      p.classList.add('active');
    }
  });

  // Toggle stepper classes
  stepNodes.forEach(node => {
    const nodeStep = parseInt(node.getAttribute('data-step'));
    node.classList.remove('active', 'completed');
    if (nodeStep === step) {
      node.classList.add('active');
    } else if (nodeStep < step) {
      node.classList.add('completed');
    }
  });

  // Toggle bottom buttons
  if (step === 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';
  } else if (step === totalSteps) {
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'block';
  } else {
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
    submitBtn.style.display = 'none';
  }
}

function validateStep(step) {
  if (step === 1) {
    return !!document.getElementById('field-category').value;
  }
  if (step === 2) {
    const pickup = document.getElementById('field-pickup').value.trim();
    const dropoff = document.getElementById('field-dropoff').value.trim();
    return pickup.length > 0 && dropoff.length > 0;
  }
  if (step === 3) {
    const desc = document.getElementById('field-description').value.trim();
    return desc.length > 0;
  }
  return true; // Step 4 files are optional
}

// Cost Calculator Logic
function calculateCosts() {
  // Read base rate from the active custom-select option's data-base attribute
  const activeOption = document.querySelector('#category-dropdown .custom-select-option.active');
  let baseRate = 50;
  if (activeOption) {
    baseRate = parseFloat(activeOption.getAttribute('data-base')) || 50;
  }

  const urgencyVal = document.getElementById('field-urgency') ? document.getElementById('field-urgency').value : 'Standard';
  let urgencySurcharge = 0;
  
  if (urgencyVal === 'Urgent') urgencySurcharge = 45;
  if (urgencyVal === 'Express') urgencySurcharge = 100;

  const subtotal = baseRate + urgencySurcharge;
  const tax = subtotal * 0.05; // 5% VAT
  const total = subtotal + tax;

  // Render values safely if elements exist in DOM
  const baseValEl = document.getElementById('summary-base-val');
  if (baseValEl) baseValEl.innerText = `GHS ${baseRate.toFixed(2)}`;

  const urgencyLabelEl = document.getElementById('summary-urgency-label');
  if (urgencyLabelEl) urgencyLabelEl.innerText = urgencyVal;

  const urgencyValEl = document.getElementById('summary-urgency-val');
  if (urgencyValEl) urgencyValEl.innerText = `GHS ${urgencySurcharge.toFixed(2)}`;

  const taxValEl = document.getElementById('summary-tax-val');
  if (taxValEl) taxValEl.innerText = `GHS ${tax.toFixed(2)}`;

  const totalValEl = document.getElementById('summary-total-val');
  if (totalValEl) totalValEl.innerText = `GHS ${total.toFixed(2)}`;
}

// 5. Drag and Drop support
function setupDragAndDrop() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-upload');
  const listPreview = document.getElementById('file-list-preview');

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  });

  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
  });

  function handleFiles(files) {
    if (files.length === 0) return;
    
    Array.from(files).forEach(file => {
      selectedFiles.push(file);
      
      const chip = document.createElement('div');
      chip.style.cssText = `
        background: rgba(0, 82, 255, 0.08);
        border: 1px solid rgba(0, 82, 255, 0.2);
        color: var(--secondary);
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      `;
      chip.innerHTML = `
        <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
        <span class="remove-file" style="cursor:pointer; font-weight:700;">&times;</span>
      `;
      
      chip.querySelector('.remove-file').addEventListener('click', () => {
        selectedFiles = selectedFiles.filter(f => f !== file);
        chip.remove();
      });
      listPreview.appendChild(chip);
    });
    
    showToast(`Attached ${files.length} document(s) successfully!`, 'success');
  }
}

// 6. Submitting dynamic Errand Booking
function submitErrandBooking() {
  const category = document.getElementById('field-category').value;
  const pickupLocation = document.getElementById('field-pickup').value;
  const dropoffLocation = document.getElementById('field-dropoff').value;
  const description = document.getElementById('field-description').value;
  const urgency = document.getElementById('field-urgency').value;

  const data = {
    category,
    description,
    pickupLocation,
    dropoffLocation,
    urgency,
    clientName: "Abena Osei",
    clientEmail: "abena@example.com",
    clientPhone: "+233 24 412 3456"
  };

  showToast("Submitting your errand booking...", "info");

  // Submit via local API first for real-time tracking dashboard
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) throw new Error("Booking submission failed.");
    return res.json();
  })
  .then(newOrder => {
    // FormSubmit integration to send to support@runmyerrand.com
    const formData = new FormData();
    formData.append('_subject', `New Errand Booked: ${newOrder.id} [${urgency}]`);
    formData.append('Order ID', newOrder.id);
    formData.append('Category', category);
    formData.append('Urgency Status', urgency);
    formData.append('Pickup Address', pickupLocation);
    formData.append('Dropoff Address', dropoffLocation);
    formData.append('Detailed Description', description);
    formData.append('Client Name', "Abena Osei");
    formData.append('Client Email', "abena@example.com");
    formData.append('Client Phone', "+233 24 412 3456");
    formData.append('_captcha', 'false');

    // Attach all files registered during setupDragAndDrop
    selectedFiles.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    return fetch('https://formsubmit.co/ajax/support@runmyerrand.com', {
      method: 'POST',
      body: formData
    })
    .then(emailRes => {
      if (!emailRes.ok) {
        console.warn("Local booking succeeded, but email notification had delivery issues.");
      }
      return newOrder;
    });
  })
  .then(newOrder => {
    showToast(`Errand ${newOrder.id} booked successfully and sent to email!`, 'success');
    
    // Add systems alert
    addSystemAlert(`Rider allocation underway for your new order ${newOrder.id}.`, 'info');
    
    // Reset wizard form & file arrays
    document.getElementById('errand-wizard-form').reset();
    const listPreview = document.getElementById('file-list-preview');
    if (listPreview) listPreview.innerHTML = '';
    selectedFiles = [];
    
    goToStep(1);
    
    // Transition to Active Errands tab if it exists, otherwise toggle DOM sections directly
    const menuMyErrands = document.getElementById('menu-my-errands');
    if (menuMyErrands) {
      menuMyErrands.click();
    } else {
      const bookingFlowSection = document.getElementById('booking-flow-section');
      const myErrandsSection = document.getElementById('my-errands-section');
      const titleText = document.getElementById('db-title-text');
      const subtitleText = document.getElementById('db-subtitle-text');

      if (bookingFlowSection) bookingFlowSection.style.display = 'none';
      if (myErrandsSection) {
        myErrandsSection.style.display = 'block';
        fetchUserOrders();
      }
      if (titleText) titleText.innerText = 'Active Errands & Tracking';
      if (subtitleText) subtitleText.innerText = 'Track the live delivery progress and courier state in real time.';
    }
  })
  .catch(err => {
    console.error(err);
    showToast("Error processing your errand. Please try again.", "danger");
  });
}

// 7. Load and render Active user orders
function fetchUserOrders() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  fetch('/api/orders')
  .then(res => res.json())
  .then(orders => {
    // If no orders
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
          <h3>No Errands Booked Yet</h3>
          <p>Create your very first logistics errand request using the Book an Errand tab.</p>
        </div>
      `;
      return;
    }

    // Check status difference for notifications (state sync!)
    if (ordersHistory.length > 0) {
      orders.forEach(order => {
        const matchingOld = ordersHistory.find(o => o.id === order.id);
        if (matchingOld && matchingOld.status !== order.status) {
          showToast(`Errand ${order.id} status updated to: ${order.status}!`, 'warning');
          addSystemAlert(`Errand ${order.id} is now [${order.status}]. Rider assigned: ${order.riderName || 'Pending'}.`, 'success');
        }
      });
    }
    
    // Store current state
    ordersHistory = orders;

    // Render cards
    container.innerHTML = orders.map(order => {
      // Map status values to horizontal step classes
      const stepIndex = getStatusStepIndex(order.status);
      
      return `
        <div class="card order-card" id="card-${order.id}">
          <div class="order-card-header">
            <div style="display:flex; align-items:center; gap: 0.75rem;">
              <h3 style="font-size: 1.1rem; color: var(--secondary);">${order.id}</h3>
              <span class="badge ${getUrgencyBadgeClass(order.urgency)}">${order.urgency}</span>
            </div>
            <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
          </div>

          <p style="font-size: 0.9rem; font-weight:600; margin-bottom: 0.5rem; color: var(--primary);">${order.category}</p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">${order.description}</p>
          
          <div class="order-meta-info" style="margin-bottom: 1.5rem;">
            <div class="order-meta-item">Pickup: <strong>${order.pickupLocation}</strong></div>
            <div class="order-meta-item">Dropoff: <strong>${order.dropoffLocation}</strong></div>
          </div>

          <!-- Tracker timeline & map grids -->
          <div class="order-tracker-panel">
            <div class="timeline-horizontal">
              <div class="timeline-h-step ${stepIndex >= 0 ? 'completed' : ''} ${stepIndex === 0 ? 'active' : ''}">
                <div class="timeline-h-dot"></div>
                <span class="timeline-h-label">Submitted</span>
              </div>
              <div class="timeline-h-step ${stepIndex >= 1 ? 'completed' : ''} ${stepIndex === 1 ? 'active' : ''}">
                <div class="timeline-h-dot"></div>
                <span class="timeline-h-label">Assigned</span>
              </div>
              <div class="timeline-h-step ${stepIndex >= 2 ? 'completed' : ''} ${stepIndex === 2 ? 'active' : ''}">
                <div class="timeline-h-dot"></div>
                <span class="timeline-h-label">In Transit</span>
              </div>
              <div class="timeline-h-step ${stepIndex >= 3 ? 'completed' : ''} ${stepIndex === 3 ? 'active' : ''}">
                <div class="timeline-h-dot"></div>
                <span class="timeline-h-label">Completed</span>
              </div>
            </div>

            <!-- Interactive map placeholder -->
            <div class="map-placeholder">
              <div class="map-grid-overlay"></div>
              <div class="map-route-line"></div>
              <div class="map-pin"></div> <!-- pickup pin -->
              ${order.status === 'In Progress' ? '<div class="map-pin rider"></div>' : ''}
              <div class="map-pin dropoff"></div> <!-- dropoff pin -->
              
              <div class="map-label">
                ${order.riderName ? `Courier: ${order.riderName}` : 'Assigning Courier...'}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  })
  .catch(err => console.error("Error fetching active bookings:", err));
}

function getStatusStepIndex(status) {
  if (status === 'Pending Assignment') return 0;
  if (status === 'Assigned') return 1;
  if (status === 'In Progress') return 2;
  if (status === 'Completed') return 3;
  return 0;
}

function getStatusBadgeClass(status) {
  if (status === 'Pending Assignment') return 'badge-pending';
  if (status === 'Assigned') return 'badge-assigned';
  if (status === 'In Progress') return 'badge-progress';
  if (status === 'Completed') return 'badge-completed';
  return 'badge-pending';
}

function getUrgencyBadgeClass(urgency) {
  if (urgency === 'Standard') return 'badge-progress';
  if (urgency === 'Urgent') return 'badge-warning';
  if (urgency === 'Express') return 'badge-urgent';
  return 'badge-progress';
}

// 8. Notification Bell Dropdown
function setupNotificationCenter() {
  const bell = document.getElementById('bell-container');
  const dropdown = document.getElementById('noti-dropdown');
  const clearBtn = document.getElementById('noti-clear');

  if (bell && dropdown) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => dropdown.classList.remove('active'));
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const notiList = document.getElementById('noti-list');
      const badge = document.getElementById('noti-badge');
      if (notiList) {
        notiList.innerHTML = `
          <div style="text-align:center; padding: 2rem 0; color: var(--text-light); font-size:0.75rem;">
            No unread alerts
          </div>
        `;
      }
      if (badge) badge.style.display = 'none';
      showToast('Notifications cleared!', 'success');
    });
  }
}

function addSystemAlert(text, type = 'info') {
  const list = document.getElementById('noti-list');
  const badge = document.getElementById('noti-badge');
  if (!list) return;

  if (badge) badge.style.display = 'block';

  // Remove empty states if present
  if (list.innerText.includes("No unread alerts")) {
    list.innerHTML = "";
  }

  const alertItem = document.createElement('div');
  alertItem.className = 'db-noti-item';
  alertItem.innerHTML = `
    <div class="db-noti-item-dot" style="${type === 'success' ? 'background: var(--success);' : ''}"></div>
    <div class="db-noti-item-content">
      <span class="db-noti-item-title">${text}</span>
      <span class="db-noti-item-time">Just now</span>
    </div>
  `;
  list.insertBefore(alertItem, list.firstChild);
}
