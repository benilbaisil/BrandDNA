import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building2,
  Sparkles,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = ({ isCollapsed, toggleSidebar, mobileOpen, closeMobile }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Delivery Management', path: '/admin/delivery', icon: Truck },
    { name: 'Orders & Tracking', path: '/admin/orders', icon: Package },
    { name: 'Products & Stock', path: '/admin/products', icon: Package },
    { name: 'Users & Staff Access', path: '/admin/users', icon: Users },
    { name: 'Reports Generator', path: '/admin/reports', icon: FileText },
    { name: 'Admin Settings', path: '/admin/settings', icon: Settings },
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white text-slate-900 border-r border-[#D6E6EC] flex flex-col justify-between transition-all duration-300 shadow-2xs shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div>
        {/* Admin Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#D6E6EC]">
          <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden text-left group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  BrandDNA
                  <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 bg-slate-900 text-white rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)] text-left">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-[#EAF4F7]/60 hover:text-slate-900'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Admin Avatar & Status */}
      <div className="p-3 border-t border-[#D6E6EC] bg-white">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2.5 rounded-2xl bg-[#EAF4F7]/50 border border-[#D6E6EC]`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
              AD
            </div>
            {!isCollapsed && (
              <div className="truncate text-left">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'System Admin'}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Platform Root</span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              title="Logout Admin"
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
