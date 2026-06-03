import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <>
      <section className="policy-hero">
        <div className="container">
          <span className="policy-badge">Legal</span>
          <h1>Terms of Service</h1>
          <p>Last updated: May 2026 &nbsp;|&nbsp; Effective: May 2026</p>
        </div>
      </section>

      <main className="policy-content">
        <div className="policy-section">
          <p>Welcome to Run My Errand ("RME", "we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of our website at <strong>runmyerrand.com</strong> and all errand, logistics, and concierge services we provide.</p>
          <div className="highlight-box">
            By placing a booking or using any of our services, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, please do not use our services.
          </div>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>1. About Our Services</h2>
          <p>Run My Errand is a professional errand and concierge service operating in Accra, Ghana. Our services include but are not limited to:</p>
          <ul>
            <li>Personal and Corporate Errands</li>
            <li>Parcel Pickup & Delivery</li>
            <li>Shopping & Vendor Services</li>
            <li>House Management & Supervision</li>
            <li>Travel & Airport Support</li>
            <li>Documentation & Compliance Assistance</li>
            <li>Site Inspection Updates & Reports</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>We act as your trusted representative and execute tasks on your behalf. We do not guarantee outcomes that are outside our direct control (e.g., government office delays, third-party vendor unavailability).</p>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>2. Eligibility</h2>
          <p>To use our services, you must:</p>
          <ul>
            <li>Be at least 18 years of age, or have the consent of a parent or legal guardian.</li>
            <li>Provide accurate, complete, and current contact and booking information.</li>
            <li>Have the legal capacity to enter into a binding agreement under Ghanaian law.</li>
          </ul>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>3. Booking & Confirmation</h2>
          <p>All errand bookings are subject to the following:</p>
          <ul>
            <li>Bookings are accepted pending review and availability of our agents.</li>
            <li>You will receive a confirmation via email, WhatsApp, or phone call after your booking is reviewed.</li>
            <li>We reserve the right to decline any booking without obligation to provide a reason.</li>
            <li>Bookings must be made with sufficient lead time — same-day bookings are subject to agent availability.</li>
            <li>Providing false or misleading information during booking may result in immediate cancellation and potential liability.</li>
          </ul>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>4. Pricing & Payment</h2>
          <ul>
            <li>Service fees are quoted per errand based on complexity, distance, time, and service type.</li>
            <li>Quoted prices are estimates unless confirmed in writing by our team.</li>
            <li>Payment terms will be communicated at the time of booking confirmation.</li>
            <li>We reserve the right to adjust pricing for unforeseen circumstances (e.g., fuel surcharges, extended hours) with prior client notification.</li>
            <li>All transactions are conducted in Ghanaian Cedis (GHS) unless otherwise agreed.</li>
            <li>Receipts or invoices will be provided upon request.</li>
          </ul>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>5. Cancellations & Refunds</h2>
          <ul>
            <li>Cancellations made more than <strong>2 hours before</strong> a scheduled errand will incur no charge.</li>
            <li>Cancellations made within 2 hours of the scheduled time may be subject to a cancellation fee of up to 50% of the agreed service fee.</li>
            <li>If RME cancels a booking due to agent unavailability or force majeure, you will receive a full refund or be offered a reschedule at no additional cost.</li>
            <li>Refunds, where applicable, will be processed within <strong>5–10 business days</strong> via the original payment method.</li>
          </ul>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>6. Client Responsibilities</h2>
          <p>As a client, you agree to:</p>
          <ul>
            <li>Provide clear, accurate instructions for each errand or task.</li>
            <li>Ensure that any items to be collected, delivered, or handled are legally permissible.</li>
            <li>Not request our agents to handle illegal goods, substances, or activities of any kind.</li>
            <li>Be reachable by phone or WhatsApp during the execution of your errand for any clarifications.</li>
            <li>Reimburse RME for any out-of-pocket expenses (e.g., purchase costs, parking fees) agreed upon in advance.</li>
          </ul>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>7. Prohibited Uses</h2>
          <p>You must not use our services to:</p>
          <ul>
            <li>Transport, deliver, or handle illegal, controlled, or hazardous items.</li>
            <li>Engage in fraudulent, deceptive, or abusive conduct toward our agents or staff.</li>
            <li>Circumvent, hack, or interfere with our website or booking systems.</li>
            <li>Impersonate another person or misrepresent your identity or affiliation.</li>
            <li>Use our agents for purposes that violate any Ghanaian or international law.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>Violation of this section may result in immediate termination of service and, where applicable, referral to law enforcement authorities.</p>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>8. Liability & Limitations</h2>
          <p>Run My Errand takes every care in executing your errands. However:</p>
          <ul>
            <li>We are not liable for delays caused by traffic, government institutions, third parties, or circumstances beyond our control (force majeure).</li>
            <li>Our liability for loss or damage to items in our care is limited to the declared value of the item at the time of booking, subject to a maximum cap agreed per booking.</li>
            <li>We are not liable for consequential, indirect, or special damages arising from the use or inability to use our services.</li>
            <li>Clients are advised to ensure adequate insurance for high-value items prior to booking delivery services.</li>
          </ul>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>9. Confidentiality</h2>
          <p>Our agents operate under strict confidentiality agreements. Any information shared with us during the course of an errand — including addresses, personal documents, financial information, or business details — will not be disclosed to third parties. See our <Link to="/privacy" style={{ color: 'var(--accent)', fontWeight: 600 }}>Privacy Policy</Link> for more details.</p>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>10. Intellectual Property</h2>
          <p>All content on this website — including logos, text, graphics, and design — is the property of Run My Errand and is protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any content from our website without our prior written consent.</p>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>11. Governing Law & Disputes</h2>
          <p>These Terms are governed by and construed in accordance with the laws of the <strong>Republic of Ghana</strong>. Any dispute arising out of or in connection with these Terms shall first be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be referred to arbitration or the appropriate Ghanaian courts.</p>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>12. Amendments to These Terms</h2>
          <p>We reserve the right to update or modify these Terms at any time. When changes are made, we will update the "Last Updated" date at the top of this page. Your continued use of our services after any changes constitutes your acceptance of the revised Terms. We encourage you to review this page periodically.</p>
        </div>

        <hr className="policy-divider" />

        <div className="policy-section">
          <h2>13. Contact Us</h2>
          <p>If you have any questions or concerns about these Terms of Service, please reach out to us:</p>
          <div className="policy-contact-box">
            <p><strong>Run My Errand (RME)</strong></p>
            <p>📧 Email: <a href="mailto:support@runmyerrand.com">support@runmyerrand.com</a></p>
            <p>📞 Phone: <a href="tel:+233591355179">+233 591 355 179</a> &nbsp;|&nbsp; <a href="tel:+233504979620">+233 504 979 620</a></p>
            <p>📍 Location: Accra, Ghana</p>
            <p>🐦 Social: <a href="https://twitter.com/runmyerrand08" target="_blank" rel="noopener noreferrer">@runmyerrand08</a></p>
          </div>
        </div>
      </main>
    </>
  );
}
