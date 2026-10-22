import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const getRoleRedirectPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'inventory_staff':
      return '/inventory/dashboard';
    case 'marketing_staff':
    case 'startup_owner':
      return '/marketing/dashboard';
    case 'delivery_agent':
    case 'DELIVERY_AGENT':
      return '/delivery';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/';
  }
};

const sanitizeUser = (raw) => {
  try {
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === 'object' && (parsed._id || parsed.id || parsed.email) && parsed.role) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const sanitizeToken = (raw) => {
  if (!raw || raw === 'undefined' || raw === 'null' || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// Check if an active authenticated session exists in storage
const getInitialAuth = () => {
  try {
    const rawUser = localStorage.getItem('branddna_user') || sessionStorage.getItem('branddna_user');
    const rawToken = localStorage.getItem('branddna_token') || sessionStorage.getItem('branddna_token');
    const validUser = sanitizeUser(rawUser);
    const validToken = sanitizeToken(rawToken);

    if (!validUser || !validToken) {
      return { user: null, token: null };
    }

    return { user: validUser, token: validToken };
  } catch (e) {
    return { user: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const initial = getInitialAuth();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const saveSession = (userData, userToken) => {
    sessionStorage.setItem('branddna_active_session', 'true');
    sessionStorage.setItem('branddna_user', JSON.stringify(userData));
    sessionStorage.setItem('branddna_token', userToken);
    localStorage.setItem('branddna_user', JSON.stringify(userData));
    localStorage.setItem('branddna_token', userToken);
    setUser(userData);
    setToken(userToken);
  };

  const clearSession = () => {
    sessionStorage.removeItem('branddna_active_session');
    sessionStorage.removeItem('branddna_user');
    sessionStorage.removeItem('branddna_token');
    sessionStorage.clear();
    localStorage.removeItem('branddna_user');
    localStorage.removeItem('branddna_token');
    setUser(null);
    setToken(null);
  };

  // Validate session on mount so stale or revoked credentials are cleared only on verified 401
  useEffect(() => {
    const rawToken = localStorage.getItem('branddna_token') || sessionStorage.getItem('branddna_token');
    if (!rawToken) {
      return;
    }

    let isMounted = true;
    authService.getMe()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && res.data && res.data.user) {
          const freshUser = res.data.user;
          setUser(freshUser);
          sessionStorage.setItem('branddna_user', JSON.stringify(freshUser));
          localStorage.setItem('branddna_user', JSON.stringify(freshUser));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err?.response?.status === 401) {
          clearSession();
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const googleLogin = async (idToken) => {
    setLoading(true);
    try {
      const res = await authService.googleLogin(idToken);
      if (res && res.success && res.data) {
        const userData = res.data.user;
        const userToken = res.data.token;
        if (userData && userToken) {
          saveSession(userData, userToken);
          addToast(`Welcome, ${userData.fullName}! Authenticated with Google.`, 'success');

          const targetUrl = getRoleRedirectPath(userData.role);
          window.location.href = targetUrl;
          return true;
        }
      }
      addToast(res?.message || 'Google authentication failed.', 'error');
      return false;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Google authentication failed.';
      addToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res && res.success && res.data) {
        const userData = res.data.user;
        const userToken = res.data.token;
        if (userData && userToken) {
          saveSession(userData, userToken);
          addToast(`Welcome back, ${userData.fullName}!`, 'success');
          
          const targetUrl = getRoleRedirectPath(userData.role);
          window.location.href = targetUrl;
          return true;
        }
      }
      addToast(res?.message || 'Login failed. Please check credentials.', 'error');
      return false;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check credentials.';
      addToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      if (res && res.success && res.data) {
        const newUser = res.data.user;
        const newTok = res.data.token;
        if (newUser && newTok) {
          saveSession(newUser, newTok);
          addToast('Account created successfully!', 'success');
          
          const targetUrl = getRoleRedirectPath(newUser.role);
          window.location.href = targetUrl;
          return true;
        }
      }
      addToast(res?.message || 'Registration failed. Please try again.', 'error');
      return false;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';
      addToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData) => {
    setLoading(true);
    try {
      let updatedUser = { ...user, ...updateData };
      delete updatedUser.password;

      try {
        const res = await authService.updateProfile(updateData);
        if (res && res.success && res.data && res.data.user) {
          updatedUser = res.data.user;
        }
      } catch (apiErr) {
        // Fallback local update
      }

      sessionStorage.setItem('branddna_user', JSON.stringify(updatedUser));
      localStorage.setItem('branddna_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      addToast('Profile updated successfully!', 'success');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile.';
      addToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      clearSession();
      addToast('Logged out successfully', 'info');
      window.location.href = '/';
    }
  };

  const checkAuth = () => {
    return Boolean(
      user &&
      (user._id || user.id || user.email) &&
      user.role &&
      token &&
      token !== 'undefined' &&
      token !== 'null'
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: checkAuth(),
        loading,
        googleLogin,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const isActive = sessionStorage.getItem('branddna_active_session') === 'true';
    if (!isActive) {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        googleLogin: async () => false,
        login: async () => false,
        register: async () => false,
        updateProfile: async () => false,
        logout: async () => {},
      };
    }
    const user = sanitizeUser(sessionStorage.getItem('branddna_user') || localStorage.getItem('branddna_user'));
    const token = sanitizeToken(sessionStorage.getItem('branddna_token') || localStorage.getItem('branddna_token'));
    return {
      user,
      token,
      isAuthenticated: Boolean(user && user.role && token),
      loading: false,
      googleLogin: async () => false,
      login: async () => false,
      register: async () => false,
      updateProfile: async () => false,
      logout: async () => {},
    };
  }
  return context;
};
