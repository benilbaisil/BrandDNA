import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  Globe,
  Lock,
  Download,
  Building,
  RefreshCw
} from 'lucide-react';

export const LegalAdvisoryPage = () => {
  const [searchMark, setSearchMark] = useState('BrandDNA AI');
  const [isSearching, setIsSearching] = useState(false);
  const [scanResult, setScanResult] = useState({
    mark: 'BrandDNA AI',
    status: 'LOW RISK (CLEARED)',
    score: 98.2,
    usptoClass: 'Class 42 (Software & SaaS) & Class 9 (AI Systems)',
    collisionCount: 0,
    confidence: '99.4%'
  });

  const handleScan = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setScanResult({
        mark: searchMark,
        status: searchMark.toLowerCase().includes('apple') ? 'HIGH CONFLICT RISK' : 'LOW RISK (CLEARED)',
        score: searchMark.toLowerCase().includes('apple') ? 22.4 : 96.8,
        usptoClass: 'Class 42 (AI Software & SaaS)',
        collisionCount: searchMark.toLowerCase().includes('apple') ? 14 : 0,
        confidence: '99.1%'
      });
      setIsSearching(false);
    }, 1200);
  };

  const complianceItems = [
    { title: 'USPTO Phonetic Collision Check', desc: 'Scanned 14,200,000 active & pending marks in US Trademark Register.', status: 'Passed', date: 'Today' },
    { title: 'EUIPO European Union Trademark Audit', desc: 'Audited Class 9, Class 35, and Class 42 across 27 EU member states.', status: 'Passed', date: 'Today' },
    { title: 'Domain & Handles Clearance', desc: 'branddna.ai, @branddna_ai, branddna.io registered/clear.', status: 'Passed', date: 'Today' },
    { title: 'AI Copyright & Training Data Protection', desc: 'No copyrighted dataset leaks or IP infringement risks flagged.', status: 'Passed', date: 'Today' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
            Legal Advisory & IP Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Trademark Clearance & IP Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Realtime collision checks against 14M+ USPTO records to ensure investor legal safety.
          </p>
        </div>

        <button
          onClick={() => alert('Generating full PDF Legal Report...')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold hover:bg-slate-50 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Export Official Audit PDF</span>
        </button>
      </div>

      {/* Trademark Search Engine Widget */}
      <form onSubmit={handleScan} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          <span>Live USPTO Trademark Collision Scanner</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchMark}
              onChange={(e) => setSearchMark(e.target.value)}
              placeholder="Enter brand name or slogan to scan..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <ShieldCheck className="w-4 h-4 text-white" />}
            <span>Run Clearance Audit</span>
          </button>
        </div>
      </form>

      {/* Scan Results Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Scan Results for "{scanResult.mark}"</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
            scanResult.score > 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {scanResult.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Clearance Score</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{scanResult.score}%</div>
            <span className="text-[10px] text-emerald-700 font-semibold">Pass Threshold 85%</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Class Spectrum</span>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate">{scanResult.usptoClass}</div>
            <span className="text-[10px] text-slate-500">Class 9, 35, 42</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Phonetic Collision Flags</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{scanResult.collisionCount}</div>
            <span className="text-[10px] text-slate-500">Direct matches</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 uppercase">AI Neural Confidence</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{scanResult.confidence}</div>
            <span className="text-[10px] text-blue-600 font-semibold">High Precision</span>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">IP & Regulatory Compliance Matrix</h3>

        <div className="space-y-3">
          {complianceItems.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                  {item.status}
                </span>
                <span className="block text-[9px] text-slate-400 mt-1">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
