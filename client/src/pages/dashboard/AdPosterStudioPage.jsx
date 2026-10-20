import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Rocket,
  Package,
  RefreshCw,
  Download,
  Save,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Palette,
  ChevronDown,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Check,
  Layers,
  Cloud,
  Eye,
  Tag,
  Boxes
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { marketingProductService } from '../../services/marketingProductService';
import { businessService } from '../../services/businessService';
import { useToast } from '../../context/ToastContext';

// ── Themes ─────────────────────────────────────────────────────────────────
const themes = {
  indigo_slate: {
    primary: '#0F172A',
    accent: '#4F46E5',
    bg: '#F8FAFC',
    text: '#FFFFFF',
    badgeBg: '#EEF2FF',
    badgeText: '#4338CA',
    label: 'Indigo Night',
    overlay: 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 40%, rgba(15,23,42,0.92) 100%)'
  },
  emerald_luxury: {
    primary: '#064E3B',
    accent: '#10B981',
    bg: '#F0FDF4',
    text: '#FFFFFF',
    badgeBg: '#ECFDF5',
    badgeText: '#047857',
    label: 'Emerald Lux',
    overlay: 'linear-gradient(180deg, rgba(6,78,59,0.85) 0%, rgba(6,78,59,0.4) 40%, rgba(6,78,59,0.92) 100%)'
  },
  amber_warm: {
    primary: '#78350F',
    accent: '#F59E0B',
    bg: '#FFFBEB',
    text: '#FFFFFF',
    badgeBg: '#FEF3C7',
    badgeText: '#B45309',
    label: 'Amber Glow',
    overlay: 'linear-gradient(180deg, rgba(120,53,15,0.85) 0%, rgba(120,53,15,0.4) 40%, rgba(120,53,15,0.92) 100%)'
  },
  rose_chic: {
    primary: '#881337',
    accent: '#F43F5E',
    bg: '#FFF1F2',
    text: '#FFFFFF',
    badgeBg: '#FFE4E6',
    badgeText: '#BE123C',
    label: 'Rose Chic',
    overlay: 'linear-gradient(180deg, rgba(136,19,55,0.85) 0%, rgba(136,19,55,0.4) 40%, rgba(136,19,55,0.92) 100%)'
  },
  dark_obsidian: {
    primary: '#090D16',
    accent: '#38BDF8',
    bg: '#0F172A',
    text: '#FFFFFF',
    badgeBg: '#1E293B',
    badgeText: '#38BDF8',
    label: 'Dark Sky',
    overlay: 'linear-gradient(180deg, rgba(9,13,22,0.88) 0%, rgba(9,13,22,0.4) 40%, rgba(9,13,22,0.95) 100%)'
  },
};

// ── Poster Canvas Component ─────────────────────────────────────────────────
const PosterCanvas = ({
  posterRef,
  adData,
  theme,
  selectedProduct,
  previewView,
  setPreviewView,
}) => {
  const t = themes[theme] || themes.indigo_slate;

  if (!adData) {
    return (
      <div className="w-full max-w-md aspect-[4/5] rounded-3xl border-2 border-dashed border-[#E5E0D8] bg-[#FAF8F5]/70 flex flex-col items-center justify-center p-8 text-center space-y-4 mx-auto">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#0F291E]/90">Live Ad Poster Stage Ready</h4>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Select an inventory product and click <span className="font-semibold text-indigo-600">"Generate Cloud Ad Poster"</span> to render the exact product ad.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-mono text-slate-600 font-medium border border-slate-200">
          <Cloud className="w-3.5 h-3.5 text-sky-500" />
          <span>Powered by Cloudflare AI + Gemini</span>
        </div>
      </div>
    );
  }

  // Exact product image URL from data or inventory product
  const exactImage =
    adData.productImageUrl ||
    (selectedProduct?.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : null) ||
    selectedProduct?.image ||
    '';

  const cloudBgImage =
    adData.cloudImageUrl ||
    (adData.cloudImageBase64 ? `data:image/jpeg;base64,${adData.cloudImageBase64}` : null);

  // If viewing pure cloud generation
  if (previewView === 'cloud_only' && cloudBgImage) {
    return (
      <div className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border border-[#E5E0D8]/80 mx-auto bg-slate-900">
        <div className="relative aspect-[4/5] flex items-center justify-center overflow-hidden">
          <img
            src={cloudBgImage}
            alt="Cloudflare Generated Studio Ad"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-sky-300 font-mono text-[10px] font-bold rounded-full border border-sky-400/30 flex items-center gap-1.5">
              <Cloud className="w-3 h-3 text-sky-400" /> Cloudflare Flux-1-Schnell Studio Render
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/75 backdrop-blur-md rounded-2xl border border-white/10 text-white space-y-1">
            <p className="text-xs font-bold truncate">{adData.headline}</p>
            <p className="text-[10px] text-slate-300 line-clamp-2 italic">"{adData.imagePrompt}"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border border-[#E5E0D8]/80 mx-auto group">
      <div
        ref={posterRef}
        className="aspect-[4/5] p-7 sm:p-9 flex flex-col justify-between relative text-white overflow-hidden"
        style={{
          backgroundColor: t.primary,
        }}
      >
        {/* Background Layer: Cloud AI Background Visual or Thematic Radial */}
        {cloudBgImage ? (
          <>
            <img
              src={cloudBgImage}
              alt="Cloud Backdrop"
              className="absolute inset-0 w-full h-full object-cover scale-105 filter blur-[0.5px] transition-transform duration-700 pointer-events-none"
            />
            {/* Elegant overlay for text legibility & contrast */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: t.overlay }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at top right, ${t.accent}40, transparent 65%), radial-gradient(circle at bottom left, ${t.primary}, transparent 70%)`,
            }}
          />
        )}

        {/* Ambient Top Glow */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ backgroundColor: t.accent }}
        />

        {/* TOP BAR: Brand Identity, Category & SKU */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl border border-white/20 flex items-center justify-center font-bold text-white text-xs shadow-md backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              {adData.brandNameText?.charAt(0) || 'B'}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-sm text-white uppercase font-serif drop-shadow-sm">
                {adData.brandNameText || 'BrandDNA'}
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-300 uppercase font-semibold">
                Official Collection
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {adData.categoryText && (
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-wider uppercase border border-white/20 backdrop-blur-md shadow-sm"
                style={{ background: 'rgba(0,0,0,0.35)' }}
              >
                {adData.categoryText}
              </span>
            )}
          </div>
        </div>

        {/* CENTER HERO STAGE: THE EXACT INVENTORY PRODUCT IMAGE */}
        <div className="relative my-auto flex flex-col items-center justify-center py-2 z-10">
          
          {/* Radial Aura Glow behind the Exact Product */}
          <div
            className="absolute w-52 h-52 rounded-full blur-2xl opacity-45 pointer-events-none"
            style={{ backgroundColor: t.accent }}
          />

          {exactImage ? (
            <div className="relative flex flex-col items-center">
              {/* Ground shadow beneath product */}
              <div className="absolute -bottom-3 w-44 h-4 bg-black/60 rounded-full blur-md" />
              <img
                src={exactImage}
                alt={adData.headline || selectedProduct?.name || 'Exact Product'}
                className="max-h-48 sm:max-h-56 max-w-[280px] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-500 z-10"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-slate-300">
              <Package className="w-12 h-12 text-slate-300" />
            </div>
          )}

          {/* Cloud AI Generation Badge */}
          {cloudBgImage && (
            <span className="mt-3 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold text-sky-200 bg-sky-950/60 border border-sky-400/30 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Cloud className="w-2.5 h-2.5 text-sky-400" /> Cloud Studio Ad
            </span>
          )}
        </div>

        {/* COPY SECTION: USP BADGE, HEADLINE & SUBHEADLINE */}
        <div className="space-y-2.5 z-10 pt-2">
          {adData.primaryUSP && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md border border-white/10"
              style={{ backgroundColor: t.badgeBg, color: t.badgeText }}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="uppercase tracking-wider text-[10px] font-extrabold">{adData.primaryUSP}</span>
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight font-serif text-white drop-shadow-md">
            {adData.headline}
          </h3>

          <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-sans line-clamp-2 opacity-95 drop-shadow-sm">
            {adData.subheadline}
          </p>

          {adData.positioningMessage && (
            <p className="text-[10px] text-slate-300 italic border-l-2 border-amber-400/90 pl-2.5 py-0.5 line-clamp-1">
              "{adData.positioningMessage}"
            </p>
          )}
        </div>

        {/* BOTTOM FOOTER BAR: PRICE & CTA */}
        <div className="pt-4 border-t border-white/20 flex items-center justify-between z-10 mt-3">
          <div>
            {adData.pricingText && (
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest block">
                  Store Price
                </span>
                <span className="text-base sm:text-lg font-black text-white drop-shadow-md">
                  {adData.pricingText}
                </span>
              </div>
            )}
          </div>

          <div
            className="px-5 py-2.5 rounded-2xl font-extrabold text-xs tracking-wide uppercase shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 border border-white/20"
            style={{ backgroundColor: t.accent, color: t.text }}
          >
            <span>{adData.ctaText || 'Shop Now'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Bottom Ambient Glow */}
        <div
          className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ backgroundColor: t.accent }}
        />
      </div>
    </div>
  );
};

// ── Main Page Component ─────────────────────────────────────────────────────
export const AdPosterStudioPage = () => {
  const { addToast } = useToast();
  const location = useLocation();
  const posterRef = useRef(null);

  // Mode: 'existing' | 'upcoming' (defaults to existing as requested)
  const initialMode = location.state?.mode || 'existing';
  const [mode, setMode] = useState(initialMode);

  // Active theme and view tab ('canvas' | 'cloud_only')
  const [activeTheme, setActiveTheme] = useState('indigo_slate');
  const [previewView, setPreviewView] = useState('canvas');

  // Shared state
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [adPosterData, setAdPosterData] = useState(null);
  const [error, setError] = useState(null);
  const [genStepText, setGenStepText] = useState('');

  // ── UPCOMING MODE: strategy data from productStrategyService
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyData, setStrategyData] = useState(null);
  const [upcomingPosterStatus, setUpcomingPosterStatus] = useState('idle');

  // ── EXISTING MODE: Real inventory products from MongoDB
  const [productsLoading, setProductsLoading] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [existingPosterStatus, setExistingPosterStatus] = useState('Not Generated');

  // ── Load data on mount or mode change ──────────────────────────────────────
  useEffect(() => {
    if (mode === 'upcoming') {
      fetchStrategy();
    } else {
      fetchInventoryProducts();
    }
    setAdPosterData(null);
    setError(null);
  }, [mode]);

  const fetchStrategy = async () => {
    setStrategyLoading(true);
    try {
      const res = await marketingProductService.getLatestStrategy();
      if (res?.success && res?.data?.product) {
        setStrategyData(res.data.product);
      }
    } catch (e) {
      console.error('Error loading strategy:', e);
    } finally {
      setStrategyLoading(false);
    }
  };

  const fetchInventoryProducts = async () => {
    setProductsLoading(true);
    setError(null);
    try {
      const res = await businessService.getProducts({ status: 'ALL' });
      const prods = res?.data?.products || res?.products || [];
      setInventoryProducts(prods);

      if (prods.length > 0) {
        // Pre-select first product or match passed state
        const targetId = location.state?.productId || prods[0]._id;
        const targetProd = prods.find((p) => p._id === targetId) || prods[0];

        setSelectedProductId(targetProd._id);
        setSelectedProduct(targetProd);

        if (targetProd.adPosterData?.headline) {
          setAdPosterData(targetProd.adPosterData);
          setExistingPosterStatus(targetProd.adPosterStatus || 'Generated');
        } else {
          setAdPosterData(null);
          setExistingPosterStatus('Not Generated');
        }
      }
    } catch (e) {
      console.error('Error loading inventory products:', e);
      setError('Failed to load inventory products from store catalog.');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    const prod = inventoryProducts.find((p) => p._id === id);
    setSelectedProduct(prod || null);

    if (prod?.adPosterData?.headline) {
      setAdPosterData(prod.adPosterData);
      setExistingPosterStatus(prod.adPosterStatus || 'Generated');
    } else {
      setAdPosterData(null);
      setExistingPosterStatus('Not Generated');
    }
    setError(null);
  };

  // ── Generate poster for UPCOMING product (from strategy data) ──────────────
  const handleGenerateUpcoming = async (isRegen = false) => {
    if (!strategyData?.productName && !strategyData?.productIdea) {
      addToast('No product strategy found. Please complete the New Product flow first.', 'error');
      return;
    }
    setGenerating(true);
    setError(null);
    setGenStepText('Synthesizing launch ad strategy...');

    try {
      const pid = strategyData._id;
      if (!pid) throw new Error('Strategy not saved yet. Please save from the New Product page first.');
      const apiCall = isRegen
        ? marketingProductService.regenerateAdPoster(pid)
        : marketingProductService.generateAdPoster(pid);
      const res = await apiCall;
      if (res?.success && res?.data?.adPosterData) {
        setAdPosterData(res.data.adPosterData);
        setUpcomingPosterStatus('done');
        addToast('Upcoming product ad poster generated!', 'success');
      }
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || e.message || 'Failed to generate poster.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setGenerating(false);
      setGenStepText('');
    }
  };

  // ── Generate poster for EXISTING product (from inventory) ─────────────────
  const handleGenerateExisting = async (isRegen = false) => {
    if (!selectedProductId) {
      addToast('Please select an inventory product first.', 'error');
      return;
    }

    setGenerating(true);
    setError(null);
    setGenStepText('Analyzing inventory product & crafting ad copy...');

    try {
      setTimeout(() => {
        setGenStepText('Calling Cloudflare Workers AI (Flux Schnell) for commercial studio visual...');
      }, 1400);

      const apiCall = isRegen
        ? businessService.regenerateProductAdPoster(selectedProductId)
        : businessService.generateProductAdPoster(selectedProductId);

      const res = await apiCall;

      if (res?.success && res?.data?.adPosterData) {
        const poster = res.data.adPosterData;
        setAdPosterData(poster);
        setExistingPosterStatus('Generated');
        addToast(
          `Ad Poster generated for "${selectedProduct?.name}" using Cloud AI!`,
          'success'
        );

        // Update local list state
        setInventoryProducts((prev) =>
          prev.map((p) =>
            p._id === selectedProductId
              ? { ...p, adPosterData: poster, adPosterStatus: 'Generated' }
              : p
          )
        );
      } else {
        throw new Error(res?.message || 'Failed to generate ad poster');
      }
    } catch (e) {
      console.error('Generate Ad Poster Error:', e);
      const msg = e.response?.data?.message || e.message || 'Failed to generate poster.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setGenerating(false);
      setGenStepText('');
    }
  };

  // ── Save poster ────────────────────────────────────────────────────────────
  const handleSavePoster = async () => {
    if (!adPosterData) return;
    setSaving(true);
    try {
      if (mode === 'existing' && selectedProductId) {
        await businessService.saveProductAdPoster(selectedProductId, { adPosterData });
        setExistingPosterStatus('Saved');
        setInventoryProducts((prev) =>
          prev.map((p) =>
            p._id === selectedProductId ? { ...p, adPosterStatus: 'Saved' } : p
          )
        );
        addToast('Ad Poster saved to inventory product in MongoDB!', 'success');
      } else if (mode === 'upcoming' && strategyData?._id) {
        await marketingProductService.saveAdPoster(strategyData._id, { adPosterData });
        setUpcomingPosterStatus('Saved');
        addToast('Ad poster saved to strategy!', 'success');
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to save poster.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Download poster as PNG ─────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const prodName =
        mode === 'existing'
          ? selectedProduct?.name || 'product'
          : strategyData?.productName || 'upcoming_product';
      link.href = image;
      link.download = `${prodName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_ad_poster.png`;
      link.click();
      addToast('High-resolution ad poster downloaded!', 'success');
    } catch (e) {
      console.error('Export error:', e);
      addToast('Failed to export poster image.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const canGenerate =
    mode === 'upcoming'
      ? Boolean(strategyData?.productName)
      : Boolean(selectedProductId);

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border"
              style={{
                background: 'rgba(79,70,229,0.08)',
                borderColor: 'rgba(79,70,229,0.25)',
                color: '#4F46E5',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Commercial Ad Studio
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
              <Cloud className="w-3 h-3 text-sky-500" />
              Cloudflare AI Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight">
            Ad Poster Generator
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Generate high-converting advertising posters based on your real inventory products using cloud AI. The ad prominently showcases the exact product and its verified pricing.
          </p>
        </motion.div>

        {/* ── Mode Selector: Existing vs Upcoming ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Existing Product Card (Recommended) */}
          <button
            id="mode-existing"
            onClick={() => setMode('existing')}
            className={`relative text-left p-5 rounded-3xl border-2 transition-all duration-200 group overflow-hidden cursor-pointer ${
              mode === 'existing'
                ? 'border-purple-600 bg-gradient-to-br from-[#120824] via-[#1F0A3D] to-[#2D1054] text-white shadow-xl scale-[1.01]'
                : 'border-[#E5E0D8] bg-white hover:border-purple-300 hover:shadow-md text-[#0F291E]'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  mode === 'existing' ? 'bg-purple-500/25 border border-purple-400/30' : 'bg-purple-50'
                }`}
              >
                <Package
                  className={`w-5 h-5 ${
                    mode === 'existing' ? 'text-purple-300' : 'text-purple-600'
                  }`}
                />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-extrabold ${
                        mode === 'existing' ? 'text-white' : 'text-[#0F291E]'
                      }`}
                    >
                      Existing Product Ad
                    </p>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        mode === 'existing'
                          ? 'bg-purple-400/20 text-purple-200 border border-purple-400/30'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      Store Inventory
                    </span>
                  </div>
                  {mode === 'existing' && (
                    <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    mode === 'existing' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Generate an ad poster for an active store inventory product. Uses the exact product photo and cloud AI.
                </p>
              </div>
            </div>
          </button>

          {/* Upcoming Product Strategy Card */}
          <button
            id="mode-upcoming"
            onClick={() => setMode('upcoming')}
            className={`relative text-left p-5 rounded-3xl border-2 transition-all duration-200 group overflow-hidden cursor-pointer ${
              mode === 'upcoming'
                ? 'border-indigo-600 bg-gradient-to-br from-[#081526] via-[#0B1D35] to-[#0F2B50] text-white shadow-xl scale-[1.01]'
                : 'border-[#E5E0D8] bg-white hover:border-indigo-300 hover:shadow-md text-[#0F291E]'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  mode === 'upcoming' ? 'bg-indigo-500/25 border border-indigo-400/30' : 'bg-indigo-50'
                }`}
              >
                <Rocket
                  className={`w-5 h-5 ${
                    mode === 'upcoming' ? 'text-indigo-300' : 'text-indigo-600'
                  }`}
                />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-extrabold ${
                        mode === 'upcoming' ? 'text-white' : 'text-[#0F291E]'
                      }`}
                    >
                      Upcoming Product Ad
                    </p>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        mode === 'upcoming'
                          ? 'bg-indigo-400/20 text-indigo-200 border border-indigo-400/30'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      Strategy Idea
                    </span>
                  </div>
                  {mode === 'upcoming' && (
                    <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    mode === 'upcoming' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Generate a pre-launch concept ad using your saved product strategy idea.
                </p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* ── Error Banner ─────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Content Area ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="glass-panel rounded-3xl border border-[#E5E0D8]/90 shadow-sm p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ── Left Panel: Controls & Product Selection ────────── */}
              <div className="lg:col-span-5 space-y-6">
                {/* ── EXISTING MODE: Inventory Products Selector ──────── */}
                {mode === 'existing' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5 text-purple-600" />
                          <span>Select Store Inventory Product</span>
                        </label>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {inventoryProducts.length} in catalog
                        </span>
                      </div>

                      {productsLoading ? (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse text-xs text-slate-400 flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-500" />
                          <span>Loading inventory products from MongoDB...</span>
                        </div>
                      ) : inventoryProducts.length === 0 ? (
                        <div className="p-6 rounded-2xl border-2 border-dashed border-[#E5E0D8] bg-[#FAF8F5]/50 text-center space-y-3">
                          <Package className="w-8 h-8 text-slate-300 mx-auto" />
                          <div>
                            <p className="text-xs font-bold text-[#0F291E]">No Inventory Products Found</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Add products to your store catalog first.</p>
                          </div>
                          <Link
                            to="/admin/products"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F291E] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" /> Open Product Manager
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Dropdown Selector */}
                          <div className="relative">
                            <select
                              id="inventory-product-selector"
                              value={selectedProductId}
                              onChange={(e) => handleSelectProduct(e.target.value)}
                              className="w-full px-4 py-3.5 pr-10 bg-white border-2 border-[#E5E0D8] rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer appearance-none shadow-2xs"
                            >
                              {inventoryProducts.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name} — ₹{p.price?.toLocaleString('en-IN')} ({p.categoryName || 'General'}) [{p.sku || 'SKU'}]
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>

                          {/* Selected Inventory Product Card with Exact Photo */}
                          {selectedProduct && (
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#120824] via-[#1E0B38] to-[#2D1054] text-white space-y-3 shadow-lg border border-purple-500/20">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-purple-400" /> Exact Store Product
                                </span>
                                {existingPosterStatus !== 'Not Generated' ? (
                                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-400/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    {existingPosterStatus === 'Saved' ? 'Poster Saved' : 'Poster Generated'}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 bg-white/10 text-slate-300 text-[10px] font-medium rounded-full">
                                    Ready to Generate
                                  </span>
                                )}
                              </div>

                              {/* Product Thumbnail & Details Row */}
                              <div className="flex items-center gap-3.5 pt-1">
                                <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                  {selectedProduct.images?.[0] ? (
                                    <img
                                      src={selectedProduct.images[0]}
                                      alt={selectedProduct.name}
                                      className="w-full h-full object-contain rounded-lg drop-shadow"
                                    />
                                  ) : (
                                    <Package className="w-8 h-8 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <p className="text-sm font-extrabold text-white font-serif truncate capitalize">
                                    {selectedProduct.name}
                                  </p>
                                  <p className="text-[11px] text-purple-200 font-mono">
                                    SKU: <span className="font-bold">{selectedProduct.sku || 'N/A'}</span> • {selectedProduct.categoryName || 'Store'}
                                  </p>
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <span className="text-xs font-black text-white">
                                      ₹{selectedProduct.price?.toLocaleString('en-IN')}
                                    </span>
                                    {selectedProduct.stock > 0 ? (
                                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                                        In Stock ({selectedProduct.stock})
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                                        Out of Stock
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {selectedProduct.description && (
                                <p className="text-[11px] text-slate-300 line-clamp-2 pt-1 border-t border-white/10 leading-relaxed">
                                  {selectedProduct.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── UPCOMING MODE: Strategy Summary ─────────────────── */}
                {mode === 'upcoming' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Product Strategy Source
                    </p>
                    {strategyLoading ? (
                      <div className="p-4 rounded-2xl bg-slate-50 animate-pulse text-xs text-slate-400">
                        Loading strategy...
                      </div>
                    ) : !strategyData?.productName ? (
                      <div className="p-6 rounded-2xl border-2 border-dashed border-[#E5E0D8] bg-[#FAF8F5]/50 text-center space-y-3">
                        <Rocket className="w-8 h-8 text-slate-300 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-[#0F291E]">No strategy found</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Complete the New Product strategy flow first.</p>
                        </div>
                        <Link
                          to="/marketing/product-strategy"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F291E] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5" /> Go to Product Strategy
                        </Link>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#081526] via-[#0B1D35] to-[#0F2B50] text-white space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest">
                            Strategy Loaded
                          </span>
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-400/30">
                            Upcoming
                          </span>
                        </div>
                        <div>
                          <p className="text-base font-extrabold text-white font-serif">{strategyData.productName}</p>
                          {strategyData.productTagline && (
                            <p className="text-xs text-indigo-200 italic mt-0.5">"{strategyData.productTagline}"</p>
                          )}
                        </div>
                        {strategyData.shortDescription && (
                          <p className="text-[11px] text-slate-300 line-clamp-2">{strategyData.shortDescription}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Theme Palette Selector ──────────────────────────── */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Poster Theme Style</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {themes[activeTheme]?.label}
                    </span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(themes).map(([key, t]) => (
                      <button
                        key={key}
                        id={`theme-${key}`}
                        title={t.label}
                        onClick={() => setActiveTheme(key)}
                        className={`h-11 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                          activeTheme === key
                            ? 'border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-500/20'
                            : 'border-[#E5E0D8] hover:border-slate-400'
                        }`}
                        style={{ backgroundColor: t.primary }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: t.accent }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Action Buttons ──────────────────────────────────── */}
                <div className="space-y-3 pt-2">
                  <button
                    id="btn-generate-poster"
                    onClick={() =>
                      mode === 'upcoming'
                        ? handleGenerateUpcoming(Boolean(adPosterData))
                        : handleGenerateExisting(Boolean(adPosterData))
                    }
                    disabled={generating || !canGenerate}
                    className="w-full py-4 rounded-2xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-xl hover:scale-101"
                    style={{
                      background:
                        mode === 'existing'
                          ? 'linear-gradient(135deg, #2D1054 0%, #4C1D95 50%, #1F0A3D 100%)'
                          : 'linear-gradient(135deg, #0B1D35 0%, #1E3A8A 50%, #0F2B50 100%)',
                      color: '#fff',
                    }}
                  >
                    {generating ? (
                      <>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                          <span>Generating Ad Poster...</span>
                        </div>
                        {genStepText && (
                          <span className="text-[10px] text-amber-200/80 font-mono font-normal animate-pulse px-4 text-center">
                            {genStepText}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>
                          {adPosterData
                            ? 'Regenerate Cloud Ad Poster'
                            : 'Generate Ad Poster (Cloud AI)'}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Secondary Save & Download Actions */}
                  {adPosterData && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        id="btn-save-poster"
                        onClick={handleSavePoster}
                        disabled={saving}
                        className="py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Saving...' : 'Save to MongoDB'}</span>
                      </button>

                      <button
                        id="btn-download-poster"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloading ? 'Exporting...' : 'Download PNG'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right Panel: Live Poster Canvas & Preview Views ── */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                {/* View Mode Switcher Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Preview Stage
                    </span>
                    {adPosterData && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Exact Product Ad
                      </span>
                    )}
                  </div>

                  {/* Toggle between Full Composite Poster vs Pure Cloud AI visual */}
                  {adPosterData && adDataHasCloudImage(adPosterData) && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        onClick={() => setPreviewView('canvas')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          previewView === 'canvas'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Branded Ad Poster
                      </button>
                      <button
                        onClick={() => setPreviewView('cloud_only')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                          previewView === 'cloud_only'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Cloud className="w-3 h-3 text-sky-500" /> Cloud Studio Render
                      </button>
                    </div>
                  )}
                </div>

                {/* Canvas Display */}
                <PosterCanvas
                  posterRef={posterRef}
                  adData={adPosterData}
                  theme={activeTheme}
                  selectedProduct={selectedProduct}
                  previewView={previewView}
                  setPreviewView={setPreviewView}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper to check if cloud image exists
const adDataHasCloudImage = (data) => {
  return Boolean(data?.cloudImageUrl || data?.cloudImageBase64);
};

export default AdPosterStudioPage;
