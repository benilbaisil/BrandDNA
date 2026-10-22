import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, getRoleRedirectPath } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CustomerRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect unauthenticated visitors attempting to browse/view products to Login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname + location.search,
          message: 'Please sign in to browse and view products.',
        }}
        replace
      />
    );
  }

  return <Outlet />;
};
