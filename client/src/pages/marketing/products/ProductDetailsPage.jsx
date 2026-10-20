import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Package,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Tag,
  CheckCircle,
  DollarSign,
  UserCheck,
  Megaphone,
  Share2,
  Tv,
  Check,
  Save,
  Info
} from 'lucide-react';
import { marketingProductService } from '../../../services/marketingProductService';
import { useToast } from '../../../context/ToastContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('strategy');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await marketingProductService.getProductById(id);
      if (res.success && res.data.product) {
        setProduct(res.data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm(`Are you sure you want to delete product "${product.productName}"?`)) {
      return;
    }
    try {
      const res = await marketingProductService.deleteProduct(id);
      if (res.success) {
        addToast('Product deleted', 'success');
        navigate('/marketing/products');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading product strategy & marketing details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-[#E5E0D8] text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-[#0F291E]/90 mb-1">Product Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">{error || 'Unable to load product information.'}</p>
          <Link
            to="/marketing/products"
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const parentBrand = product.brand || {};

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] p-6 md:p-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-[#E5E0D8]/80 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/marketing/products')}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs shrink-0">
              {product.productName ? product.productName[0].toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#0F291E]">{product.productName}</h1>
                {parentBrand.brandName && (
                  <Link
                    to={`/marketing/brands/${parentBrand._id}`}
                    className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>Brand: {parentBrand.brandName}</span>
                  </Link>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-lg">"{product.productIdea}"</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteProduct}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 border-b border-[#E5E0D8] pb-2 scrollbar-none">
          {[
            { id: 'strategy', name: 'Identity & Strategy', icon: Package },
            { id: 'persona', name: 'Customer Persona', icon: UserCheck },
            { id: 'packaging', name: 'Packaging', icon: Tag },
            { id: 'marketing', name: 'Marketing Ideas', icon: Sparkles },
            { id: 'campaigns', name: 'Campaigns', icon: Megaphone },
            { id: 'social', name: 'Social Media', icon: Share2 },
            { id: 'adCopy', name: 'Ad Copy', icon: Tv },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'glass-panel text-slate-600 hover:text-indigo-600 border border-[#E5E0D8]/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="glass-panel rounded-2xl border border-[#E5E0D8]/80 shadow-xs p-6 md:p-8 min-h-[400px]">

          {/* TAB 1: IDENTITY & STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="space-y-6 text-sm">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Elevator Pitch
                </span>
                <p className="text-xs text-[#0F291E]/90 leading-relaxed font-medium">
                  {product.description?.shortDescription || product.productIdea}
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
                <span className="text-[10px] font-bold text-[#0F291E] uppercase tracking-wider block mb-1">
                  Detailed Overview
                </span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description?.detailedDescription || 'N/A'}
                </p>
              </div>

              {/* Pricing Suggestions */}
              {product.pricingSuggestion?.suggestedPriceRange && (
                <div className="p-4 bg-[#FAF8F5]merald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>AI Pricing Recommendations</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="glass-panel p-3 rounded-lg border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Suggested Range</span>
                      <span className="text-base font-extrabold text-[#0F291E]">
                        {product.pricingSuggestion.suggestedPriceRange}
                      </span>
                    </div>
                    <div className="glass-panel p-3 rounded-lg border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Pricing Strategy</span>
                      <span className="text-sm font-bold text-[#0F291E]/90">
                        {product.pricingSuggestion.pricingStrategy}
                      </span>
                    </div>
                  </div>
                  {product.pricingSuggestion.reasoning && (
                    <p className="text-xs text-slate-700 glass-panel p-3 rounded-lg border border-emerald-100">
                      <strong>Reasoning:</strong> {product.pricingSuggestion.reasoning}
                    </p>
                  )}
                  {product.pricingSuggestion.disclaimer && (
                    <p className="text-[11px] text-amber-700 italic flex items-center gap-1.5 bg-[#FAF8F5]mber-50 p-2 rounded-lg border border-amber-200">
                      <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{product.pricingSuggestion.disclaimer}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Positioning */}
              {product.positioning?.positioningStatement && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-[#0F291E] uppercase tracking-wider block">Positioning Statement</span>
                  <p className="text-slate-700 italic">"{product.positioning.positioningStatement}"</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOMER PERSONA */}
          {activeTab === 'persona' && (
            <div className="space-y-6 text-sm">
              <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200">AI Target Persona</span>
                <h3 className="text-xl font-bold">{product.customerPersona?.name || 'Target Customer'}</h3>
                <p className="text-xs text-purple-100 mt-0.5">
                  {product.customerPersona?.occupation} • Age: {product.customerPersona?.ageRange}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
                  <h4 className="font-bold text-rose-800 uppercase tracking-wider mb-2">Pain Points</h4>
                  <ul className="space-y-1.5 text-slate-700">
                    {Array.isArray(product.customerPersona?.painPoints) ? (
                      product.customerPersona.painPoints.map((pt, i) => <li key={i}>• {pt}</li>)
                    ) : (
                      <li>{product.customerPersona?.painPoints || 'N/A'}</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
                  <h4 className="font-bold text-emerald-800 uppercase tracking-wider mb-2">Needs & Motivations</h4>
                  <ul className="space-y-1.5 text-slate-700">
                    {Array.isArray(product.customerPersona?.needs) ? (
                      product.customerPersona.needs.map((nd, i) => <li key={i}>• {nd}</li>)
                    ) : (
                      <li>{product.customerPersona?.needs || 'N/A'}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PACKAGING */}
          {activeTab === 'packaging' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5E0D8]">
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Packaging Type</span>
                  <span className="font-medium text-[#0F291E]">{product.packaging?.type || 'N/A'}</span>
                </div>
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5E0D8]">
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Material</span>
                  <span className="font-medium text-[#0F291E]">{product.packaging?.material || 'N/A'}</span>
                </div>
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5E0D8]">
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Sustainability</span>
                  <span className="font-medium text-[#0F291E]">{product.packaging?.sustainability || 'N/A'}</span>
                </div>
              </div>
              {product.packaging?.designConcept && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl">
                  <span className="font-bold text-[#0F291E]/90 block mb-1">Visual Design Concept</span>
                  <p className="text-slate-700">{product.packaging.designConcept}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MARKETING IDEAS */}
          {activeTab === 'marketing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl">
                <h4 className="font-bold text-indigo-900 uppercase tracking-wider mb-2">Online Strategy</h4>
                <ul className="space-y-2 text-slate-700">
                  {Array.isArray(product.marketingIdeas?.onlineMarketing) &&
                    product.marketingIdeas.onlineMarketing.map((m, i) => <li key={i}>• {m}</li>)}
                </ul>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl">
                <h4 className="font-bold text-purple-900 uppercase tracking-wider mb-2">Offline Strategy</h4>
                <ul className="space-y-2 text-slate-700">
                  {Array.isArray(product.marketingIdeas?.offlineMarketing) &&
                    product.marketingIdeas.offlineMarketing.map((m, i) => <li key={i}>• {m}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4 text-xs">
              {Array.isArray(product.campaigns) && product.campaigns.map((camp, idx) => (
                <div key={idx} className="p-5 glass-panel border border-[#E5E0D8] rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-[#0F291E] text-sm">{camp.name || 'Campaign'}</h4>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md">
                      {camp.duration}
                    </span>
                  </div>
                  <p className="text-[#0F291E]/90 italic">"{camp.promotionalMessage}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Offer: <strong className="text-[#0F291E]/90">{camp.offerIdea}</strong></span>
                    <span className="font-bold text-indigo-600">CTA: {camp.callToAction}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: SOCIAL MEDIA */}
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {Array.isArray(product.socialMediaContent) && product.socialMediaContent.map((post, idx) => (
                <div key={idx} className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl space-y-2">
                  <span className="font-bold text-[#0F291E]/90 glass-panel px-2 py-0.5 rounded border border-[#E5E0D8]">
                    {post.platform}
                  </span>
                  <p className="text-[#0F291E]/90 font-mono glass-panel p-3 rounded-lg border border-[#E5E0D8]">
                    {post.caption}
                  </p>
                  <div className="text-indigo-600 font-medium">
                    {Array.isArray(post.hashtags) ? post.hashtags.join(' ') : post.hashtags}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: AD COPY */}
          {activeTab === 'adCopy' && (
            <div className="space-y-4 text-xs">
              {Array.isArray(product.advertisementCopy) && product.advertisementCopy.map((ad, idx) => (
                <div key={idx} className="p-5 glass-panel border border-[#E5E0D8] rounded-xl shadow-xs space-y-3">
                  <h4 className="font-extrabold text-[#0F291E] text-sm">{ad.headline}</h4>
                  <p className="text-slate-700 bg-[#FAF8F5] p-3 rounded-lg border border-[#E5E0D8]">{ad.primaryText}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">{ad.shortCopy}</span>
                    <button className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg">{ad.callToAction}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


