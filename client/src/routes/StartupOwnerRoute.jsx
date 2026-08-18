import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const StartupOwnerRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || JSON.parse(localStorage.getItem('branddna_user') || '{}')?.role;

  // Administrators should be kept in their dedicated admin workspace (/admin)
  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
