import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const AdminStatCard = ({ icon: Icon, title, value, change, isPositive = true, trendData = [30, 45, 35, 55, 70, 85] }) => {
  return (
    <Card hoverEffect className="flex flex-col justify-between text-left p-5 border-slate-200/90">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">{title}</span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-2xs">
            {Icon && <Icon className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          
          {change && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          )}
        </div>
      </div>

      {/* Small Trend Chart Visual */}
      <div className="mt-4 pt-2 border-t border-slate-100 flex items-end gap-1 h-6">
        {trendData.map((val, idx) => (
          <div
            key={idx}
            style={{ height: `${val}%` }}
            className={`flex-1 rounded-xs transition-all ${
              isPositive ? 'bg-blue-600/70 hover:bg-blue-600' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </Card>
  );
};
