import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Menu,
  Zap,
  Plus,
  PackagePlus,
} from 'lucide-react';
import { CommandPalette } from '../ui/CommandPalette';
import { ProductModal } from './ProductModal';

export const TopNavbar = ({ onOpenMobile }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  React.useEffect(() => {
    const handleOpenModal = () => setShowProductModal(true);
    window.addEventListener('open-add-product-modal', handleOpenModal);
    return () => window.removeEventListener('open-add-product-modal', handleOpenModal);
  }, []);

  let role = user?.role;
  if (!role) {
    try {
      const u = localStorage.getItem('branddna_user');
      role = u && u !== 'undefined' ? JSON.parse(u)?.role : 'customer';
    } catch(e) { role = 'customer'; }
  }
  const canManageProducts = role === 'admin' || role === 'inventory_staff' || role === 'marketing_staff';

  const handleAddProductClick = () => {
    setShowProductModal(true);
  };

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/brand-identity':
      case '/brand-analysis':
        return { title: 'Brand Analysis', desc: 'Build your brand identity with AI-powered suggestions. Choose, refine, regenerate, or create your own.' };
      case '/brand-summary':
      case '/saved-brand':
        return { title: 'Saved Brand DNA', desc: 'Consolidated overview of your saved brand identity elements & export guidelines.' };
      case '/product-strategy':
        return { title: 'Products & Strategy', desc: 'Positioning, Value Props & Prioritization' };
      case '/competitors':
        return { title: 'Competitor Intelligence', desc: 'Market Radar & Similarity Analysis' };
      case '/ai-chat':
        return { title: 'AI Advisor Chat', desc: 'Interactive Brand & Legal Copilot' };
      case '/marketing-planner':
        return { title: 'Marketing Planner', desc: 'Growth Strategy & Campaign Matrix' };
      case '/legal':
        return { title: 'Legal Advisory', desc: 'Trademark Clearance & IP Protection' };
      case '/reports':
        return { title: 'Executive Reports', desc: 'PDF Report Preview & Distribution' };
      case '/analytics':
        return { title: 'Performance Analytics', desc: 'Brand Metrics & Growth Timeline' };
      case '/design-system':
        return { title: 'Design System UI', desc: 'Handcrafted Micro-Components Showcase' };
      case '/settings':
        return { title: 'Settings', desc: 'AI Engines, Workspace & API Keys' };
      case '/profile':
        return { title: 'User Profile', desc: 'Account Credentials & Security' };
      case '/dashboard':
      default:
        return { title: 'Executive Dashboard', desc: 'Real-time Brand DNA & Market Metrics' };
    }
  };

  const pageInfo = getPageInfo();

  const notifications = user?.fullName ? [
    { id: '1', title: 'System Active', time: 'Just now', text: `Welcome back, ${user.fullName}. Brand DNA engine ready.` }
  ] : [];

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#D6E6EC] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0">
        
        {/* Left: Mobile Toggle & Page Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="text-left">
            <h1 className="font-serif text-lg font-bold text-slate-900 tracking-tight">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Actions & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {canManageProducts && (
            <button
              onClick={handleAddProductClick}
              className="px-3.5 py-1.5 bg-[#0F382C] hover:bg-[#16503f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-emerald-800"
              title="Add New Product to Shop"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-blue-600 hover:underline cursor-pointer font-semibold">Mark all read</span>
                </div>
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Command Palette Trigger Modal */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      
      {/* Product Modal */}
      <ProductModal 
        isOpen={showProductModal} 
        onClose={() => setShowProductModal(false)} 
        onSuccess={() => {
          // If the user is on a page that needs to refresh products, we can dispatch an event
          window.dispatchEvent(new CustomEvent('product-added-success'));
        }} 
      />
    </>
  );
};
