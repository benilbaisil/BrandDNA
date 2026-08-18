import React from 'react';
import { Card } from '../ui/Card';
import { Users, Activity, FolderKanban, FileText, HardDrive, BarChart3 } from 'lucide-react';

export const AdminSystemAnalytics = () => {
  const metrics = [
    { label: 'Registered Users', value: '1,280', change: '+12% MoM', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Daily Active Users (DAU)', value: '342', change: '+8% vs yesterday', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Monthly Active Users (MAU)', value: '1,150', change: '89% Retention', icon: Activity, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Projects Created', value: '3,890', change: '+18% this week', icon: FolderKanban, color: 'text-amber-600 bg-amber-50' },
    { label: 'Reports Generated', value: '2,410', change: '+22% growth', icon: FileText, color: 'text-purple-600 bg-purple-50' },
    { label: 'Storage Usage', value: '48.2 GB / 500 GB', change: '9.6% Capacity', icon: HardDrive, color: 'text-slate-700 bg-slate-100' },
  ];

  return (
    <Card hoverEffect className="text-left border-slate-200/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">System Analytics</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Platform Usage & Capacity Infrastructure</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{m.value}</p>
                <span className="text-[10px] font-semibold text-emerald-600">{m.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
