import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Dna,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Tag,
  Compass,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#EAF4F7] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
      
      {/* ─────────────────────────────────────────────────────────────
          MINIMAL NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Dna className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            BrandDNA <span className="text-xs font-sans font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-white">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>


      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION (MINIMALIST LUXURY)
         ───────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 space-y-16 flex-1 flex flex-col justify-center">
        
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#D6E6EC] text-slate-700 text-xs font-semibold shadow-2xs backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Brand Intelligence Workspace v4.5</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl font-normal text-slate-900 tracking-tight leading-[1.15]"
          >
            Craft your brand DNA with pure AI clarity.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            An intuitive workspace for generating, reviewing, selecting, and refining your core brand identity—from name and tagline to story and personality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to={isAuthenticated ? "/brand-identity" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <span>{isAuthenticated ? 'Open Brand Analysis' : 'Start Free Workspace'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/80 border border-[#D6E6EC] text-slate-800 text-xs font-bold hover:bg-white transition-all shadow-2xs text-center"
            >
              Sign In to Account
            </Link>
          </motion.div>
        </div>


        {/* ─────────────────────────────────────────────────────────────
            MINIMALIST SHOWCASE MOCKUP CARD
           ───────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D6E6EC] shadow-sm max-w-4xl mx-auto w-full space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Brand Analysis Preview</h3>
                <p className="text-xs text-slate-400">Independent AI generation & review</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Workspace
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="p-4 rounded-2xl bg-[#EAF4F7]/50 border border-[#D6E6EC] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" /> Brand Name
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">Selected</span>
              </div>
              <p className="font-serif text-xl font-bold text-slate-900">NovaNest</p>
              <p className="text-[11px] text-slate-500">Combines modern innovation with a safe, comforting foundation.</p>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-2xl bg-[#EAF4F7]/50 border border-[#D6E6EC] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-600" /> Mission Statement
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">Saved</span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                "Empowering businesses to build sustainable futures through intelligent technology."
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-2xl bg-[#EAF4F7]/50 border border-[#D6E6EC] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" /> Personality
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">Traits</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Innovative', 'Friendly', 'Trustworthy', 'Bold'].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>


        {/* ─────────────────────────────────────────────────────────────
            MINIMAL 2-COLUMN FEATURE HIGHLIGHTS
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-8 border border-[#D6E6EC] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-slate-900" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              6 Independent AI Modules
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Regenerate names, taglines, mission, vision, story, and personality traits independently using context-aware Gemini AI.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#D6E6EC] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-slate-900" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Full Control & Manual Editing
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Never forced to accept AI output. Select options, refine text before saving, or enter manual inputs whenever desired.
            </p>
          </div>
        </div>

      </main>


      {/* ─────────────────────────────────────────────────────────────
          MINIMAL FOOTER
         ───────────────────────────────────────────────────────────── */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-8 border-t border-[#D6E6EC]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 mt-12">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-slate-900">BrandDNA AI</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 text-slate-600 font-semibold">
          <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-slate-900 transition-colors">Get Started</Link>
        </div>
      </footer>

    </div>
  );
};
