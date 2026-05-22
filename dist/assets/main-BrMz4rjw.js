(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),document.addEventListener(`DOMContentLoaded`,()=>{let e=document.querySelector(`.header`);e&&window.addEventListener(`scroll`,()=>{window.scrollY>50?e.classList.add(`scrolled`):e.classList.remove(`scrolled`)});let n=document.querySelector(`.hamburger`),r=document.querySelector(`.mobile-nav`);if(n&&r){let e=document.createElement(`div`);e.className=`mobile-nav-overlay`,document.body.appendChild(e);let t=()=>{n.classList.remove(`active`),r.classList.remove(`active`),e.classList.remove(`active`),document.body.style.overflow=``};n.addEventListener(`click`,()=>{r.classList.contains(`active`)?t():(n.classList.add(`active`),r.classList.add(`active`),e.classList.add(`active`),document.body.style.overflow=`hidden`)}),r.querySelectorAll(`.nav-link, .btn`).forEach(e=>{e.addEventListener(`click`,()=>{t()})}),e.addEventListener(`click`,()=>{t()})}let i=window.location.pathname;document.querySelectorAll(`.nav-link`).forEach(e=>{let t=e.getAttribute(`href`);i===t||t===`/`&&i===``||i.endsWith(t)?e.classList.add(`active`):e.classList.remove(`active`)}),t()});function e(e,t=`info`){let n=document.getElementById(`toast-container`);n||(n=document.createElement(`div`),n.id=`toast-container`,document.body.appendChild(n));let r=document.createElement(`div`);r.className=`toast ${t}`;let i=`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;t===`success`?i=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `:t===`warning`?i=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `:t===`danger`&&(i=`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `),r.innerHTML=`
    ${i}
    <span>${e}</span>
  `,n.appendChild(r),setTimeout(()=>{r.classList.add(`toast-closing`),r.addEventListener(`animationend`,()=>{r.remove()})},4e3)}function t(){let t=localStorage.getItem(`theme`)||`light`;document.documentElement.setAttribute(`data-theme`,t),document.querySelectorAll(`.theme-toggle`).forEach(t=>{t.addEventListener(`click`,()=>{let t=document.documentElement.getAttribute(`data-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-theme`,t),localStorage.setItem(`theme`,t),e(`Switched to ${t} mode!`,`success`),n(t)})}),n(t)}function n(e){document.querySelectorAll(`.theme-toggle`).forEach(t=>{e===`dark`?t.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `:t.innerHTML=`
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `})}document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`splash-screen`);e&&(window.addEventListener(`load`,()=>{setTimeout(()=>{e.classList.add(`fade-out`),setTimeout(()=>{e.remove()},600)},1500)}),setTimeout(()=>{let e=document.getElementById(`splash-screen`);e&&(e.classList.add(`fade-out`),setTimeout(()=>e.remove(),600))},4e3))});