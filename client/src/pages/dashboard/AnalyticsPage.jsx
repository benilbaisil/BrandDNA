import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Eye,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
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
  ResponsiveContainer
} from 'recharts';

export const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('6m');

  // Sample HD analytics dataset
  const growthData = [
    { month: 'Jan', brandScore: 68, marketShare: 12, legalConfidence: 85 },
    { month: 'Feb', brandScore: 74, marketShare: 18, legalConfidence: 89 },
    { month: 'Mar', brandScore: 81, marketShare: 24, legalConfidence: 91 },
    { month: 'Apr', brandScore: 86, marketShare: 31, legalConfidence: 94 },
    { month: 'May', brandScore: 90, marketShare: 39, legalConfidence: 96 },
    { month: 'Jun', brandScore: 94, marketShare: 46, legalConfidence: 98.2 }
  ];

  const acquisitionData = [
    { channel: 'Direct / Founders', count: 420 },
    { channel: 'Investor Referrals', count: 310 },
    { channel: 'Search & SEO', count: 280 },
    { channel: 'Social & Twitter', count: 190 },
    { channel: 'Legal Partners', count: 150 }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
            Performance Metrics & Velocity
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Deep Brand Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor brand score progression, customer acquisition velocity, and legal confidence over time.
          </p>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl self-start sm:self-auto shadow-2xs">
          {['1m', '3m', '6m', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                timeRange === range
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Large Chart: Brand Score & Legal Confidence Trajectory */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Brand DNA Score Trajectory</span>
            </h3>
            <p className="text-xs text-slate-500">6-Month historical growth trajectory vs trademark safety confidence.</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1 text-blue-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600" /> Brand Score
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> Legal Confidence
            </span>
          </div>
        </div>

        {/* HD Responsive Recharts Area Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLegal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 11 }} domain={[50, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }}
              />
              <Area type="monotone" dataKey="brandScore" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorBrand)" />
              <Area type="monotone" dataKey="legalConfidence" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorLegal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: Customer Insights & Acquisition Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Acquisition Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Audience Acquisition Channels</span>
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={acquisitionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis dataKey="channel" type="category" stroke="#64748B" tick={{ fill: '#475569', fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }}
                />
                <Bar dataKey="count" fill="#0F172A" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Persona Demographics */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Customer Persona Drivers</span>
            </h3>
            <p className="text-xs text-slate-500">Core psychological motivations of target users.</p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Demand for Legal Certainty', val: 94 },
              { label: 'Speed-to-Market Priority', val: 89 },
              { label: 'Minimalist Premium Aesthetics', val: 96 },
              { label: 'Investor Deck Readyness', val: 82 }
            ].map((driver, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{driver.label}</span>
                  <span className="font-mono text-slate-500 font-bold">{driver.val}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{ width: `${driver.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <span className="text-[11px] text-blue-600 font-mono font-bold">100% Verified by AI Persona Model</span>
          </div>
        </div>

      </div>

    </div>
  );
};
