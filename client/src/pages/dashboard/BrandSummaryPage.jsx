import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Tag,
  Target,
  Compass,
  Eye,
  BookOpen,
  Sliders,
  Edit3,
  Copy,
  Check,
  Printer,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileText,
  ShieldCheck,
  Zap,
  Package,
  Layers
} from 'lucide-react';
import { brandService } from '../../services/brandService';
import { productStrategyService } from '../../services/productStrategyService';
import { useToast } from '../../context/ToastContext';

export const BrandSummaryPage = () => {
  const [identity, setIdentity] = useState(null);
  const [productStrategy, setProductStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedSection, setCopiedSection] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandRes, stratRes] = await Promise.all([
        brandService.getIdentity().catch(() => null),
        productStrategyService.getStrategy().catch(() => null),
      ]);

      const brandData = brandRes?.data?.brand || brandRes?.data;
      if (brandData) {
        setIdentity(brandData);
      }

      if (stratRes?.data?.strategy) {
        setProductStrategy(stratRes.data.strategy);
      }
    } catch (err) {
      console.error('Error fetching saved brand DNA & product strategy summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, sectionKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyFullBrandSummary = () => {
    const sections = [];

    sections.push('=== SAVED BRAND DNA & PRODUCT STRATEGY SUMMARY ===\n');

    if (identity?.brandName) sections.push(`[BRAND NAME]\n${identity.brandName}\n`);
    if (identity?.tagline) sections.push(`[TAGLINE]\n"${identity.tagline}"\n`);
    if (identity?.missionStatement) sections.push(`[MISSION STATEMENT]\n${identity.missionStatement}\n`);
    if (identity?.visionStatement) sections.push(`[VISION STATEMENT]\n${identity.visionStatement}\n`);
    if (identity?.brandStory) sections.push(`[BRAND STORY]\n${identity.brandStory}\n`);
    if (identity?.brandPersonality) sections.push(`[BRAND PERSONALITY]\n${identity.brandPersonality}\n`);

    if (productStrategy?.productName) {
      sections.push(`[PRODUCT NAME]\n${productStrategy.productName} ${productStrategy.productTagline ? `("${productStrategy.productTagline}")` : ''}\n`);
    }
    if (productStrategy?.shortDescription) {
      sections.push(`[PRODUCT PITCH]\n${productStrategy.shortDescription}\n`);
    }
    if (productStrategy?.detailedDescription) {
      sections.push(`[PRODUCT NARRATIVE]\n${productStrategy.detailedDescription}\n`);
    }
    if (productStrategy?.usps?.length > 0) {
      const uspStr = productStrategy.usps.map((u) => `- ${u.title}: ${u.description}`).join('\n');
      sections.push(`[UNIQUE SELLING PROPOSITIONS]\n${uspStr}\n`);
    }
    if (productStrategy?.positioningStatement) {
      sections.push(`[PRODUCT POSITIONING STATEMENT]\n"${productStrategy.positioningStatement}"\n`);
    }

    navigator.clipboard.writeText(sections.join('\n').trim());
    addToast('Full Brand & Product Strategy Summary copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 font-mono">Loading Saved Brand & Product DNA...</span>
      </div>
    );
  }

  const hasAnySaved = Boolean(
    identity?.brandName ||
    identity?.tagline ||
    identity?.missionStatement ||
    identity?.visionStatement ||
    identity?.brandStory ||
    identity?.brandPersonality ||
    productStrategy?.productName ||
    productStrategy?.shortDescription ||
    productStrategy?.positioningStatement ||
    productStrategy?.usps?.length > 0
  );

  const hasProductStrategy = Boolean(
    productStrategy?.productName ||
    productStrategy?.shortDescription ||
    productStrategy?.detailedDescription ||
    productStrategy?.positioningStatement ||
    productStrategy?.usps?.length > 0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left pb-20 print:p-0 print:space-y-6 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER & ACTIONS
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4 print:border-none print:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                Consolidated DNA Hub
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight mt-2">
              Saved Brand & Product DNA
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your consolidated, AI-generated and refined brand identity and product strategy profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={copyFullBrandSummary}
              disabled={!hasAnySaved}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
              title="Copy all sections to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-slate-600" />
              <span>Copy Full Summary</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              title="Print or export as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / Export</span>
            </button>

            <Link
              to="/product-strategy"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Product Strategy</span>
            </Link>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          NO SAVED BRAND DATA WARNING
         ───────────────────────────────────────────────────────────── */}
      {!hasAnySaved && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-slate-900">No Saved Brand or Product DNA Yet</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              You haven't saved any brand identity components or product strategies yet. Head over to the Brand Analysis or Product Strategy workspace to generate and save your assets!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/brand-analysis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-md"
            >
              <span>Brand Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/product-strategy"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md"
            >
              <span>Product Strategy</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SAVED SECTIONS GRID SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      {hasAnySaved && (
        <div className="space-y-6">
          
          {/* 1. BRAND NAME */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">01</span>
                    <h3 className="font-serif text-xl font-bold text-slate-900">Brand Name</h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {identity?.brandNameSource && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                    {identity.brandNameSource === 'manual' ? 'Manual Input' : 'AI Generated'}
                  </span>
                )}
                {identity?.brandName && (
                  <button
                    onClick={() => copyToClipboard(identity.brandName, 'brandName')}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Copy Brand Name"
                  >
                    {copiedSection === 'brandName' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {identity?.brandName ? (
              <div className="p-4 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC]">
                <p className="font-serif text-3xl font-bold text-slate-900">{identity.brandName}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No brand name saved yet.</p>
            )}
          </div>


          {/* 2. TAGLINE */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">02</span>
                    <h3 className="font-serif text-xl font-bold text-slate-900">Tagline</h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {identity?.taglineSource && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                    {identity.taglineSource === 'manual' ? 'Manual Input' : 'AI Generated'}
                  </span>
                )}
                {identity?.tagline && (
                  <button
                    onClick={() => copyToClipboard(identity.tagline, 'tagline')}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Copy Tagline"
                  >
                    {copiedSection === 'tagline' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {identity?.tagline ? (
              <div className="p-4 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC]">
                <p className="font-serif text-xl italic font-medium text-slate-900">"{identity.tagline}"</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No tagline saved yet.</p>
            )}
          </div>


          {/* 3. MISSION STATEMENT */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">03</span>
                    <h3 className="font-serif text-xl font-bold text-slate-900">Mission Statement</h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {identity?.missionSource && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                    {identity.missionSource === 'manual' ? 'Manual Input' : 'AI Generated'}
                  </span>
                )}
                {identity?.missionStatement && (
                  <button
                    onClick={() => copyToClipboard(identity.missionStatement, 'mission')}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Copy Mission"
                  >
                    {copiedSection === 'mission' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {identity?.missionStatement ? (
              <div className="p-5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC]">
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{identity.missionStatement}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No mission statement saved yet.</p>
            )}
          </div>


          {/* 4. VISION STATEMENT */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">04</span>
                    <h3 className="font-serif text-xl font-bold text-slate-900">Vision Statement</h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {identity?.visionSource && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                    {identity.visionSource === 'manual' ? 'Manual Input' : 'AI Generated'}
                  </span>
                )}
                {identity?.visionStatement && (
                  <button
                    onClick={() => copyToClipboard(identity.visionStatement, 'vision')}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Copy Vision"
                  >
                    {copiedSection === 'vision' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {identity?.visionStatement ? (
              <div className="p-5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC]">
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{identity.visionStatement}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No vision statement saved yet.</p>
            )}
          </div>


          {/* 5. BRAND STORY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">05</span>
                    <h3 className="font-serif text-xl font-bold text-slate-900">Brand Story</h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {identity?.brandStorySource && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                    {identity.brandStorySource === 'manual' ? 'Manual Input' : 'AI Generated'}
                  </span>
                )}
                {identity?.brandStory && (
                  <button
                    onClick={() => copyToClipboard(identity.brandStory, 'brandStory')}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Copy Brand Story"
                  >
                    {copiedSection === 'brandStory' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {identity?.brandStory ? (
              <div className="p-6 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC]">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {identity.brandStory}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No brand story saved yet.</p>
            )}
          </div>


          {/* 6. BRAND PERSONALITY */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">06</span>
                    <h3 className="font-serif text-xl font-bold text-slate-900">Brand Personality</h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {identity?.brandPersonalitySource && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                    {identity.brandPersonalitySource === 'manual' ? 'Manual Input' : 'AI Generated'}
                  </span>
                )}
                {identity?.brandPersonality && (
                  <button
                    onClick={() => copyToClipboard(identity.brandPersonality, 'brandPersonality')}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Copy Personality Traits"
                  >
                    {copiedSection === 'brandPersonality' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {identity?.brandPersonality ? (
              <div className="p-5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-3">
                <div className="flex flex-wrap gap-2">
                  {identity.brandPersonality.split(',').map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-2xs"
                    >
                      {trait.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No brand personality traits saved yet.</p>
            )}
          </div>


          {/* ─────────────────────────────────────────────────────────────
              7. SAVED PRODUCT STRATEGY & POSITIONING
             ───────────────────────────────────────────────────────────── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">07</span>
                    <h3 className="font-serif text-xl font-bold text-slate-900">Product Strategy & Positioning</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      Chained AI Module
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/product-strategy"
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Strategy</span>
                </Link>
              </div>
            </div>

            {hasProductStrategy ? (
              <div className="space-y-6">

                {/* Product Name & Tagline */}
                {productStrategy.productName && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Active Product Offering</span>
                    <div className="flex items-baseline gap-2">
                      <p className="font-serif text-2xl font-bold text-slate-900">{productStrategy.productName}</p>
                      {productStrategy.productTagline && (
                        <span className="text-xs font-semibold text-blue-600 italic">"{productStrategy.productTagline}"</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Short Pitch & Full Narrative */}
                {(productStrategy.shortDescription || productStrategy.detailedDescription) && (
                  <div className="space-y-3">
                    {productStrategy.shortDescription && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Elevator Pitch</span>
                        <p className="text-xs font-semibold text-slate-900 leading-relaxed">{productStrategy.shortDescription}</p>
                      </div>
                    )}

                    {productStrategy.detailedDescription && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Full Product Story</span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">{productStrategy.detailedDescription}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* USPs Matrix */}
                {productStrategy.usps?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Unique Selling Propositions (USPs)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {productStrategy.usps.map((usp, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-extrabold text-slate-900">{usp.title}</span>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {usp.impact || 'High'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{usp.description}</p>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 font-semibold pt-1 border-t border-slate-200/60 block mt-2">
                            {usp.category || 'Differentiation'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Positioning Statement Container */}
                {productStrategy.positioningStatement && (
                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 shadow-md">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      Product Positioning Statement
                    </span>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed italic">
                      "{productStrategy.positioningStatement}"
                    </p>
                  </div>
                )}

                {/* Positioning Pillars */}
                {(productStrategy.targetSegment || productStrategy.keyBenefit || productStrategy.competitiveMoat) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {productStrategy.targetSegment && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Target ICP Segment</span>
                        <p className="text-slate-800 font-semibold">{productStrategy.targetSegment}</p>
                      </div>
                    )}
                    {productStrategy.keyBenefit && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Core Benefit</span>
                        <p className="text-slate-800 font-semibold">{productStrategy.keyBenefit}</p>
                      </div>
                    )}
                    {productStrategy.competitiveMoat && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Defensible Moat</span>
                        <p className="text-slate-800 font-semibold">{productStrategy.competitiveMoat}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-500 font-medium">No product strategy details saved yet.</p>
                <Link
                  to="/product-strategy"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Build Product Strategy with AI</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
