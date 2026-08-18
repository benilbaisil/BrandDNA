import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();

  const userRole = user?.role || JSON.parse(localStorage.getItem('branddna_user') || '{}')?.role;

  useEffect(() => {
    if (isAuthenticated && userRole !== 'admin') {
      addToast('You do not have permission to access this page.', 'error');
    }
  }, [isAuthenticated, userRole, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
