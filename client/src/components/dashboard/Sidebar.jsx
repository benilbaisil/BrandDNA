import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Dna,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Sparkles,
  BookmarkCheck,
  Target,
  Users,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  AlertTriangle,
  XCircle,
  PlusCircle,
  MinusCircle,
  Sliders,
  History,
  Truck,
  ShoppingCart,
  RotateCcw,
  ShieldAlert,
  BarChart3,
  Rocket,
  Megaphone
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, toggleSidebar, mobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isInventoryStaff = user?.role === 'inventory_staff';
  const isMarketingStaff = user?.role === 'marketing_staff';

  // Clean two-tool nav for marketing staff
  const marketingNavItems = [
    { name: 'Dashboard', path: '/marketing/dashboard', icon: LayoutDashboard },
    { name: 'New Product', path: '/marketing/product-strategy', icon: Rocket },
    { name: 'Create Ad Poster', path: '/marketing/ad-poster', icon: Megaphone },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const defaultNavItems = [
    { name: 'Business Details', path: '/dashboard', icon: Building2 },
    { name: 'Brand Analysis', path: '/brand-analysis', icon: Sparkles },
    { name: 'Product Strategy', path: '/product-strategy', icon: Target },
    { name: 'Customer Persona', path: '/customer-persona', icon: Users },
    { name: 'Ad Poster Studio', path: '/ad-poster-studio', icon: ImageIcon },
    { name: 'Saved Brand DNA', path: '/brand-summary', icon: BookmarkCheck },
    { name: 'Account Profile', path: '/profile', icon: User },
  ];

  const inventoryNavItems = [
    { name: 'Dashboard', path: '/inventory/dashboard?tab=dashboard', icon: LayoutDashboard },
    { name: 'Products & Stock', path: '/inventory/dashboard?tab=products', icon: Package },
    { name: 'Stock Management', path: '/inventory/dashboard?tab=stock-management', icon: Sliders },
    { name: 'Stock Movement History', path: '/inventory/dashboard?tab=movement-history', icon: History },
    { name: 'Order Processing', path: '/inventory/dashboard?tab=orders', icon: ShoppingCart },
    { name: 'Delivery Management', path: '/inventory/dashboard?tab=delivery', icon: Truck },
    { name: 'Returns & Refunds', path: '/inventory/dashboard?tab=returns-damaged', icon: RotateCcw },
    { name: 'Inventory Reports', path: '/inventory/dashboard?tab=reports', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Logout', path: '#logout', isLogout: true, icon: LogOut },
  ];

  const navItems = isInventoryStaff
    ? inventoryNavItems
    : isMarketingStaff
    ? marketingNavItems
    : defaultNavItems;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-[#0F291E]/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#060D1A] text-white border-r border-[#1E3E62]/60 flex flex-col justify-between transition-all duration-300 shadow-xl shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E3E62]/60">
            <Link to={isInventoryStaff ? "/inventory/dashboard" : isMarketingStaff ? "/marketing/dashboard" : "/dashboard"} className="flex items-center gap-3 overflow-hidden group">
              <div className="w-9 h-9 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center font-bold shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-[#1E3E62]/80">
                <Dna className="w-5 h-5 text-sky-400" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                    BrandDNA
                    <span className="font-sans text-[10px] font-mono px-1.5 py-0.5 bg-[#1E3E62] text-sky-300 rounded-md font-bold uppercase border border-sky-400/30">
                      {isInventoryStaff ? 'Stock' : isMarketingStaff ? 'Mktg' : 'AI'}
                    </span>
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {isInventoryStaff ? 'Inventory Management' : isMarketingStaff ? 'Marketing Studio' : 'Minimal Workspace'}
                  </span>
                </div>
              )}
            </Link>

            <div className="flex items-center gap-1">
              {/* Mobile Close Button */}
              <button
                onClick={closeMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E3E62]/50"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Desktop Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E3E62]/50 transition-colors border border-[#1E3E62]/60"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-145px)] text-left scrollbar-thin scrollbar-thumb-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;

              if (item.isLogout) {
                return (
                  <button
                    key="logout-item"
                    onClick={() => { closeMobile(); logout(); }}
                    className="w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-transparent transition-all cursor-pointer text-left"
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-rose-400" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </button>
                );
              }

              const fullPath = `${location.pathname}${location.search}`;
              const isActive = fullPath === item.path || (location.pathname === item.path && !location.search);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1E3E62] text-white shadow-md font-bold border border-sky-400/30'
                      : 'text-slate-300 hover:bg-[#1E3E62]/40 hover:text-white border border-transparent'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-sky-300' : 'text-slate-400 group-hover:text-white'}`} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Avatar & Status */}
        <div className="p-3 border-t border-[#1E3E62]/60 bg-[#040912]">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-xl bg-[#0B192C] border border-[#1E3E62]/60 shadow-2xs`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#1E3E62] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-sky-400/30">
                {(user?.fullName || 'I')[0].toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Inventory Staff'}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-[10px] text-sky-300/80 capitalize">{user?.role?.replace('_', ' ') || 'Staff'}</span>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

