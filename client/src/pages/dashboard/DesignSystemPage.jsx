import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Sparkles,
  Search,
  Check,
  ChevronDown,
  AlertCircle,
  Calendar as CalendarIcon,
  Upload,
  RefreshCw,
  FolderOpen,
  Command,
  FileText,
  ShieldCheck,
  X,
  Bell
} from 'lucide-react';

export const DesignSystemPage = () => {
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState('opt1');
  const [dropdownVal, setDropdownVal] = useState('Option 1');
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono font-bold border border-white/20 uppercase">
            Monochrome Design System & UI Kit
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          BrandDNA Micro-Components Showcase (Noir Edition)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Handcrafted Linear/Vercel-grade high-contrast black & white UI components.
        </p>
      </div>

      {/* 1. Buttons */}
      <section className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span>1. Button System</span>
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all shadow-md shadow-white/10">
            Primary White Button
          </button>

          <button className="px-4 py-2.5 rounded-xl bg-[#141414] border border-white/10 hover:border-white/30 text-white font-semibold text-xs transition-colors">
            Secondary Surface
          </button>

          <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-semibold text-xs transition-colors">
            Ghost Outline
          </button>

          <button className="px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-xs hover:bg-white/20 transition-colors">
            High Contrast Badge
          </button>

          <button disabled className="px-4 py-2.5 rounded-xl bg-white/5 text-zinc-600 font-semibold text-xs border border-white/5 cursor-not-allowed">
            Disabled State
          </button>
        </div>
      </section>

      {/* 2. Inputs, Search, Dropdowns, Checkboxes & Radio */}
      <section className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-white" />
          <span>2. Inputs, Controls & Selection</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Input */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Standard Input</label>
            <input
              type="text"
              placeholder="Enter brand name..."
              className="w-full bg-[#141414] border border-white/10 focus:border-white text-xs text-white placeholder-zinc-500 rounded-xl px-3.5 py-2.5 outline-none"
            />
          </div>

          {/* Search Input with Shortcut */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Search Component</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-[#141414] border border-white/10 text-xs text-white placeholder-zinc-500 rounded-xl pl-9 pr-8 py-2.5 outline-none"
              />
              <kbd className="absolute right-2.5 top-2 text-[9px] font-mono text-zinc-300 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Custom Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Styled Dropdown</label>
            <select
              value={dropdownVal}
              onChange={(e) => setDropdownVal(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
            >
              <option value="Option 1">Class 42 Software SaaS</option>
              <option value="Option 2">Class 9 AI Neural Hardware</option>
              <option value="Option 3">Class 35 Business Strategy</option>
            </select>
          </div>
        </div>

        {/* Checkbox & Radio Toggle */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300">
            <div
              onClick={() => setCheckboxVal(!checkboxVal)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                checkboxVal ? 'bg-white border-white text-black' : 'border-white/20 bg-[#141414]'
              }`}
            >
              {checkboxVal && <Check className="w-3 h-3 text-black" />}
            </div>
            <span>Include USPTO Legal Risk Matrix</span>
          </label>

          <div className="flex items-center gap-4 text-xs text-zinc-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="sample-radio"
                checked={radioVal === 'opt1'}
                onChange={() => setRadioVal('opt1')}
                className="accent-white"
              />
              <span>High Precision</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="sample-radio"
                checked={radioVal === 'opt2'}
                onChange={() => setRadioVal('opt2')}
                className="accent-white"
              />
              <span>Standard Scan</span>
            </label>
          </div>
        </div>
      </section>

      {/* 3. Badges, Progress Bars & Loading Skeleton */}
      <section className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>3. Badges, Progress Bars & Loading Skeletons</span>
        </h2>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono font-bold border border-white/20">
            PASSED 98.2%
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono font-bold border border-white/20">
            AI ACTIVE
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-bold">
            TIER 1 ELITE
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold border border-zinc-700">
            CONFLICT FLAG
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-2 max-w-md pt-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Neural Synthesis Progress</span>
            <span>85%</span>
          </div>
          <div className="h-2 w-full bg-[#141414] rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ duration: 1 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="space-y-2 pt-2 max-w-md">
          <span className="text-[11px] font-medium text-zinc-400 block">Loading Skeleton Preview</span>
          <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-2 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        </div>
      </section>

      {/* 4. Accordion, Toast & Empty States */}
      <section className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" />
          <span>4. Accordion, Toast & Empty State Components</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Accordion */}
          <div className="space-y-2">
            <div
              onClick={() => setAccordionOpen(!accordionOpen)}
              className="p-3.5 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-between cursor-pointer select-none text-xs font-bold text-white"
            >
              <span>Expandable Accordion Module</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${accordionOpen ? 'rotate-180' : ''}`} />
            </div>
            {accordionOpen && (
              <div className="p-4 rounded-xl bg-[#141414]/50 border border-white/5 text-xs text-zinc-400">
                BrandDNA AI micro-interactions provide ultra smooth state feedback for founder executive workflows.
              </div>
            )}
          </div>

          {/* Toast Notification Trigger */}
          <div className="space-y-2">
            <button
              onClick={() => setToastVisible(true)}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white/20 transition-colors"
            >
              Trigger System Toast Notification
            </button>

            {toastVisible && (
              <div className="p-3.5 rounded-xl bg-[#141414] border border-white/30 shadow-2xl flex items-center justify-between text-xs text-white animate-bounce">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-white" />
                  <span>Trademark audit passed cleanly for Aura AI!</span>
                </div>
                <button onClick={() => setToastVisible(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        <div className="p-8 rounded-xl bg-[#141414]/40 border border-dashed border-white/10 text-center space-y-3 pt-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 mx-auto flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xs font-bold text-white">No Archival Decks Selected</h3>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
            Drag and drop custom PDF exports here to index into the BrandDNA neural database.
          </p>
        </div>
      </section>

    </div>
  );
};
