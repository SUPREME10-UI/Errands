import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqData = [
    {
      question: "What geographical areas do you cover?",
      answer: "Currently, our primary courier coverage zone includes the entire Greater Accra Metropolitan Area (including East Legon, Airport Residential, Cantonments, Dzorwulu, Tema, Spintex, Oyarifa, and surrounding areas). For Site Inspection Updates, we also cover Kumasi and Koforidua."
    },
    {
      question: "Are my packages and deliveries insured?",
      answer: "Yes. Every RME order is backed by premium logistical insurance up to GHS 10,000 for valuables and documents. All deliveries are handled with dedicated safety checks, strict dual-signature validation, and real-time tracking updates."
    },
    {
      question: "How quickly are Urgent and Express errands handled?",
      answer: "Express errands are dispatched immediately with dedicated direct couriers (no multi-stops) and are guaranteed to be completed within 60-90 minutes. Urgent errands are completed within 3 hours. Standard errands are processed within 1 business day."
    }
  ];

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-accent"></div>
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Reliable Logistics Partner
            </div>
            <h1 className="hero-headline">Need Help With Your <span>To-Do List?</span></h1>
            <p className="hero-subheadline">“Relax, we’ve got it covered.” We manage your personal, corporate, shopping, and logistic tasks with absolute trust and efficiency.</p>
            <div className="hero-cta">
              <Link to="/dashboard" className="btn btn-primary">
                Book an Errand
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
            </div>
            <div className="hero-trust-metrics">
              <div className="hero-metric">
                <h4>15k+</h4>
                <p>Errands Completed</p>
              </div>
              <div className="hero-metric">
                <h4>99.4%</h4>
                <p>On-Time Rate</p>
              </div>
              <div className="hero-metric">
                <h4>25+</h4>
                <p>Active Riders</p>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-circle-backdrop"></div>
            
            {/* Courier Illustration SVG */}
            <svg className="hero-illustration" width="100%" height="100%" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="250" cy="380" rx="200" ry="40" fill="url(#groundGrad)" />
              <circle cx="250" cy="200" r="160" fill="url(#circleGrad)" />
              
              <rect x="140" y="160" width="110" height="180" rx="8" fill="#0F2C59" />
              <rect x="160" y="190" width="30" height="30" rx="4" fill="#0052FF" opacity="0.3" />
              <rect x="200" y="190" width="30" height="30" rx="4" fill="#0052FF" opacity="0.3" />
              <rect x="160" y="240" width="30" height="30" rx="4" fill="#0052FF" opacity="0.3" />
              <rect x="200" y="240" width="30" height="30" rx="4" fill="#0052FF" opacity="0.3" />
              <rect x="175" y="290" width="40" height="50" rx="2" fill="#00D7FF" />
              
              <circle cx="340" cy="280" r="45" fill="#0052FF" />
              <path d="M315 255C315 240 330 235 345 235C360 235 365 245 365 255H315Z" fill="#0F2C59" />
              <path d="M340 242H360L355 250H340V242Z" fill="#00D7FF" />
              <rect x="280" y="260" width="45" height="55" rx="6" fill="#10B981" />
              <line x1="280" y1="287" x2="325" y2="287" stroke="#ffffff" strokeWidth="2" />
              <circle cx="310" cy="360" r="28" stroke="#0F2C59" strokeWidth="6" fill="none" />
              <circle cx="390" cy="360" r="28" stroke="#0F2C59" strokeWidth="6" fill="none" />
              <line x1="310" y1="360" x2="350" y2="300" stroke="#0F2C59" strokeWidth="8" strokeLinecap="round" />
              <line x1="390" y1="360" x2="350" y2="300" stroke="#0F2C59" strokeWidth="8" strokeLinecap="round" />
              
              <defs>
                <radialGradient id="groundGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" transform="translate(250 380) rotate(90) scale(40 200)">
                  <stop stopColor="#0052FF" stopOpacity="0.15" />
                  <stop offset="1" stopColor="#0052FF" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="circleGrad" x1="90" y1="40" x2="410" y2="360" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0052FF" stopOpacity="0.06" />
                  <stop offset="1" stopColor="#00D7FF" stopOpacity="0.01" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating Widgets */}
            <div className="floating-card floating-card-1 glass">
              <div className="floating-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div className="floating-info">
                <span>Parcel Assigned</span>
                <span>Rider Kofi is en route</span>
              </div>
            </div>

            <div className="floating-card floating-card-2 glass">
              <div className="floating-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="floating-info">
                <span>Shopping Complete</span>
                <span>Delivered 4 mins ago</span>
              </div>
            </div>

            <div className="floating-card floating-card-3 glass">
              <div className="floating-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="floating-info">
                <span>House Management</span>
                <span>Inspection report ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners */}
      <section className="trusted">
        <div className="container">
          <p className="trusted-title">Trusted By Corporate Businesses & Individuals</p>
          <div className="trusted-logos">
            <div className="trusted-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12h8"></path>
              </svg>
              Melcom Group
            </div>
            <div className="trusted-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              GRA Ventures
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <span>What We Do</span>
            <h2>Premium Services Designed Around Your Daily Needs</h2>
            <p>Whether you require secure financial logistics, professional shopping assistance, or property inspection updates, we handle it with maximum care.</p>
          </div>

          <div className="features-grid">
            {/* Feature Card 1 */}
            <div className="card feature-card">
              <div className="feature-icon-wrapper">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <h3>Parcel Pickup & Delivery</h3>
              <p>Instant pick-ups and deliveries of crucial documents, shopping bundles, and fragile parcels across the city.</p>
              <Link to="/services" className="feature-link">
                Learn more 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>

            {/* Feature Card 2 */}
            <div className="card feature-card">
              <div className="feature-icon-wrapper">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <h3>House Management</h3>
              <p>Supervise property maintenance projects, utility meter checks, key collections, and domestic management duties.</p>
              <Link to="/services" className="feature-link">
                Learn more 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to="/services" className="btn btn-secondary">View All 8 Core Services</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us">
        <div className="container why-us-grid">
          <div className="why-us-image">
            <svg width="100%" height="340" viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 'var(--radius-md)' }}>
              <rect width="400" height="340" fill="url(#flyerGrad)" />
              <circle cx="200" cy="170" r="100" fill="#0052FF" opacity="0.1" />
              
              <rect x="180" y="120" width="40" height="70" rx="4" fill="#0F2C59" />
              <circle cx="200" cy="100" r="15" fill="#E2E8F0" />
              <rect x="220" y="130" width="20" height="35" rx="3" fill="#10B981" />
              <line x1="150" y1="230" x2="250" y2="230" stroke="#0F2C59" strokeWidth="4" strokeLinecap="round" />
              <text x="200" y="275" fill="#0F2C59" fontFamily="Poppins" fontWeight="700" fontSize="16" textAnchor="middle">Reliable & Accountable</text>
              <text x="200" y="295" fill="#64748B" fontFamily="Inter" fontSize="12" textAnchor="middle">Accra's Trusted Concierge Agency</text>
              <defs>
                <linearGradient id="flyerGrad" x1="0" y1="0" x2="400" y2="340" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="1" stopColor="#F1F5F9" />
                </linearGradient>
              </defs>
            </svg>
            <div className="why-us-badge">
              <span>99.8%</span>
              <span>Trust Rating</span>
            </div>
          </div>

          <div className="why-us-content">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
              <span>Why RME</span>
              <h2>Corporate Reliability In Logistics</h2>
              <p>We are not just a simple delivery service. We are a premier concierge firm focused on saving you valuable hours.</p>
            </div>

            <div className="why-us-list">
              {/* Item 1 */}
              <div className="why-us-item">
                <div className="why-us-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="why-us-info">
                  <h3>Vetted Professional Riders</h3>
                  <p>Every single courier on our team is carefully background-checked, insured, and thoroughly trained to handle confidential materials and sensitive deliveries.</p>
                </div>
              </div>
              
              {/* Item 2 */}
              <div className="why-us-item">
                <div className="why-us-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="why-us-info">
                  <h3>Live Status Synchronization</h3>
                  <p>Track your errand's exact step (from submission to final delivery signature) directly on our custom real-time customer booking dashboard.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="why-us-item">
                <div className="why-us-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="why-us-info">
                  <h3>Transparent Cost Estimation</h3>
                  <p>Zero hidden fees. Our custom booking wizard calculates the route distance and urgency rate and details the breakdown instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <div className="section-header">
            <span>FAQ</span>
            <h2>Frequently Answered Queries</h2>
            <p>Quick answers regarding our operational zones, insurance guarantees, and custom packages.</p>
          </div>

          <div className="faq-list">
            {faqData.map((faq, index) => (
              <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`}>
                <div className="faq-question" onClick={() => toggleFaq(index)} style={{ cursor: 'pointer' }}>
                  {faq.question}
                  <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div className="faq-answer">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
