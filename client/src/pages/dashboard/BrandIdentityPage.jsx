import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Palette,
  Target,
  Zap,
  Building2,
  Users,
  Compass,
  FileCode,
  Globe,
  Award,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye,
  Lock
} from 'lucide-react';

export const BrandIdentityPage = () => {
  // Input Form State
  const [formData, setFormData] = useState({
    brandName: 'Aura AI',
    industry: 'Enterprise Software & AI',
    targetAudience: 'Founders, CTOs, & Product Leaders',
    description: 'An AI-powered autonomous brand intelligence and trademark advisory platform.'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedHex, setCopiedHex] = useState(null);
  const [expandedCards, setExpandedCards] = useState({
    personality: true,
    colors: true,
    archetype: true,
    logos: true,
    names: true,
    taglines: true,
    persona: true,
    swot: true,
    market: true,
    trademark: true
  });

  const toggleCard = (key) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1500);
  };

  // High-Contrast Premium White Mode Palette
  const colorPalette = [
    { hex: '#0F172A', label: 'Obsidian Black', role: 'Primary Typography', contrast: '21:1 AAA' },
    { hex: '#2563EB', label: 'Electric Royal Blue', role: 'Primary Brand Accent', contrast: '7.2:1 AAA' },
    { hex: '#7C3AED', label: 'Deep Violet', role: 'Secondary Accent', contrast: '6.5:1 AA' },
    { hex: '#059669', label: 'Emerald Green', role: 'Clearance Highlight', contrast: '8.1:1 AAA' },
    { hex: '#F8FAFC', label: 'Slate Porcelain', role: 'Card Background', contrast: '1.1:1 Base' }
  ];

  // Mock Logo Variations (Vector Marks)
  const logoConcepts = [
    { id: 1, name: 'Geometric Matrix Mark', path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { id: 2, name: 'Neural Orbit Emblem', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { id: 3, name: 'Infinite Synthesis Icon', path: 'M12 2v20M2 12h20M5 5l14 14M5 19L19 5' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-100 uppercase">
              Brand Studio Engine v4.5
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight mt-1">
            Brand Analysis & DNA Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define your core identity, customer persona, color psychology, and legal clearance.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shrink-0 self-start sm:self-auto shadow-sm"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Brand DNA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Re-Analyze Brand</span>
            </>
          )}
        </button>
      </div>

      {/* Input Section Card */}
      <form onSubmit={handleAnalyze} className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0F291E] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Brand Core Parameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Brand Name</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Industry Sector</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Target Audience</label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Brand Mission / Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Upload Brand Mark / Logo</label>
            <div className="h-[74px] border-2 border-dashed border-[#E5E0D8] hover:border-blue-500 rounded-xl bg-[#FAF8F5]/50 flex items-center justify-center cursor-pointer transition-colors text-center px-4">
              <div className="flex items-center gap-2 text-slate-500 hover:text-[#0F291E] text-xs">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Drop SVG/PNG or click</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Loading Skeleton during Analysis */}
      {isAnalyzing && (
        <div className="p-8 glass-panel border border-[#E5E0D8] rounded-2xl text-center space-y-4 animate-pulse shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-[#0F291E]">Synthesizing Brand Intelligence Matrix...</h3>
          <p className="text-xs text-slate-500">Processing USPTO legal databases, market sentiment, & brand archetypes.</p>
        </div>
      )}

      {/* AI Generated Results Cards */}
      {!isAnalyzing && (
        <div className="space-y-6">
          
          {/* Card 1: Brand Archetype & Personality */}
          <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
            <div
              onClick={() => toggleCard('archetype')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F291E]">1. Brand Archetype & Personality</h3>
                  <span className="text-[11px] text-slate-500">The Visionary Creator • High Authority & Innovation</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-[#0F291E]">
                {expandedCards.archetype ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {expandedCards.archetype && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-slate-100 space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                      <span className="text-[10px] text-blue-600 font-mono uppercase font-bold">Primary Archetype</span>
                      <h4 className="text-base font-bold text-[#0F291E] mt-1">The Visionary</h4>
                      <p className="text-[11px] text-slate-600 mt-1">Transforms futuristic AI capabilities into trusted enterprise standards.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                      <span className="text-[10px] text-purple-600 font-mono uppercase font-bold">Core Motivation</span>
                      <h4 className="text-base font-bold text-[#0F291E] mt-1">Mastery & Clarity</h4>
                      <p className="text-[11px] text-slate-600 mt-1">Providing founders with instant legal certainty and market domination.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                      <span className="text-[10px] text-emerald-600 font-mono uppercase font-bold">Tone of Voice</span>
                      <h4 className="text-base font-bold text-[#0F291E] mt-1">Direct & Luxurious</h4>
                      <p className="text-[11px] text-slate-600 mt-1">Minimal, confident, precise, avoiding fluff or excessive hype.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 2: Color Psychology & Palette */}
          <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
            <div
              onClick={() => toggleCard('colors')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F291E]">2. Color Psychology & Palette System</h3>
                  <span className="text-[11px] text-slate-500">High contrast white theme tailored for legal precision & AI trust</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-[#0F291E]">
                {expandedCards.colors ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {expandedCards.colors && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-slate-100 space-y-4"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {colorPalette.map((item) => (
                      <div key={item.hex} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2 group">
                        <div
                          className="h-16 rounded-lg w-full border border-[#E5E0D8] shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: item.hex }}
                        >
                          <button
                            onClick={() => handleCopy(item.hex)}
                            className="p-1.5 rounded-lg bg-[#0F291E] text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            title="Copy HEX code"
                          >
                            {copiedHex === item.hex ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-[#0F291E]">{item.label}</p>
                          <p className="text-[10px] font-mono text-slate-500">{item.hex}</p>
                          <span className="text-[9px] text-slate-400 block">{item.contrast}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 3: Logo Suggestions */}
          <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
            <div
              onClick={() => toggleCard('logos')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F291E]">3. Generative Logo Concepts</h3>
                  <span className="text-[11px] text-slate-500">Minimal vector marks with light mode balance</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-[#0F291E]">
                {expandedCards.logos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {expandedCards.logos && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-slate-100"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {logoConcepts.map((logo) => (
                      <div key={logo.id} className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col items-center justify-center text-center space-y-3 group hover:border-slate-400 transition-colors">
                        <div className="w-16 h-16 rounded-2xl glass-panel border border-[#E5E0D8] flex items-center justify-center text-[#0F291E] group-hover:scale-110 transition-transform shadow-xs">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={logo.path} />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0F291E]">{logo.name}</p>
                          <span className="text-[10px] text-slate-500 font-mono">Vector SVG Concept</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 4: Taglines & Naming Suggestions */}
          <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
            <div
              onClick={() => toggleCard('taglines')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F291E]">4. AI Name Variants & Taglines</h3>
                  <span className="text-[11px] text-slate-500">High-impact brand positioning statements & domain clearance</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-[#0F291E]">
                {expandedCards.taglines ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {expandedCards.taglines && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-slate-100 space-y-4 text-xs"
                >
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#0F291E] text-xs">Curated Taglines:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between">
                        <span className="font-semibold text-[#0F291E]">"Autonomous Brand Intelligence. Zero Legal Guesswork."</span>
                        <span className="text-[10px] text-blue-600 font-mono font-bold">9.8 Impact</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between">
                        <span className="font-semibold text-[#0F291E]">"Build Unforgettable Brands with Investor-Grade AI."</span>
                        <span className="text-[10px] text-blue-600 font-mono font-bold">9.5 Impact</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 5: Trademark Risk Analysis */}
          <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-4">
            <div
              onClick={() => toggleCard('trademark')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F291E]">5. Trademark Clearance & Risk Index</h3>
                  <span className="text-[11px] text-slate-500">14.2M USPTO records scanned • Low Infringement Risk</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-[#0F291E]">
                {expandedCards.trademark ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {expandedCards.trademark && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-slate-100 space-y-4 text-xs"
                >
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#0F291E]">Risk Score: 1.8% (Very Low)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
                          PASSED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        No active Class 9 or Class 42 trademark conflicts detected under "Aura AI" phonetics.
                      </p>
                    </div>

                    <button className="px-4 py-2 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 shadow-2xs">
                      Download Certificate
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

    </div>
  );
};

