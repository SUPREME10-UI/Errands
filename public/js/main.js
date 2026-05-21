// Global Common Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Nav Toggle
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    // Create overlay element dynamically
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);

    const closeMenu = () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = ''; // Restore scroll
    };

    hamburger.addEventListener('click', () => {
      const isActive = mobileNav.classList.contains('active');
      if (isActive) {
        closeMenu();
      } else {
        hamburger.classList.add('active');
        mobileNav.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
      }
    });

    // Close mobile nav when clicking a link or button inside it
    mobileNav.querySelectorAll('.nav-link, .btn').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close mobile nav when clicking on the background overlay
    overlay.addEventListener('click', () => {
      closeMenu();
    });
  }

  // 3. Highlight current page in navbar
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath === href || (href === '/' && currentPath === '') || currentPath.endsWith(href)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. Setup Theme Toggle globally
  setupGlobalTheme();
});

// Toast System
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Premium Icons for Toasts
  let icon = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  if (type === 'success') {
    icon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else if (type === 'warning') {
    icon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `;
  } else if (type === 'danger') {
    icon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.add('toast-closing');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

// Theme handling
function setupGlobalTheme() {
  const storedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', storedTheme);
  
  // Theme toggle buttons
  const toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      showToast(`Switched to ${newTheme} mode!`, 'success');
      
      // Update toggle button displays if any
      updateThemeToggleIcons(newTheme);
    });
  });
  
  updateThemeToggleIcons(storedTheme);
}

function updateThemeToggleIcons(theme) {
  const toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(btn => {
    if (theme === 'dark') {
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    } else {
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    }
  });
}

// Global Splash Screen Loading Dismissal Handler
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    // Dismiss once all page images/stylesheets are fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        splash.classList.add('fade-out');
        // Destroy element completely after transition finished
        setTimeout(() => {
          splash.remove();
        }, 600);
      }, 1500); // Premium 1.5 seconds loading screen hold
    });

    // Safety fallback: dismiss after 4 seconds regardless of load event
    setTimeout(() => {
      const activeSplash = document.getElementById('splash-screen');
      if (activeSplash) {
        activeSplash.classList.add('fade-out');
        setTimeout(() => activeSplash.remove(), 600);
      }
    }, 4000);
  }
});
