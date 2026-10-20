import React from 'react';
import {
  Cpu,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  Server,
  TrendingUp,
  BarChart2,
  PieChart
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminAIUsagePage = () => {
  const dailyUsage = [
    { day: 'Mon', requests: 1200, failed: 2 },
    { day: 'Tue', requests: 1450, failed: 1 },
    { day: 'Wed', requests: 1600, failed: 4 },
    { day: 'Thu', requests: 1380, failed: 0 },
    { day: 'Fri', requests: 1750, failed: 3 },
    { day: 'Sat', requests: 950, failed: 0 },
    { day: 'Sun', requests: 1100, failed: 2 }
  ];

  const featureUsage = [
    { name: 'Brand Identity', value: 42, color: '#2563EB' },
    { name: 'Product Strategy', value: 20, color: '#7C3AED' },
    { name: 'Customer Persona', value: 15, color: '#D97706' },
    { name: 'Marketing Planner', value: 11, color: '#059669' },
    { name: 'SWOT Analysis', value: 8, color: '#0EA5E9' },
    { name: 'Report Generation', value: 4, color: '#64748B' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
            Neural Infrastructure Monitoring
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight mt-1">
            AI Usage & Telemetry Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor AI request volumes, response times, error rates, and feature popularity across OpenAI & Claude models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI API Status: Operational
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Total AI Requests</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F291E]">42,890</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">+28% this month</span>
        </div>

        <div className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Requests Today</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F291E]">1,420</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Peak 140 req/hr</span>
        </div>

        <div className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F291E]">180ms</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Optimal Latency</span>
        </div>

        <div className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Failed AI Requests</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F291E]">12</div>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">0.02% Error Rate</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Request Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#0F291E] flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Daily AI Request Volume</span>
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="requests" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Popularity Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#0F291E] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" />
            <span>AI Feature Usage Distribution</span>
          </h3>

          <div className="space-y-3 pt-2">
            {featureUsage.map((f) => (
              <div key={f.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F291E]/90">{f.name}</span>
                  <span className="font-mono font-bold text-slate-600">{f.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-[#E5E0D8]">
                  <div className="h-full rounded-full" style={{ width: `${f.value}%`, backgroundColor: f.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

