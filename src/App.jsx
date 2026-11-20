import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Splash from './components/Splash';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import BookNow from './pages/BookNow';
import Employee from './pages/Employee';

const AppContent = () => {
  const location = useLocation();
  const { currentUser, userData, logout } = useAuth();
  const isPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Auto-logout admin users when they access public pages
  useEffect(() => {
    const publicRoutes = ['/', '/services', '/contact', '/book-now', '/privacy', '/terms'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (isPublicRoute && currentUser && (userData?.role === 'admin' || userData?.role === 'employee')) {
      logout().catch(err => console.error('Auto-logout failed:', err));
    }
  }, [location.pathname, currentUser, userData, logout]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isPortal && <Header />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/book-now" element={<BookNow />} />
          
          {/* Protected Client Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Protected Admin CMS Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          } />

          {/* Protected Employee Operations Portal */}
          <Route path="/employee" element={
            <ProtectedRoute employeeOnly={true}>
              <Employee />
            </ProtectedRoute>
          } />

          {/* Legal Pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>
      {!isPortal && !isAuthPage && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Splash />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
