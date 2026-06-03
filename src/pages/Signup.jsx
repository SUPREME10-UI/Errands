import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, address, password } = formData;
    
    if (!name || !email || !phone || !address || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Perform Auth registration and save profile to Firestore users collection
      await signup(email, password, { name, phone, address });
      navigate('/dashboard');
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id.replace('signup-', '')]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/">
            <img src="/logo.jpg" alt="RME Logo" />
          </Link>
          <h1>Create an Account</h1>
          <p>Join Run My Errand for premium logistics</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <input 
              className="form-input" 
              type="text" 
              id="signup-name" 
              required 
              placeholder="Abena Osei"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <input 
              className="form-input" 
              type="email" 
              id="signup-email" 
              required 
              placeholder="abena@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-phone">Phone Number</label>
            <input 
              className="form-input" 
              type="tel" 
              id="signup-phone" 
              required 
              placeholder="+233 24 000 0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-address">Home/Office Address</label>
            <input 
              className="form-input" 
              type="text" 
              id="signup-address" 
              required 
              placeholder="Plot 12, East Legon, Accra"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input 
              className="form-input" 
              type="password" 
              id="signup-password" 
              required 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          {error && (
            <p className="error-msg" style={{ display: 'block', color: 'var(--danger, #ef4444)', fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            id="signup-btn"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer" style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
