import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, getRoleRedirectPath } from '../context/AuthContext';

export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const target = getRoleRedirectPath(user?.role);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};
