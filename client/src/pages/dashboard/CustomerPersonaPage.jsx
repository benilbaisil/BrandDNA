import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Sparkles,
  RefreshCw,
  Save,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Heart,
  ShoppingBag,
  Zap,
  Check,
  Copy,
  ChevronRight,
  ShieldCheck,
  Layers,
  HelpCircle,
  BookmarkCheck
} from 'lucide-react';
import { personaService } from '../../services/personaService';
import { useToast } from '../../context/ToastContext';

const formatIncomeToINR = (incomeStr) => {
  if (!incomeStr) return 'N/A';
  let str = String(incomeStr);
  
  if (str.includes('₹') || str.includes('INR') || (str.includes('Lakh') && !str.includes('$'))) {
    return str;
  }
  
  return str.replace(/\$(\d{1,3}(?:,\d{3})*|\d+)/g, (match, p1) => {
    const num = parseInt(p1.replace(/,/g, ''), 10);
    if (isNaN(num)) return match;
    const inrVal = num * 85;
    if (inrVal >= 100000) {
      const lakhs = (inrVal / 100000).toFixed(1).replace(/\.0$/, '');
      return `₹${lakhs} Lakhs`;
    }
    return `₹${inrVal.toLocaleString('en-IN')}`;
  });
};

export const CustomerPersonaPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const showToast = (msg, type = 'success') => addToast(msg, type);

  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Loaded Brand & Product Context
  const [brandContext, setBrandContext] = useState({
    brandName: '',
    industry: '',
    targetAudience: '',
    productName: '',
  });

  // Generated / Saved Personas List (2 Personas)
  const [personas, setPersonas] = useState([]);

  // Active Tab per Persona Card { [personaIndex]: 'demographics' | 'interests' | 'buying' | 'pain' }
  const [activeTabs, setActiveTabs] = useState({
    0: 'demographics',
    1: 'demographics',
  });

  // Copy state tracker
  const [copiedKey, setCopiedKey] = useState(null);

  // Fetch initial persona and context data
  useEffect(() => {
    fetchPersonaData();
    const handleGlobalSync = () => fetchPersonaData();
    window.addEventListener('brand_dna_updated', handleGlobalSync);
    return () => window.removeEventListener('brand_dna_updated', handleGlobalSync);
  }, []);

  const fetchPersonaData = async () => {
    try {
      const res = await personaService.getPersonas();
      if (res && res.success) {
        if (res.data?.personas && res.data.personas.length > 0) {
          setPersonas(res.data.personas);
        }
        if (res.data?.brandContext) {
          setBrandContext(res.data.brandContext);
        }
      }
    } catch (err) {
      console.error('Error fetching persona data:', err);
      showToast('Failed to load target customer persona context.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate Personas via Gemini LLM
  const handleGeneratePersonas = async (e) => {
    if (e) e.preventDefault();
    setAiGenerating(true);
    try {
      const res = await personaService.generatePersonas();
      if (res && res.success && res.data?.personas) {
        setPersonas(res.data.personas);
        showToast('2 Target Customer Personas Generated Successfully!', 'success');
      }
    } catch (err) {
      console.error('Error generating customer personas:', err);
      showToast(err.message || 'Failed to generate customer personas using AI.', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  // Save & Continue Action
  const handleSaveAndContinue = async () => {
    if (personas.length === 0) {
      showToast('Please generate at least one customer persona before proceeding.', 'info');
      return;
    }
    setSaving(true);
    try {
      const res = await personaService.savePersonas(personas);
      if (res && res.success) {
        window.dispatchEvent(new CustomEvent('brand_dna_updated'));
        showToast('Customer Personas saved to MongoDB!', 'success');
        navigate('/marketing-planner');
      }
    } catch (err) {
      console.error('Error saving customer personas:', err);
      showToast('Failed to save customer personas to project document.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Tab switcher helper per card
  const handleTabSwitch = (cardIndex, tabKey) => {
    setActiveTabs((prev) => ({ ...prev, [cardIndex]: tabKey }));
  };

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };



  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left pb-24 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER & MASTER ACTIONS
         ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0F291E] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                Module 05: Customer Persona Engine
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Brand Context Active
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F291E] tracking-tight mt-2">
              Target Customer Persona Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generate detailed target customer profiles including Demographics, Interests, Buying Behaviour, and Pain Points.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <button
              onClick={handleGeneratePersonas}
              disabled={aiGenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F291E]/90 text-xs font-bold transition-all border border-[#D6E6EC] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${aiGenerating ? 'animate-spin' : ''}`} />
              <span>{aiGenerating ? 'Generating Personas...' : 'Regenerate Personas'}</span>
            </button>

            <button
              onClick={handleSaveAndContinue}
              disabled={saving || personas.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save & Continue</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Accumulated Context Summary Banner */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F291E] text-white flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Source Brand Context</span>
              <h3 className="text-sm font-extrabold text-[#0F291E]">{brandContext.brandName || 'Master Brand Identity'}</h3>
            </div>
          </div>
          {brandContext.industry && (
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-[#E5E0D8]">
              {brandContext.industry}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF8F5]/40 border border-[#D6E6EC]">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Target Audience Focus</span>
            <p className="text-[#0F291E]/90 font-semibold">{brandContext.targetAudience || 'Modern Consumers & Founders'}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F5]/40 border border-[#D6E6EC]">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Active Product Solution</span>
            <p className="text-[#0F291E]/90 font-semibold">{brandContext.productName || 'Flagship Offering'}</p>
          </div>
        </div>
      </div>

      {/* Empty State / CTA if no personas generated yet */}
      {personas.length === 0 && !aiGenerating && (
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif text-xl font-bold text-[#0F291E]">No Target Customer Personas Generated Yet</h3>
            <p className="text-xs text-slate-500">
              Click the button below to execute AI consumer psychology analysis and generate 2 distinct target customer profiles based on your brand DNA & product strategy.
            </p>
          </div>
          <button
            onClick={handleGeneratePersonas}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate Customer Personas with AI</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton while AI is Generating Data */}
      {aiGenerating && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2 font-semibold">
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Analyzing consumer demographics, psychology, buying drivers, and pain points...</span>
            </div>
            <span className="font-mono text-[10px] font-bold">2 Personas in Progress</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((idx) => (
              <div key={idx} className="p-6 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs space-y-6 animate-pulse">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-slate-200 rounded" />
                      <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                </div>

                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-48 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER 2 DISTINCT PERSONA CARDS */}
      {!aiGenerating && personas.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#0F291E] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              2 Generated Target Customer Persona Profiles
            </span>
            <span className="text-[10px] font-mono text-slate-400">Interactive Tabs for Demographics, Interests, Buying & Pain Points</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personas.map((persona, pIdx) => {
              const currentTab = activeTabs[pIdx] || 'demographics';

              return (
                <div
                  key={pIdx}
                  className="glass-panel rounded-3xl border border-[#D6E6EC] shadow-2xs overflow-hidden flex flex-col justify-between text-left transition-all"
                >
                  {/* Persona Card Header */}
                  <div className="p-6 bg-[#0F291E] text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl glass-panel/10 text-white flex items-center justify-center font-bold border border-white/20 shrink-0">
                        <User className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                          Persona Profile #{pIdx + 1}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-white tracking-tight">
                          {persona.personaName || `Target Buyer Persona ${pIdx + 1}`}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(JSON.stringify(persona, null, 2), `persona-${pIdx}`)}
                      className="p-2 rounded-xl text-slate-300 hover:text-white hover:glass-panel/10 transition-colors"
                      title="Copy JSON Profile"
                    >
                      {copiedKey === `persona-${pIdx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Persona Tabs Navigation */}
                  <div className="p-2 bg-slate-100/70 border-b border-[#D6E6EC] grid grid-cols-4 gap-1 text-[11px] font-bold">
                    {[
                      { id: 'demographics', label: 'Demographics', icon: User },
                      { id: 'interests', label: 'Interests', icon: Heart },
                      { id: 'buying', label: 'Buying Behaviour', icon: ShoppingBag },
                      { id: 'pain', label: 'Pain Points', icon: Zap },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = currentTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabSwitch(pIdx, tab.id)}
                          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            isActive
                              ? 'glass-panel text-[#0F291E] shadow-2xs font-extrabold border border-[#E5E0D8]'
                              : 'text-slate-500 hover:text-[#0F291E] hover:glass-panel/50'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="hidden sm:inline truncate">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Body Content */}
                  <div className="p-6 flex-1 space-y-4 min-h-[300px]">
                    <AnimatePresence mode="wait">

                      {/* TAB 1: DEMOGRAPHICS */}
                      {currentTab === 'demographics' && (
                        <motion.div
                          key="demographics"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-4 text-xs"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Age Range</span>
                              <p className="font-bold text-[#0F291E]">{persona.demographics?.age || 'N/A'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Location</span>
                              <p className="font-bold text-[#0F291E]">{persona.demographics?.location || 'N/A'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Income Level</span>
                              <p className="font-bold text-[#0F291E]">{formatIncomeToINR(persona.demographics?.income)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Occupation / Role</span>
                              <p className="font-bold text-[#0F291E]">{persona.demographics?.occupation || 'N/A'}</p>
                            </div>
                          </div>

                          {persona.demographics?.details && (
                            <div className="p-3.5 rounded-xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Background & Context</span>
                              <p className="text-slate-700 leading-relaxed font-medium">{persona.demographics.details}</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* TAB 2: INTERESTS */}
                      {currentTab === 'interests' && (
                        <motion.div
                          key="interests"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-4 text-xs"
                        >
                          {/* Hobbies */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Hobbies & Activities</span>
                            <div className="flex flex-wrap gap-1.5">
                              {persona.interests?.hobbies?.map((item, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[11px]">
                                  {item}
                                </span>
                              )) || <p className="text-slate-400 italic">No hobbies listed</p>}
                            </div>
                          </div>

                          {/* Values */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Core Values & Drivers</span>
                            <div className="flex flex-wrap gap-1.5">
                              {persona.interests?.values?.map((item, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                                  {item}
                                </span>
                              )) || <p className="text-slate-400 italic">No values listed</p>}
                            </div>
                          </div>

                          {/* Media Consumption */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Media & Information Channels</span>
                            <div className="flex flex-wrap gap-1.5">
                              {persona.interests?.mediaConsumption?.map((item, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#0F291E]/90 font-semibold border border-[#E5E0D8] text-[11px]">
                                  {item}
                                </span>
                              )) || <p className="text-slate-400 italic">No media listed</p>}
                            </div>
                          </div>

                          {persona.interests?.details && (
                            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Psychographic Summary</span>
                              <p className="text-slate-700 leading-relaxed font-medium">{persona.interests.details}</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* TAB 3: BUYING BEHAVIOUR */}
                      {currentTab === 'buying' && (
                        <motion.div
                          key="buying"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-4 text-xs"
                        >
                          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Shopping & Evaluation Habits</span>
                            <p className="text-[#0F291E]/90 font-semibold leading-relaxed">{persona.buyingBehaviour?.shoppingHabits || 'N/A'}</p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Decision Drivers</span>
                            <p className="text-[#0F291E]/90 font-semibold leading-relaxed">{persona.buyingBehaviour?.decisionDrivers || 'N/A'}</p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Price Sensitivity</span>
                            <p className="text-[#0F291E]/90 font-semibold leading-relaxed">{persona.buyingBehaviour?.priceSensitivity || 'N/A'}</p>
                          </div>

                          {persona.buyingBehaviour?.details && (
                            <div className="p-3.5 rounded-xl bg-[#FAF8F5]/40 border border-[#D6E6EC] space-y-1">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Buying Rationale</span>
                              <p className="text-slate-700 leading-relaxed font-medium">{persona.buyingBehaviour.details}</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* TAB 4: PAIN POINTS */}
                      {currentTab === 'pain' && (
                        <motion.div
                          key="pain"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-4 text-xs"
                        >
                          {persona.painPoints?.primaryChallenge && (
                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                              <span className="text-[10px] font-mono font-bold text-rose-600 uppercase">Primary Challenge</span>
                              <p className="text-rose-900 font-extrabold leading-relaxed">{persona.painPoints.primaryChallenge}</p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Specific Frustrations Solved</span>
                            <div className="space-y-1.5">
                              {persona.painPoints?.specificFrustrations?.map((item, idx) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-start gap-2">
                                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <span className="text-[#0F291E]/90 font-semibold leading-snug">{item}</span>
                                </div>
                              )) || <p className="text-slate-400 italic">No specific frustrations listed</p>}
                            </div>
                          </div>

                          {persona.painPoints?.details && (
                            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Solution Fit Rationale</span>
                              <p className="text-slate-700 leading-relaxed font-medium">{persona.painPoints.details}</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Persona Card Footer */}
                  <div className="p-4 bg-[#FAF8F5] border-t border-[#D6E6EC] flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      Aligned with {brandContext.brandName || 'Brand Strategy'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> AI Verified
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer Bar */}
          <div className="p-6 rounded-3xl glass-panel border border-[#D6E6EC] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-[#0F291E]">Ready to build your AI Marketing Plan?</h4>
              <p className="text-xs text-slate-500">Save these customer personas to your MongoDB project document and proceed to Module 6: AI Marketing Planner.</p>
            </div>

            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F291E] text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default CustomerPersonaPage;

