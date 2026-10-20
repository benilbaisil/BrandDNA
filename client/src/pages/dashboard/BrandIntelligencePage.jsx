import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Edit2,
  Globe,
  ArrowRight,
  AlertCircle,
  Wand2,
  Lightbulb,
  Sparkles,
  Target,
  BookOpen,
  MessageCircleHeart
} from 'lucide-react';
import { startupService } from '../../services/startupService';
import { brandService } from '../../services/brandService';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export const BrandIntelligencePage = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [brandData, setBrandData] = useState(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const profileRes = await startupService.getProfile();
      if (profileRes?.data) {
        setHasProfile(true);
        setSavedData(profileRes.data);
      }
      
      try {
        const brandRes = await brandService.getIdentity();
        if (brandRes?.data?.brand) {
          setBrandData(brandRes.data.brand);
        }
      } catch (e) {
        console.error("Brand identity not found or error", e);
      }
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await brandService.generateBrand({ useAI: true });
      if (res.success) {
        showToast('Brand Identity generated successfully!', 'success');
        await fetchData();
      } else {
        showToast('Failed to generate brand identity.', 'error');
      }
    } catch (error) {
      console.error('Error generating:', error);
      showToast('An error occurred during generation.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading Brand Intelligence...</span>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0F291E]">Business Profile Required</h2>
        <p className="text-sm text-slate-500">
          You need to complete your business profile to generate brand identity assets.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
        >
          Go to Business Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const hasAIAssets = brandData && brandData.missionStatement;

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight mt-1">
            Brand Intelligence AI
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Transform your business profile into a powerful, cohesive brand identity using advanced Gemini AI.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="relative inline-flex items-center justify-center gap-2 px-6 py-3 overflow-hidden rounded-xl bg-[#0F291E] text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" /> {hasAIAssets ? 'Regenerate Identity' : 'Generate Brand Identity'}
            </>
          )}
        </button>
      </div>

      {/* Generated Assets Display */}
      {hasAIAssets && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Name & Tagline Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-center shadow-xl border border-indigo-800/50"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel/10 text-blue-200 border border-white/10 text-[10px] font-bold font-mono tracking-widest uppercase backdrop-blur-sm">
                <Sparkles className="w-3 h-3" /> Core Identity
              </span>
              <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
                {brandData.brandName}
              </h2>
              <p className="text-lg sm:text-xl text-blue-200 font-medium max-w-2xl mt-2 leading-relaxed">
                "{brandData.tagline}"
              </p>
            </div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-[#E5E0D8]/60 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F291E] mb-2 font-display">Mission Statement</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {brandData.missionStatement}
            </p>
          </motion.div>

          {/* Vision Statement */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-[#E5E0D8]/60 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F291E] mb-2 font-display">Vision Statement</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {brandData.visionStatement}
            </p>
          </motion.div>

          {/* Brand Story */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 glass-panel/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E5E0D8]/60 hover:shadow-md transition-all group"
          >
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                 <BookOpen className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-[#0F291E] font-display">Brand Story</h3>
             </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
              {brandData.brandStory}
            </p>
          </motion.div>

          {/* Brand Personality */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100/50 flex flex-col sm:flex-row items-center gap-6"
          >
            <div className="w-16 h-16 rounded-3xl glass-panel text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
              <MessageCircleHeart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F291E] mb-1 font-display">Brand Personality</h3>
              <p className="text-sm sm:text-base text-emerald-800 font-medium">
                {brandData.brandPersonality}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {!hasAIAssets && !generating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FAF8F5] border border-dashed border-slate-300 rounded-3xl p-12 text-center flex flex-col items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center shadow-sm border border-[#E5E0D8] mb-6">
            <Sparkles className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-[#0F291E]/90 mb-2">No Identity Generated Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Click the generate button above to let Gemini AI analyze your business profile and craft a premium brand identity for you.
          </p>
        </motion.div>
      )}

      {/* Saved Business Summary Collapsible or Mini View */}
      {savedData && (
        <div className="pt-8 border-t border-[#E5E0D8]/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Reference Context (Your Input)</p>
          <div className="glass-panel/40 backdrop-blur-md rounded-2xl border border-[#E5E0D8]/50 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="px-5 py-3 border-b border-slate-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F291E]/90">
                    {savedData?.businessType || 'Business'} · {savedData?.industry}
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel text-slate-600 font-semibold text-xs hover:bg-[#FAF8F5] transition-colors border border-[#E5E0D8] cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Edit Profile
              </Link>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Goals</p>
                <p className="font-medium text-slate-700">
                  {Array.isArray(savedData?.businessGoals) ? savedData.businessGoals.join(', ') : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Description</p>
                <p className="font-medium text-slate-700 truncate">{savedData?.businessDescription || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

