import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DeliveryRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();

  const userRole =
    user?.role ||
    (function () {
      try {
        var u = localStorage.getItem('branddna_user');
        return u && u !== 'undefined' ? JSON.parse(u)?.role : undefined;
      } catch (e) {
        return undefined;
      }
    })();

  const isDeliveryAgent =
    userRole === 'delivery_agent' || userRole === 'DELIVERY_AGENT' || userRole === 'admin';

  useEffect(() => {
    if (isAuthenticated && !isDeliveryAgent) {
      addToast('You do not have permission to access the delivery agent portal.', 'error');
    }
  }, [isAuthenticated, isDeliveryAgent, addToast]);

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

  if (!isDeliveryAgent) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
