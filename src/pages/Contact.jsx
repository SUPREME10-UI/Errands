import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import "./contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({ type: 'danger', message: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Submitting your support ticket...' });

    try {
      // Save directly to Firestore contactMessages collection
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        createdAt: new Date().toISOString()
      });

      setStatus({ type: 'success', message: "Support ticket submitted! We'll reply within 60 mins." });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error("Error submitting contact message:", error);
      setStatus({ type: 'danger', message: 'Error submitting contact ticket. Please retry.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id.replace('contact-', '')]: e.target.value
    });
  };

  return (
    <>
      <section className="contact-hero glass-card">
        <div className="container">
          <h1>Contact Support</h1>
          <p>Have questions regarding bulk corporate services, document clearance insurance, or custom logistical integrations? Our operations managers are here to assist.</p>
        </div>
      </section>

      <section className="contact-section glass-card">
        <div className="container contact-grid">
          {/* Left Column: Direct channels and office info */}
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Direct Channels</h2>

            <div className="channel-cards">
              {/* WhatsApp card */}
              <div className="card channel-card">
                <div
                  className="channel-icon whatsapp"
                  onClick={() => window.open('https://wa.me/233591355179', '_blank')}
                  style={{ cursor: 'pointer' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.9 9.9 0 0 0-6.98-2.878c-5.443 0-9.866 4.372-9.87 9.802-.001 1.772.474 3.504 1.378 5.027L1.912 21.8l4.735-1.646zm12.756-7.391c-.33-.164-1.94-.949-2.24-1.057-.3-.109-.52-.164-.74.164-.22.328-.85 1.057-1.04 1.275-.19.219-.38.246-.71.082-.33-.164-1.39-.508-2.65-1.621-.98-.868-1.64-1.942-1.83-2.27-.19-.328-.02-.505.15-.668.15-.148.33-.38.5-.57.17-.19.22-.328.33-.546.11-.219.06-.41-.03-.574-.09-.164-.74-1.764-1.01-2.42-.27-.648-.54-.56-.74-.571l-.63-.012c-.22 0-.58.082-.88.41-.3.328-1.15 1.12-1.15 2.732 0 1.612 1.19 3.167 1.35 3.386.17.218 2.34 3.535 5.67 4.957 2.77 1.18 3.33.95 4.51.84.8-.074 1.94-.787 2.22-1.51.27-.723.27-1.343.19-1.476-.08-.13-.3-.218-.63-.382z"></path>
                  </svg>
                </div>
                <h4>WhatsApp Live</h4>
                <p>Direct chat with operations managers</p>
                <a href="https://wa.me/233591355179" target="_blank" rel="noopener noreferrer">+233 591 355 179</a>
              </div>

              {/* Email card */}
              <div className="card channel-card">
                <div className="channel-icon email">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h4>Email Support</h4>
                <p>Send institutional and bulk queries</p>
                <a href="mailto:support@runmyerrand.com">support@runmyerrand.com</a>
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Airport Office Location</h2>
            {/* Custom Accra road map vector */}
            <div className="office-map-container" style={{ marginBottom: '2.5rem' }}>
              <div className="map-street-grid"></div>
              <svg className="office-map-svg" width="100%" height="100%">
                <path d="M 0 60 L 500 60" stroke="rgba(0,82,255,0.12)" strokeWidth="20" fill="none" />
                <path d="M 120 0 L 120 300" stroke="rgba(0,82,255,0.12)" strokeWidth="15" fill="none" />
                <path d="M 380 0 L 380 300" stroke="rgba(0,82,255,0.12)" strokeWidth="15" fill="none" />
              </svg>

              {/* Pulsing Location Pin */}
              <div className="map-location-marker">
                <div className="marker-pulse"></div>
                <div className="marker-label">RME HQ - Airport Residential Area</div>
              </div>
            </div>

            <div className="hours-info-box">
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--primary)' }}>Operational Hours</h3>
              <div className="hours-row">
                <span>Monday - Friday</span>
                <strong>8:00 AM - 6:00 PM</strong>
              </div>
              <div className="hours-row">
                <span>Saturday</span>
                <strong>9:00 AM - 4:00 PM</strong>
              </div>
              <div className="hours-row">
                <span>Sunday & Holidays</span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Closed (Emergency Only)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive ticket submission form */}
          <div className="card contact-form-card" style={{ padding: '2.5rem', border: '1px solid var(--border-light)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: 12, background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700 }}>Send a Message</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Fill out our direct inquiry ticket. Our response SLA is guaranteed within 60 minutes during business hours.</p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="contact-name" style={{ fontWeight: 600 }}>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    className="form-input"
                    id="contact-name"
                    type="text"
                    placeholder="E.g., Ama Ofori"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    style={{ borderRadius: 8, padding: '0.8rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="contact-email" style={{ fontWeight: 600 }}>Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    className="form-input"
                    id="contact-email"
                    type="email"
                    placeholder="E.g., ama@company.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    style={{ borderRadius: 8, padding: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="contact-phone" style={{ fontWeight: 600 }}>Phone Number</label>
                  <input
                    className="form-input"
                    id="contact-phone"
                    type="tel"
                    placeholder="E.g., +233 24 412 3456"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ borderRadius: 8, padding: '0.8rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="contact-subject" style={{ fontWeight: 600 }}>Subject <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    className="form-input"
                    id="contact-subject"
                    type="text"
                    placeholder="E.g., Bulk Corporate Contract"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    style={{ borderRadius: 8, padding: '0.8rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="contact-message" style={{ fontWeight: 600 }}>Detail Message <span style={{ color: 'var(--danger)' }}>*</span></label>
                <textarea
                  className="form-textarea"
                  id="contact-message"
                  rows={5}
                  placeholder="Provide details. Include deadlines, locations, or any specific requirements..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                  style={{ borderRadius: 8, padding: '0.8rem', resize: 'vertical' }}
                />
              </div>

              {status && (
                <div
                  className={`alert alert-${status.type}`}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: status.type === 'success' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                  }}
                >
                  {status.message}
                </div>
              )}

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 600, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }}
              >
                <span>{loading ? 'Submitting...' : 'Submit Inquiry Ticket'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
