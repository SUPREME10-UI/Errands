import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../lib/dbHelper';

const iconMap = {
  Briefcase: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  Truck: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  ),
  Plane: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
    </svg>
  ),
  ShoppingCart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  Home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  FileText: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Camera: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  )
};

export default function Services() {
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const data = await getServices();
        setServicesList(data);
      } catch (err) {
        console.error("Error fetching dynamic services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServicesData();
  }, []);

  return (
    <>
      <section className="services-hero">
        <div className="container">
          <h1>Our Professional Services</h1>
          <p>Save hours of daily friction. Delegate corporate logistics, confidential documentation, home administration, and site inspect audits to our vetted concierge team.</p>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="splash-pulse" style={{ margin: '0 auto 1.5rem', width: '40px', height: '40px' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading our services...</p>
            </div>
          ) : (
            <div className="services-grid">
              {servicesList.map((service, index) => (
                <div key={service.id || index} className="card service-detail-card">
                  <div className="service-header-row">
                    <div className="service-icon-box">
                      {iconMap[service.iconName] || iconMap.Briefcase}
                    </div>
                    <span className="service-badge">{service.badge}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p className="service-desc">{service.desc}</p>
                  <div className="service-items-list">
                    {(service.bullets || []).map((bullet, bulletIdx) => (
                      <div key={bulletIdx} className="service-item-bullet">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        {bullet}
                      </div>
                    ))}
                  </div>
                  <div className="service-footer" style={{ justifyContent: 'flex-end' }}>
                    <Link 
                      to={`/dashboard?service=${encodeURIComponent(service.title)}`} 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem', width: '100%', textAlign: 'center' }}
                    >
                      Book Errand
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
