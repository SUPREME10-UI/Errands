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
      <div className="splash-content">
        <div className="splash-logo-container">
          <img src="/logo.jpg" alt="RME Logo" className="splash-logo" />
          <div className="splash-pulse"></div>
        </div>
        <h2 className="splash-title">RUN MY ERRAND</h2>
        <p className="splash-subtitle">Errands Done Right</p>
        <div className="splash-loader-bar">
          <div className="splash-loader-progress"></div>
        </div>
        <p className="splash-loading-text">Initializing Concierge Services...</p>
      </div>
    </div>
  );
}
