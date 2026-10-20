import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, FolderKanban, CheckCircle2, FileText, PieChart } from 'lucide-react';

export const StatCard = ({ icon: Icon, title, value, trend, trendType = 'up' }) => {
  return (
    <Card hoverEffect className="flex flex-col justify-between text-left p-5 md:p-6 border-[#E5E0D8]/90">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">{title}</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs">
            {Icon ? <Icon className="w-4 h-4" /> : <FolderKanban className="w-4 h-4" />}
          </div>
        </div>

        <p className="text-2xl font-extrabold text-[#0F291E] tracking-tight">{value}</p>
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
};

