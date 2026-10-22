import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  FileText,
  ShieldCheck,
  Target,
  Sparkles,
  RefreshCw,
  Edit3,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  ArrowRight,
  Save,
  CheckCircle2,
  X,
  BookmarkCheck,
  Copy,
  Award,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { productStrategyService } from '../../services/productStrategyService';
import { useToast } from '../../context/ToastContext';

export const ProductStrategyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const showToast = (msg, type = 'success') => addToast(msg, type);

  // General Loading State
  const [loading, setLoading] = useState(false);

  // Per-section Regeneration Loading States
  const [regenerating, setRegenerating] = useState({
    names: false,
    description: false,
    usps: false,
    positioning: false,
    all: false,
  });

  // Per-section Saving Loading States
  const [saving, setSaving] = useState({
    names: false,
    description: false,
    usps: false,
    positioning: false,
    all: false,
  });

  // Per-section Save Success Feedback States
  const [saveSuccess, setSaveSuccess] = useState({
    names: false,
    description: false,
    usps: false,
    positioning: false,
  });

  // Per-section Error States
  const [errors, setErrors] = useState({
    names: null,
    description: null,
    usps: null,
    positioning: null,
  });

  // User input prompt direction / product idea
  const [productIdea, setProductIdea] = useState('');

  // Loaded Brand Context (from MongoDB)
  const [brandContext, setBrandContext] = useState({
    brandName: '',
    tagline: '',
    missionStatement: '',
    visionStatement: '',
    brandPersonality: '',
    brandStory: '',
    targetAudience: '',
    industry: '',
  });

  // Currently Selected & Saved Strategy Data
  const [strategy, setStrategy] = useState({
    productName: '',
    productTagline: '',
    shortDescription: '',
    detailedDescription: '',
    usps: [],
    positioningStatement: '',
    targetSegment: '',
    keyBenefit: '',
    competitiveMoat: '',
    perceptualAngle: '',
    valuePillars: [],
    productNameSuggestions: [],
    descriptionSuggestions: [],
    uspSuggestions: [],
    positioningSuggestions: [],
  });

  // Copy indicator state
  const [copiedKey, setCopiedKey] = useState(null);

  // Custom USP form inputs
  const [customUspTitle, setCustomUspTitle] = useState('');
  const [customUspDesc, setCustomUspDesc] = useState('');
  const [customUspCategory, setCustomUspCategory] = useState('Differentiation');
  const [customUspImpact, setCustomUspImpact] = useState('High');

  // Load Initial Strategy & Context Data
  useEffect(() => {
    fetchStrategyData();
    const handleGlobalSync = () => fetchStrategyData();
    window.addEventListener('brand_dna_updated', handleGlobalSync);
    return () => window.removeEventListener('brand_dna_updated', handleGlobalSync);
  }, []);

  const fetchStrategyData = async () => {
    try {
      const res = await productStrategyService.getStrategy();
      if (res.success) {
        if (res.data.strategy) {
          setStrategy(res.data.strategy);
        }
        if (res.data.brandContext) {
          setBrandContext(res.data.brandContext);
        }
      }
    } catch (err) {
      console.error('Error fetching product strategy:', err);
      showToast('Failed to load product strategy context.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper title formatter
  const formatSectionTitle = (key) => {
    switch (key) {
      case 'names': return 'Product Names';
      case 'description': return 'Product Description';
      case 'usps': return 'USPs';
      case 'positioning': return 'Product Positioning';
      default: return key;
    }
  };

  // Handler for Regenerating a specific section via AI
  const handleRegenerate = async (sectionKey) => {
    setRegenerating((prev) => ({ ...prev, [sectionKey]: true }));
    setErrors((prev) => ({ ...prev, [sectionKey]: null }));

    try {
      const userHint = productIdea.trim();

      if (sectionKey === 'names') {
        const res = await productStrategyService.generateNames(userHint);
        if (res.success && res.data.suggestions) {
          setStrategy((prev) => ({
            ...prev,
            productNameSuggestions: res.data.suggestions,
          }));
          showToast('Product Name suggestions regenerated!', 'success');
        }
      } else if (sectionKey === 'description') {
        const res = await productStrategyService.generateDescription({
          productName: strategy.productName || brandContext.brandName,
          userHint,
          applySelection: true,
        });
        if (res.success && res.data.description) {
          const d = res.data.description;
          setStrategy((prev) => ({
            ...prev,
            shortDescription: d.shortPitch,
            detailedDescription: d.fullDescription,
            descriptionSuggestions: [d],
          }));
          showToast('Product Description regenerated!', 'success');
        }
      } else if (sectionKey === 'usps') {
        const res = await productStrategyService.generateUSP({
          productName: strategy.productName || brandContext.brandName,
          description: strategy.shortDescription || strategy.detailedDescription,
          userHint,
          applySelection: true,
        });
        if (res.success && res.data.usps) {
          setStrategy((prev) => ({
            ...prev,
            usps: res.data.usps,
            uspSuggestions: res.data.usps,
          }));
          showToast('USPs regenerated!', 'success');
        }
      } else if (sectionKey === 'positioning') {
        const res = await productStrategyService.generatePositioning({
          productName: strategy.productName || brandContext.brandName,
          description: strategy.shortDescription,
          usps: strategy.usps,
          userHint,
          applySelection: true,
        });
        if (res.success && res.data.positioning) {
          const p = res.data.positioning;
          setStrategy((prev) => ({
            ...prev,
            positioningStatement: p.positioningStatement,
            targetSegment: p.targetSegment,
            keyBenefit: p.keyBenefit,
            competitiveMoat: p.competitiveMoat,
            perceptualAngle: p.perceptualAngle,
            valuePillars: p.valuePillars || [],
            positioningSuggestions: [p],
          }));
          showToast('Product Positioning Framework regenerated!', 'success');
        }
      }
    } catch (err) {
      console.error(`Error regenerating ${sectionKey}:`, err);
      setErrors((prev) => ({
        ...prev,
        [sectionKey]: err.message || `Unable to regenerate ${formatSectionTitle(sectionKey)}. Please try again.`,
      }));
      showToast(`Failed to regenerate ${formatSectionTitle(sectionKey)}.`, 'error');
    } finally {
      setRegenerating((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  // Handler for 1-Click Full Chained Regeneration
  const handleRegenerateAll = async () => {
    setRegenerating((prev) => ({ ...prev, all: true }));
    try {
      const res = await productStrategyService.generateProductStrategy({
        productIdea,
        userHint: productIdea,
      });
      if (res.success && (res.data.strategy || res.data.chainedResult)) {
        const updated = res.data.strategy || res.data.chainedResult;
        setStrategy({
          productName: updated.productName || strategy.productName,
          productTagline: updated.productTagline || '',
          shortDescription: updated.shortDescription || '',
          detailedDescription: updated.detailedDescription || '',
          usps: updated.usps || [],
          positioningStatement: updated.positioningStatement || updated.positioning?.positioningStatement || '',
          targetSegment: updated.targetSegment || updated.positioning?.targetSegment || '',
          keyBenefit: updated.keyBenefit || updated.positioning?.keyBenefit || '',
          competitiveMoat: updated.competitiveMoat || updated.positioning?.competitiveMoat || '',
          perceptualAngle: updated.perceptualAngle || updated.positioning?.perceptualAngle || '',
          valuePillars: updated.valuePillars || updated.positioning?.valuePillars || [],
          productNameSuggestions: updated.productNameSuggestions || updated.suggestions?.productNameSuggestions || [],
          descriptionSuggestions: updated.descriptionSuggestions || updated.suggestions?.descriptionSuggestions || [],
          uspSuggestions: updated.uspSuggestions || updated.suggestions?.uspSuggestions || [],
          positioningSuggestions: updated.positioningSuggestions || updated.suggestions?.positioningSuggestions || [],
        });
        showToast('Full 4-Stage Product Strategy Prompt Chain Executed!', 'success');
      }
    } catch (err) {
      console.error('Error in 1-Click chain:', err);
      showToast(err.message || 'Error executing prompt chain.', 'error');
    } finally {
      setRegenerating((prev) => ({ ...prev, all: false }));
    }
  };

  // Save single section or entire strategy to MongoDB
  const handleSaveSection = async (sectionKey) => {
    setSaving((prev) => ({ ...prev, [sectionKey]: true }));
    try {
      const res = await productStrategyService.saveStrategy(strategy);
      if (res.success) {
        window.dispatchEvent(new CustomEvent('brand_dna_updated'));
        showToast(`${formatSectionTitle(sectionKey)} saved to MongoDB!`, 'success');
        setSaveSuccess((prev) => ({ ...prev, [sectionKey]: true }));
        setTimeout(() => {
          setSaveSuccess((prev) => ({ ...prev, [sectionKey]: false }));
        }, 3000);
      }
    } catch (err) {
      console.error(`Save error for ${sectionKey}:`, err);
      showToast(`Error saving ${formatSectionTitle(sectionKey)}.`, 'error');
    } finally {
      setSaving((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  // Save & Continue — save strategy then go to ad poster page
  const handleSaveAndContinue = async () => {
    setSaving((prev) => ({ ...prev, all: true }));
    try {
      const res = await productStrategyService.saveStrategy(strategy);
      if (res.success) {
        window.dispatchEvent(new CustomEvent('brand_dna_updated'));
        showToast('Product Strategy saved! Proceeding to Ad Poster Studio...', 'success');
        navigate('/marketing/ad-poster', { state: { mode: 'upcoming' } });
      }
    } catch (err) {
      console.error('Error saving strategy:', err);
      showToast('Failed to save product strategy.', 'error');
    } finally {
      setSaving((prev) => ({ ...prev, all: false }));
    }
  };

  // Select a Name from Step 1 list
  const handleSelectProductName = (nameObj) => {
    setStrategy((prev) => ({
      ...prev,
      productName: nameObj.name,
      productTagline: nameObj.tagline || prev.productTagline,
    }));
    showToast(`Selected "${nameObj.name}" as active product name.`, 'success');
  };

  // Add Custom USP
  const handleAddCustomUsp = () => {
    if (!customUspTitle.trim()) return;
    const newUsp = {
      title: customUspTitle,
      description: customUspDesc,
      category: customUspCategory,
      impact: customUspImpact,
    };
    setStrategy((prev) => ({
      ...prev,
      usps: [...(prev.usps || []), newUsp],
    }));
    setCustomUspTitle('');
    setCustomUspDesc('');
    showToast('Custom USP added.', 'success');
  };

  // Remove USP
  const handleRemoveUsp = (index) => {
    setStrategy((prev) => ({
      ...prev,
      usps: prev.usps.filter((_, i) => i !== index),
    }));
    showToast('USP removed.', 'info');
  };

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Progress Checklist Items
  const progressItems = [
    { key: 'names', label: 'Product Name', completed: Boolean(strategy.productName) },
    { key: 'description', label: 'Description', completed: Boolean(strategy.shortDescription) },
    { key: 'usps', label: 'USPs', completed: Boolean(strategy.usps?.length > 0) },
    { key: 'positioning', label: 'Positioning', completed: Boolean(strategy.positioningStatement) },
  ];



  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left pb-24 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER + PROGRESS BAR (Matches Brand Analysis Layout)
         ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                Chained AI Product Engine
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F291E] tracking-tight mt-2">
              Product Strategy & Positioning
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Build your product strategy with AI-powered suggestions. Choose, refine, regenerate each section, or create your own.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer self-start sm:self-auto">
            <button
              onClick={handleRegenerateAll}
              disabled={regenerating.all}
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 font-bold text-xs transition-all flex items-center gap-2 border border-[#D6E6EC] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${regenerating.all ? 'animate-spin' : ''}`} />
              <span>{regenerating.all ? 'Running Prompt Chain...' : '1-Click Regenerate All'}</span>
            </button>

            <button
              onClick={handleSaveAndContinue}
              disabled={saving.all}
              className="px-5 py-2.5 rounded-full bg-[#0F291E] hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save & Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Progress Checklist Bar */}
        <div className="pt-4 border-t border-[#D6E6EC]/60">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {progressItems.map((item) => (
              <div
                key={item.key}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  item.completed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-[#FAF8F5]/40 text-slate-500 border-[#D6E6EC]'
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source Brand DNA Context Banner */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F291E] text-white flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Master Brand Context</span>
              <h3 className="text-sm font-extrabold text-[#0F291E]">{brandContext.brandName || 'Brand Identity Loaded'}</h3>
            </div>
          </div>
          {brandContext.industry && (
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-[#E5E0D8]">
              {brandContext.industry}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[#FAF8F5]/40 border border-[#D6E6EC]">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Brand Mission</span>
            <p className="text-slate-700 font-medium line-clamp-2">{brandContext.missionStatement || 'Not specified'}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAF8F5]/40 border border-[#D6E6EC]">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Brand Personality</span>
            <p className="text-slate-700 font-medium line-clamp-2">{brandContext.brandPersonality || 'Not specified'}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAF8F5]/40 border border-[#D6E6EC]">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Target Audience</span>
            <p className="text-slate-700 font-medium line-clamp-2">{brandContext.targetAudience || 'Not specified'}</p>
          </div>
        </div>
      </div>


      {/* User Specific Product Idea Input Bar */}
      <div className="p-5 rounded-2xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-mono font-bold text-[#0F291E] uppercase tracking-wider">
            Product Idea or Specific Feature Focus
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={productIdea}
            onChange={(e) => setProductIdea(e.target.value)}
            placeholder='e.g., "Enter your specific product idea or feature" (e.g., AI-powered strategy engine)'
            className="flex-1 w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] placeholder-slate-400 rounded-xl px-3.5 py-2.5 outline-none focus:border-slate-900 focus:glass-panel transition-all font-medium"
          />
          <button
            onClick={() => handleRegenerate('names')}
            disabled={regenerating.names}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Regenerate with Idea</span>
          </button>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          1. PRODUCT NAME GENERATOR SECTION (With Individual Regenerate)
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">01</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Product Name Generator</h3>
                {strategy.productName && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate 5 catchy, brand-aligned product names matching your Master Brand identity and tone.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('names')}
            disabled={regenerating.names}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer border border-[#D6E6EC]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.names ? 'animate-spin' : ''}`} />
            <span>{regenerating.names ? 'Generating suggestions...' : 'Regenerate Product Names'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errors.names && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.names}</span>
            </div>
            <button
              onClick={() => handleRegenerate('names')}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Spinner overlay */}
        {regenerating.names && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is generating brand-aligned product names...</p>
          </div>
        )}

        {/* AI Name Suggestions Grid */}
        {!regenerating.names && strategy.productNameSuggestions?.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">AI Generated Product Name Suggestions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {strategy.productNameSuggestions.map((item, idx) => {
                const isSelected = strategy.productName === item.name;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectProductName(item)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 text-[#0F291E] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5E0D8] hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#0F291E]">{item.name}</span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.brandAlignmentScore || 96}% Match
                        </span>
                      </div>
                      {item.tagline && (
                        <p className="text-[11px] font-semibold text-blue-600 italic">"{item.tagline}"</p>
                      )}
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{item.rationale}</p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(`${item.name} - ${item.tagline || ''}`, `name-${idx}`);
                        }}
                        className="text-[10px] font-semibold text-slate-500 hover:text-[#0F291E] flex items-center gap-1"
                      >
                        {copiedKey === `name-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                        {isSelected ? 'Active Selection' : 'Click to Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Product Name Input & Save */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Active Product Name:</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={strategy.productName}
              onChange={(e) => setStrategy({ ...strategy, productName: e.target.value })}
              placeholder="e.g. BrandDNA Intelligence"
              className="flex-1 bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs font-bold text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
            {saveSuccess.names && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
                Saved!
              </span>
            )}
            <button
              onClick={() => handleSaveSection('names')}
              disabled={saving.names || !strategy.productName.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              {saving.names ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Name</span>
            </button>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          2. PRODUCT DESCRIPTION & NARRATIVE SECTION (With Individual Regenerate)
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">02</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Product Description & Narrative</h3>
                {strategy.shortDescription && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate a compelling elevator pitch and full detailed product narrative based on your active product name.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('description')}
            disabled={regenerating.description}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer border border-[#D6E6EC]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.description ? 'animate-spin' : ''}`} />
            <span>{regenerating.description ? 'Generating description...' : 'Regenerate Description'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errors.description && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.description}</span>
            </div>
            <button
              onClick={() => handleRegenerate('description')}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Spinner overlay */}
        {regenerating.description && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is crafting elevator pitch & value narrative...</p>
          </div>
        )}

        {/* Description Textareas */}
        {!regenerating.description && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase">Elevator Pitch (Short Pitch)</label>
                <button
                  onClick={() => handleCopy(strategy.shortDescription, 'shortPitch')}
                  className="text-[11px] font-semibold text-slate-500 hover:text-[#0F291E] flex items-center gap-1"
                >
                  {copiedKey === 'shortPitch' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={strategy.shortDescription}
                onChange={(e) => setStrategy({ ...strategy, shortDescription: e.target.value })}
                placeholder="Click 'Regenerate Description' to generate elevator pitch..."
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl p-3 outline-none focus:border-slate-900 focus:glass-panel transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase">Comprehensive Product Narrative</label>
                <button
                  onClick={() => handleCopy(strategy.detailedDescription, 'fullDesc')}
                  className="text-[11px] font-semibold text-slate-500 hover:text-[#0F291E] flex items-center gap-1"
                >
                  {copiedKey === 'fullDesc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={strategy.detailedDescription}
                onChange={(e) => setStrategy({ ...strategy, detailedDescription: e.target.value })}
                placeholder="Click 'Regenerate Description' to generate full narrative..."
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl p-3 outline-none focus:border-slate-900 focus:glass-panel transition-all leading-relaxed"
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {saveSuccess.description && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Description Saved!
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={() => handleSaveSection('description')}
              disabled={saving.description || (!strategy.shortDescription.trim() && !strategy.detailedDescription.trim())}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {saving.description ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Description</span>
            </button>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          3. UNIQUE SELLING PROPOSITIONS (USPs) SECTION (With Individual Regenerate)
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">03</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Unique Selling Propositions (3 USPs)</h3>
                {strategy.usps?.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    {strategy.usps.length} USPs
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Synthesize defensible market differentiators and unique value levers for your product.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('usps')}
            disabled={regenerating.usps}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer border border-[#D6E6EC]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.usps ? 'animate-spin' : ''}`} />
            <span>{regenerating.usps ? 'Generating USPs...' : 'Regenerate USPs'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errors.usps && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.usps}</span>
            </div>
            <button
              onClick={() => handleRegenerate('usps')}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Spinner overlay */}
        {regenerating.usps && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is synthesizing Unique Selling Propositions...</p>
          </div>
        )}

        {/* USP Cards Grid */}
        {!regenerating.usps && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {strategy.usps?.map((usp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0F291E]">{usp.title}</span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {usp.impact || 'High Impact'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{usp.description}</p>
                </div>

                <div className="pt-2 border-t border-[#E5E0D8]/80 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500 font-semibold">{usp.category || 'Differentiation'}</span>
                  <button
                    onClick={() => handleRemoveUsp(idx)}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Custom USP Drawer */}
        <div className="p-4 rounded-xl bg-[#FAF8F5]/60 border border-[#E5E0D8] space-y-3">
          <span className="text-xs font-mono font-bold text-[#0F291E] uppercase">Add Custom USP</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={customUspTitle}
              onChange={(e) => setCustomUspTitle(e.target.value)}
              placeholder="USP Title (e.g. 100% On-Premise Privacy)"
              className="glass-panel border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl px-3 py-2 outline-none focus:border-slate-900"
            />
            <input
              type="text"
              value={customUspDesc}
              onChange={(e) => setCustomUspDesc(e.target.value)}
              placeholder="USP Rationale / Explanation"
              className="glass-panel border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl px-3 py-2 outline-none focus:border-slate-900"
            />
          </div>
          <button
            onClick={handleAddCustomUsp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom USP</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {saveSuccess.usps && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              USPs Saved!
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={() => handleSaveSection('usps')}
              disabled={saving.usps || strategy.usps?.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {saving.usps ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save USPs</span>
            </button>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          4. PRODUCT POSITIONING FRAMEWORK SECTION (With Individual Regenerate)
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">04</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Product Positioning Framework</h3>
                {strategy.positioningStatement && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Define how this product fits into the market and why your target audience should care.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('positioning')}
            disabled={regenerating.positioning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer border border-[#D6E6EC]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.positioning ? 'animate-spin' : ''}`} />
            <span>{regenerating.positioning ? 'Generating positioning...' : 'Regenerate Positioning'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errors.positioning && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.positioning}</span>
            </div>
            <button
              onClick={() => handleRegenerate('positioning')}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Spinner overlay */}
        {regenerating.positioning && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is framing strategic market positioning...</p>
          </div>
        )}

        {/* Positioning Highlight Box & Editable Area */}
        {!regenerating.positioning && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0F291E] text-white shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Positioning Statement
                </span>
                <button
                  onClick={() => handleCopy(strategy.positioningStatement, 'pos-stmt')}
                  className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'pos-stmt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={strategy.positioningStatement}
                onChange={(e) => setStrategy({ ...strategy, positioningStatement: e.target.value })}
                placeholder="Click 'Regenerate Positioning' to construct positioning statement..."
                className="w-full bg-slate-800 border border-slate-700 text-xs sm:text-sm font-medium text-white rounded-xl p-3 outline-none focus:border-amber-400 transition-all leading-relaxed italic"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Target Segment</span>
                <input
                  type="text"
                  value={strategy.targetSegment}
                  onChange={(e) => setStrategy({ ...strategy, targetSegment: e.target.value })}
                  placeholder="Target ICP..."
                  className="w-full glass-panel border border-[#E5E0D8] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F291E] outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Key Benefit</span>
                <input
                  type="text"
                  value={strategy.keyBenefit}
                  onChange={(e) => setStrategy({ ...strategy, keyBenefit: e.target.value })}
                  placeholder="Primary benefit..."
                  className="w-full glass-panel border border-[#E5E0D8] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F291E] outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Competitive Moat</span>
                <input
                  type="text"
                  value={strategy.competitiveMoat}
                  onChange={(e) => setStrategy({ ...strategy, competitiveMoat: e.target.value })}
                  placeholder="Defensible moat..."
                  className="w-full glass-panel border border-[#E5E0D8] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F291E] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {saveSuccess.positioning && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Positioning Saved!
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={() => handleSaveSection('positioning')}
              disabled={saving.positioning || !strategy.positioningStatement.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {saving.positioning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Positioning</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-6 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-[#0F291E]">Generate Your Upcoming Product Ad</h4>
          <p className="text-xs text-slate-500">Save all strategy data and generate a launch-ready ad poster for this upcoming product.</p>
        </div>

        <button
          onClick={handleSaveAndContinue}
          disabled={saving.all}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-emerald-400" />
          <span>Save & Generate Ad</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>

    </div>
  );
};

