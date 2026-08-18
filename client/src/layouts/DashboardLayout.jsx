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
    { sender: 'ai', text: 'Hello Benil! I am your BrandDNA AI Advisor (Enterprise White Edition). How can I assist your brand strategy today?' }
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
          text: `Analyzing "${userMsg}" against 14M USPTO trademark records & global competitor indexes. Key recommendation: Focus on high-barrier differentiation in tech positioning.`
        }
      ]);
    }, 1000);
  };

  return (
    <div className="h-screen bg-[#EAF4F7] flex text-slate-900 font-sans selection:bg-slate-900 selection:text-white relative overflow-hidden">

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
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {chatWidgetOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden glass-panel"
            >
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">BrandDNA Copilot</h3>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setChatWidgetOpen(false)}
                  className="p-1 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Message area */}
              <div className="p-3 h-64 overflow-y-auto space-y-2.5 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white font-semibold rounded-br-none shadow-xs'
                          : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Form */}
              <form onSubmit={handleWidgetSend} className="p-2 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={widgetMessage}
                  onChange={(e) => setWidgetMessage(e.target.value)}
                  placeholder="Ask BrandDNA AI..."
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 rounded-xl px-3 py-1.5 outline-none focus:border-slate-900"
                />
                <button
                  type="submit"
                  className="p-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setChatWidgetOpen(!chatWidgetOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xl hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>BrandDNA AI Copilot</span>
        </button>
      </div>

    </div>
  );
};
