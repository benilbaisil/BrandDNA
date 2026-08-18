import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Sparkles,
  Calendar,
  Send,
  Target,
  Users,
  TrendingUp,
  Share2,
  CheckCircle2,
  Plus
} from 'lucide-react';

export const MarketingPlannerPage = () => {
  const campaigns = [
    { title: 'Product Hunt Launch', channel: 'Product Hunt & Twitter', status: 'Active', reach: '45,000 Impressions', conversion: '12.4%' },
    { title: 'Investor Pitch Campaign', channel: 'LinkedIn & Direct VC Mail', status: 'Scheduled', reach: '1,200 Targeted VCs', conversion: '35.0%' },
    { title: 'Legal & Trademark SEO', channel: 'Search & Blog Content', status: 'Evergreen', reach: '18,500 Monthly Organic', conversion: '8.2%' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Acquisition & Growth Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Marketing & Campaign Planner
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Multi-channel content strategy, launch campaign timeline, and messaging architecture.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all self-start sm:self-auto shadow-md shadow-white/10">
          <Sparkles className="w-4 h-4 text-black" />
          <span>Generate AI Campaign</span>
        </button>
      </div>

      {/* Messaging Architecture Card */}
      <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-white" />
          <span>Key Messaging Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Core Hook</span>
            <h4 className="text-xs font-bold text-white">"AI Brand Intelligence with Zero Legal Collision Risk."</h4>
            <p className="text-[11px] text-zinc-400">Pitches total protection alongside sleek design.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Secondary Hook</span>
            <h4 className="text-xs font-bold text-white">"Build Unforgettable Brands for Investors."</h4>
            <p className="text-[11px] text-zinc-400">Appeals directly to startup founders raising capital.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Call To Action</span>
            <h4 className="text-xs font-bold text-white">"Analyze Your Brand in 60 Seconds →"</h4>
            <p className="text-[11px] text-zinc-400">High velocity conversion trigger.</p>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-white" />
            <span>Active Marketing Campaigns</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Channels</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Estimated Reach</th>
                <th className="py-3 px-4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.map((c, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{c.title}</td>
                  <td className="py-3.5 px-4 text-zinc-300">{c.channel}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] border border-white/20">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300 font-mono">{c.reach}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{c.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
