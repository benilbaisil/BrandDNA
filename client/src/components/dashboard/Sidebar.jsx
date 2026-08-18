import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  Image as ImageIcon
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, toggleSidebar, mobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Business Details', path: '/dashboard', icon: Building2 },
    { name: 'Brand Analysis', path: '/brand-analysis', icon: Sparkles },
    { name: 'Product Strategy', path: '/product-strategy', icon: Target },
    { name: 'Customer Persona', path: '/customer-persona', icon: Users },
    { name: 'Ad Poster Studio', path: '/ad-poster-studio', icon: ImageIcon },
    { name: 'Saved Brand DNA', path: '/brand-summary', icon: BookmarkCheck },
    { name: 'Account Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-[#D6E6EC] flex flex-col justify-between transition-all duration-300 shadow-2xs shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#D6E6EC]/60">
            <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <Dna className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                    BrandDNA
                    <span className="font-sans text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 text-white rounded-md font-semibold">
                      AI
                    </span>
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Minimal Workspace</span>
                </div>
              )}
            </Link>

            <div className="flex items-center gap-1">
              {/* Mobile Close Button */}
              <button
                onClick={closeMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Desktop Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-145px)] text-left">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    }`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User Avatar & Status */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-xl bg-white border border-slate-200 shadow-2xs`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user?.fullName || 'B')[0].toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'Business Owner'}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500">Business Owner</span>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
