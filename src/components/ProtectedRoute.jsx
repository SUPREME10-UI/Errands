import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, employeeOnly = false }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="splash-pulse" style={{ width: 60, height: 60 }}></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = userData?.role || 'user';

  if (adminOnly && role !== 'admin') {
    return <Navigate to={role === 'employee' ? "/employee" : "/dashboard"} replace />;
  }

  if (employeeOnly && role !== 'employee' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && !employeeOnly) {
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (role === 'employee') {
      return <Navigate to="/employee" replace />;
    }
  }

  return children;
}
