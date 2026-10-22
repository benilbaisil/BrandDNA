import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopNavbar } from '../components/dashboard/TopNavbar';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-[#FAF8F5] flex text-slate-800 font-sans selection:bg-[#0F382C] selection:text-white relative overflow-hidden">

      {/* Collapsible Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobile={() => setMobileOpen(true)}
        />

        {/* Dashboard Canvas Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key="dashboard-canvas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
};

