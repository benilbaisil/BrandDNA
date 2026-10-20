import React from 'react';
import { Card } from '../ui/Card';
import { Cpu, Zap, Clock, Users, Sparkles } from 'lucide-react';

export const AdminAIUsageCard = () => {
  const topUsers = [
    { name: 'Sarah Founder (AuraCraft AI)', requests: 142 },
    { name: 'Elena Venture (Synthetix)', requests: 98 },
    { name: 'Alex Product (Novaflow)', requests: 74 },
  ];

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">AI Usage Analytics</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time LLM API Traffic & Latency Metrics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Daily AI Requests</span>
            <Zap className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-[#0F291E]">1,482</p>
          <span className="text-[10px] font-semibold text-emerald-600">+14% vs yesterday</span>
        </div>

        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Monthly AI Requests</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-[#0F291E]">42,890</p>
          <span className="text-[10px] font-semibold text-emerald-600">+28% this month</span>
        </div>

        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Most Used Feature</span>
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-[#0F291E] mt-1">Brand Identity Generator</p>
          <span className="text-[10px] font-medium text-slate-500">48% of total volume</span>
        </div>

        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Gen Time</span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-[#0F291E]">2.14 sec</p>
          <span className="text-[10px] font-semibold text-emerald-600">-0.4s optimization</span>
        </div>
      </div>

      {/* Top Active AI Users */}
      <div className="p-4 bg-[#FAF8F5]/70 rounded-2xl border border-[#E5E0D8]/60 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-500 font-semibold text-[10px] uppercase tracking-wider pb-1 border-b border-[#E5E0D8]/60">
          <span>Top Active Users</span>
          <span>Requests Generated</span>
        </div>
        {topUsers.map((u, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <span className="font-bold text-[#0F291E]/90">{u.name}</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{u.requests} gens</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

