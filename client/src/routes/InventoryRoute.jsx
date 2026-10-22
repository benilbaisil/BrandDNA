import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRoleRedirectPath } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const InventoryRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();

  const userRole = user?.role || (function(){try{var u=sessionStorage.getItem('branddna_user')||localStorage.getItem('branddna_user');return u&&u!=='undefined'?JSON.parse(u)?.role:undefined}catch(e){return undefined}})();
  const isAllowed = userRole === 'inventory_staff' || userRole === 'admin';

  useEffect(() => {
    if (isAuthenticated && !isAllowed) {
      addToast('Unauthorized access. Inventory Staff or Admin role required.', 'error');
    }
  }, [isAuthenticated, isAllowed, addToast]);



  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to={getRoleRedirectPath(userRole)} replace />;
  }

  return <Outlet />;
};
