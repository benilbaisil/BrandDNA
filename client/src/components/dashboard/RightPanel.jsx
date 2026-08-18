import React from 'react';
import { Card } from '../ui/Card';
import { Lightbulb, Bell, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const RightPanel = () => {
  const { addToast } = useToast();

  const notifications = [
    { id: 1, title: 'AI Brand Identity Generated', time: '10m ago' },
    { id: 2, title: 'PDF Strategy Report Ready', time: '1h ago' },
    { id: 3, title: 'Trademark Availability Check Passed', time: '3h ago' },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Today's Tip */}
      <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-blue-100 p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Today's Tip</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
          "Strong brands communicate one clear message consistently across every touchpoint."
        </p>
      </Card>

      {/* Recent Notifications */}
      <Card className="border-slate-200/90 p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900">Recent Notifications</h4>
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">3 New</span>
        </div>

        <div className="space-y-2.5 pt-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => addToast(`Opening notification: ${n.title}`, 'info')}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-slate-300 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Features */}
      <Card className="border-slate-200/90 p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900">Upcoming Features</h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>AI Competitor Benchmark</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Live Pitch Deck Export</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Automated Legal Trademark Scanner</span>
          </div>
        </div>
      </Card>

    </div>
  );
};
