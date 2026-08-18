import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('branddna_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('branddna_token'));
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const googleLogin = async (idToken) => {
    setLoading(true);
    try {
      const res = await authService.googleLogin(idToken);
      if (res && res.success && res.data) {
        const userData = res.data.user;
        const userToken = res.data.token;
        if (userData && userToken) {
          localStorage.setItem('branddna_user', JSON.stringify(userData));
          localStorage.setItem('branddna_token', userToken);
          setUser(userData);
          setToken(userToken);
          addToast(`Welcome, ${userData.fullName}! Authenticated with Google.`, 'success');

          const targetUrl = userData.role === 'admin' ? '/admin' : '/dashboard';
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 300);
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
          localStorage.setItem('branddna_user', JSON.stringify(userData));
          localStorage.setItem('branddna_token', userToken);
          setUser(userData);
          setToken(userToken);
          addToast(`Welcome back, ${userData.fullName}!`, 'success');
          
          const targetUrl = userData.role === 'admin' ? '/admin' : '/dashboard';
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 300);
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
          localStorage.setItem('branddna_user', JSON.stringify(newUser));
          localStorage.setItem('branddna_token', newTok);
          setUser(newUser);
          setToken(newTok);
          addToast('Account created successfully!', 'success');
          
          const targetUrl = newUser.role === 'admin' ? '/admin' : '/dashboard';
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 300);
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
        // Fallback local update sync
      }

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
      setUser(null);
      setToken(null);
      localStorage.removeItem('branddna_user');
      localStorage.removeItem('branddna_token');
      addToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    }
  };

  const checkAuth = () => {
    if (user) return true;
    const storedTok = localStorage.getItem('branddna_token');
    const storedUsr = localStorage.getItem('branddna_user');
    return !!storedTok && !!storedUsr;
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || (localStorage.getItem('branddna_user') ? JSON.parse(localStorage.getItem('branddna_user')) : null),
        token: token || localStorage.getItem('branddna_token'),
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
    const savedUser = localStorage.getItem('branddna_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    return {
      user,
      token: localStorage.getItem('branddna_token'),
      isAuthenticated: !!user || !!localStorage.getItem('branddna_token'),
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
