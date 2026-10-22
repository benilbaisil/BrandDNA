import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  Package,
  Target,
  DollarSign,
  Layers,
  Palette,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  Check
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { marketingProductService } from '../../services/marketingProductService';
import { useToast } from '../../context/ToastContext';

export const AdPosterGeneratorSection = () => {
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // AI Generated Poster State
  const [adPosterData, setAdPosterData] = useState(null);
  const [adPosterStatus, setAdPosterStatus] = useState('Not Generated');

  // Customization Presets
  const [activeTheme, setActiveTheme] = useState('indigo_slate');
  const posterRef = useRef(null);

  // Themes
  const themes = {
    indigo_slate: { primary: '#0F172A', accent: '#4F46E5', bg: '#F8FAFC', text: '#FFFFFF', badgeBg: '#EEF2FF', badgeText: '#4338CA' },
    emerald_luxury: { primary: '#064E3B', accent: '#10B981', bg: '#F0FDF4', text: '#FFFFFF', badgeBg: '#ECFDF5', badgeText: '#047857' },
    amber_warm: { primary: '#78350F', accent: '#F59E0B', bg: '#FFFBEB', text: '#FFFFFF', badgeBg: '#FEF3C7', badgeText: '#B45309' },
    rose_chic: { primary: '#881337', accent: '#F43F5E', bg: '#FFF1F2', text: '#FFFFFF', badgeBg: '#FFE4E6', badgeText: '#BE123C' },
    dark_obsidian: { primary: '#090D16', accent: '#38BDF8', bg: '#0F172A', text: '#FFFFFF', badgeBg: '#1E293B', badgeText: '#38BDF8' },
  };

  useEffect(() => {
    fetchSavedProducts();
  }, []);

  const fetchSavedProducts = async () => {
    setError(null);
    try {
      const res = await marketingProductService.getProducts();
      if (res?.success && Array.isArray(res?.data?.products)) {
        setProducts(res.data.products);
        if (res.data.products.length > 0) {
          const first = res.data.products[0];
          setSelectedProductId(first._id);
          setSelectedProduct(first);
          if (first.adPosterData && first.adPosterStatus !== 'Not Generated') {
            setAdPosterData(first.adPosterData);
            setAdPosterStatus(first.adPosterStatus);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load saved products:', err);
      setError(err.response?.data?.message || 'Failed to load saved products from MongoDB.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p._id === id);
    setSelectedProduct(prod || null);
    if (prod?.adPosterData && prod?.adPosterStatus !== 'Not Generated') {
      setAdPosterData(prod.adPosterData);
      setAdPosterStatus(prod.adPosterStatus);
    } else {
      setAdPosterData(null);
      setAdPosterStatus('Not Generated');
    }
    setError(null);
  };

  const handleGeneratePoster = async () => {
    if (!selectedProductId) {
      addToast('Please select a saved product first.', 'error');
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const res = await marketingProductService.generateAdPoster(selectedProductId);
      if (res?.success && res?.data?.adPosterData) {
        setAdPosterData(res.data.adPosterData);
        setAdPosterStatus('Generated');
        addToast('AI Ad Poster concept generated from saved strategy!', 'success');
        
        // Update local products array state
        setProducts((prev) =>
          prev.map((p) =>
            p._id === selectedProductId
              ? { ...p, adPosterData: res.data.adPosterData, adPosterStatus: 'Generated' }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Poster generation error:', err);
      const msg = err.response?.data?.message || 'Failed to generate AI Ad Poster concept.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegeneratePoster = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await marketingProductService.regenerateAdPoster(selectedProductId);
      if (res?.success && res?.data?.adPosterData) {
        setAdPosterData(res.data.adPosterData);
        setAdPosterStatus('Generated');
        addToast('Fresh AI Ad Poster concept regenerated!', 'success');
      }
    } catch (err) {
      console.error('Regenerate error:', err);
      addToast('Failed to regenerate poster.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePoster = async () => {
    if (!selectedProductId || !adPosterData) return;
    setSaving(true);
    try {
      const res = await marketingProductService.saveAdPoster(selectedProductId, {
        adPosterData,
      });
      if (res?.success) {
        setAdPosterStatus('Saved');
        addToast('Ad Poster reference saved to MongoDB!', 'success');
      }
    } catch (err) {
      console.error('Save error:', err);
      addToast('Failed to save poster reference.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = `${(selectedProduct?.productName || 'ad_poster').toLowerCase().replace(/\s+/g, '_')}_poster.png`;
      link.href = image;
      link.download = filename;
      link.click();
      addToast('Ad poster downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      addToast('Failed to export poster image.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const currTheme = themes[activeTheme] || themes.indigo_slate;

  // Extract saved strategy details cleanly
  const productName = selectedProduct?.productName || 'Selected Product';
  const productIdea = selectedProduct?.productIdea || '';
  const category = selectedProduct?.category || 'E-Commerce Product';
  const usps = selectedProduct?.usps || [];
  const primaryUspText = usps.length > 0 ? (usps[0].title ? `${usps[0].title} - ${usps[0].description}` : usps[0]) : '';
  const priceDisplay = selectedProduct?.pricingSuggestion?.suggestedPriceRange ||
                      selectedProduct?.pricingSuggestion?.priceINR ||
                      selectedProduct?.pricingSuggestion?.priceUSD || '';
  const positioningStmt = selectedProduct?.positioning?.positioningStatement ||
                          selectedProduct?.positioning?.marketPositioning || '';
  const packagingConcept = selectedProduct?.packaging?.designConcept || selectedProduct?.packaging?.type || '';

  return (
    <div className="glass-panel rounded-3xl border border-[#E5E0D8]/80 shadow-xs p-6 md:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Ad Poster Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F291E]">
            AI Ad Poster Generator
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Automatically craft e-commerce promotional posters using real saved MongoDB strategy data (USPs, Pricing, Positioning & Brand Identity).
          </p>
        </div>

        {adPosterStatus !== 'Not Generated' && (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              adPosterStatus === 'Saved' 
                ? 'bg-[#FAF8F5]merald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-[#FAF8F5]mber-50 text-amber-700 border border-amber-200'
            }`}>
              {adPosterStatus === 'Saved' ? '✓ Saved in MongoDB' : '• Concept Ready'}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {products.length === 0 ? (
        /* Empty State */
        <div className="py-12 text-center border-2 border-dashed border-[#E5E0D8] rounded-3xl bg-[#FAF8F5]/50 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F291E]/90">No Saved Products Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Create and save a Product Strategy first to automatically generate AI Ad Posters.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Product Selector & Strategy Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Saved Product Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                1. Select Saved Product from MongoDB
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl text-xs font-semibold text-[#0F291E]/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName} ({p.category || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Strategy Context Summary Card */}
            {selectedProduct && (
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]/90 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F291E]/90">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Saved Strategy Context</span>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    MongoDB Verified
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Product Idea</span>
                    <p className="font-semibold text-[#0F291E]/90 line-clamp-2 italic">"{productIdea}"</p>
                  </div>

                  {primaryUspText && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Primary USP</span>
                      <p className="text-slate-700 font-medium line-clamp-2">{primaryUspText}</p>
                    </div>
                  )}

                  {priceDisplay && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Suggested Price:</span>
                      <span className="font-extrabold text-[#0F291E] glass-panel px-2 py-0.5 rounded border border-[#E5E0D8] text-xs">
                        {priceDisplay}
                      </span>
                    </div>
                  )}

                  {positioningStmt && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Positioning</span>
                      <p className="text-slate-600 text-[11px] line-clamp-2">{positioningStmt}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Theme Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Poster Style Theme</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(themes).map((tKey) => {
                  const t = themes[tKey];
                  return (
                    <button
                      key={tKey}
                      onClick={() => setActiveTheme(tKey)}
                      className={`h-10 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                        activeTheme === tKey ? 'border-indigo-600 scale-105 shadow-sm' : 'border-[#E5E0D8] hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: t.primary }}
                      title={tKey.replace('_', ' ')}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleGeneratePoster}
                disabled={generating}
                className="w-full py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-slate-900 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>AI Engine Generating Poster Concept...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate AI Ad Poster</span>
                  </>
                )}
              </button>

              {adPosterData && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleRegeneratePoster}
                    disabled={generating}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={handleSavePoster}
                    disabled={saving}
                    className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPoster}
                    disabled={downloading}
                    className="py-2.5 bg-[#FAF8F5]merald-600 hover:bg-[#FAF8F5]merald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloading ? 'Exporting...' : 'Download'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: AI Poster Preview Canvas */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            <div className="w-full flex items-center justify-between mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Live Poster Preview</span>
              <span className="text-[10px] text-slate-400">High Resolution Render</span>
            </div>

            {!adPosterData ? (
              /* Pre-generation Placeholder Canvas */
              <div className="w-full max-w-sm aspect-[4/5] rounded-3xl border-2 border-dashed border-[#E5E0D8] bg-[#FAF8F5]/70 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F291E]/90">Poster Canvas Ready</h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Click "Generate AI Ad Poster" above to create an optimized promotional poster based on saved strategy data.
                  </p>
                </div>
              </div>
            ) : (
              /* Rendered AI Ad Poster Card */
              <div className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border border-[#E5E0D8]/80 transition-all duration-300">
                <div
                  ref={posterRef}
                  className="aspect-[4/5] p-8 sm:p-10 flex flex-col justify-between relative text-white"
                  style={{
                    backgroundColor: currTheme.primary,
                    backgroundImage: `radial-gradient(circle at top right, ${currTheme.accent}33, transparent 60%)`
                  }}
                >
                  {/* Top Bar: Brand Badge & Category */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg glass-panel/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-xs">
                        {adPosterData.brandNameText?.charAt(0) || 'B'}
                      </div>
                      <span className="font-extrabold tracking-tight text-sm text-white uppercase font-serif">
                        {adPosterData.brandNameText || 'BrandDNA'}
                      </span>
                    </div>

                    {adPosterData.categoryText && (
                      <span className="px-3 py-1 glass-panel/10 backdrop-blur-md rounded-full text-[10px] font-semibold text-slate-200 tracking-wider uppercase border border-white/10">
                        {adPosterData.categoryText}
                      </span>
                    )}
                  </div>

                  {/* Main Creative Copy Hero Section */}
                  <div className="my-auto space-y-4 z-10 py-6">
                    
                    {/* Primary USP Badge */}
                    {adPosterData.primaryUSP && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                        style={{ backgroundColor: currTheme.badgeBg, color: currTheme.badgeText }}>
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span className="uppercase tracking-wider text-[10px]">{adPosterData.primaryUSP}</span>
                      </div>
                    )}

                    {/* Headline */}
                    <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight font-serif text-white">
                      {adPosterData.headline}
                    </h3>

                    {/* Subheadline */}
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-sm font-sans opacity-90">
                      {adPosterData.subheadline}
                    </p>

                    {/* Positioning Statement snippet */}
                    {adPosterData.positioningMessage && (
                      <p className="text-[11px] text-slate-300 italic border-l-2 border-amber-400/80 pl-3 py-0.5">
                        "{adPosterData.positioningMessage}"
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Footer Bar */}
                  <div className="pt-6 border-t border-white/15 flex items-center justify-between z-10">
                    <div>
                      {adPosterData.pricingText && (
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">Suggested Price</span>
                          <span className="text-lg font-black text-white">{adPosterData.pricingText}</span>
                        </div>
                      )}
                    </div>

                    {/* Call to Action Button */}
                    <div className="px-6 py-3 rounded-2xl font-extrabold text-xs tracking-wide uppercase shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: currTheme.accent, color: currTheme.text }}>
                      <span>{adPosterData.ctaText || 'Shop Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Visual Background Accent Details */}
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ backgroundColor: currTheme.accent }} />
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default AdPosterGeneratorSection;


