import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Startup Owner Dashboard Pages (Working Business Details & Profile)
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BrandAnalysisPage } from './pages/dashboard/BrandAnalysisPage';
import { BrandSummaryPage } from './pages/dashboard/BrandSummaryPage';
import { ProductStrategyPage } from './pages/dashboard/ProductStrategyPage';
import { CustomerPersonaPage } from './pages/dashboard/CustomerPersonaPage';
import { AdPosterStudioPage } from './pages/dashboard/AdPosterStudioPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';

// Platform Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminStartupsPage } from './pages/admin/AdminStartupsPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

import { PublicRoute } from './routes/PublicRoute';
import { AdminRoute } from './routes/AdminRoute';
import { StartupOwnerRoute } from './routes/StartupOwnerRoute';

const AuthenticatedFallback = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const role = user?.role || JSON.parse(localStorage.getItem('branddna_user') || '{}')?.role;
  return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
            </Route>

            {/* Public Shared Auth Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
              {/* Legacy /admin/login redirects to common /login */}
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Protected Startup Owner Workspace Routes */}
            <Route element={<StartupOwnerRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/brand-identity" element={<BrandAnalysisPage />} />
                <Route path="/brand-analysis" element={<BrandAnalysisPage />} />
                <Route path="/brand-summary" element={<BrandSummaryPage />} />
                <Route path="/saved-brand" element={<BrandSummaryPage />} />
                <Route path="/product-strategy" element={<ProductStrategyPage />} />
                <Route path="/customer-persona" element={<CustomerPersonaPage />} />
                <Route path="/ad-poster-studio" element={<AdPosterStudioPage />} />
                <Route path="/marketing-planner" element={<AdPosterStudioPage />} />
                <Route path="/legal" element={<Navigate to="/dashboard" replace />} />
                <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
                <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
                <Route path="/design-system" element={<Navigate to="/dashboard" replace />} />
                <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            {/* Protected Platform Admin Workspace Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="startups" element={<AdminStartupsPage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
              </Route>
            </Route>

            {/* Fallback Route based on user role */}
            <Route path="*" element={<AuthenticatedFallback />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
