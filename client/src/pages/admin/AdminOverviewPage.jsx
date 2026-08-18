import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Sparkles,
  FileText,
  UserCheck,
  UserPlus,
  Clock,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminOverviewPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStartups: 0,
    totalProjects: 0,
    totalReports: 0,
    activeUsersToday: 0,
    newUsersThisMonth: 0,
  });

  const [activities, setActivities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, actRes, indRes] = await Promise.all([
        adminService.getStats(),
        adminService.getActivities(),
        adminService.getIndustryAnalytics(),
      ]);

      if (statsRes && statsRes.data) setStats(statsRes.data);
      if (actRes && actRes.data) setActivities(actRes.data);
      if (indRes && indRes.data) setIndustries(indRes.data);
    } catch (err) {
      console.error('Failed to load admin stats from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    { title: 'Total Registered Users', value: stats.totalUsers, icon: Users, path: '/admin/users' },
    { title: 'Startup Profiles', value: stats.totalStartups, icon: Building2, path: '/admin/startups' },
    { title: 'Total Projects Created', value: stats.totalProjects, icon: Sparkles, path: '/admin/projects' },
    { title: 'PDF Reports Generated', value: stats.totalReports, icon: FileText, path: '/admin/reports' },
    { title: 'Active Users Today', value: stats.activeUsersToday, icon: UserCheck, path: '/admin/users' },
    { title: 'New Users This Month', value: stats.newUsersThisMonth, icon: UserPlus, path: '/admin/users' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-sans font-bold uppercase tracking-wider">
            Live Platform Telemetry
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight mt-2">
            Admin System Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time analytics and data metrics retrieved directly from MongoDB.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              onClick={() => navigate(kpi.path)}
              className="bg-white p-6 rounded-3xl border border-[#D6E6EC] hover:border-slate-900 shadow-2xs hover:shadow-md transition-all cursor-pointer group text-left space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                  {kpi.title}
                </span>
                <div className="w-9 h-9 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                {loading ? '...' : kpi.value}
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-slate-900 transition-colors pt-1">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Industry Breakdown & System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Industry Distribution */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-5">
          <h3 className="font-serif text-xl font-bold text-slate-900">Startup Industry Distribution</h3>

          {industries.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No industry data recorded in database yet.
            </div>
          ) : (
            <div className="space-y-4">
              {industries.map((ind, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{ind.name}</span>
                    <span className="font-mono text-slate-500 font-bold">{ind.count} ({ind.percentage}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#EAF4F7] rounded-full overflow-hidden border border-[#D6E6EC]">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${ind.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Activity Logs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-5">
          <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            <span>Recent System Activity Logs</span>
          </h3>

          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No activity logs recorded yet in database.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="p-3.5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                    <span className="text-[10px] text-slate-500">User: {act.user}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold">
                    {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
