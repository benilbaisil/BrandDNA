import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const StartupOwnerRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();



  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || (function(){try{var u=sessionStorage.getItem('branddna_user')||localStorage.getItem('branddna_user');return u&&u!=='undefined'?JSON.parse(u)?.role:undefined}catch(e){return undefined}})();

  // Administrators should be kept in their dedicated admin workspace (/admin)
  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
