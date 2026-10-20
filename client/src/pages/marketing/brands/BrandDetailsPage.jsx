import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Package,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Tag,
  CheckCircle,
  ArrowRight,
  Save,
  Check
} from 'lucide-react';
import { brandService } from '../../../services/brandService';
import { useToast } from '../../../context/ToastContext';

export default function BrandDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBrandDetails();
  }, [id]);

  const fetchBrandDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await brandService.getBrandById(id);
      if (res.success && res.data.brand) {
        setBrand(res.data.brand);
        setProducts(res.data.products || []);
        setEditForm({
          brandName: res.data.brand.brandName || '',
          industry: res.data.brand.industry || '',
          tagline: res.data.brand.tagline || '',
          mission: res.data.brand.mission || '',
          vision: res.data.brand.vision || '',
          brandStory: res.data.brand.brandStory || '',
          logoConcept: res.data.brand.logoConcept || '',
          brandPositioning: res.data.brand.brandPositioning || '',
          brandUSP: res.data.brand.brandUSP || '',
        });
      } else {
        setError('Brand not found');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch brand details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await brandService.updateBrand(id, editForm);
      if (res.success) {
        setBrand(res.data.brand);
        setIsEditing(false);
        addToast('Brand details updated', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update brand', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!window.confirm(`Are you sure you want to delete brand "${brand.brandName}"? All associated products under this brand will also be removed.`)) {
      return;
    }
    try {
      const res = await brandService.deleteBrand(id);
      if (res.success) {
        addToast('Brand deleted', 'success');
        navigate('/marketing/brands');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete brand', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Loading brand details...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-[#E5E0D8] text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-[#0F291E]/90 mb-1">Brand Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">{error || 'Unable to load brand information.'}</p>
          <Link
            to="/marketing/brands"
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Brands</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] p-6 md:p-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-[#E5E0D8]/80 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/marketing/brands')}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs shrink-0">
              {brand.brandName ? brand.brandName[0].toUpperCase() : 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#0F291E]">{brand.brandName}</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md">
                  {brand.industry || 'Brand'}
                </span>
              </div>
              {brand.tagline && <p className="text-xs text-slate-500 italic mt-0.5">"{brand.tagline}"</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Brand'}</span>
            </button>

            <button
              onClick={handleDeleteBrand}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Brand"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link
              to={`/marketing/products/create?brandId=${brand._id}`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product under Brand</span>
            </Link>
          </div>
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveEdit} className="glass-panel p-6 rounded-2xl border border-[#E5E0D8] shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-[#0F291E] text-sm">Edit Brand Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={editForm.brandName}
                  onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={editForm.industry}
                  onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={editForm.tagline}
                onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Story</label>
              <textarea
                rows={3}
                value={editForm.brandStory}
                onChange={(e) => setEditForm({ ...editForm, brandStory: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg flex items-center gap-1">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Brand Details Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Mission, Vision, Story */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Mission & Vision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-[#E5E0D8]/80 shadow-xs">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Brand Mission</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{brand.mission || 'N/A'}</p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-[#E5E0D8]/80 shadow-xs">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Brand Vision</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{brand.vision || 'N/A'}</p>
              </div>
            </div>

            {/* Brand Story */}
            <div className="glass-panel p-5 rounded-2xl border border-[#E5E0D8]/80 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand Story</span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{brand.brandStory || 'N/A'}</p>
            </div>

            {/* Positioning & USP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E5E0D8] text-xs">
                <span className="font-bold text-[#0F291E]/90 block mb-1">Brand Positioning</span>
                <p className="text-slate-600">{brand.brandPositioning || 'N/A'}</p>
              </div>
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E5E0D8] text-xs">
                <span className="font-bold text-[#0F291E]/90 block mb-1">Brand USP</span>
                <p className="text-slate-600">{brand.brandUSP || 'N/A'}</p>
              </div>
            </div>

            {/* Products Under Brand Section */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E0D8]/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-[#0F291E]">Products under {brand.brandName}</h3>
                </div>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                  {products.length} Products
                </span>
              </div>

              {products.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-[#E5E0D8] rounded-xl bg-[#FAF8F5]/50">
                  <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-[#0F291E]/90 mb-1">No products created for this brand yet.</h4>
                  <p className="text-[11px] text-slate-500 mb-4 max-w-xs mx-auto">
                    Create product strategies and AI marketing assets linked directly to {brand.brandName}.
                  </p>
                  <Link
                    to={`/marketing/products/create?brandId=${brand._id}`}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Product under {brand.brandName}</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((prod) => (
                    <div
                      key={prod._id}
                      className="p-4 bg-[#FAF8F5] hover:glass-panel border border-[#E5E0D8] rounded-xl transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-bold text-[#0F291E] text-xs group-hover:text-indigo-600 transition-colors">
                          {prod.productName}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{prod.productIdea}</p>
                      </div>
                      <Link
                        to={`/marketing/products/${prod._id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Product"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Personality, Colors, Logo Prompt */}
          <div className="space-y-6">

            {/* Personality & Tone */}
            <div className="glass-panel p-5 rounded-2xl border border-[#E5E0D8]/80 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Brand Personality
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(brand.brandPersonality) && brand.brandPersonality.length > 0 ? (
                    brand.brandPersonality.map((p, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-[#0F291E]/90 text-xs font-semibold rounded-lg">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">N/A</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Tone of Voice
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(brand.brandTone) && brand.brandTone.length > 0 ? (
                    brand.brandTone.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-800 text-xs font-semibold rounded-lg">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="glass-panel p-5 rounded-2xl border border-[#E5E0D8]/80 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Color Palette
              </span>
              <div className="space-y-2">
                {Array.isArray(brand.colorPalette) && brand.colorPalette.length > 0 ? (
                  brand.colorPalette.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]/80 text-xs">
                      <div
                        className="w-7 h-7 rounded-lg border border-slate-300 shrink-0"
                        style={{ backgroundColor: c.hex || '#6366f1' }}
                      />
                      <div>
                        <span className="font-bold text-[#0F291E]/90 block">{c.name || 'Color'}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{c.hex} • {c.usage}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No color palette saved</p>
                )}
              </div>
            </div>

            {/* Logo Prompt */}
            {brand.logoConcept && (
              <div className="bg-[#0F291E] text-slate-100 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Logo Concept Prompt</span>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-slate-800 p-3 rounded-xl border border-slate-700 leading-relaxed">
                  {brand.logoConcept}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}


