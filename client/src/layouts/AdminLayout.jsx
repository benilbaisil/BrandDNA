import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopNavbar } from '../components/admin/AdminTopNavbar';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen bg-[#EAF4F7] flex text-slate-900 font-sans selection:bg-slate-900 selection:text-white overflow-hidden">
      
      {/* Collapsible Left Admin Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Admin Top Navbar */}
        <AdminTopNavbar
          onOpenMobile={() => setMobileOpen(true)}
          onSearch={(query) => setSearchQuery(query)}
        />

        {/* Admin Canvas Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key="admin-canvas"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet context={{ searchQuery }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
};
