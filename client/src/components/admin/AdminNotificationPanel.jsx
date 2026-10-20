import React from 'react';
import { Card } from '../ui/Card';
import { Bell, ShieldAlert, CheckCircle2, AlertTriangle, UserPlus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminNotificationPanel = () => {
  const { addToast } = useToast();

  const notifications = [
    { id: 1, title: 'New User Registered', desc: 'Sarah Founder joined BrandDNA AI', type: 'info', icon: UserPlus, color: 'text-blue-600 bg-blue-50' },
    { id: 2, title: 'Failed Login Attempts', desc: '3 invalid password attempts on admin account', type: 'warning', icon: ShieldAlert, color: 'text-amber-600 bg-amber-50' },
    { id: 3, title: 'AI API Status', desc: 'OpenAI & Claude LLM gateways operating at 100%', type: 'success', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { id: 4, title: 'System Alert', desc: 'MongoDB Atlas connection pool healthy (12/100 active connections)', type: 'system', icon: AlertTriangle, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#0F291E] text-white flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">System Notifications</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Alerts, Security & Gateway Health</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={() => addToast(`Notification selected: ${n.title}`, 'info')}
              className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 hover:border-slate-300 cursor-pointer transition-colors flex items-start gap-3 text-xs"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0F291E] leading-snug">{n.title}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{n.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

