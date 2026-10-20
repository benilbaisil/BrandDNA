import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, getRoleRedirectPath } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CustomerRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  const userRole = user?.role || (function(){try{var u=localStorage.getItem('branddna_user');return u&&u!=='undefined'?JSON.parse(u)?.role:undefined}catch(e){return undefined}})();
  const isAllowed = userRole === 'customer';

  useEffect(() => {
    if (isAuthenticated && !isAllowed) {
      addToast('Redirecting to your workspace portal.', 'info');
    }
  }, [isAuthenticated, isAllowed, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect unauthenticated visitors attempting to access protected customer pages to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Redirect authenticated non-customer role users (e.g. inventory staff) to their workspace
  if (!isAllowed) {
    return <Navigate to={getRoleRedirectPath(userRole)} replace />;
  }

  return <Outlet />;
};
