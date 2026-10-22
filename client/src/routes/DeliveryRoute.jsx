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
        var u = sessionStorage.getItem('branddna_user') || localStorage.getItem('branddna_user');
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



  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isDeliveryAgent) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
