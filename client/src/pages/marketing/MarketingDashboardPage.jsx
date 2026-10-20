import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Rocket,
  Image as ImageIcon,
  Lightbulb,
  Megaphone,
  ChevronRight
} from 'lucide-react';
import { marketingProductService } from '../../services/marketingProductService';
import { useAuth } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const MarketingDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedCount, setSavedCount] = useState(null);

  useEffect(() => {
    marketingProductService.getProducts().then((res) => {
      if (res?.success && Array.isArray(res?.data?.products)) {
        setSavedCount(res.data.products.length);
      }
    }).catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const tools = [
    {
      id: 'new-product',
      to: '/marketing/product-strategy',
      gradient: 'from-[#0B1D35] via-[#0F2B50] to-[#0B1D35]',
      accentColor: '#4F8EF7',
      accentBg: 'rgba(79,142,247,0.12)',
      icon: Rocket,
      iconColor: '#7DB3FA',
      badge: 'AI-Powered',
      badgeBg: 'rgba(79,142,247,0.15)',
      badgeText: '#7DB3FA',
      title: 'New Product',
      subtitle: 'From idea to launch-ready strategy',
      description:
        'Enter your product concept and let AI generate detailed product details, naming ideas, USPs, pricing, positioning — then create a stunning upcoming product ad automatically.',
      steps: [
        { icon: Lightbulb, label: 'Product Details & Ideas' },
        { icon: Sparkles, label: 'AI Marketing Strategy' },
        { icon: Megaphone, label: 'Upcoming Product Ad' },
      ],
      cta: 'Start New Product',
    },
    {
      id: 'existing-product',
      to: '/marketing/ad-poster',
      gradient: 'from-[#1A0B2E] via-[#2D1054] to-[#1A0B2E]',
      accentColor: '#B06EF7',
      accentBg: 'rgba(176,110,247,0.12)',
      icon: ImageIcon,
      iconColor: '#C89BFA',
      badge: 'Instant Generation',
      badgeBg: 'rgba(176,110,247,0.15)',
      badgeText: '#C89BFA',
      title: 'Create Ad Poster',
      subtitle: 'For your existing products',
      description:
        'Pick any product you have already saved and generate a premium, on-brand advertising poster in seconds — multiple themes, ready to download.',
      steps: [
        { icon: ImageIcon, label: 'Select Existing Product' },
        { icon: Sparkles, label: 'AI Generates Poster' },
        { icon: Megaphone, label: 'Download & Publish' },
      ],
      cta: 'Create Ad Poster',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans overflow-x-hidden">
      {/* ── Ambient blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-160px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-140px',
            width: '460px',
            height: '460px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(176,110,247,0.07) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-12">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border"
              style={{
                background: 'rgba(79,142,247,0.08)',
                borderColor: 'rgba(79,142,247,0.2)',
                color: '#4F8EF7',
              }}
            >
              <Sparkles className="w-3 h-3" />
              Marketing AI Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F291E] tracking-tight">
            {greeting()},{' '}
            <span className="text-[#0F291E]/70">{user?.fullName?.split(' ')[0] || 'Marketer'}</span>
          </h1>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
            Choose what you'd like to do today. Two focused tools — everything you need, nothing you don't.
          </p>
          {savedCount !== null && savedCount > 0 && (
            <p className="text-xs text-slate-400">
              You have{' '}
              <span className="font-bold text-slate-600">{savedCount}</span>{' '}
              saved product{savedCount !== 1 ? 's' : ''} ready to use.
            </p>
          )}
        </motion.div>

        {/* ── Two Action Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="group relative rounded-3xl overflow-hidden cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${tool.gradient.replace('from-', '').replace('via-', '').replace('to-', '')})`,
                }}
                onClick={() => navigate(tool.to)}
              >
                {/* Actual gradient bg */}
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${
                      tool.id === 'new-product'
                        ? '#0B1D35, #0F2B50, #0B1D35'
                        : '#1A0B2E, #2D1054, #1A0B2E'
                    })`,
                  }}
                />

                {/* Glow orb */}
                <div
                  aria-hidden
                  className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle, ${tool.accentColor}55 0%, transparent 70%)`,
                    transform: 'translate(30%, -30%)',
                  }}
                />

                <div className="relative z-10 p-7 sm:p-9 flex flex-col h-full min-h-[360px]">
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                      style={{
                        background: tool.badgeBg,
                        borderColor: `${tool.accentColor}30`,
                        color: tool.badgeText,
                      }}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {tool.badge}
                    </span>

                    {/* Icon bubble */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center border"
                      style={{
                        background: tool.accentBg,
                        borderColor: `${tool.accentColor}30`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: tool.iconColor }} />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {tool.title}
                    </h2>
                    <p className="text-xs font-semibold" style={{ color: tool.badgeText }}>
                      {tool.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-7 flex-1">
                    {tool.description}
                  </p>

                  {/* Steps */}
                  <div className="space-y-2.5 mb-7">
                    {tool.steps.map((step, si) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={si} className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: tool.accentBg }}
                          >
                            <StepIcon className="w-3 h-3" style={{ color: tool.accentColor }} />
                          </div>
                          <span className="text-xs text-slate-300 font-medium">{step.label}</span>
                          {si < tool.steps.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-slate-600 ml-auto shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <Link
                    to={tool.to}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 group-hover:gap-3.5"
                    style={{
                      background: `linear-gradient(135deg, ${tool.accentColor}CC, ${tool.accentColor}88)`,
                      color: '#fff',
                      boxShadow: `0 4px 24px ${tool.accentColor}40`,
                    }}
                  >
                    {tool.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── How it works strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel rounded-2xl border border-[#E5E0D8]/80 px-6 py-5"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center font-bold shrink-0 text-[11px]">
                1
              </div>
              <div>
                <p className="font-bold text-[#0F291E] mb-0.5">Choose a Mode</p>
                <p className="text-slate-500 text-[11px]">New product or existing product ad poster.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center font-bold shrink-0 text-[11px]">
                2
              </div>
              <div>
                <p className="font-bold text-[#0F291E] mb-0.5">Fill in Details</p>
                <p className="text-slate-500 text-[11px]">Enter your product idea or select an existing one.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold shrink-0 text-[11px]">
                3
              </div>
              <div>
                <p className="font-bold text-[#0F291E] mb-0.5">AI Does the Rest</p>
                <p className="text-slate-500 text-[11px]">Get strategy insights and a publication-ready ad.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default MarketingDashboardPage;
