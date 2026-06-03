import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <header className="header">
        <div className="container header-container">
          <Link to="/" className="logo">
            <img className="logo-image" src="/logo.jpg" alt="RME Logo" />
            <div className="logo-text">
              <span>RUN MY ERRAND</span>
              <span>Errands Done Right</span>
            </div>
          </Link>
          
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
            <NavLink to="/services" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Services</NavLink>
            
            <NavLink to="/book-now" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Book Now</NavLink>
            {currentUser && (
              <NavLink to={userData?.role === 'admin' ? "/admin" : "/dashboard"} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                {userData?.role === 'admin' ? "Admin Panel" : "Dashboard"}
              </NavLink>
            )}

            <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink>
          </nav>

          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />

            {currentUser ? (
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Log Out</button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1.2rem' }}>Log In</Link>
            )}

            <div className={`hamburger ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav ${mobileOpen ? 'active' : ''}`}>
        <NavLink to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</NavLink>
        <NavLink to="/services" className="nav-link" onClick={() => setMobileOpen(false)}>Services</NavLink>
        
        {currentUser ? (
          userData?.role === 'admin' ? (
            <NavLink to="/admin" className="nav-link" onClick={() => setMobileOpen(false)}>Admin Panel</NavLink>
          ) : (
            <NavLink to="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
          )
        ) : (
          <NavLink to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Log In</NavLink>
        )}

        <NavLink to="/contact" className="nav-link" onClick={() => setMobileOpen(false)}>Contact</NavLink>
        
        {currentUser && (
          <button 
            onClick={() => { handleLogout(); setMobileOpen(false); }} 
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Log Out
          </button>
        )}
      </div>
    </>
  );
}
