import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Target,
  Megaphone,
  FileText,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Share2,
  Download
} from 'lucide-react';

export const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('brand');

  const tabs = [
    { id: 'brand', label: 'Brand Name', icon: Sparkles },
    { id: 'tagline', label: 'Tagline & Voice', icon: Target },
    { id: 'personality', label: 'Personality', icon: UserCheck },
    { id: 'strategy', label: 'Product Strategy', icon: TrendingUp },
    { id: 'marketing', label: 'Marketing Plan', icon: Megaphone },
    { id: 'report', label: 'Brand Report', icon: FileText },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden text-left font-sans">
      {/* Top Window Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          <span className="text-xs font-semibold text-slate-500 ml-2">BrandDNA AI Workspace v2.4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Active
          </span>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="border-b border-slate-100 bg-slate-50/50 p-2 flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Preview Content Canvas */}
      <div className="p-6 min-h-[300px] bg-slate-50/30">
        <AnimatePresence mode="wait">
          {activeTab === 'brand' && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">AI Suggestion #1</span>
                  <h3 className="text-2xl font-extrabold text-slate-900">AuraCraft AI</h3>
                  <p className="text-xs text-slate-500 mt-1">High memorability score: 98% • Domain available (.com)</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                  Verified Legal DNA
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="text-[11px] text-slate-400 font-medium uppercase">Brand Archetype</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">The Visionary Innovator</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/70">
                  <span className="text-[11px] text-slate-400 font-medium uppercase">Core Identity</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">Intelligent Automation</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tagline' && (
            <motion.div
              key="tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Generated Taglines</span>
                <div className="mt-3 space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-blue-200 text-slate-800 text-sm font-medium flex items-center justify-between">
                    <span>"Transforming Complexity into Pure Brand Clarity."</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 text-slate-600 text-sm hover:border-slate-300">
                    "AI Intelligence Built for Next-Gen Leaders."
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 text-slate-600 text-sm hover:border-slate-300">
                    "Smart Brands. Fast Execution. Zero Friction."
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'personality' && (
            <motion.div
              key="personality"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Brand Personality Matrix</span>
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Sophistication & Polish</span>
                    <span>94%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[94%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Authority & Trust</span>
                    <span>89%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[89%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Approachability & Heat</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[85%]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'strategy' && (
            <motion.div
              key="strategy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Product Roadmap & Positioning</span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-blue-600 font-bold">PHASE 1</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Core MVP Launch</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automated Identity Engine</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-emerald-600 font-bold">PHASE 2</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Legal Advisor</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">IP & Trademark Checks</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-amber-600 font-bold">PHASE 3</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Scale Analytics</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Global Market Expansion</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'marketing' && (
            <motion.div
              key="marketing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">GTM Multi-Channel Strategy</span>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">LinkedIn Authority Campaigns</h4>
                  <p className="text-[11px] text-slate-500">Thought leadership series targeting SaaS founders & VC executives</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">High Impact</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Product Hunt & Launch Viral Blitz</h4>
                  <p className="text-[11px] text-slate-500">Interactive live sandbox demo + early access pricing offer</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Scheduled</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Full Brand Blueprint 2026.pdf</h4>
                    <p className="text-xs text-slate-500">Includes personas, GTM strategy & legal compliance scorecard</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold bg-white text-blue-600 px-3 py-2 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-50 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
