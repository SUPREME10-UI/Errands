import React, { useEffect, useState } from 'react';

export default function Splash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Elegant fade out animation after 1.5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div id="splash-screen" className="fade-out-splash">
      <div class="splash-content">
        <div class="splash-logo-container">
          <img src="/logo.jpg" alt="RME Logo" class="splash-logo" />
          <div class="splash-pulse"></div>
        </div>
        <h2 class="splash-title">RUN MY ERRAND</h2>
        <p class="splash-subtitle">Errands Done Right</p>
        <div class="splash-loader-bar">
          <div class="splash-loader-progress"></div>
        </div>
        <p class="splash-loading-text">Initializing Concierge Services...</p>
      </div>
    </div>
  );
}
