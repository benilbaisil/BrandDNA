import React from 'react';
import { Card } from '../ui/Card';
import { ShieldCheck, Crosshair, BarChart3, Bot, Zap, Clock } from 'lucide-react';

export const ComingSoonSection = () => {
  const upcoming = [
    { name: 'Competitor Intelligence', desc: 'Real-time AI monitoring of competitor positioning gaps.', icon: Crosshair },
    { name: 'Brand DNA Score', desc: 'Algorithmic 0-100 brand strength and memorability index.', icon: Zap },
    { name: 'Legal Advisory', desc: 'Automated USPTO trademark & copyright risk checks.', icon: ShieldCheck },
    { name: 'Brand Advisor AI', desc: 'Interactive 24/7 conversational brand strategist.', icon: Bot },
    { name: 'Analytics Suite', desc: 'Customer sentiment tracking & campaign performance.', icon: BarChart3 },
  ];

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#0F291E] tracking-tight">Upcoming AI Modules</h3>
        <span className="text-xs font-semibold text-slate-400">Roadmap 2026</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {upcoming.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="flex flex-col justify-between p-4 bg-[#FAF8F5]/60 border-[#E5E0D8]/70">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Coming Soon
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#0F291E]/90 leading-tight">{item.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E5E0D8]/50 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                <Clock className="w-3 h-3" />
                <span>Q3 Release</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

