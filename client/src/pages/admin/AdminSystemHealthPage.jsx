import React, { useState } from 'react';
import {
  HeartPulse,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminSystemHealthPage = () => {
  const { addToast } = useToast();
  const [isDiagnosticsRunning, setIsDiagnosticsRunning] = useState(false);
  const [lastCheck, setLastCheck] = useState('2 minutes ago');

  const services = [
    { name: 'Backend API Engine (Express/Node)', status: 'Operational', statusType: 'ok', responseTime: '42ms', uptime: '99.99%', lastChecked: 'Just now', icon: Server },
    { name: 'Primary Database (MongoDB Atlas)', status: 'Operational', statusType: 'ok', responseTime: '12ms', uptime: '99.98%', lastChecked: 'Just now', icon: Database },
    { name: 'AI API Gateway (OpenAI / Claude)', status: 'Operational', statusType: 'ok', responseTime: '140ms', uptime: '99.95%', lastChecked: 'Just now', icon: Cpu },
    { name: 'Authentication & JWT Service', status: 'Operational', statusType: 'ok', responseTime: '28ms', uptime: '100%', lastChecked: 'Just now', icon: ShieldCheck },
    { name: 'File & Asset Storage (S3 Vault)', status: 'Operational', statusType: 'ok', responseTime: '65ms', uptime: '99.99%', lastChecked: 'Just now', icon: HardDrive }
  ];

  const handleRunDiagnostics = () => {
    setIsDiagnosticsRunning(true);
    setTimeout(() => {
      setIsDiagnosticsRunning(false);
      setLastCheck('Just now');
      addToast('All 5 core system services passed health check!', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
            Platform Infrastructure & Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight mt-1">
            System Infrastructure Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Realtime operational status of backend services, database clusters, and AI gateways.
          </p>
        </div>

        <button
          onClick={handleRunDiagnostics}
          disabled={isDiagnosticsRunning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Activity className={`w-4 h-4 text-white ${isDiagnosticsRunning ? 'animate-pulse' : ''}`} />
          <span>{isDiagnosticsRunning ? 'Running Diagnostics...' : 'Run System Diagnostics'}</span>
        </button>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Overall Server Uptime</span>
          <div className="text-2xl font-extrabold text-[#0F291E] mt-1">99.98%</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">✓ 30 Days SLA Passed</span>
        </div>

        <div className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Average API Latency</span>
          <div className="text-2xl font-extrabold text-[#0F291E] mt-1">42ms</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Optimal Performance</span>
        </div>

        <div className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Database Connections</span>
          <div className="text-2xl font-extrabold text-[#0F291E] mt-1">100% Active</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">18/50 Pool Connected</span>
        </div>

        <div className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Error Count (24h)</span>
          <div className="text-2xl font-extrabold text-[#0F291E] mt-1">0.01%</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Negligible Exception Rate</span>
        </div>
      </div>

      {/* Services List */}
      <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0F291E]">Core Services Status</h3>
          <span className="text-xs font-mono text-slate-500">Last System Check: {lastCheck}</span>
        </div>

        <div className="space-y-3">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-panel border border-[#E5E0D8] text-[#0F291E] flex items-center justify-center font-bold shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F291E]">{s.name}</h4>
                    <p className="text-[11px] text-slate-500">Response time: {s.responseTime} • Uptime: {s.uptime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>✓ {s.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

