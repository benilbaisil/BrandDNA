import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Building2,
  Sparkles,
  Cpu,
  FileText,
  TrendingUp,
  Activity,
  Layers
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

export const AdminAnalyticsPage = () => {
  const [analyticsTab, setAnalyticsTab] = useState('user');

  const userGrowth = [
    { month: 'Jan', totalUsers: 850, activeUsers: 600, newRegs: 110 },
    { month: 'Feb', totalUsers: 960, activeUsers: 680, newRegs: 130 },
    { month: 'Mar', totalUsers: 1090, activeUsers: 750, newRegs: 160 },
    { month: 'Apr', totalUsers: 1280, activeUsers: 840, newRegs: 210 }
  ];

  const industryBreakdown = [
    { industry: 'Technology', count: 180 },
    { industry: 'Healthcare', count: 95 },
    { industry: 'Finance', count: 85 },
    { industry: 'Retail', count: 50 },
    { industry: 'Education', count: 40 }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
            Platform Operations & Macro Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Admin Analytics Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cross-platform telemetry across Users, Startups, Projects, AI Requests, and Report Generation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
          {[
            { id: 'user', label: 'User Analytics' },
            { id: 'startup', label: 'Startup Analytics' },
            { id: 'project', label: 'Project Analytics' },
            { id: 'ai', label: 'AI Analytics' },
            { id: 'report', label: 'Report Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAnalyticsTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                analyticsTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Body */}
      {analyticsTab === 'user' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500">Total Registered Users</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">1,280</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">+14% growth rate</span>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500">New Registrations</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">210</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">This month</span>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500">Active Monthly Users</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">840</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">65.6% Retention</span>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500">User Growth Factor</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">3.4x</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Quarterly Velocity</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">User Growth & Active Session Trajectory</h3>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="totalUsers" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="activeUsers" stroke="#059669" fill="#059669" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {analyticsTab === 'startup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500">Total Startup Profiles</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">450</div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500">Most Popular Industry</span>
              <div className="text-2xl font-extrabold text-purple-600 mt-1">Technology</div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-500">Avg Profile Completion</span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">86.4%</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Startups by Industry Sector</h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={industryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="industry" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {analyticsTab === 'project' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Project Telemetry</h3>
          <p className="text-xs text-slate-500">Total Projects Created: <strong>3,890</strong> • Average 8.6 projects per startup.</p>
        </div>
      )}

      {analyticsTab === 'ai' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900">AI Request Popularity</h3>
          <p className="text-xs text-slate-500">Total Requests: <strong>42,890</strong> • Error Rate: <strong>0.02%</strong></p>
        </div>
      )}

      {analyticsTab === 'report' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Report Deliverable Analytics</h3>
          <p className="text-xs text-slate-500">Reports Generated: <strong>2,410</strong> • Reports Downloaded: <strong>1,980 (82%)</strong></p>
        </div>
      )}

    </div>
  );
};
