import React, { useState } from 'react';
import { Search, Bell, Settings, Menu, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminTopNavbar = ({ onOpenMobile, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="h-16 bg-white text-slate-900 border-b border-[#D6E6EC] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0">
      
      {/* Left: Mobile Toggle & Admin Portal Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-[#EAF4F7]"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-left">
          <h1 className="font-serif text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Admin Control Portal</span>
            <span className="text-[10px] font-sans font-bold text-white bg-slate-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
              ROOT
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">BrandDNA AI Platform Overview & Startup Audit</p>
        </div>
      </div>

      {/* Center: Global Admin Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users, startups, or projects..."
            className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 rounded-full pl-9 pr-4 py-2 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Admin Profile */}
      <div className="flex items-center gap-3">

        {/* Settings Button */}
        <Link
          to="/admin/settings"
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-[#EAF4F7] transition-colors"
          title="System Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#D6E6EC]">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
            AD
          </div>
        </div>
      </div>

    </header>
  );
};
