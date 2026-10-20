import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Building2,
  Package,
  Plus,
  Check,
  CheckCircle,
  RefreshCw,
  Edit2,
  Save,
  AlertCircle,
  Lightbulb,
  DollarSign,
  UserCheck,
  Megaphone,
  Share2,
  ChevronRight,
  Tv
} from 'lucide-react';
import { brandService } from '../../../services/brandService';
import { marketingProductService } from '../../../services/marketingProductService';
import { useToast } from '../../../context/ToastContext';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedBrandId = searchParams.get('brandId') || '';
  const { addToast } = useToast();

  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [step, setStep] = useState(1); // 1: Input, 2: Review AI Strategy

  // Form inputs
  const [selectedBrandId, setSelectedBrandId] = useState(preselectedBrandId);
  const [formData, setFormData] = useState({
    productIdea: '',
    category: '',
    characteristics: '',
    estimatedCost: '',
    intendedMarket: '',
    productObjective: '',
  });

  // AI Output
  const [aiResult, setAiResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  // Selected Active Choices
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedUSP, setSelectedUSP] = useState('');
  const [editableFields, setEditableFields] = useState({});

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserBrands();
    
    // Intercept state from CreateBrandPage "Create Product From This Strategy"
    if (location.state?.productStrategy) {
      const ps = location.state.productStrategy;
      setSelectedBrandId(location.state.brandId);
      setFormData(prev => ({ ...prev, productIdea: location.state.productIdea }));
      
      const mappedResult = {
        productNamesSuggestions: ps.productNames || [],
        uspSuggestions: ps.productUSP ? [ps.productUSP] : [],
        pricingSuggestion: {
          suggestedPriceRange: ps.pricingSuggestions || '',
          pricingStrategy: 'Generated from Brand Strategy Preview',
        },
        positioning: {
          marketPositioning: ps.productPositioning || '',
        },
        packaging: {
          type: ps.packagingSuggestions || '',
        },
        description: {
          shortDescription: ps.productPositioning ? ps.productPositioning.substring(0, 100) : '',
          detailedDescription: ps.productPositioning || '',
          keyFeatures: [],
          benefits: []
        }
      };
      
      setAiResult(mappedResult);
      if (Array.isArray(ps.productNames) && ps.productNames.length > 0) {
        const first = ps.productNames[0];
        setSelectedProductName(typeof first === 'string' ? first : first.name);
      }
      setSelectedUSP(ps.productUSP || '');
      setStep(2);
      
      // Delay toast slightly to ensure Context is ready
      setTimeout(() => {
        addToast('Imported Product Strategy from Brand Creation workflow. You can save or regenerate.', 'success');
      }, 500);
    }
  }, [location.state]);

  const fetchUserBrands = async () => {
    try {
      setLoadingBrands(true);
      const res = await brandService.getBrands();
      if (res.success && Array.isArray(res.data.brands)) {
        setBrands(res.data.brands);
        if (!selectedBrandId && res.data.brands.length > 0) {
          setSelectedBrandId(res.data.brands[0]._id);
        }
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error(err);
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleGenerateProductStrategy = async (e) => {
    e?.preventDefault();
    if (!selectedBrandId) {
      addToast('Please select an existing Brand first.', 'error');
      return;
    }
    if (!formData.productIdea.trim()) {
      addToast('Please enter a Product Idea / Concept.', 'error');
      return;
    }

    try {
      setGenerating(true);
      setGenError(null);

      const res = await marketingProductService.generateProductAI({
        brandId: selectedBrandId,
        ...formData,
      });

      if (res.success && res.data?.aiResult) {
        const result = res.data.aiResult;
        setAiResult(result);

        // Pre-select first name suggestion if available
        if (Array.isArray(result.productNamesSuggestions) && result.productNamesSuggestions.length > 0) {
          const first = result.productNamesSuggestions[0];
          setSelectedProductName(typeof first === 'string' ? first : first.name);
        } else {
          setSelectedProductName(formData.productIdea.substring(0, 30));
        }

        if (Array.isArray(result.uspSuggestions) && result.uspSuggestions.length > 0) {
          setSelectedUSP(result.uspSuggestions[0]);
        }

        setEditableFields({
          tagline: result.tagline || '',
          shortDescription: result.description?.shortDescription || '',
          detailedDescription: result.description?.detailedDescription || '',
          targetCustomer: result.targetCustomer || '',
        });

        setStep(2);
        addToast('Product Strategy & Marketing generated with parent brand context!', 'success');
      } else {
        setGenError('Unable to generate strategy. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setGenError(err.response?.data?.message || 'Unable to generate strategy. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!selectedBrandId) {
      addToast('Brand association is required', 'error');
      return;
    }
    if (!selectedProductName || !selectedProductName.trim()) {
      addToast('Product Name is required', 'error');
      return;
    }

    try {
      setSaving(true);
      const productPayload = {
        brand: selectedBrandId,
        productName: selectedProductName.trim(),
        productIdea: formData.productIdea,
        category: formData.category,
        characteristics: formData.characteristics,
        estimatedCost: formData.estimatedCost,
        intendedMarket: formData.intendedMarket,
        productObjective: formData.productObjective,
        description: {
          shortDescription: editableFields.shortDescription || aiResult?.description?.shortDescription || '',
          detailedDescription: editableFields.detailedDescription || aiResult?.description?.detailedDescription || '',
          keyFeatures: aiResult?.description?.keyFeatures || [],
          benefits: aiResult?.description?.benefits || [],
        },
        tagline: editableFields.tagline || aiResult?.tagline || '',
        USP: selectedUSP ? [selectedUSP] : aiResult?.uspSuggestions || [],
        pricingSuggestion: aiResult?.pricingSuggestion || {},
        positioning: aiResult?.positioning || {},
        targetCustomer: editableFields.targetCustomer || aiResult?.targetCustomer || '',
        customerPersona: aiResult?.customerPersona || {},
        packaging: aiResult?.packaging || {},
        marketingIdeas: aiResult?.marketingIdeas || {},
        campaigns: aiResult?.campaigns || [],
        socialMediaContent: aiResult?.socialMediaContent || [],
        advertisementCopy: aiResult?.advertisementCopy || [],
        seoKeywords: aiResult?.seoKeywords || [],
        productNamesSuggestions: aiResult?.productNamesSuggestions || [],
        uspSuggestions: aiResult?.uspSuggestions || [],
      };

      const res = await marketingProductService.createProduct(productPayload);
      if (res.success && res.data.product) {
        addToast(`Product "${res.data.product.productName}" created under brand!`, 'success');
        navigate('/marketing/products');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedBrandDoc = brands.find((b) => b._id === selectedBrandId);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] p-6 md:p-8 pb-16">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/marketing/products"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0F291E] tracking-tight">AI Product Creation & Strategy</h1>
            <p className="text-xs text-slate-500">
              Create products linked to your saved Brands. Gemini generates product identity & marketing tailored to the Brand.
            </p>
          </div>
        </div>

        {/* STEP 1: BRAND SELECTION & PRODUCT INPUT */}
        {step === 1 && (
          <form onSubmit={handleGenerateProductStrategy} className="glass-panel rounded-2xl border border-[#E5E0D8]/80 shadow-xs p-6 md:p-8 space-y-6">
            
            {/* BRAND SELECTION - STRICT REQUIREMENT */}
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-base font-bold text-[#0F291E] flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Step 1: Select Parent Brand *
              </h2>
              <p className="text-xs text-slate-500">
                A Product must belong to an existing Brand saved in your database.
              </p>

              {loadingBrands ? (
                <div className="py-4 text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading available brands...</span>
                </div>
              ) : brands.length === 0 ? (
                /* STRICT EMPTY BRAND STATE */
                <div className="mt-4 p-5 bg-[#FAF8F5]mber-50 border border-amber-200 rounded-xl text-center">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-amber-900 mb-1">No brands available. Create a brand first.</h3>
                  <p className="text-xs text-amber-700 max-w-sm mx-auto mb-4">
                    Products require a parent Brand context to generate strategic alignment.
                  </p>
                  <Link
                    to="/marketing/brands/create"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Brand</span>
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {brands.map((b) => {
                      const isSelected = selectedBrandId === b._id;
                      return (
                        <div
                          key={b._id}
                          onClick={() => setSelectedBrandId(b._id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 shadow-xs'
                              : 'bg-[#FAF8F5] border-[#E5E0D8] hover:glass-panel hover:border-indigo-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-[#0F291E] text-xs block">{b.brandName}</span>
                            <span className="text-[10px] text-slate-500">{b.industry || 'General Industry'}</span>
                          </div>
                          {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {selectedBrandDoc && (
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5E0D8] text-xs flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        Selected: <strong className="text-indigo-900">{selectedBrandDoc.brandName}</strong>
                        {selectedBrandDoc.tagline && ` — "${selectedBrandDoc.tagline}"`}
                      </span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                        Brand Connected
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PRODUCT INPUTS */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#0F291E] flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                Step 2: Product Idea & Characteristics
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Idea / Concept *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your product idea in detail (e.g. Eco-friendly reusable insulated bamboo water bottle designed for college students)"
                  value={formData.productIdea}
                  onChange={(e) => setFormData({ ...formData, productIdea: e.target.value })}
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Sustainable Drinkware, Electronics"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approx. Estimated Cost (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹350 ($4.50)"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Intended Market (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. College students, Fitness enthusiasts"
                    value={formData.intendedMarket}
                    onChange={(e) => setFormData({ ...formData, intendedMarket: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Characteristics & Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Double-wall thermal insulation, leak-proof cap, bamboo exterior"
                  value={formData.characteristics}
                  onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
                  className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:glass-panel"
                />
              </div>
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
                disabled={generating || brands.length === 0}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Product Strategy with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Product Strategy</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW AI STRATEGY & MARKETING */}
        {step === 2 && aiResult && (
          <div className="glass-panel rounded-2xl border border-[#E5E0D8]/80 shadow-xs p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#0F291E] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Review Generated Product Strategy & Marketing
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parent Brand: <strong className="text-indigo-900">{selectedBrandDoc?.brandName}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateProductStrategy}
                disabled={generating}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                <span>Regenerate Strategy</span>
              </button>
            </div>

            {/* 1. Product Name Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Select Product Name *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.isArray(aiResult.productNamesSuggestions) &&
                  aiResult.productNamesSuggestions.map((item, idx) => {
                    const nameStr = typeof item === 'string' ? item : item.name;
                    const fitStr = typeof item === 'object' ? item.fitWithBrand : '';
                    const isSelected = selectedProductName === nameStr;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedProductName(nameStr)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                            : 'glass-panel border-[#E5E0D8] hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#0F291E] text-xs">{nameStr}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </div>
                        {fitStr && <p className="text-[10px] text-slate-500">{fitStr}</p>}
                      </div>
                    );
                  })}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-slate-500">Or edit product name:</span>
                <input
                  type="text"
                  value={selectedProductName}
                  onChange={(e) => setSelectedProductName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-[#0F291E] focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 2. Product Description */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Product Description & Value Pitch
              </label>
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] space-y-3">
                <div>
                  <span className="font-semibold text-slate-700 text-xs block mb-1">Short Description</span>
                  <input
                    type="text"
                    value={editableFields.shortDescription}
                    onChange={(e) => setEditableFields({ ...editableFields, shortDescription: e.target.value })}
                    className="w-full text-xs p-2 glass-panel border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <span className="font-semibold text-slate-700 text-xs block mb-1">Detailed Overview</span>
                  <textarea
                    rows={3}
                    value={editableFields.detailedDescription}
                    onChange={(e) => setEditableFields({ ...editableFields, detailedDescription: e.target.value })}
                    className="w-full text-xs p-2 glass-panel border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pricing Suggestions (₹ INR & $ USD) */}
            {aiResult.pricingSuggestion && (
              <div className="p-4 bg-[#FAF8F5]merald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>AI Pricing Recommendation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="glass-panel p-3 rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-600 block uppercase">Suggested Range</span>
                    <span className="text-base font-extrabold text-[#0F291E]">{aiResult.pricingSuggestion.suggestedPriceRange}</span>
                  </div>
                  <div className="glass-panel p-3 rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-600 block uppercase">Strategy</span>
                    <span className="text-sm font-bold text-[#0F291E]/90">{aiResult.pricingSuggestion.pricingStrategy}</span>
                  </div>
                </div>
                {aiResult.pricingSuggestion.disclaimer && (
                  <p className="text-[11px] text-amber-700 italic bg-[#FAF8F5]mber-50 p-2 rounded-lg border border-amber-200">
                    {aiResult.pricingSuggestion.disclaimer}
                  </p>
                )}
              </div>
            )}

            {/* 4. Target Customer Persona Summary */}
            {aiResult.customerPersona && (
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    Target Persona: {aiResult.customerPersona.name}
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold glass-panel px-2 py-0.5 rounded-md border border-purple-100">
                    Age: {aiResult.customerPersona.ageRange}
                  </span>
                </div>
                <p className="text-slate-700">{aiResult.customerPersona.lifestyle}</p>
              </div>
            )}

            {/* 5. Promotional Campaigns & Social Media Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {Array.isArray(aiResult.campaigns) && aiResult.campaigns.length > 0 && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl space-y-2">
                  <span className="font-bold text-[#0F291E] flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-indigo-600" />
                    Launch Campaign Concept
                  </span>
                  <p className="font-semibold text-[#0F291E]/90">{aiResult.campaigns[0].name}</p>
                  <p className="text-slate-600 italic">"{aiResult.campaigns[0].promotionalMessage}"</p>
                </div>
              )}

              {Array.isArray(aiResult.socialMediaContent) && aiResult.socialMediaContent.length > 0 && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl space-y-2">
                  <span className="font-bold text-[#0F291E] flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-purple-600" />
                    Social Media Post ({aiResult.socialMediaContent[0].platform})
                  </span>
                  <p className="text-slate-700 font-mono text-[11px] glass-panel p-2 rounded-lg border border-[#E5E0D8]">
                    {aiResult.socialMediaContent[0].caption}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Back to Inputs
              </button>

              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Product to MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Product under Brand</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


