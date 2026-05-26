import"./main-BrMz4rjw.js";var e=1,t=4,n=[],r=[];document.addEventListener(`DOMContentLoaded`,()=>{i(),a(),s(),c(),f(),v(),d(),o(),m(),setInterval(m,4e3)});function i(){let e=document.getElementById(`menu-new-errand`),t=document.getElementById(`menu-my-errands`),n=document.getElementById(`booking-flow-section`),r=document.getElementById(`my-errands-section`),i=document.getElementById(`db-title-text`),a=document.getElementById(`db-subtitle-text`);e&&t&&(e.addEventListener(`click`,()=>{e.classList.add(`active`),t.classList.remove(`active`),n.style.display=`grid`,r.style.display=`none`,i&&(i.innerText=`Book a New Errand`),a&&(a.innerText=`Fill out our custom logistics form to get dispatched in real time.`)}),t.addEventListener(`click`,()=>{t.classList.add(`active`),e.classList.remove(`active`),n.style.display=`none`,r.style.display=`block`,i&&(i.innerText=`Active Errands & Tracking`),a&&(a.innerText=`Track the live delivery progress and courier state in real time.`),m()}))}function a(){let e=document.getElementById(`category-custom-select`),t=document.getElementById(`category-trigger`),n=document.getElementById(`category-dropdown`),r=document.getElementById(`field-category`),i=document.getElementById(`category-label`),a=document.getElementById(`category-desc`),o=document.getElementById(`category-icon`);if(!e||!t||!n)return;let s=n.querySelectorAll(`.custom-select-option`);t.addEventListener(`click`,n=>{n.stopPropagation();let r=e.classList.contains(`open`);e.classList.toggle(`open`,!r),t.setAttribute(`aria-expanded`,String(!r))}),t.addEventListener(`keydown`,n=>{(n.key===`Enter`||n.key===` `)&&(n.preventDefault(),t.click()),n.key===`Escape`&&(e.classList.remove(`open`),t.setAttribute(`aria-expanded`,`false`))}),s.forEach(n=>{n.addEventListener(`click`,c=>{c.stopPropagation();let l=n.getAttribute(`data-value`),u=n.getAttribute(`data-desc`)||``,f=n.querySelector(`.option-icon`)?.innerHTML||``;i&&(i.textContent=l),a&&(a.textContent=u),o&&(o.innerHTML=f),r&&(r.value=l),s.forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`),e.classList.remove(`open`),t.setAttribute(`aria-expanded`,`false`),d()})}),document.addEventListener(`click`,()=>{e.classList.remove(`open`),t.setAttribute(`aria-expanded`,`false`)})}function o(){let e=new URLSearchParams(window.location.search).get(`service`);if(e){let t=document.getElementById(`field-category`);t&&Array.from(t.options).find(t=>t.value===e)&&(t.value=e,d(),showToast(`Auto-selected: ${e}`,`info`))}}function s(){let e=document.getElementById(`field-category`);e&&e.addEventListener(`change`,()=>{d()});let t=document.getElementById(`field-urgency`);t&&t.addEventListener(`change`,()=>{d()})}function c(){let n=document.getElementById(`wizard-next-btn`),r=document.getElementById(`wizard-prev-btn`),i=document.getElementById(`wizard-submit-btn`),a=document.getElementById(`errand-wizard-form`);!n||!r||!i||!a||(n.addEventListener(`click`,()=>{u(e)?e<t&&l(e+1):showToast(`Please fill out all required fields before continuing.`,`warning`)}),r.addEventListener(`click`,()=>{e>1&&l(e-1)}),a.addEventListener(`submit`,e=>{e.preventDefault(),p()}))}function l(n){let r=document.querySelectorAll(`.wizard-panel`),i=document.querySelectorAll(`.step-node`),a=document.getElementById(`wizard-next-btn`),o=document.getElementById(`wizard-prev-btn`),s=document.getElementById(`wizard-submit-btn`);e=n,r.forEach(e=>{e.classList.remove(`active`),parseInt(e.getAttribute(`data-step`))===n&&e.classList.add(`active`)}),i.forEach(e=>{let t=parseInt(e.getAttribute(`data-step`));e.classList.remove(`active`,`completed`),t===n?e.classList.add(`active`):t<n&&e.classList.add(`completed`)}),n===1?(o.style.display=`none`,a.style.display=`block`,s.style.display=`none`):n===t?(o.style.display=`block`,a.style.display=`none`,s.style.display=`block`):(o.style.display=`block`,a.style.display=`block`,s.style.display=`none`)}function u(e){if(e===1)return!!document.getElementById(`field-category`).value;if(e===2){let e=document.getElementById(`field-pickup`).value.trim(),t=document.getElementById(`field-dropoff`).value.trim();return e.length>0&&t.length>0}return e===3?document.getElementById(`field-description`).value.trim().length>0:!0}function d(){let e=document.querySelector(`#category-dropdown .custom-select-option.active`),t=50;e&&(t=parseFloat(e.getAttribute(`data-base`))||50);let n=document.getElementById(`field-urgency`)?document.getElementById(`field-urgency`).value:`Standard`,r=0;n===`Urgent`&&(r=45),n===`Express`&&(r=100);let i=t+r,a=i*.05,o=i+a,s=document.getElementById(`summary-base-val`);s&&(s.innerText=`GHS ${t.toFixed(2)}`);let c=document.getElementById(`summary-urgency-label`);c&&(c.innerText=n);let l=document.getElementById(`summary-urgency-val`);l&&(l.innerText=`GHS ${r.toFixed(2)}`);let u=document.getElementById(`summary-tax-val`);u&&(u.innerText=`GHS ${a.toFixed(2)}`);let d=document.getElementById(`summary-total-val`);d&&(d.innerText=`GHS ${o.toFixed(2)}`)}function f(){let e=document.getElementById(`drop-zone`),t=document.getElementById(`file-upload`),n=document.getElementById(`file-list-preview`);if(!e||!t)return;e.addEventListener(`click`,()=>t.click()),[`dragenter`,`dragover`].forEach(t=>{e.addEventListener(t,t=>{t.preventDefault(),e.classList.add(`dragover`)},!1)}),[`dragleave`,`drop`].forEach(t=>{e.addEventListener(t,t=>{t.preventDefault(),e.classList.remove(`dragover`)},!1)}),e.addEventListener(`drop`,e=>{let t=e.dataTransfer.files;i(t)}),t.addEventListener(`change`,()=>{i(t.files)});function i(e){e.length!==0&&(Array.from(e).forEach(e=>{r.push(e);let t=document.createElement(`div`);t.style.cssText=`
        background: rgba(0, 82, 255, 0.08);
        border: 1px solid rgba(0, 82, 255, 0.2);
        color: var(--secondary);
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      `,t.innerHTML=`
        <span>${e.name} (${(e.size/1024/1024).toFixed(2)} MB)</span>
        <span class="remove-file" style="cursor:pointer; font-weight:700;">&times;</span>
      `,t.querySelector(`.remove-file`).addEventListener(`click`,()=>{r=r.filter(t=>t!==e),t.remove()}),n.appendChild(t)}),showToast(`Attached ${e.length} document(s) successfully!`,`success`))}}function p(){let e=document.getElementById(`field-category`).value,t=document.getElementById(`field-pickup`).value,n=document.getElementById(`field-dropoff`).value,i=document.getElementById(`field-description`).value,a=document.getElementById(`field-urgency`).value,o={category:e,description:i,pickupLocation:t,dropoffLocation:n,urgency:a,clientName:`Abena Osei`,clientEmail:`abena@example.com`,clientPhone:`+233 24 412 3456`};showToast(`Submitting your errand booking...`,`info`),fetch(`/api/orders`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(o)}).then(e=>{if(!e.ok)throw Error(`Booking submission failed.`);return e.json()}).then(o=>{let s=new FormData;return s.append(`_subject`,`New Errand Booked: ${o.id} [${a}]`),s.append(`Order ID`,o.id),s.append(`Category`,e),s.append(`Urgency Status`,a),s.append(`Pickup Address`,t),s.append(`Dropoff Address`,n),s.append(`Detailed Description`,i),s.append(`Client Name`,`Abena Osei`),s.append(`Client Email`,`abena@example.com`),s.append(`Client Phone`,`+233 24 412 3456`),s.append(`_captcha`,`false`),r.forEach((e,t)=>{s.append(`file_${t}`,e)}),fetch(`https://formsubmit.co/ajax/support@runmyerrand.com`,{method:`POST`,body:s}).then(e=>(e.ok||console.warn(`Local booking succeeded, but email notification had delivery issues.`),o))}).then(e=>{showToast(`Errand ${e.id} booked successfully and sent to email!`,`success`),y(`Rider allocation underway for your new order ${e.id}.`,`info`),document.getElementById(`errand-wizard-form`).reset();let t=document.getElementById(`file-list-preview`);t&&(t.innerHTML=``),r=[],l(1);let n=document.getElementById(`menu-my-errands`);if(n)n.click();else{let e=document.getElementById(`booking-flow-section`),t=document.getElementById(`my-errands-section`),n=document.getElementById(`db-title-text`),r=document.getElementById(`db-subtitle-text`);e&&(e.style.display=`none`),t&&(t.style.display=`block`,m()),n&&(n.innerText=`Active Errands & Tracking`),r&&(r.innerText=`Track the live delivery progress and courier state in real time.`)}}).catch(e=>{console.error(e),showToast(`Error processing your errand. Please try again.`,`danger`)})}function m(){let e=document.getElementById(`orders-list-container`);e&&fetch(`/api/orders`).then(e=>e.json()).then(t=>{if(t.length===0){e.innerHTML=`
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
          <h3>No Errands Booked Yet</h3>
          <p>Create your very first logistics errand request using the Book an Errand tab.</p>
        </div>
      `;return}n.length>0&&t.forEach(e=>{let t=n.find(t=>t.id===e.id);t&&t.status!==e.status&&(showToast(`Errand ${e.id} status updated to: ${e.status}!`,`warning`),y(`Errand ${e.id} is now [${e.status}]. Rider assigned: ${e.riderName||`Pending`}.`,`success`))}),n=t,e.innerHTML=t.map(e=>{let t=h(e.status);return`
        <div class="card order-card" id="card-${e.id}">
          <div class="order-card-header">
            <div style="display:flex; align-items:center; gap: 0.75rem;">
              <h3 style="font-size: 1.1rem; color: var(--secondary);">${e.id}</h3>
              <span class="badge ${_(e.urgency)}">${e.urgency}</span>
            </div>
            <span class="badge ${g(e.status)}">${e.status}</span>
          </div>

          <p style="font-size: 0.9rem; font-weight:600; margin-bottom: 0.5rem; color: var(--primary);">${e.category}</p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">${e.description}</p>
          
          <div class="order-meta-info" style="margin-bottom: 1.5rem;">
            <div class="order-meta-item">Pickup: <strong>${e.pickupLocation}</strong></div>
            <div class="order-meta-item">Dropoff: <strong>${e.dropoffLocation}</strong></div>
          </div>

          <!-- Tracker timeline & map grids -->
          <div class="order-tracker-panel">
            <div class="timeline-horizontal">
              <div class="timeline-h-step ${t>=0?`completed`:``} ${t===0?`active`:``}">
                <div class="timeline-h-dot"></div>
                <span class="timeline-h-label">Submitted</span>
              </div>
              <div class="timeline-h-step ${t>=1?`completed`:``} ${t===1?`active`:``}">
                <div class="timeline-h-dot"></div>
                <span class="timeline-h-label">Assigned</span>
              </div>
              <div class="timeline-h-step ${t>=2?`completed`:``} ${t===2?`active`:``}">
                <div class="timeline-h-dot"></div>
                <span class="timeline-h-label">In Transit</span>
              </div>
              <div class="timeline-h-step ${t>=3?`completed`:``} ${t===3?`active`:``}">
                <div class="timeline-h-dot"></div>
                <span class="timeline-h-label">Completed</span>
              </div>
            </div>

            <!-- Interactive map placeholder -->
            <div class="map-placeholder">
              <div class="map-grid-overlay"></div>
              <div class="map-route-line"></div>
              <div class="map-pin"></div> <!-- pickup pin -->
              ${e.status===`In Progress`?`<div class="map-pin rider"></div>`:``}
              <div class="map-pin dropoff"></div> <!-- dropoff pin -->
              
              <div class="map-label">
                ${e.riderName?`Courier: ${e.riderName}`:`Assigning Courier...`}
              </div>
            </div>
          </div>
        </div>
      `}).join(``)}).catch(e=>console.error(`Error fetching active bookings:`,e))}function h(e){return e===`Pending Assignment`?0:e===`Assigned`?1:e===`In Progress`?2:e===`Completed`?3:0}function g(e){return e===`Pending Assignment`?`badge-pending`:e===`Assigned`?`badge-assigned`:e===`In Progress`?`badge-progress`:e===`Completed`?`badge-completed`:`badge-pending`}function _(e){return e===`Standard`?`badge-progress`:e===`Urgent`?`badge-warning`:e===`Express`?`badge-urgent`:`badge-progress`}function v(){let e=document.getElementById(`bell-container`),t=document.getElementById(`noti-dropdown`),n=document.getElementById(`noti-clear`);e&&t&&(e.addEventListener(`click`,e=>{e.stopPropagation(),t.classList.toggle(`active`)}),document.addEventListener(`click`,()=>t.classList.remove(`active`))),n&&n.addEventListener(`click`,e=>{e.stopPropagation();let t=document.getElementById(`noti-list`),n=document.getElementById(`noti-badge`);t&&(t.innerHTML=`
          <div style="text-align:center; padding: 2rem 0; color: var(--text-light); font-size:0.75rem;">
            No unread alerts
          </div>
        `),n&&(n.style.display=`none`),showToast(`Notifications cleared!`,`success`)})}function y(e,t=`info`){let n=document.getElementById(`noti-list`),r=document.getElementById(`noti-badge`);if(!n)return;r&&(r.style.display=`block`),n.innerText.includes(`No unread alerts`)&&(n.innerHTML=``);let i=document.createElement(`div`);i.className=`db-noti-item`,i.innerHTML=`
    <div class="db-noti-item-dot" style="${t===`success`?`background: var(--success);`:``}"></div>
    <div class="db-noti-item-content">
      <span class="db-noti-item-title">${e}</span>
      <span class="db-noti-item-time">Just now</span>
    </div>
  `,n.insertBefore(i,n.firstChild)}