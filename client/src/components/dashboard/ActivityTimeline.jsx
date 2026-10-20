import React from 'react';
import { Card } from '../ui/Card';
import { Sparkles, Package, Megaphone, Download, UserCheck, Activity } from 'lucide-react';

export const ActivityTimeline = () => {
  const activities = [
    { id: 1, title: 'Generated Brand Name', time: '10 mins ago', icon: Sparkles, color: 'text-blue-600 bg-blue-50' },
    { id: 2, title: 'Generated Product Strategy', time: '1 hour ago', icon: Package, color: 'text-indigo-600 bg-indigo-50' },
    { id: 3, title: 'Generated Marketing Plan', time: '3 hours ago', icon: Megaphone, color: 'text-amber-600 bg-amber-50' },
    { id: 4, title: 'Downloaded Report', time: 'Yesterday', icon: Download, color: 'text-emerald-600 bg-emerald-50' },
    { id: 5, title: 'Profile Updated', time: '2 days ago', icon: UserCheck, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">Recent AI Activities</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time Workspace Activity Log</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {activities.map((act, index) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="flex items-start gap-3 relative">
              {index !== activities.length - 1 && (
                <span className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-100" />
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${act.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-[#0F291E]">{act.title}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{act.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

