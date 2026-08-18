import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Sparkles,
  Package,
  Users,
  Megaphone,
  FileText,
  Settings,
  Scale,
  BarChart3,
  Bot,
  Layers,
  ArrowRight,
  X,
  Zap
} from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'dash', name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Navigation', shortcut: 'G D' },
    { id: 'brand', name: 'Brand Studio & AI Analyzer', path: '/brand-identity', icon: Sparkles, category: 'AI Tools', shortcut: 'G B' },
    { id: 'prod', name: 'Product Strategy & Roadmap', path: '/product-strategy', icon: Package, category: 'Strategy', shortcut: 'G P' },
    { id: 'comp', name: 'Competitor Intelligence Radar', path: '/competitors', icon: Users, category: 'Intelligence', shortcut: 'G C' },
    { id: 'ai', name: 'AI Advisor Chatbot', path: '/ai-chat', icon: Bot, category: 'AI Tools', shortcut: 'G A' },
    { id: 'legal', name: 'Legal Advisory & Trademark Clearance', path: '/legal', icon: Scale, category: 'Legal', shortcut: 'G L' },
    { id: 'mkt', name: 'Marketing Campaign Planner', path: '/marketing-planner', icon: Megaphone, category: 'Marketing', shortcut: 'G M' },
    { id: 'reports', name: 'Generate Executive PDF Report', path: '/reports', icon: FileText, category: 'Reports', shortcut: 'G R' },
    { id: 'analytics', name: 'Deep Performance Analytics', path: '/analytics', icon: BarChart3, category: 'Analytics', shortcut: 'G N' },
    { id: 'design', name: 'Design System & Component Library', path: '/design-system', icon: Layers, category: 'Developer', shortcut: 'G S' },
    { id: 'settings', name: 'Workspace Settings & AI Model', path: '/settings', icon: Settings, category: 'System', shortcut: 'G T' },
  ];

  const filtered = actions.filter((action) =>
    action.name.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-900"
        >
          {/* Header Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search workspace..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-700 mr-2">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
              ESC
            </kbd>
          </div>

          {/* List Results */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No matching commands found for "{query}"
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/80 hover:border-slate-200 border border-transparent transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.shortcut}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-600 shadow-2xs">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-600 shadow-2xs">↵</kbd> Select
              </span>
            </div>
            <span className="flex items-center gap-1 text-slate-900 font-mono font-semibold">
              <Zap className="w-3 h-3 text-blue-600" /> BrandDNA Enterprise Active
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
