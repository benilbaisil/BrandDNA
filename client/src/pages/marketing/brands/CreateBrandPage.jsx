import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Check,
  CheckCircle,
  RefreshCw,
  Edit2,
  Save,
  Building2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Palette,
  Target,
  Layers,
  ChevronRight,
  Package
} from 'lucide-react';
import { brandService } from '../../../services/brandService';
import { useToast } from '../../../context/ToastContext';

export default function CreateBrandPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1: Input, 2: AI Generated Review, 3: Finalizing

  // Step 1 Form Data
  const [formData, setFormData] = useState({
    brandIdea: '',
    industry: '',
    businessDescription: '',
    targetMarket: '',
    businessGoals: '',
    preferredStyleTone: '',
    productIdea: '',
  });

  // AI Output & Selected Choices
  const [aiResult, setAiResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  // Selected Active Attributes
  const [selectedBrandName, setSelectedBrandName] = useState('');
  const [selectedTagline, setSelectedTagline] = useState('');
  const [editableFields, setEditableFields] = useState({
    mission: '',
    vision: '',
    brandStory: '',
    logoConcept: '',
    brandPositioning: '',
    brandUSP: '',
  });

  const [saving, setSaving] = useState(false);

  const handleGenerateBrand = async (e) => {
    e?.preventDefault();
    if (!formData.brandIdea.trim()) {
      addToast('Please enter a Brand Idea / Concept', 'error');
      return;
    }

    try {
      setGenerating(true);
      setGenError(null);
      const res = await brandService.generateBrandAI(formData);

      if (res.success && res.data?.aiResult) {
        const result = res.data.aiResult;
        setAiResult(result);

        const brandIdResult = result.brandIdentity || result;

        // Pre-select first name and tagline suggestions if available
        if (Array.isArray(brandIdResult.brandNames) && brandIdResult.brandNames.length > 0) {
          const first = brandIdResult.brandNames[0];
          setSelectedBrandName(typeof first === 'string' ? first : first.name);
        }

        if (Array.isArray(brandIdResult.taglines) && brandIdResult.taglines.length > 0) {
          const first = brandIdResult.taglines[0];
          setSelectedTagline(typeof first === 'string' ? first : first.text);
        }

        setEditableFields({
          mission: brandIdResult.mission || '',
          vision: brandIdResult.vision || '',
          brandStory: brandIdResult.brandStory || '',
          logoConcept: brandIdResult.logoConcept || '',
          brandPositioning: brandIdResult.brandPositioning || '',
          brandUSP: brandIdResult.brandUSP || '',
        });

        setStep(2);
        addToast('Brand Identity generated successfully!', 'success');
      } else {
        setGenError('Unable to generate Brand Identity. Please check inputs and try again.');
      }
    } catch (err) {
      console.error(err);
      setGenError(err.response?.data?.message || 'Unable to generate Brand Identity. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveBrand = async () => {
    if (!selectedBrandName || !selectedBrandName.trim()) {
      addToast('Please select or enter a Brand Name before saving.', 'error');
      return;
    }

    try {
      setSaving(true);
      const brandPayload = {
        brandName: selectedBrandName.trim(),
        industry: formData.industry,
        businessDescription: formData.businessDescription,
        targetMarket: formData.targetMarket,
        businessGoals: formData.businessGoals,
        preferredStyleTone: formData.preferredStyleTone,
        brandIdea: formData.brandIdea,
        tagline: selectedTagline,
        mission: editableFields.mission,
        vision: editableFields.vision,
        brandStory: editableFields.brandStory,
        brandPersonality: aiResult?.brandIdentity?.brandPersonality || aiResult?.brandPersonality || [],
        brandTone: aiResult?.brandIdentity?.brandTone || aiResult?.brandTone || [],
        colorPalette: aiResult?.brandIdentity?.colorPalette || aiResult?.colorPalette || [],
        logoConcept: editableFields.logoConcept,
        brandPositioning: editableFields.brandPositioning,
        brandUSP: editableFields.brandUSP,
        nameSuggestions: aiResult?.brandIdentity?.brandNames || aiResult?.brandNames || [],
        taglineSuggestions: aiResult?.brandIdentity?.taglines || aiResult?.taglines || [],
      };

      const res = await brandService.createBrand(brandPayload);
      if (res.success && res.data.brand) {
        addToast(`Brand "${res.data.brand.brandName}" created successfully!`, 'success');
        return res.data.brand._id;
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to save brand', 'error');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    const brandId = await handleSaveBrand();
    if (brandId) {
      navigate('/marketing/brands');
    }
  };

  const handleCreateProductStrategy = async () => {
    const brandId = await handleSaveBrand();
    if (brandId) {
      navigate('/marketing/products/create', {
        state: {
          brandId,
          productIdea: formData.productIdea,
          productStrategy: aiResult?.productStrategy,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] p-6 md:p-8 pb-16">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/marketing/brands"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0F291E] tracking-tight">AI Brand Creation Wizard</h1>
            <p className="text-xs text-slate-500">
              Provide basic business parameters and Gemini will generate a full Brand Identity.
            </p>
          </div>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="glass-panel p-4 rounded-2xl border border-[#E5E0D8]/80 shadow-xs flex items-center justify-between gap-4 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              1
            </span>
            <span>Brand Information</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              2
            </span>
            <span>Review & Customize Identity</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              3
            </span>
            <span>Save Brand</span>
          </div>
        </div>

        {/* STEP 1: INPUT FORM */}
        {step === 1 && (
          <form onSubmit={handleGenerateBrand} className="glass-panel rounded-2xl border border-[#E5E0D8]/80 shadow-xs p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-[#0F291E] flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                Step 1: Basic Brand & Business Idea
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Do NOT enter the final brand name—Gemini will generate names dynamically based on your concept.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Business Idea *
              </label>
              <textarea
                rows={3}
                placeholder="Describe your business idea in detail (e.g. Eco-friendly zero-waste kitchenware made from bamboo for urban households)"
                value={formData.brandIdea}
                onChange={(e) => setFormData({ ...formData, brandIdea: e.target.value })}
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Sustainability & Home Goods, HealthTech, Fashion"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Market</label>
                <input
                  type="text"
                  placeholder="e.g. Eco-conscious college students, Working professionals"
                  value={formData.targetMarket}
                  onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Description & Goals</label>
              <textarea
                rows={2}
                placeholder="Describe key business goals (e.g. Establish a premium sustainable brand with 100% recyclable packaging)"
                value={formData.businessGoals}
                onChange={(e) => setFormData({ ...formData, businessGoals: e.target.value })}
                className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Brand Style / Tone (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Modern, Minimalist, Earthy, Professional, Energetic"
                value={formData.preferredStyleTone}
                onChange={(e) => setFormData({ ...formData, preferredStyleTone: e.target.value })}
                className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel"
              />
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-[#0F291E] flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-emerald-600" />
                Product Strategy (Optional)
              </h3>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Idea / Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe a specific product you want to launch. Gemini will generate a Product Strategy preview."
                value={formData.productIdea}
                onChange={(e) => setFormData({ ...formData, productIdea: e.target.value })}
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {genError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{genError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={generating}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Brand Identity with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Brand Identity</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW & CUSTOMIZE AI GENERATED BRAND IDENTITY */}
        {step === 2 && aiResult && (
          <div className="glass-panel rounded-2xl border border-[#E5E0D8]/80 shadow-xs p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#0F291E] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Step 2: Review & Select AI Suggestions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on name and tagline suggestions to select them as active identity attributes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateBrand}
                  disabled={generating}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  <span>Regenerate AI</span>
                </button>
              </div>
            </div>

            {/* 1. Brand Name Suggestions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Select Brand Name *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {Array.isArray(aiResult?.brandIdentity?.brandNames || aiResult?.brandNames) && (aiResult?.brandIdentity?.brandNames || aiResult?.brandNames).map((item, idx) => {
                  const nameStr = typeof item === 'string' ? item : item.name;
                  const reasonStr = typeof item === 'object' ? item.reason : '';
                  const isSelected = selectedBrandName === nameStr;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedBrandName(nameStr)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 shadow-xs'
                          : 'glass-panel border-[#E5E0D8] hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#0F291E] text-sm">{nameStr}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                      </div>
                      {reasonStr && <p className="text-[11px] text-slate-500 leading-snug">{reasonStr}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Manual name override input */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-slate-500">Or enter custom name:</span>
                <input
                  type="text"
                  value={selectedBrandName}
                  onChange={(e) => setSelectedBrandName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-[#0F291E] focus:ring-2 focus:ring-indigo-500"
                  placeholder="Custom Brand Name"
                />
              </div>
            </div>

            {/* 2. Tagline Suggestions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. Select Tagline
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.isArray(aiResult?.brandIdentity?.taglines || aiResult?.taglines) && (aiResult?.brandIdentity?.taglines || aiResult?.taglines).map((tag, idx) => {
                  const tagStr = typeof tag === 'string' ? tag : tag.text;
                  const isSelected = selectedTagline === tagStr;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTagline(tagStr)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200 font-medium text-purple-900'
                          : 'glass-panel border-[#E5E0D8] text-[#0F291E]/90 hover:border-purple-300'
                      }`}
                    >
                      <span className="italic">"{tagStr}"</span>
                      {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Mission Statement</label>
                <textarea
                  rows={3}
                  value={editableFields.mission}
                  onChange={(e) => setEditableFields({ ...editableFields, mission: e.target.value })}
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Vision Statement</label>
                <textarea
                  rows={3}
                  value={editableFields.vision}
                  onChange={(e) => setEditableFields({ ...editableFields, vision: e.target.value })}
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Brand Story */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Origin Story</label>
              <textarea
                rows={4}
                value={editableFields.brandStory}
                onChange={(e) => setEditableFields({ ...editableFields, brandStory: e.target.value })}
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-slate-300 rounded-xl"
              />
            </div>

            {/* Color Palette & Logo Concept */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
                <label className="block text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-3">
                  Color Palette Suggestions
                </label>
                <div className="space-y-2">
                  {Array.isArray(aiResult?.brandIdentity?.colorPalette || aiResult?.colorPalette) && (aiResult?.brandIdentity?.colorPalette || aiResult?.colorPalette).map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 glass-panel rounded-lg border border-[#E5E0D8] text-xs">
                      <div
                        className="w-6 h-6 rounded-md border border-slate-300 shrink-0"
                        style={{ backgroundColor: c.hex || '#6366f1' }}
                      />
                      <div className="flex-1">
                        <span className="font-bold text-[#0F291E]/90">{c.name || 'Color'}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{c.hex} • {c.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
                <label className="block text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-2">
                  Logo Concept & Prompt
                </label>
                <textarea
                  rows={4}
                  value={editableFields.logoConcept}
                  onChange={(e) => setEditableFields({ ...editableFields, logoConcept: e.target.value })}
                  className="w-full text-xs p-2.5 glass-panel border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Positioning & USP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Positioning</label>
                <textarea
                  rows={2}
                  value={editableFields.brandPositioning}
                  onChange={(e) => setEditableFields({ ...editableFields, brandPositioning: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand USP</label>
                <textarea
                  rows={2}
                  value={editableFields.brandUSP}
                  onChange={(e) => setEditableFields({ ...editableFields, brandUSP: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* PRODUCT STRATEGY PREVIEW (If Available) */}
            {aiResult?.productStrategy && (
              <div className="mt-8 border-t border-[#E5E0D8] pt-8">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-[#0F291E] flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    Product Strategy (Preview)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This strategy is a preview generated based on your product idea. It will NOT be saved to the Brand collection. Use the button below to create a Marketing Product.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAF8F5]merald-50/50 border border-emerald-200 rounded-xl">
                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                      Product Name Suggestions
                    </label>
                    <div className="space-y-2">
                      {Array.isArray(aiResult.productStrategy.productNames) && aiResult.productStrategy.productNames.map((n, i) => (
                        <div key={i} className="p-2 glass-panel rounded border border-emerald-100 text-xs">
                          <div className="font-bold text-[#0F291E]">{typeof n === 'string' ? n : n.name}</div>
                          {typeof n === 'object' && n.reasoning && (
                            <div className="text-[10px] text-slate-500 mt-1">{n.reasoning}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
                    <label className="block text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-2">
                      Product USP
                    </label>
                    <textarea
                      readOnly
                      rows={4}
                      value={aiResult.productStrategy.productUSP}
                      className="w-full text-xs p-2.5 glass-panel border border-slate-300 rounded-lg text-slate-600 focus:outline-none cursor-default"
                    />
                  </div>

                  <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
                    <label className="block text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-2">
                      Pricing Suggestions
                    </label>
                    <textarea
                      readOnly
                      rows={3}
                      value={aiResult.productStrategy.pricingSuggestions}
                      className="w-full text-xs p-2.5 glass-panel border border-slate-300 rounded-lg text-slate-600 focus:outline-none cursor-default"
                    />
                  </div>

                  <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
                    <label className="block text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-2">
                      Product Positioning
                    </label>
                    <textarea
                      readOnly
                      rows={3}
                      value={aiResult.productStrategy.productPositioning}
                      className="w-full text-xs p-2.5 glass-panel border border-slate-300 rounded-lg text-slate-600 focus:outline-none cursor-default"
                    />
                  </div>
                  
                  <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl md:col-span-2">
                    <label className="block text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-2">
                      Packaging Suggestions
                    </label>
                    <textarea
                      readOnly
                      rows={2}
                      value={aiResult.productStrategy.packagingSuggestions}
                      className="w-full text-xs p-2.5 glass-panel border border-slate-300 rounded-lg text-slate-600 focus:outline-none cursor-default"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Back to Input
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  disabled={saving}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-[#0F291E] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Brand Only</span>
                </button>
                
                {aiResult?.productStrategy && (
                  <button
                    type="button"
                    onClick={handleCreateProductStrategy}
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                    <span>Create Product From This Strategy</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


