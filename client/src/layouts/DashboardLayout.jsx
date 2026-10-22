import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopNavbar } from '../components/dashboard/TopNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Send } from 'lucide-react';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);
  const [widgetMessage, setWidgetMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your BrandDNA AI Strategy Advisor. How can I assist your product positioning today?' }
  ]);

  const handleWidgetSend = (e) => {
    e.preventDefault();
    if (!widgetMessage.trim()) return;
    const userMsg = widgetMessage;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setWidgetMessage('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Analyzing "${userMsg}". Recommendation: Focus on unique selling proposition and clear market positioning.`
        }
      ]);
    }, 1000);
  };

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

      {/* Floating AI Assistant Widget Button & Chat Drawer */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <AnimatePresence>
          {chatWidgetOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 bg-[#08221B] text-white flex items-center justify-between border-b border-emerald-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center font-bold border border-emerald-600/40">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">BrandDNA Strategy Copilot</h3>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setChatWidgetOpen(false)}
                  className="p-1 text-emerald-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Message area */}
              <div className="p-4 h-64 overflow-y-auto space-y-2.5 text-xs bg-[#FAF8F5]">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-[#0F382C] text-white font-semibold rounded-br-none shadow-xs'
                          : 'bg-white text-slate-800 border border-stone-200 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Form */}
              <form onSubmit={handleWidgetSend} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
                <input
                  type="text"
                  value={widgetMessage}
                  onChange={(e) => setWidgetMessage(e.target.value)}
                  placeholder="Ask BrandDNA AI..."
                  className="flex-1 bg-[#FAF8F5] border border-stone-200 text-xs text-slate-900 placeholder-slate-400 rounded-xl px-3.5 py-2 outline-none focus:border-[#0F382C]"
                />
                <button
                  type="submit"
                  className="p-2 bg-[#0F382C] text-white font-bold rounded-xl hover:bg-[#16503f] transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setChatWidgetOpen(!chatWidgetOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#0F382C] hover:bg-[#16503f] text-white font-bold text-xs shadow-xl hover:scale-105 transition-all cursor-pointer border border-emerald-700/30"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>BrandDNA AI Copilot</span>
        </button>
      </div>

    </div>
  );
};

