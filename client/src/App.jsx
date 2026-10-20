import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth, getRoleRedirectPath } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Role Dashboard Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { OrderManagementView } from './components/dashboard/OrderManagementView';
import { InventoryDashboardPage } from './pages/inventory/InventoryDashboardPage';
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { CustomerProductDetailPage } from './pages/customer/CustomerProductDetailPage';

// Product & Marketing Strategy Tools
import { BrandSummaryPage } from './pages/dashboard/BrandSummaryPage';
import { ProductStrategyPage } from './pages/dashboard/ProductStrategyPage';
import { CustomerPersonaPage } from './pages/dashboard/CustomerPersonaPage';
import { AdPosterStudioPage } from './pages/dashboard/AdPosterStudioPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { ProductManagementPage } from './pages/dashboard/ProductManagementPage';

import { AdminDeliveryManagementPage } from './pages/admin/AdminDeliveryManagementPage';
import { DeliveryDashboardPage } from './pages/delivery/DeliveryDashboardPage';

// Role-based Route Protection Guards
import { PublicRoute } from './routes/PublicRoute';
import { AdminRoute } from './routes/AdminRoute';
import { InventoryRoute } from './routes/InventoryRoute';
import { MarketingRoute } from './routes/MarketingRoute';
import { CustomerRoute } from './routes/CustomerRoute';
import { DeliveryRoute } from './routes/DeliveryRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';

import MarketingDashboardPage from './pages/marketing/MarketingDashboardPage';
import SavedStrategiesPage from './pages/marketing/SavedStrategiesPage';
import MarketingProjectDetailsPage from './pages/marketing/MarketingProjectDetailsPage';
import ImageGenerationPage from './pages/marketing/ImageGenerationPage';

import BrandsListPage from './pages/marketing/brands/BrandsListPage';
import CreateBrandPage from './pages/marketing/brands/CreateBrandPage';
import BrandDetailsPage from './pages/marketing/brands/BrandDetailsPage';

import ProductsListPage from './pages/marketing/products/ProductsListPage';
import CreateProductPage from './pages/marketing/products/CreateProductPage';
import ProductDetailsPage from './pages/marketing/products/ProductDetailsPage';

const AuthenticatedFallback = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  let role = user?.role;
  if (!role) {
    try {
      const u = localStorage.getItem('branddna_user');
      role = u && u !== 'undefined' ? JSON.parse(u)?.role : undefined;
    } catch(e) {}
  }
  return <Navigate to={getRoleRedirectPath(role)} replace />;
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

            {/* Public Auth Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Protected Administrator Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminOverviewPage />} />
                <Route path="/admin/delivery" element={<AdminDeliveryManagementPage />} />
                <Route path="/admin/orders" element={<OrderManagementView />} />
                <Route path="/admin/products" element={<ProductManagementPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/profile" element={<AdminProfilePage />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Route>

            {/* Protected Delivery Agent Routes */}
            <Route element={<DeliveryRoute />}>
              <Route path="/delivery" element={<DeliveryDashboardPage />} />
              <Route path="/delivery/*" element={<DeliveryDashboardPage />} />
            </Route>

            {/* Protected Inventory Staff Routes */}
            <Route element={<InventoryRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/inventory/dashboard" element={<InventoryDashboardPage />} />
                <Route path="/inventory/products" element={<Navigate to="/inventory/dashboard?tab=products" replace />} />
                <Route path="/inventory" element={<Navigate to="/inventory/dashboard" replace />} />
              </Route>
            </Route>

            {/* Protected Customer Routes */}
            <Route element={<CustomerRoute />}>
              <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/customer/product/:id" element={<CustomerProductDetailPage />} />
              <Route path="/products" element={<CustomerDashboardPage />} />
              <Route path="/product/:id" element={<CustomerProductDetailPage />} />
              <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
            </Route>

            {/* Protected Strategy & Marketing Staff Routes */}
            <Route element={<MarketingRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/marketing/dashboard" element={<MarketingDashboardPage />} />
                <Route path="/marketing/product-strategy" element={<ProductStrategyPage />} />
                <Route path="/marketing/saved-strategies" element={<SavedStrategiesPage />} />
                <Route path="/marketing/ad-poster" element={<AdPosterStudioPage />} />
                <Route path="/marketing/image-generation" element={<ImageGenerationPage />} />
                
                {/* Obsolete/legacy routes redirected cleanly */}
                <Route path="/marketing/brands" element={<Navigate to="/marketing/product-strategy" replace />} />
                <Route path="/marketing/brands/create" element={<Navigate to="/marketing/product-strategy" replace />} />
                <Route path="/marketing/brands/:id" element={<Navigate to="/marketing/product-strategy" replace />} />
                
                <Route path="/marketing" element={<Navigate to="/marketing/dashboard" replace />} />
                
                {/* STRATEGY & MARKETING TOOLS */}
                <Route path="/product-strategy" element={<ProductStrategyPage />} />
              </Route>
            </Route>

            {/* Generic Protected Routes (Accessible by all authenticated roles) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Dynamic Dashboard Redirect */}
            <Route path="/dashboard" element={<AuthenticatedFallback />} />

            {/* Fallback Route based on user role */}
            <Route path="*" element={<AuthenticatedFallback />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
