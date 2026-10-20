import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Building2, Sparkles, Cpu, FileText, Activity } from 'lucide-react';
import { adminService } from '../../services/adminService';

import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { AdminUserTable } from '../../components/admin/AdminUserTable';
import { AdminStartupTable } from '../../components/admin/AdminStartupTable';
import { AdminProjectTable } from '../../components/admin/AdminProjectTable';
import { AdminReportsTable } from '../../components/admin/AdminReportsTable';
import { AdminAIUsageCard } from '../../components/admin/AdminAIUsageCard';
import { AdminSystemAnalytics } from '../../components/admin/AdminSystemAnalytics';
import { AdminIndustryChart } from '../../components/admin/AdminIndustryChart';
import { AdminActivityTimeline } from '../../components/admin/AdminActivityTimeline';
import { AdminNotificationPanel } from '../../components/admin/AdminNotificationPanel';
import { AdminQuickActionCard } from '../../components/admin/AdminQuickActionCard';
import { AdminSettingsCard } from '../../components/admin/AdminSettingsCard';
import { AdminProfileCard } from '../../components/admin/AdminProfileCard';
import { AdminFooter } from '../../components/admin/AdminFooter';

export const AdminDashboardPage = () => {
  const { searchQuery, activeTab, setActiveTab } = useOutletContext() || {};
  const [statsData, setStatsData] = useState({
    totalUsers: '1,280',
    totalStartups: '450',
    totalProjects: '3,890',
    totalAIGenerations: '42,890',
    totalReports: '2,410',
    activeUsersToday: '342',
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res && res.success && res.data) {
          setStatsData({
            totalUsers: String(res.data.totalUsers || 1280),
            totalStartups: String(res.data.totalStartups || 450),
            totalProjects: String(res.data.totalProjects || 3890),
            totalAIGenerations: String(res.data.totalAIGenerations || 42890),
            totalReports: String(res.data.totalReports || 2410),
            activeUsersToday: String(res.data.activeUsersToday || 342),
          });
        }
      } catch (err) {
        // Keep fallback stats
      }
    };
    loadStats();
  }, []);

  const stats = [
    { title: 'Total Users', value: statsData.totalUsers, change: '+12%', isPositive: true, icon: Users, trend: [30, 45, 60, 75, 90] },
    { title: 'Total Startup Profiles', value: statsData.totalStartups, change: '+8%', isPositive: true, icon: Building2, trend: [20, 35, 50, 65, 80] },
    { title: 'Total Branding Projects', value: statsData.totalProjects, change: '+18%', isPositive: true, icon: Sparkles, trend: [40, 50, 70, 85, 95] },
    { title: 'Total AI Generations', value: statsData.totalAIGenerations, change: '+24%', isPositive: true, icon: Cpu, trend: [25, 40, 65, 80, 100] },
    { title: 'Total Reports', value: statsData.totalReports, change: '+15%', isPositive: true, icon: FileText, trend: [15, 30, 45, 60, 75] },
    { title: 'Active Users Today', value: statsData.activeUsersToday, change: '+5%', isPositive: true, icon: Activity, trend: [50, 60, 70, 80, 90] },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminUserTable searchQuery={searchQuery} />;
      case 'startups':
        return <AdminStartupTable />;
      case 'projects':
        return <AdminProjectTable />;
      case 'reports':
        return <AdminReportsTable />;
      case 'industries':
        return <AdminIndustryChart />;
      case 'ai-usage':
        return <AdminAIUsageCard />;
      case 'system-analytics':
        return <AdminSystemAnalytics />;
      case 'settings':
        return <AdminSettingsCard />;
      case 'profile':
        return <AdminProfileCard />;
      case 'overview':
      default:
        return (
          <div className="space-y-8">
            {/* 6 Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {stats.map((s, index) => (
                <AdminStatCard
                  key={index}
                  icon={s.icon}
                  title={s.title}
                  value={s.value}
                  change={s.change}
                  isPositive={s.isPositive}
                  trendData={s.trend}
                />
              ))}
            </div>

            {/* Split Grid: Main Content & Right Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (8 Spans) */}
              <div className="lg:col-span-8 space-y-8">
                <AdminUserTable searchQuery={searchQuery} />
                <AdminStartupTable />
                <AdminProjectTable />
                <AdminReportsTable />
                <AdminAIUsageCard />
                <AdminSystemAnalytics />
                <AdminIndustryChart />
                <AdminActivityTimeline />
              </div>

              {/* Right Panel (4 Spans) */}
              <div className="lg:col-span-4 space-y-8">
                <AdminQuickActionCard onNavigateTab={(tab) => setActiveTab(tab)} />
                <AdminNotificationPanel />
                <AdminSettingsCard />
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left">
      {renderContent()}
      <AdminFooter />
    </div>
  );
};

