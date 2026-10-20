import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRoleRedirectPath } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const MarketingRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { addToast } = useToast();

  const userRole = user?.role || (function(){try{var u=localStorage.getItem('branddna_user');return u&&u!=='undefined'?JSON.parse(u)?.role:undefined}catch(e){return undefined}})();
  const isAllowed = userRole === 'marketing_staff' || userRole === 'admin' || userRole === 'startup_owner';

  useEffect(() => {
    if (isAuthenticated && !isAllowed) {
      addToast('Unauthorized access. Marketing Staff or Admin role required.', 'error');
    }
  }, [isAuthenticated, isAllowed, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to={getRoleRedirectPath(userRole)} replace />;
  }

  return <Outlet />;
};
