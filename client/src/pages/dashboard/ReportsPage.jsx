import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Share2,
  Check,
  Eye,
  Printer,
  Sparkles,
  ShieldCheck,
  Dna,
  BarChart2,
  CheckSquare,
  Square
} from 'lucide-react';

export const ReportsPage = () => {
  const [selectedModules, setSelectedModules] = useState({
    executiveSummary: true,
    brandDNA: true,
    colorPsychology: true,
    trademarkRisk: true,
    competitorRadar: true,
    financialGrowth: false
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const toggleModule = (key) => {
    setSelectedModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Executive BrandDNA AI PDF Report downloaded successfully!');
    }, 1500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
            Investor & Board Deliverables
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight mt-1">
            Executive Report Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate printable, high-resolution PDF decks with live brand intelligence & trademark proofs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel border border-[#E5E0D8] text-slate-700 text-xs font-bold hover:bg-[#FAF8F5] transition-colors shadow-2xs"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedShare ? 'Link Copied' : 'Share Deck'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xs"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isGenerating ? 'Compiling PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Module Customization Options */}
        <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#0F291E] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Select Report Modules</span>
          </h3>
          <p className="text-xs text-slate-500">Customize the compiled chapters before exporting PDF.</p>

          <div className="space-y-2 pt-2">
            {[
              { key: 'executiveSummary', label: 'Executive Summary & Brand Score' },
              { key: 'brandDNA', label: 'Brand DNA Archetype & Voice Pillars' },
              { key: 'colorPsychology', label: 'Color Psychology & Contrast Ratios' },
              { key: 'trademarkRisk', label: 'USPTO Trademark Clearance Proof' },
              { key: 'competitorRadar', label: '2D Competitor Positioning Matrix' },
              { key: 'financialGrowth', label: 'Market Opportunity & Growth Forecast' }
            ].map((mod) => (
              <div
                key={mod.key}
                onClick={() => toggleModule(mod.key)}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] hover:border-slate-300 cursor-pointer flex items-center justify-between text-xs select-none transition-colors"
              >
                <span className="text-[#0F291E]/90 font-medium">{mod.label}</span>
                {selectedModules[mod.key] ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Live Interactive PDF Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F291E] flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>PDF Live Page Preview</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Page 1 of 12 • Standard A4</span>
          </div>

          {/* Paper Sheet Preview Container */}
          <div className="p-8 rounded-2xl glass-panel text-[#0F291E] shadow-lg border border-slate-300 space-y-6 min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F291E] text-white flex items-center justify-center font-bold">
                  <Dna className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#0F291E] tracking-tight">BrandDNA AI</h2>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Confidential Executive Report</span>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                <div>Date: August 2026</div>
                <div>Target: Aura AI Corp</div>
              </div>
            </div>

            {/* Title Section */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Brand Intelligence Audit</span>
              <h1 className="text-2xl font-black text-[#0F291E]">
                Aura AI: Global Strategy & Legal Clearance Deck
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prepared by BrandDNA Autonomous AI System. This document contains verified USPTO trademark clearance scores, brand archetype pillars, color contrast ratios, and competitor positioning matrices.
              </p>
            </div>

            {/* Metrics Overview in PDF preview */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Overall Score</span>
                <div className="text-lg font-black text-[#0F291E]">94 / 100</div>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Trademark Risk</span>
                <div className="text-lg font-black text-emerald-600">1.8% (Passed)</div>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Market Moat</span>
                <div className="text-lg font-black text-purple-600">High (Top 3%)</div>
              </div>
            </div>

            {/* Content Preview Blocks */}
            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <h3 className="font-bold text-[#0F291E] text-sm border-b border-[#E5E0D8] pb-1">1. Brand DNA & Archetype</h3>
              <p className="text-[11px] leading-normal text-slate-600">
                Aura AI embodies **The Visionary Creator** archetype. Tone is direct, luxurious, and authoritative, striking a perfect balance between software speed and legal safety.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

