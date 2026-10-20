import React, { useState } from 'react';
import {
  Bell,
  Check,
  Trash2,
  UserPlus,
  Building2,
  AlertTriangle,
  Server,
  Database,
  Cpu,
  CheckCheck
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminNotificationsPage = () => {
  const { addToast } = useToast();

  const [notificationsList, setNotificationsList] = useState([
    { id: 1, type: 'New user registration', title: 'New User Registered', desc: 'Sarah Jenkins registered account for Acme AI Labs', time: '10m ago', unread: true, category: 'user', icon: UserPlus, color: 'text-blue-600' },
    { id: 2, type: 'New startup created', title: 'New Startup Created', desc: 'Vectra Health Corp created brand profile', time: '1h ago', unread: true, category: 'startup', icon: Building2, color: 'text-purple-600' },
    { id: 3, type: 'Failed AI request', title: 'AI API Timeout Warning', desc: 'OpenAI endpoint experienced 450ms response spike', time: '3h ago', unread: false, category: 'ai', icon: Cpu, color: 'text-amber-600' },
    { id: 4, type: 'Database warning', title: 'MongoDB Pool High Memory', desc: 'Database connection pool reached 70% threshold', time: '5h ago', unread: false, category: 'db', icon: Database, color: 'text-rose-600' },
    { id: 5, type: 'API limit warning', title: 'Rate Limit Threshold Alert', desc: 'User David Chen reached 80% daily AI generation limit', time: '1d ago', unread: false, category: 'system', icon: AlertTriangle, color: 'text-amber-600' }
  ]);

  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
    addToast('All notifications marked as read.', 'info');
  };

  const handleMarkRead = (id) => {
    setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const handleDeleteNotification = (id) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
    addToast('Notification removed.', 'info');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
            System Events & Alerts Log
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight mt-1">
            Admin System Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Realtime alerts regarding user signups, AI API errors, database warnings, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel border border-[#E5E0D8] text-slate-700 text-xs font-bold hover:bg-[#FAF8F5] shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-3">
        {notificationsList.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                n.unread ? 'bg-amber-50/30 border-amber-200' : 'bg-[#FAF8F5] border-[#E5E0D8]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl glass-panel border border-[#E5E0D8] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Icon className={`w-4 h-4 ${n.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#0F291E]">{n.title}</h4>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{n.desc}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {n.unread && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F291E] hover:glass-panel"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:glass-panel"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

