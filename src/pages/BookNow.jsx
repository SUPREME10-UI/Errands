import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import './book-now.css';
import './glass-card.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getServices } from '../lib/dbHelper';

export default function BookNow() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Standard');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const showAlert = (message, title = "Notice", type = "warning") => {
    setModalConfig({ message, title, type });
  };

  const fileInputRef = useRef(null);
  const categoryWrapperRef = useRef(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const list = await getServices();
        const mapped = list.map(s => ({
          value: s.title,
          desc: s.desc,
          base: s.basePrice
        }));
        setCategories(mapped);
        if (mapped.length > 0) {
          setCategory(mapped[0].value);
        }
      } catch (err) {
        console.error("Error fetching categories in BookNow:", err);
      }
    };
    loadCategories();
  }, []);

  // Close category select on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryWrapperRef.current && !categoryWrapperRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNextStep = () => {
    if (currentStep === 1 && !category) {
      showAlert('Please select a service category.');
      return;
    }
    if (currentStep === 2 && (!pickup.trim() || !dropoff.trim())) {
      showAlert('Please provide pickup and dropoff locations.');
      return;
    }
    if (currentStep === 3 && !description.trim()) {
      showAlert('Please enter errand details.');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBookErrand = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      // Redirect to login but maybe pass state to return here?
      showAlert("Please log in to submit your errand.", "Authentication Required");
      // Give them a moment to see the alert before navigating, or navigate after they click OK
      // For now, let's just use the modal. But wait, if we navigate immediately, they won't see it.
      // So we'll skip immediate navigation and let them click OK or manually go to login.
      // Actually, let's just let them read it.
      return;
    }

    setLoading(true);

    const data = {
      category,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      description,
      urgency,
      clientName: currentUser.displayName || "Customer",
      clientEmail: currentUser.email,
      userId: currentUser.uid,
      status: "Pending Assignment",
      createdAt: new Date().toISOString()
    };

    const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('YOUR_API_KEY') || currentUser.uid.startsWith('demo-');
    if (isDemo) {
      try {
        const allOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        const newOrderId = `order-${Date.now()}`;
        const newOrder = { id: newOrderId, ...data };
        allOrders.push(newOrder);
        localStorage.setItem('demo_orders', JSON.stringify(allOrders));
        showAlert(`Errand ${newOrderId} booked successfully!`, "Success", "success");
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        console.error("Error booking errand in demo mode:", error);
        showAlert("Error processing your errand. Please try again.", "Error", "danger");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "orders"), data);
      showAlert(`Errand ${docRef.id} booked successfully!`, "Success", "success");
      setTimeout(() => navigate('/dashboard'), 2000); // Go to dashboard to track it
    } catch (error) {
      console.error("Error booking errand:", error);
      showAlert("Error processing your errand. Please try again.", "Error", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-now-page">
      <div className="container" style={{ maxWidth: '900px', padding: '120px 20px 60px' }}>
        
        {/* Top Quick Links */}
        <div className="quick-book-cards">
          <a href="https://wa.me/233591355179" target="_blank" rel="noreferrer" className="quick-card whatsapp-card glass-card">
            <div className="quick-icon whatsapp-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.573c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="quick-text">
              <h4>Fast Book via WhatsApp</h4>
              <p>Tap to text us directly for quick bookings</p>
            </div>
          </a>
          <a href="mailto:support@runmyerrand.com" className="quick-card email-card glass-card">
            <div className="quick-icon email-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className="quick-text">
              <h4>Book via Email</h4>
              <p>For detailed or bulk corporate requests</p>
            </div>
          </a>
        </div>

        {/* Main Wizard Card */}
        <div className="wizard-main-card glass-card">
          <div className="wizard-header">
            <div className="wizard-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 12 12 17 22 12"></polyline>
                <polyline points="2 17 12 22 22 17"></polyline>
              </svg>
            </div>
            <div className="wizard-header-text">
              <h2>Book a New Errand</h2>
              <p>Fill out our custom logistics form to get dispatched in real time.</p>
            </div>
          </div>
          
          <hr className="wizard-divider" />

          {/* Stepper */}
          <div className="standalone-stepper">
            {[1, 2, 3, 4].map((step, idx) => (
              <React.Fragment key={step}>
                <div className={`stepper-circle ${currentStep === step ? 'active' : currentStep > step ? 'completed' : ''}`}>
                  {step}
                </div>
                {idx < 3 && <div className={`stepper-line ${currentStep > step ? 'completed' : ''}`}></div>}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleBookErrand} className="standalone-wizard-form">
            {currentStep === 1 && (
              <div className="wizard-step-content">
                <h3 className="step-title">Step 1: Select Errand Category</h3>
                <div className="form-group">
                  <label className="form-label">Errand Category</label>
                  <Select value={category} onValueChange={(val) => setCategory(val)}>
                    <SelectTrigger className="w-full h-auto p-4 rounded-lg border-[1px] border-solid border-[var(--border)] bg-transparent hover:bg-transparent focus:ring-0">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-[var(--text)]">
                            {category || "Select a Category"}
                          </div>
                          <div className="text-sm text-[var(--text-light)]">
                            {category ? categories.find(c => c.value === category)?.desc : 'Choose from our options'}
                          </div>
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="font-semibold text-[var(--text)]">{cat.value}</div>
                          <div className="text-xs text-[var(--text-light)]">{cat.desc}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="wizard-step-content">
                <h3 className="step-title">Step 2: Provide Location Details</h3>
                <div className="form-group">
                  <label className="form-label">Pickup Address</label>
                  <input className="form-input" type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="E.g. East Legon" required />
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Dropoff Address</label>
                  <input className="form-input" type="text" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="E.g. Osu" required />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="wizard-step-content">
                <h3 className="step-title">Step 3: Description & Urgency</h3>
                <div className="form-group">
                  <label className="form-label">Urgency</label>
                  <select className="form-select" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                    <option value="Standard">Standard (Within 24 Hours)</option>
                    <option value="Urgent">Urgent (Within 3 Hours)</option>
                    <option value="Express">Express direct dispatch (90 Mins)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Details</label>
                  <textarea className="form-textarea" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the errand..." required></textarea>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="wizard-step-content">
                <h3 className="step-title">Step 4: Attach Files & Confirm</h3>
                <div className="drop-zone" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', padding: '2rem', border: '2px dashed var(--border)', textAlign: 'center', borderRadius: '8px', marginBottom: '1rem' }}>
                  <input type="file" multiple style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
                  <p>Click or drag to attach files (optional)</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedFiles.map((f, i) => (
                    <span key={i} style={{ background: 'var(--bg)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {f.name} <button type="button" onClick={() => handleRemoveFile(i)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>x</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <hr className="wizard-divider" style={{ marginTop: '2rem' }} />

            <div className="wizard-footer" style={{ display: 'flex', justifyContent: currentStep > 1 ? 'space-between' : 'flex-end', paddingTop: '1rem' }}>
              {currentStep > 1 && (
                <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>Back</button>
              )}
              {currentStep < 4 ? (
                <button type="button" className="btn btn-primary" onClick={handleNextStep} style={{ borderRadius: '24px', padding: '0.75rem 2rem' }}>Continue</button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ borderRadius: '24px', padding: '0.75rem 2rem' }}>
                  {loading ? 'Submitting...' : 'Submit Errand'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Nice UI Modal for Alerts */}
      {modalConfig && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setModalConfig(null)}>
          <div style={{ background: 'var(--bg)', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '1rem', color: modalConfig.type === 'danger' ? '#ef4444' : modalConfig.type === 'success' ? '#10b981' : '#f59e0b' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                {modalConfig.type === 'danger' && <circle cx="12" cy="12" r="10"></circle>}
                {modalConfig.type === 'danger' && <line x1="12" y1="8" x2="12" y2="12"></line>}
                {modalConfig.type === 'danger' && <line x1="12" y1="16" x2="12.01" y2="16"></line>}
                
                {modalConfig.type === 'warning' && <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>}
                {modalConfig.type === 'warning' && <line x1="12" y1="9" x2="12" y2="13"></line>}
                {modalConfig.type === 'warning' && <line x1="12" y1="17" x2="12.01" y2="17"></line>}

                {modalConfig.type === 'success' && <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>}
                {modalConfig.type === 'success' && <polyline points="22 4 12 14.01 9 11.01"></polyline>}
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{modalConfig.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>{modalConfig.message}</p>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }} onClick={() => {
              setModalConfig(null);
              if (modalConfig.message.includes('log in')) {
                navigate('/login', { state: { from: location.pathname } });
              }
            }}>
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
