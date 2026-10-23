import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Target,
  Sparkles,
  ArrowRight,
  Trash2,
  DollarSign,
  Package,
  Layers,
  Clock,
  Plus,
  Edit3,
  CheckCircle2,
  Image as ImageIcon,
  Wand2,
  Download,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';
import { marketingProductService } from '../../services/marketingProductService';
import { useToast } from '../../context/ToastContext';
import { AdPosterModal } from './AdPosterModal';

export const SavedStrategiesPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedPosterId, setSelectedPosterId] = useState(null);

  useEffect(() => {
    fetchSavedStrategies();
  }, []);

  const fetchSavedStrategies = async () => {
    setLoading(true);
    try {
      const res = await marketingProductService.getProducts();
      if (res?.success && Array.isArray(res?.data?.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching saved strategies:', err);
      addToast(err.response?.data?.message || 'Failed to fetch saved strategies from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this strategy'}" and its saved ad poster from MongoDB?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await marketingProductService.deleteProduct(id);
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        addToast(`Strategy "${name || 'Item'}" and ad poster deleted successfully!`, 'success');
      }
    } catch (err) {
      console.error('Error deleting strategy:', err);
      addToast('Failed to delete strategy from MongoDB.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const totalStrategies = products.length;
  const strategiesWithAds = products.filter(
    (p) => Boolean(p.adPosterData?.headline) || p.adPosterStatus === 'Saved' || p.adPosterStatus === 'Generated'
  ).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E5E0D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0F291E] text-white rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MongoDB Strategy & Ad Collection</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F291E] tracking-tight">
              Saved Strategies & Generated Ads
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              View, manage, load, and export all AI-generated product launch strategies and their companion AI ad posters saved to MongoDB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/marketing/ad-poster"
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs border border-indigo-200 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>Ad Poster Studio</span>
            </Link>

            <Link
              to="/marketing/product-strategy"
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>New Product Strategy</span>
            </Link>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-[#E5E0D8] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Total Saved Strategies
              </span>
              <p className="text-2xl font-black text-[#0F291E] mt-0.5">{totalStrategies}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#E5E0D8] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Ad Posters Saved
              </span>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">{strategiesWithAds}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#E5E0D8] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Database Status
              </span>
              <p className="text-sm font-bold text-[#0F291E] mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>MongoDB Synchronized</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <BookmarkCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="glass-panel p-16 text-center rounded-3xl border border-[#E5E0D8] space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#0F291E]">Loading saved strategies & ads...</p>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="glass-panel p-14 text-center rounded-3xl border-2 border-dashed border-[#E5E0D8] space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <BookmarkCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#0F291E]">No Product Strategies Saved Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Go to the New Product Strategy page, type your product idea, generate the strategy, and click <strong>'Save Strategy'</strong> or <strong>'Save & Continue'</strong> to store both the strategy and generated ad poster here.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/marketing/product-strategy"
                className="px-5 py-3 bg-[#0F291E] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Open Product Strategy Tool</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map((prod) => {
              const priceText =
                prod.pricingSuggestion?.suggestedPriceRange ||
                prod.pricing?.suggestedPriceRange ||
                'Market Optimal';
              const formattedDate = new Date(prod.updatedAt || prod.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const hasAdPoster = Boolean(prod.adPosterData?.headline);
              const poster = prod.adPosterData;

              return (
                <div
                  key={prod._id}
                  className="glass-panel p-6 sm:p-7 rounded-3xl border border-[#E5E0D8]/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
                >
                  {/* Top Section: Strategy Overview */}
                  <div className="space-y-4">
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
                          Product Strategy
                        </span>
                        <h3 className="text-xl font-extrabold text-[#0F291E] group-hover:text-indigo-600 transition-colors mt-0.5">
                          {prod.name || prod.productName || 'Untitled Strategy'}
                        </h3>
                        {prod.tagline && (
                          <p className="text-xs text-slate-500 italic mt-0.5">"{prod.tagline}"</p>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-[#E5E0D8] shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formattedDate}
                      </span>
                    </div>

                    {/* Product Idea Callout */}
                    {prod.productIdea && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]/80 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Product Idea</span>
                        <p className="text-xs text-slate-700 font-medium line-clamp-2 italic">
                          "{prod.productIdea}"
                        </p>
                      </div>
                    )}

                    {/* USPs Tags */}
                    {Array.isArray(prod.usps) && prod.usps.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Key USPs</span>
                        <div className="flex flex-wrap gap-1.5">
                          {prod.usps.slice(0, 3).map((u, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
                            >
                              {typeof u === 'string' ? u : u.title || u.headline || 'USP'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing & Positioning Info */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]/80">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-0.5">
                          Price Guidance
                        </span>
                        <span className="font-bold text-[#0F291E] text-xs">{priceText}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]/80">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-0.5">
                          Packaging
                        </span>
                        <span className="font-bold text-[#0F291E] text-xs truncate block">
                          {prod.packaging?.type || 'Standard Box'}
                        </span>
                      </div>
                    </div>

                    {/* ── DEDICATED SAVED AD POSTER SHOWCASE ── */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>AI Marketing Ad Poster</span>
                        </span>
                        {hasAdPoster ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Ad Poster Saved</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold inline-flex items-center gap-1 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>No Ad Generated Yet</span>
                          </span>
                        )}
                      </div>

                      {hasAdPoster ? (
                        /* Saved Ad Card Preview */
                        <div
                          className="rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-sm transition-all space-y-3 relative overflow-hidden"
                          style={{
                            background: poster?.themeColors?.bg
                              ? `linear-gradient(135deg, ${poster.themeColors.bg} 0%, #FFFFFF 100%)`
                              : 'linear-gradient(135deg, #EEF2FF 0%, #FAF8F5 100%)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className="text-[10px] font-bold tracking-widest uppercase"
                              style={{ color: poster?.themeColors?.text || '#4F46E5' }}
                            >
                              {poster.brandNameText || prod.name || 'Ad Creative'}
                            </span>
                            {poster.primaryUSP && (
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                                style={{
                                  backgroundColor: poster?.themeColors?.accent || '#4F46E5',
                                  color: '#FFFFFF',
                                }}
                              >
                                {poster.primaryUSP}
                              </span>
                            )}
                          </div>

                          <div>
                            <h4
                              className="font-serif text-lg sm:text-xl font-extrabold leading-snug"
                              style={{ color: poster?.themeColors?.primary || '#0F172A' }}
                            >
                              "{poster.headline}"
                            </h4>
                            {poster.subheadline && (
                              <p
                                className="text-xs font-medium leading-relaxed mt-1 opacity-90 line-clamp-2"
                                style={{ color: poster?.themeColors?.text || '#334155' }}
                              >
                                {poster.subheadline}
                              </p>
                            )}
                          </div>

                          {/* Ad Preview Footer with Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5">
                            <div className="space-y-0.5">
                              {poster.pricingText && (
                                <span className="text-xs font-bold text-slate-800">
                                  {poster.pricingText}
                                </span>
                              )}
                              {poster.ctaText && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-100 ml-2">
                                  CTA: {poster.ctaText}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedPosterId(prod._id)}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-indigo-600" />
                                <span>View & Export</span>
                              </button>

                              <button
                                onClick={() =>
                                  navigate(`/marketing/ad-poster?productId=${prod._id}&mode=upcoming`)
                                }
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Wand2 className="w-3 h-3" />
                                <span>Edit in Studio</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Empty Ad Notice */
                        <div className="rounded-2xl p-4 border border-dashed border-[#E5E0D8] bg-[#FAF8F5] flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-700">No Ad Poster Generated Yet</p>
                            <p className="text-[11px] text-slate-500">
                              Craft high-converting ad copy and theme visuals in the Ad Poster Studio.
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              navigate(`/marketing/ad-poster?productId=${prod._id}&mode=upcoming`)
                            }
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Create Ad</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleDelete(prod._id, prod.name || prod.productName)}
                      disabled={deletingId === prod._id}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete strategy and ad from MongoDB"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPosterId(prod._id)}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Ad Poster Modal</span>
                      </button>

                      <button
                        onClick={() => navigate(`/marketing/product-strategy?id=${prod._id}`)}
                        className="px-4 py-2 bg-[#0F291E] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Edit Strategy</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Ad Poster High-Res Canvas Modal */}
      {selectedPosterId && (
        <AdPosterModal
          productId={selectedPosterId}
          onClose={() => setSelectedPosterId(null)}
        />
      )}
    </div>
  );
};

export default SavedStrategiesPage;
