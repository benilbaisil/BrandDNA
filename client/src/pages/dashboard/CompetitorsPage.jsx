import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Radar as RadarIcon,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  Layers,
  Search,
  Filter
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

export const CompetitorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Radar chart comparison data across 5 dimensions
  const radarData = [
    { subject: 'AI Intelligence', BrandDNA: 98, Linear: 65, Perplexity: 85, OpenAI: 92 },
    { subject: 'Legal Clearance', BrandDNA: 99, Linear: 20, Perplexity: 40, OpenAI: 30 },
    { subject: 'Brand Strategy', BrandDNA: 95, Linear: 80, Perplexity: 70, OpenAI: 75 },
    { subject: 'Usability/UX', BrandDNA: 96, Linear: 94, Perplexity: 88, OpenAI: 85 },
    { subject: 'Speed & Speed-to-Market', BrandDNA: 94, Linear: 90, Perplexity: 92, OpenAI: 89 }
  ];

  // Competitor Matrix Table Data
  const competitors = [
    {
      name: 'BrandDNA AI',
      category: 'Autonomous Brand Intelligence & Legal OS',
      similarity: 'Self (Target)',
      strengths: ['14M USPTO Database', 'Generative DNA System', 'Investor PDF Decks'],
      weaknesses: ['New Market Entrant'],
      priceTier: 'Enterprise ($99/mo)',
      innovationScore: 98
    },
    {
      name: 'Perplexity Enterprise',
      category: 'AI Answer Engine & Research',
      similarity: '62% Overlap',
      strengths: ['Fast Web Search', 'Citation Indexing'],
      weaknesses: ['No Trademark Clearance', 'Generic UI Templates'],
      priceTier: 'Pro ($200/mo)',
      innovationScore: 88
    },
    {
      name: 'Linear AI Studio',
      category: 'Issue Tracking & Project OS',
      similarity: '45% Overlap',
      strengths: ['Ultra-fast Keyboard UX', 'Developer API'],
      weaknesses: ['No Brand Psychology', 'No Legal Advisory'],
      priceTier: 'Standard ($12/user)',
      innovationScore: 82
    },
    {
      name: 'Notion AI Enterprise',
      category: 'Workspace & Knowledge Base',
      similarity: '52% Overlap',
      strengths: ['Doc Organization', 'Flexible Blocks'],
      weaknesses: ['No Competitor Radar', 'Manual Strategy Templates'],
      priceTier: 'Enterprise ($20/user)',
      innovationScore: 78
    }
  ];

  const filteredCompetitors = competitors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
            Competitor Intelligence & Positioning
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight mt-1">
            Market Competitor Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Realtime competitor benchmarking across AI capability, trademark protection, and design UX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-mono font-bold">
            4 Competitors Tracked
          </span>
        </div>
      </div>

      {/* Top 2 Columns: Radar Chart & 2D Positioning Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart Card */}
        <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F291E] flex items-center gap-2">
              <RadarIcon className="w-4 h-4 text-blue-600" />
              <span>Multi-Axis Competitor Radar</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Scores out of 100</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" stroke="#64748B" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" />
                <Radar name="BrandDNA AI" dataKey="BrandDNA" stroke="#0F172A" fill="#0F172A" fillOpacity={0.3} />
                <Radar name="Perplexity" dataKey="Perplexity" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
                <Radar name="Linear" dataKey="Linear" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2D Brand Positioning Graph & Market Gap */}
        <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#0F291E] flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span>2D Brand Positioning Matrix</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Unclaimed Market Gap
              </span>
            </div>
            <p className="text-xs text-slate-500">
              High Innovation + Legal Advisory quadrant is currently 100% owned by BrandDNA AI.
            </p>
          </div>

          {/* Interactive 2D Graph Canvas representation */}
          <div className="relative h-64 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-4 flex flex-col justify-between">
            {/* Axis Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-slate-200" />
              <div className="h-full w-px bg-slate-200 absolute" />
            </div>

            {/* Axis Labels */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-600 glass-panel px-2 py-0.5 rounded border border-[#E5E0D8] shadow-2xs">
              High Innovation & Legal AI ↑
            </span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-600 glass-panel px-2 py-0.5 rounded border border-[#E5E0D8] shadow-2xs">
              Legacy Docs & Manual Strategy ↓
            </span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-600 glass-panel px-1 py-0.5 rounded border border-[#E5E0D8] shadow-2xs">
              ← Mass Market
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-600 glass-panel px-1 py-0.5 rounded border border-[#E5E0D8] shadow-2xs">
              Premium Enterprise →
            </span>

            {/* Positioning Nodes */}
            <div className="absolute top-8 right-12 flex items-center gap-1.5 bg-[#0F291E] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>BrandDNA AI</span>
            </div>

            <div className="absolute top-20 left-16 flex items-center gap-1.5 glass-panel border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full text-[11px] shadow-2xs">
              <span>Perplexity</span>
            </div>

            <div className="absolute bottom-16 right-20 flex items-center gap-1.5 glass-panel border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full text-[11px] shadow-2xs">
              <span>Linear</span>
            </div>

            <div className="absolute bottom-12 left-24 flex items-center gap-1.5 glass-panel border border-slate-300 text-slate-700 px-2.5 py-1 rounded-full text-[11px] shadow-2xs">
              <span>Notion AI</span>
            </div>
          </div>
        </div>

      </div>

      {/* Modern Comparison Table */}
      <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#0F291E]">Competitor Intelligence Breakdown</h3>
            <p className="text-xs text-slate-500">Detailed feature matrix, similarity score, strengths and weaknesses.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter competitor..."
                className="bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] placeholder-slate-400 rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-slate-500 font-mono text-[10px] uppercase bg-[#FAF8F5]/50">
                <th className="py-3 px-4">Platform Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Similarity Index</th>
                <th className="py-3 px-4">Key Strengths</th>
                <th className="py-3 px-4">Weaknesses</th>
                <th className="py-3 px-4">Innovation Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompetitors.map((comp) => (
                <tr key={comp.name} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0F291E] flex items-center gap-2">
                    {comp.name === 'BrandDNA AI' ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                    )}
                    {comp.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{comp.category}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] border border-[#E5E0D8]">
                      {comp.similarity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {comp.strengths.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                          +{s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {comp.weaknesses.map((w, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                          -{w}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {comp.innovationScore}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

