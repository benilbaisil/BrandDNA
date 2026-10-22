import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Target,
  Compass,
  Eye,
  BookOpen,
  Sparkles,
  RefreshCw,
  Edit3,
  Check,
  Plus,
  AlertCircle,
  Building2,
  ArrowRight,
  Save,
  CheckCircle2,
  Sliders,
  X,
  FileText,
  BookmarkCheck
} from 'lucide-react';
import { brandService } from '../../services/brandService';
import { startupService } from '../../services/startupService';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

export const BrandAnalysisPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const showToast = (msg, type = 'success') => addToast(msg, type);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Per-section Regeneration Loading States
  const [regenerating, setRegenerating] = useState({
    brandName: false,
    tagline: false,
    mission: false,
    vision: false,
    brandStory: false,
    brandPersonality: false,
  });

  // Per-section Saving Loading States
  const [saving, setSaving] = useState({
    brandName: false,
    tagline: false,
    mission: false,
    vision: false,
    brandStory: false,
    brandPersonality: false,
  });

  // Per-section Save Success States
  const [saveSuccess, setSaveSuccess] = useState({
    brandName: false,
    tagline: false,
    mission: false,
    vision: false,
    brandStory: false,
    brandPersonality: false,
  });

  // Per-section Error States
  const [errors, setErrors] = useState({
    brandName: null,
    tagline: null,
    mission: null,
    vision: null,
    brandStory: null,
    brandPersonality: null,
  });

  // AI Suggestions Storage
  const [suggestions, setSuggestions] = useState({
    brandName: [],
    tagline: [],
    mission: [],
    vision: [],
    brandStory: [],
    brandPersonality: [],
  });

  const [personalityExplanation, setPersonalityExplanation] = useState('');

  // Currently Selected & Editable Values
  const [selectedValues, setSelectedValues] = useState({
    brandName: '',
    tagline: '',
    missionStatement: '',
    visionStatement: '',
    brandStory: '',
    brandPersonality: [], // Array of trait strings
  });

  // Saved State in DB (for status indicators)
  const [savedValues, setSavedValues] = useState({
    brandName: '',
    tagline: '',
    missionStatement: '',
    visionStatement: '',
    brandStory: '',
    brandPersonality: '',
  });

  // Sources ('ai' | 'manual')
  const [sources, setSources] = useState({
    brandNameSource: 'ai',
    taglineSource: 'ai',
    missionSource: 'ai',
    visionSource: 'ai',
    brandStorySource: 'ai',
    brandPersonalitySource: 'ai',
  });

  // Mode toggles per section: 'ai' vs 'manual'
  const [inputModes, setInputModes] = useState({
    brandName: 'ai',
    tagline: 'ai',
    mission: 'ai',
    vision: 'ai',
    brandStory: 'ai',
    brandPersonality: 'ai',
  });

  // Manual input fields / temporary edits
  const [manualFields, setManualFields] = useState({
    brandName: '',
    tagline: '',
    missionStatement: '',
    visionStatement: '',
    brandStory: '',
    brandPersonalityInput: '',
  });

  // Initial Fetch Data
  const fetchData = async () => {
    try {
      // 1. Fetch Business Profile Context
      const profileRes = await startupService.getProfile();
      if (profileRes?.data) {
        setHasProfile(true);
        setProfileData(profileRes.data);
      }

      // 2. Fetch Brand Identity
      const brandRes = await brandService.getIdentity();
      if (brandRes?.data?.brand) {
        const brand = brandRes.data.brand;

        // Set Saved Values
        setSavedValues({
          brandName: brand.brandName || '',
          tagline: brand.tagline || '',
          missionStatement: brand.missionStatement || '',
          visionStatement: brand.visionStatement || '',
          brandStory: brand.brandStory || '',
          brandPersonality: brand.brandPersonality || '',
        });

        // Set Selected Values
        const personalityArray = brand.brandPersonality
          ? brand.brandPersonality.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        setSelectedValues({
          brandName: brand.brandName || '',
          tagline: brand.tagline || '',
          missionStatement: brand.missionStatement || '',
          visionStatement: brand.visionStatement || '',
          brandStory: brand.brandStory || '',
          brandPersonality: personalityArray,
        });

        setManualFields({
          brandName: brand.brandName || '',
          tagline: brand.tagline || '',
          missionStatement: brand.missionStatement || '',
          visionStatement: brand.visionStatement || '',
          brandStory: brand.brandStory || '',
          brandPersonalityInput: '',
        });

        // Set Sources
        setSources({
          brandNameSource: brand.brandNameSource || 'ai',
          taglineSource: brand.taglineSource || 'ai',
          missionSource: brand.missionSource || 'ai',
          visionSource: brand.visionSource || 'ai',
          brandStorySource: brand.brandStorySource || 'ai',
          brandPersonalitySource: brand.brandPersonalitySource || 'ai',
        });

        // Restore cached suggestions if present
        setSuggestions({
          brandName: brand.brandNameSuggestions || [],
          tagline: brand.taglineSuggestions || [],
          mission: brand.missionSuggestions || [],
          vision: brand.visionSuggestions || [],
          brandStory: brand.brandStorySuggestions || [],
          brandPersonality: brand.brandPersonalitySuggestions || [],
        });

        if (brand.brandPersonalityExplanation) {
          setPersonalityExplanation(brand.brandPersonalityExplanation);
        }
      }
    } catch (err) {
      console.error('Error loading brand identity workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleGlobalSync = () => fetchData();
    window.addEventListener('brand_dna_updated', handleGlobalSync);
    return () => window.removeEventListener('brand_dna_updated', handleGlobalSync);
  }, []);

  // Handler for Regenerating a specific section via Gemini API
  const handleRegenerate = async (sectionKey) => {
    setRegenerating((prev) => ({ ...prev, [sectionKey]: true }));
    setErrors((prev) => ({ ...prev, [sectionKey]: null }));

    try {
      let res;
      const contextPayload = {
        brandName: selectedValues.brandName || savedValues.brandName,
        missionStatement: selectedValues.missionStatement || savedValues.missionStatement,
        visionStatement: selectedValues.visionStatement || savedValues.visionStatement,
      };

      switch (sectionKey) {
        case 'brandName':
          res = await brandService.generateBrandName();
          if (res?.data?.suggestions) {
            setSuggestions((prev) => ({ ...prev, brandName: res.data.suggestions }));
            setErrors((prev) => ({ ...prev, brandName: null }));
          }
          break;

        case 'tagline':
          res = await brandService.generateTagline(contextPayload);
          if (res?.data?.suggestions) {
            setSuggestions((prev) => ({ ...prev, tagline: res.data.suggestions }));
            setErrors((prev) => ({ ...prev, tagline: null }));
          }
          break;

        case 'mission':
          res = await brandService.generateMission(contextPayload);
          if (res?.data?.suggestions) {
            setSuggestions((prev) => ({ ...prev, mission: res.data.suggestions }));
            setErrors((prev) => ({ ...prev, mission: null }));
          }
          break;

        case 'vision':
          res = await brandService.generateVision(contextPayload);
          if (res?.data?.suggestions) {
            setSuggestions((prev) => ({ ...prev, vision: res.data.suggestions }));
            setErrors((prev) => ({ ...prev, vision: null }));
          }
          break;

        case 'brandStory':
          res = await brandService.generateBrandStory(contextPayload);
          if (res?.data?.suggestions) {
            setSuggestions((prev) => ({ ...prev, brandStory: res.data.suggestions }));
            setErrors((prev) => ({ ...prev, brandStory: null }));
          }
          break;

        case 'brandPersonality':
          res = await brandService.generateBrandPersonality(contextPayload);
          if (res?.data?.traits) {
            setSuggestions((prev) => ({ ...prev, brandPersonality: res.data.traits }));
            setErrors((prev) => ({ ...prev, brandPersonality: null }));
          }
          if (res?.data?.explanation) {
            setPersonalityExplanation(res.data.explanation);
          }
          break;

        default:
          break;
      }
      setErrors((prev) => ({ ...prev, [sectionKey]: null }));
      showToast(`${formatSectionTitle(sectionKey)} suggestions regenerated!`, 'success');
    } catch (err) {
      console.error(`Error regenerating ${sectionKey}:`, err);
      const apiMsg = err.response?.data?.message || err.message;
      setErrors((prev) => ({
        ...prev,
        [sectionKey]: apiMsg && !apiMsg.includes('Object') ? apiMsg : 'Unable to generate suggestions right now. Please try again.',
      }));
    } finally {
      setRegenerating((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  // Helper for title string formatting
  const formatSectionTitle = (key) => {
    switch (key) {
      case 'brandName': return 'Brand Name';
      case 'tagline': return 'Tagline';
      case 'mission': return 'Mission Statement';
      case 'vision': return 'Vision Statement';
      case 'brandStory': return 'Brand Story';
      case 'brandPersonality': return 'Brand Personality';
      default: return key;
    }
  };

  // Save single section to MongoDB
  const handleSaveSection = async (sectionKey, valueToSave, source = 'ai') => {
    setSaving((prev) => ({ ...prev, [sectionKey]: true }));
    try {
      const payload = {};
      switch (sectionKey) {
        case 'brandName':
          payload.brandName = valueToSave;
          payload.brandNameSource = source;
          break;
        case 'tagline':
          payload.tagline = valueToSave;
          payload.taglineSource = source;
          break;
        case 'mission':
          payload.missionStatement = valueToSave;
          payload.missionSource = source;
          break;
        case 'vision':
          payload.visionStatement = valueToSave;
          payload.visionSource = source;
          break;
        case 'brandStory':
          payload.brandStory = valueToSave;
          payload.brandStorySource = source;
          break;
        case 'brandPersonality':
          const traitStr = Array.isArray(valueToSave) ? valueToSave.join(', ') : valueToSave;
          payload.brandPersonality = traitStr;
          payload.brandPersonalitySource = source;
          break;
        default:
          break;
      }

      const res = await brandService.saveBrandIdentity(payload);
      if (res?.success) {
        window.dispatchEvent(new CustomEvent('brand_dna_updated'));
        showToast(`${formatSectionTitle(sectionKey)} saved successfully!`, 'success');
        setSaveSuccess((prev) => ({ ...prev, [sectionKey]: true }));
        setTimeout(() => {
          setSaveSuccess((prev) => ({ ...prev, [sectionKey]: false }));
        }, 4000);

        // Update local saved state & sources
        setSavedValues((prev) => ({
          ...prev,
          ...(payload.brandName !== undefined && { brandName: payload.brandName }),
          ...(payload.tagline !== undefined && { tagline: payload.tagline }),
          ...(payload.missionStatement !== undefined && { missionStatement: payload.missionStatement }),
          ...(payload.visionStatement !== undefined && { visionStatement: payload.visionStatement }),
          ...(payload.brandStory !== undefined && { brandStory: payload.brandStory }),
          ...(payload.brandPersonality !== undefined && { brandPersonality: payload.brandPersonality }),
        }));
        setSources((prev) => ({
          ...prev,
          ...(payload.brandNameSource && { brandNameSource: payload.brandNameSource }),
          ...(payload.taglineSource && { taglineSource: payload.taglineSource }),
          ...(payload.missionSource && { missionSource: payload.missionSource }),
          ...(payload.visionSource && { visionSource: payload.visionSource }),
          ...(payload.brandStorySource && { brandStorySource: payload.brandStorySource }),
          ...(payload.brandPersonalitySource && { brandPersonalitySource: payload.brandPersonalitySource }),
        }));
      } else {
        showToast(`Failed to save ${formatSectionTitle(sectionKey)}.`, 'error');
      }
    } catch (err) {
      console.error(`Save error for ${sectionKey}:`, err);
      showToast(`Error saving ${formatSectionTitle(sectionKey)}.`, 'error');
    } finally {
      setSaving((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  // Save ALL Brand Analysis sections to MongoDB and navigate to Product Strategy
  const handleSaveAllAndProceed = async () => {
    setSavingAll(true);
    try {
      const traitStr = Array.isArray(selectedValues.brandPersonality)
        ? selectedValues.brandPersonality.join(', ')
        : selectedValues.brandPersonality;

      const payload = {
        brandName: manualFields.brandName || selectedValues.brandName || savedValues.brandName,
        brandNameSource: sources.brandNameSource || 'ai',
        tagline: manualFields.tagline || selectedValues.tagline || savedValues.tagline,
        taglineSource: sources.taglineSource || 'ai',
        missionStatement: manualFields.missionStatement || selectedValues.missionStatement || savedValues.missionStatement,
        missionSource: sources.missionSource || 'ai',
        visionStatement: manualFields.visionStatement || selectedValues.visionStatement || savedValues.visionStatement,
        visionSource: sources.visionSource || 'ai',
        brandStory: manualFields.brandStory || selectedValues.brandStory || savedValues.brandStory,
        brandStorySource: sources.brandStorySource || 'ai',
        brandPersonality: traitStr || savedValues.brandPersonality,
        brandPersonalitySource: sources.brandPersonalitySource || 'ai',
      };

      const res = await brandService.saveBrandIdentity(payload);
      if (res?.success || res?.brand) {
        window.dispatchEvent(new CustomEvent('brand_dna_updated'));
        setSavedValues({
          brandName: payload.brandName,
          tagline: payload.tagline,
          missionStatement: payload.missionStatement,
          visionStatement: payload.visionStatement,
          brandStory: payload.brandStory,
          brandPersonality: payload.brandPersonality,
        });
        showToast('Brand Analysis saved successfully! Proceeding to Product Strategy...', 'success');
        
        setTimeout(() => {
          navigate('/product-strategy?autoGenerate=true');
        }, 500);
      } else {
        showToast('Failed to save Brand Analysis. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error saving Brand Analysis:', err);
      showToast('Error saving Brand Analysis. Please try again.', 'error');
    } finally {
      setSavingAll(false);
    }
  };

  // Trait helpers for Brand Personality
  const togglePersonalityTrait = (trait) => {
    setSelectedValues((prev) => {
      const current = prev.brandPersonality || [];
      const exists = current.includes(trait);
      const updated = exists ? current.filter((t) => t !== trait) : [...current, trait];
      return { ...prev, brandPersonality: updated };
    });
  };

  const addManualTrait = (e) => {
    e.preventDefault();
    const val = manualFields.brandPersonalityInput.trim();
    if (val && !selectedValues.brandPersonality.includes(val)) {
      setSelectedValues((prev) => ({
        ...prev,
        brandPersonality: [...prev.brandPersonality, val],
      }));
      setManualFields((prev) => ({ ...prev, brandPersonalityInput: '' }));
    }
  };

  // Status checkmark array for header progress
  const progressItems = [
    { key: 'brandName', label: 'Brand Name', completed: Boolean(savedValues.brandName) },
    { key: 'tagline', label: 'Tagline', completed: Boolean(savedValues.tagline) },
    { key: 'mission', label: 'Mission', completed: Boolean(savedValues.missionStatement) },
    { key: 'vision', label: 'Vision', completed: Boolean(savedValues.visionStatement) },
    { key: 'brandStory', label: 'Brand Story', completed: Boolean(savedValues.brandStory) },
    { key: 'brandPersonality', label: 'Brand Personality', completed: Boolean(savedValues.brandPersonality) },
  ];



  if (!hasProfile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0F291E]">Business Profile Required</h2>
        <p className="text-sm text-slate-500">
          Please submit your basic business details first to provide context for AI brand generation.
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left pb-20">
      
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER + PROGRESS BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                AI Identity Builder
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F291E] tracking-tight mt-2">
              Brand Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Build your brand identity with AI-powered suggestions. Choose, refine, regenerate, or create your own.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={handleSaveAllAndProceed}
              disabled={savingAll}
              className="px-5 py-2.5 rounded-full bg-[#0F291E] hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {savingAll ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              ) : (
                <Save className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span>{savingAll ? 'Saving Brand Analysis...' : 'Save & Fill Product Strategy'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>

            <Link
              to="/brand-summary"
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 font-bold text-xs transition-all flex items-center gap-2 border border-[#D6E6EC] cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 text-slate-700" />
              <span>View Brand DNA</span>
            </Link>
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


      {/* ─────────────────────────────────────────────────────────────
          1. BRAND NAME SECTION
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">01</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Brand Name</h3>
                {savedValues.brandName && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    Saved ({sources.brandNameSource === 'manual' ? 'Manual' : 'AI'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Create a distinctive name that fits your business and brand direction.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('brandName')}
            disabled={regenerating.brandName}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.brandName ? 'animate-spin' : ''}`} />
            <span>{regenerating.brandName ? 'Generating new suggestions...' : 'Regenerate Suggestions'}</span>
          </button>
        </div>

        {/* Error alert */}
        {errors.brandName && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.brandName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRegenerate('brandName')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => setErrors((prev) => ({ ...prev, brandName: null }))}
                className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner overlay when regenerating */}
        {regenerating.brandName && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is brainstorming brand names for your business...</p>
          </div>
        )}

        {/* Suggestions list */}
        {!regenerating.brandName && suggestions.brandName.length > 0 && inputModes.brandName === 'ai' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">AI Suggestions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestions.brandName.map((item, idx) => {
                const nameStr = typeof item === 'string' ? item : item.name;
                const isSelected = selectedValues.brandName === nameStr;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedValues((prev) => ({ ...prev, brandName: nameStr }));
                      setManualFields((prev) => ({ ...prev, brandName: nameStr }));
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 text-[#0F291E] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5E0D8] hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-400 glass-panel'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full glass-panel" />}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#0F291E]">{nameStr}</p>
                      {item.rationale && <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.rationale}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Initial Trigger if no suggestions yet */}
        {!regenerating.brandName && suggestions.brandName.length === 0 && inputModes.brandName === 'ai' && (
          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs text-slate-500">No name suggestions generated yet.</p>
            <button
              onClick={() => handleRegenerate('brandName')}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
            >
              Generate Brand Names with AI
            </button>
          </div>
        )}

        {/* Selected Display + Edit Input */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Selected / Active Value:
            </span>
            <button
              onClick={() => setInputModes((prev) => ({ ...prev, brandName: prev.brandName === 'ai' ? 'manual' : 'ai' }))}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {inputModes.brandName === 'ai' ? 'Enter Manually' : 'View AI Suggestions'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={manualFields.brandName}
              onChange={(e) => {
                setManualFields({ ...manualFields, brandName: e.target.value });
                setSelectedValues({ ...selectedValues, brandName: e.target.value });
              }}
              placeholder="Enter brand name..."
              className="flex-1 bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs font-bold text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
            {saveSuccess.brandName && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
                Saving Successful!
              </span>
            )}
            <button
              onClick={() => handleSaveSection('brandName', manualFields.brandName, inputModes.brandName === 'manual' ? 'manual' : 'ai')}
              disabled={saving.brandName || !manualFields.brandName.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              {saving.brandName ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Brand Name</span>
            </button>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          2. TAGLINE SECTION
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">02</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Tagline</h3>
                {savedValues.tagline && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    Saved ({sources.taglineSource === 'manual' ? 'Manual' : 'AI'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate memorable taglines based on business details and selected brand name.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('tagline')}
            disabled={regenerating.tagline}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.tagline ? 'animate-spin' : ''}`} />
            <span>{regenerating.tagline ? 'Generating new suggestions...' : 'Regenerate'}</span>
          </button>
        </div>

        {/* Error alert */}
        {errors.tagline && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.tagline}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRegenerate('tagline')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => setErrors((prev) => ({ ...prev, tagline: null }))}
                className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {regenerating.tagline && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is crafting catchy taglines...</p>
          </div>
        )}

        {/* Suggestions list */}
        {!regenerating.tagline && suggestions.tagline.length > 0 && inputModes.tagline === 'ai' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">AI Suggestions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestions.tagline.map((item, idx) => {
                const taglineStr = typeof item === 'string' ? item : item.tagline || item;
                const isSelected = selectedValues.tagline === taglineStr;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedValues((prev) => ({ ...prev, tagline: taglineStr }));
                      setManualFields((prev) => ({ ...prev, tagline: taglineStr }));
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 text-[#0F291E] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5E0D8] hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-400 glass-panel'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full glass-panel" />}
                    </div>
                    <span className="text-xs font-semibold text-[#0F291E]">"{taglineStr}"</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!regenerating.tagline && suggestions.tagline.length === 0 && inputModes.tagline === 'ai' && (
          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs text-slate-500">No tagline suggestions generated yet.</p>
            <button
              onClick={() => handleRegenerate('tagline')}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-xs"
            >
              Generate Taglines with AI
            </button>
          </div>
        )}

        {/* Selected Display & Input */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Selected / Editable Tagline:</span>
            <button
              onClick={() => setInputModes((prev) => ({ ...prev, tagline: prev.tagline === 'ai' ? 'manual' : 'ai' }))}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {inputModes.tagline === 'ai' ? 'Enter Manually' : 'View AI Suggestions'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={manualFields.tagline}
              onChange={(e) => {
                setManualFields({ ...manualFields, tagline: e.target.value });
                setSelectedValues({ ...selectedValues, tagline: e.target.value });
              }}
              placeholder="Enter tagline..."
              className="flex-1 bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs font-medium text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
            {saveSuccess.tagline && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
                Saving Successful!
              </span>
            )}
            <button
              onClick={() => handleSaveSection('tagline', manualFields.tagline, inputModes.tagline === 'manual' ? 'manual' : 'ai')}
              disabled={saving.tagline || !manualFields.tagline.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              {saving.tagline ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Tagline</span>
            </button>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          3. MISSION STATEMENT SECTION
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">03</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Mission Statement</h3>
                {savedValues.missionStatement && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    Saved ({sources.missionSource === 'manual' ? 'Manual' : 'AI'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate mission statements defining your core purpose and impact.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('mission')}
            disabled={regenerating.mission}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.mission ? 'animate-spin' : ''}`} />
            <span>{regenerating.mission ? 'Generating new suggestions...' : 'Regenerate'}</span>
          </button>
        </div>

        {/* Error alert */}
        {errors.mission && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.mission}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRegenerate('mission')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => setErrors((prev) => ({ ...prev, mission: null }))}
                className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {regenerating.mission && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is formulating mission statements...</p>
          </div>
        )}

        {/* Suggestions Selectable Cards */}
        {!regenerating.mission && suggestions.mission.length > 0 && inputModes.mission === 'ai' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">AI Suggestions</label>
            <div className="space-y-2.5">
              {suggestions.mission.map((item, idx) => {
                const missionStr = typeof item === 'string' ? item : item.mission || item;
                const isSelected = selectedValues.missionStatement === missionStr;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedValues((prev) => ({ ...prev, missionStatement: missionStr }));
                      setManualFields((prev) => ({ ...prev, missionStatement: missionStr }));
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-[#0F291E] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5E0D8] hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400 glass-panel'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full glass-panel" />}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed font-medium text-[#0F291E]/90">
                      "{missionStr}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!regenerating.mission && suggestions.mission.length === 0 && inputModes.mission === 'ai' && (
          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs text-slate-500">No mission statement suggestions generated yet.</p>
            <button
              onClick={() => handleRegenerate('mission')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Generate Mission Statements with AI
            </button>
          </div>
        )}

        {/* Editable Field & Save */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Edit / Review Selected Mission:</span>
            <button
              onClick={() => setInputModes((prev) => ({ ...prev, mission: prev.mission === 'ai' ? 'manual' : 'ai' }))}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {inputModes.mission === 'ai' ? 'Enter Manually' : 'View AI Suggestions'}
            </button>
          </div>

          <textarea
            rows={3}
            value={manualFields.missionStatement}
            onChange={(e) => {
              setManualFields({ ...manualFields, missionStatement: e.target.value });
              setSelectedValues({ ...selectedValues, missionStatement: e.target.value });
            }}
            placeholder="Type or refine mission statement..."
            className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs font-medium text-[#0F291E] rounded-xl p-3 outline-none resize-none transition-all"
          />

          <div className="flex items-center justify-end gap-3">
            {saveSuccess.mission && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Saving Successful!
              </span>
            )}
            <button
              onClick={() => handleSaveSection('mission', manualFields.missionStatement, inputModes.mission === 'manual' ? 'manual' : 'ai')}
              disabled={saving.mission || !manualFields.missionStatement.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {saving.mission ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Mission Statement</span>
            </button>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          4. VISION STATEMENT SECTION
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">04</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Vision Statement</h3>
                {savedValues.visionStatement && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    Saved ({sources.visionSource === 'manual' ? 'Manual' : 'AI'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate vision statements mapping your aspirational future goals.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('vision')}
            disabled={regenerating.vision}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.vision ? 'animate-spin' : ''}`} />
            <span>{regenerating.vision ? 'Generating new suggestions...' : 'Regenerate'}</span>
          </button>
        </div>

        {/* Error alert */}
        {errors.vision && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.vision}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRegenerate('vision')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => setErrors((prev) => ({ ...prev, vision: null }))}
                className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {regenerating.vision && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is envisioning long-term goals...</p>
          </div>
        )}

        {/* Selectable Cards */}
        {!regenerating.vision && suggestions.vision.length > 0 && inputModes.vision === 'ai' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">AI Suggestions</label>
            <div className="space-y-2.5">
              {suggestions.vision.map((item, idx) => {
                const visionStr = typeof item === 'string' ? item : item.vision || item;
                const isSelected = selectedValues.visionStatement === visionStr;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedValues((prev) => ({ ...prev, visionStatement: visionStr }));
                      setManualFields((prev) => ({ ...prev, visionStatement: visionStr }));
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-[#0F291E] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5E0D8] hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-600 bg-amber-600' : 'border-slate-400 glass-panel'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full glass-panel" />}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed font-medium text-[#0F291E]/90">
                      "{visionStr}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!regenerating.vision && suggestions.vision.length === 0 && inputModes.vision === 'ai' && (
          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs text-slate-500">No vision statement suggestions generated yet.</p>
            <button
              onClick={() => handleRegenerate('vision')}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-xs"
            >
              Generate Vision Statements with AI
            </button>
          </div>
        )}

        {/* Editable Field & Save */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Edit / Review Selected Vision:</span>
            <button
              onClick={() => setInputModes((prev) => ({ ...prev, vision: prev.vision === 'ai' ? 'manual' : 'ai' }))}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {inputModes.vision === 'ai' ? 'Enter Manually' : 'View AI Suggestions'}
            </button>
          </div>

          <textarea
            rows={3}
            value={manualFields.visionStatement}
            onChange={(e) => {
              setManualFields({ ...manualFields, visionStatement: e.target.value });
              setSelectedValues({ ...selectedValues, visionStatement: e.target.value });
            }}
            placeholder="Type or refine vision statement..."
            className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs font-medium text-[#0F291E] rounded-xl p-3 outline-none resize-none transition-all"
          />

          <div className="flex items-center justify-end gap-3">
            {saveSuccess.vision && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Saving Successful!
              </span>
            )}
            <button
              onClick={() => handleSaveSection('vision', manualFields.visionStatement, inputModes.vision === 'manual' ? 'manual' : 'ai')}
              disabled={saving.vision || !manualFields.visionStatement.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {saving.vision ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Vision Statement</span>
            </button>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          5. BRAND STORY SECTION
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#0F291E] flex items-center justify-center shrink-0 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">05</span>
                <h3 className="font-serif text-xl font-bold text-[#0F291E]">Brand Story</h3>
                {savedValues.brandStory && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    Saved ({sources.brandStorySource === 'manual' ? 'Manual' : 'AI'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate 2–3 brand story options and edit before saving.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('brandStory')}
            disabled={regenerating.brandStory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.brandStory ? 'animate-spin' : ''}`} />
            <span>{regenerating.brandStory ? 'Generating new suggestions...' : 'Regenerate Stories'}</span>
          </button>
        </div>

        {/* Error alert */}
        {errors.brandStory && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.brandStory}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRegenerate('brandStory')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => setErrors((prev) => ({ ...prev, brandStory: null }))}
                className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {regenerating.brandStory && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is writing authentic brand stories...</p>
          </div>
        )}

        {/* Story Cards */}
        {!regenerating.brandStory && suggestions.brandStory.length > 0 && inputModes.brandStory === 'ai' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">AI Suggestions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.brandStory.map((story, idx) => {
                const storyContent = typeof story === 'string' ? story : story.content || '';
                const storyTitle = typeof story === 'object' && story.title ? story.title : `Option ${idx + 1}`;
                const isSelected = selectedValues.brandStory === storyContent;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedValues((prev) => ({ ...prev, brandStory: storyContent }));
                      setManualFields((prev) => ({ ...prev, brandStory: storyContent }));
                    }}
                    className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-[#0F291E] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5E0D8] hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0F291E] flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          {storyTitle}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400 glass-panel'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full glass-panel" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-6">
                        {storyContent}
                      </p>
                    </div>
                    <div className="text-[11px] font-bold text-indigo-600 pt-2 border-t border-[#E5E0D8]/50">
                      {isSelected ? '✓ Selected' : 'Click to select'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!regenerating.brandStory && suggestions.brandStory.length === 0 && inputModes.brandStory === 'ai' && (
          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs text-slate-500">No brand stories generated yet.</p>
            <button
              onClick={() => handleRegenerate('brandStory')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Generate Brand Stories with AI
            </button>
          </div>
        )}

        {/* Large Textarea Editor + Save */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Edit / Write Brand Story:</span>
            <button
              onClick={() => setInputModes((prev) => ({ ...prev, brandStory: prev.brandStory === 'ai' ? 'manual' : 'ai' }))}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {inputModes.brandStory === 'ai' ? 'Enter Manually' : 'View AI Suggestions'}
            </button>
          </div>

          <textarea
            rows={7}
            value={manualFields.brandStory}
            onChange={(e) => {
              setManualFields({ ...manualFields, brandStory: e.target.value });
              setSelectedValues({ ...selectedValues, brandStory: e.target.value });
            }}
            placeholder="Write or edit your full brand story..."
            className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs font-medium text-[#0F291E] rounded-xl p-4 outline-none resize-y transition-all leading-relaxed"
          />

          <div className="flex items-center justify-end gap-3">
            {saveSuccess.brandStory && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Saving Successful!
              </span>
            )}
            <button
              onClick={() => handleSaveSection('brandStory', manualFields.brandStory, inputModes.brandStory === 'manual' ? 'manual' : 'ai')}
              disabled={saving.brandStory || !manualFields.brandStory.trim()}
              className="px-5 py-2.5 rounded-full bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {saving.brandStory ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Brand Story</span>
            </button>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          6. BRAND PERSONALITY SECTION
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-600">06</span>
                <h3 className="text-base font-bold text-[#0F291E]">Brand Personality</h3>
                {savedValues.brandPersonality && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                    Saved ({sources.brandPersonalitySource === 'manual' ? 'Manual' : 'AI'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyze your business context and select multiple personality traits.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRegenerate('brandPersonality')}
            disabled={regenerating.brandPersonality}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${regenerating.brandPersonality ? 'animate-spin' : ''}`} />
            <span>{regenerating.brandPersonality ? 'Generating new suggestions...' : 'Regenerate Personality'}</span>
          </button>
        </div>

        {/* Error alert */}
        {errors.brandPersonality && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.brandPersonality}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRegenerate('brandPersonality')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => setErrors((prev) => ({ ...prev, brandPersonality: null }))}
                className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {regenerating.brandPersonality && (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-2 animate-pulse">
            <RefreshCw className="w-5 h-5 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Gemini is analyzing brand personality traits...</p>
          </div>
        )}

        {/* AI Explanation Box */}
        {personalityExplanation && !regenerating.brandPersonality && (
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 text-xs text-teal-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              <span className="font-bold">AI Context: </span>
              {personalityExplanation}
            </p>
          </div>
        )}

        {/* AI Suggested Trait Pills (Selectable Multiple) */}
        {!regenerating.brandPersonality && suggestions.brandPersonality.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              AI Suggested Personality Traits (Select Multiple):
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.brandPersonality.map((trait, idx) => {
                const isSelected = selectedValues.brandPersonality.includes(trait);
                return (
                  <button
                    key={idx}
                    onClick={() => togglePersonalityTrait(trait)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-[#FAF8F5] text-slate-700 border-[#E5E0D8] hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{trait}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!regenerating.brandPersonality && suggestions.brandPersonality.length === 0 && (
          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-xs text-slate-500">No personality traits suggested yet.</p>
            <button
              onClick={() => handleRegenerate('brandPersonality')}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-xs"
            >
              Suggest Traits with AI
            </button>
          </div>
        )}

        {/* Selected Traits Summary & Manual Addition */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Selected Brand Personality Traits:</label>

          {selectedValues.brandPersonality.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedValues.brandPersonality.map((trait, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold shadow-2xs"
                >
                  <span>{trait}</span>
                  <button
                    onClick={() => togglePersonalityTrait(trait)}
                    className="p-0.5 rounded-full hover:bg-slate-700 transition-colors text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No traits selected yet.</p>
          )}

          {/* Manual Input for custom traits */}
          <form onSubmit={addManualTrait} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={manualFields.brandPersonalityInput}
              onChange={(e) => setManualFields({ ...manualFields, brandPersonalityInput: e.target.value })}
              placeholder="Add custom trait (e.g. Luxurious)..."
              className="flex-1 bg-[#FAF8F5] border border-[#E5E0D8] focus:border-slate-900 focus:glass-panel text-xs text-[#0F291E] rounded-xl px-3.5 py-2 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!manualFields.brandPersonalityInput.trim()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>Add Trait</span>
            </button>
          </form>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saveSuccess.brandPersonality && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Saving Successful!
              </span>
            )}
            <button
              onClick={() => handleSaveSection('brandPersonality', selectedValues.brandPersonality, 'ai')}
              disabled={saving.brandPersonality || selectedValues.brandPersonality.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {saving.brandPersonality ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Brand Personality</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          NEXT STEP BANNER: PRODUCT STRATEGY & POSITIONING
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Next Step in BrandDNA Engine</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
            Fill Product Strategy & Positioning
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Use your saved Brand Analysis (Name, Tagline, Mission, Vision, and Personality) to automatically generate high-impact product names, elevator pitches, defensible USPs, and positioning frameworks.
          </p>
        </div>
        <button
          onClick={handleSaveAllAndProceed}
          disabled={savingAll}
          className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {savingAll ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Save className="w-4 h-4 text-white" />
          )}
          <span>{savingAll ? 'Saving Brand Analysis...' : 'Save & Proceed to Product Strategy'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

