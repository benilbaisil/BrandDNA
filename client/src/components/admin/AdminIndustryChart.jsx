import React from 'react';
import { Card } from '../ui/Card';
import { PieChart, Layers } from 'lucide-react';

export const AdminIndustryChart = () => {
  const industries = [
    { name: 'Technology & AI', percentage: 42, color: 'bg-blue-600', text: 'text-blue-600' },
    { name: 'Healthcare & Biotech', percentage: 22, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { name: 'Education & EdTech', percentage: 14, color: 'bg-indigo-600', text: 'text-indigo-600' },
    { name: 'Retail & E-Commerce', percentage: 12, color: 'bg-amber-500', text: 'text-amber-600' },
    { name: 'Finance & Fintech', percentage: 7, color: 'bg-purple-600', text: 'text-purple-600' },
    { name: 'Others & Niche', percentage: 3, color: 'bg-slate-400', text: 'text-slate-500' },
  ];

  return (
    <Card hoverEffect className="text-left border-slate-200/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Industry Analytics</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Most Common Startup Industry Sectors</p>
          </div>
        </div>
      </div>

      {/* Visual Stack Progress Bar */}
      <div className="space-y-2">
        <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100">
          {industries.map((ind, i) => (
            <div
              key={i}
              style={{ width: `${ind.percentage}%` }}
              className={`${ind.color} transition-all hover:opacity-90`}
              title={`${ind.name}: ${ind.percentage}%`}
            />
          ))}
        </div>
      </div>

      {/* Grid Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
        {industries.map((ind, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={`w-2.5 h-2.5 rounded-full ${ind.color} shrink-0`} />
              <span className="font-semibold text-slate-800 truncate">{ind.name}</span>
            </div>
            <span className={`font-extrabold ${ind.text}`}>{ind.percentage}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
