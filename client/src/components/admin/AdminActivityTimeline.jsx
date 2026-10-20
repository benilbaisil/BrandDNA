import React from 'react';
import { Card } from '../ui/Card';
import { UserPlus, Building2, Sparkles, Megaphone, Download, Clock } from 'lucide-react';

export const AdminActivityTimeline = () => {
  const activities = [
    { id: 1, title: 'New User Registered: Sarah Founder (sarah@company.com)', time: '5 mins ago', icon: UserPlus, color: 'text-blue-600 bg-blue-50' },
    { id: 2, title: 'Startup Profile Created: AuraCraft AI', time: '25 mins ago', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
    { id: 3, title: 'Brand Identity Generated for Novaflow Cloud', time: '1 hour ago', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
    { id: 4, title: 'Marketing Plan Generated for Synthetix Data', time: '3 hours ago', icon: Megaphone, color: 'text-purple-600 bg-purple-50' },
    { id: 5, title: 'Report Downloaded: BrandDNA_Audit_AuraCraft.pdf', time: '5 hours ago', icon: Download, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">Recent Platform Activities</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time System Audit Event Stream</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {activities.map((act, index) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="flex items-start gap-3 relative text-xs">
              {index !== activities.length - 1 && (
                <span className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-100" />
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${act.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0F291E] leading-snug">{act.title}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{act.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

