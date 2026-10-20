import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Edit2,
  Save,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  FileText,
  UserCheck,
  Megaphone,
  Share2,
  Tv,
  Layers,
  Check,
  Zap,
  Info,
  DollarSign,
  Package,
  Award,
  Tag
} from 'lucide-react';
import { marketingProjectService } from '../../services/marketingProjectService';

export default function MarketingProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('brandIdentity');
  
  // Track generation state per module
  const [generating, setGenerating] = useState({});
  const [genError, setGenError] = useState({});

  // Track editable state for project metadata & modules
  const [isEditingIdea, setIsEditingIdea] = useState(false);
  const [ideaForm, setIdeaForm] = useState({});
  
  const [editingModule, setEditingModule] = useState(null);
  const [moduleEditData, setModuleEditData] = useState({});
  const [savingModule, setSavingModule] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await marketingProjectService.getProjectById(id);
      if (res.success && res.data.project) {
        setProject(res.data.project);
        setIdeaForm({
          title: res.data.project.title || '',
          productIdea: res.data.project.productIdea || '',
          productCategory: res.data.project.productCategory || '',
          intendedMarket: res.data.project.intendedMarket || '',
          productCost: res.data.project.productCost || '',
          specialFeatures: res.data.project.specialFeatures || '',
          businessObjective: res.data.project.businessObjective || '',
          geographicMarket: res.data.project.geographicMarket || ''
        });
      } else {
        setError('Unable to load project details.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIdea = async (e) => {
    e.preventDefault();
    try {
      setSavingModule(true);
      const res = await marketingProjectService.updateProject(id, ideaForm);
      if (res.success) {
        setProject(res.data.project);
        setIsEditingIdea(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product idea');
    } finally {
      setSavingModule(false);
    }
  };

  const handleGenerateModule = async (moduleKey) => {
    try {
      setGenerating((prev) => ({ ...prev, [moduleKey]: true }));
      setGenError((prev) => ({ ...prev, [moduleKey]: null }));

      const res = await marketingProjectService.generateModuleAI(id, moduleKey);
      if (res.success && res.data.project) {
        setProject(res.data.project);
      } else {
        setGenError((prev) => ({ ...prev, [moduleKey]: 'Unable to generate content. Please try again.' }));
      }
    } catch (err) {
      console.error(err);
      setGenError((prev) => ({
        ...prev,
        [moduleKey]: err.response?.data?.message || 'Unable to generate content. Please try again.'
      }));
    } finally {
      setGenerating((prev) => ({ ...prev, [moduleKey]: false }));
    }
  };

  const handleSelectAttribute = async (type, value) => {
    try {
      const updatePayload = {};
      if (type === 'productName') updatePayload.selectedProductName = value;
      if (type === 'tagline') updatePayload.selectedTagline = value;
      if (type === 'usp') updatePayload.selectedUSP = value;

      const res = await marketingProjectService.updateProject(id, updatePayload);
      if (res.success) {
        setProject(res.data.project);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingModule = (moduleKey) => {
    setEditingModule(moduleKey);
    setModuleEditData(JSON.parse(JSON.stringify(project[moduleKey] || {})));
  };

  const handleSaveModuleData = async (moduleKey) => {
    try {
      setSavingModule(true);
      const res = await marketingProjectService.updateProject(id, {
        [moduleKey]: moduleEditData
      });
      if (res.success) {
        setProject(res.data.project);
        setEditingModule(null);
      }
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSavingModule(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = project.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      const res = await marketingProjectService.updateProject(id, { status: newStatus });
      if (res.success) {
        setProject(res.data.project);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium text-sm">Loading Project Intelligence Workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-6 rounded-2xl shadow-sm border border-[#E5E0D8] text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#0F291E]/90 mb-2">Project Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">{error || "The requested marketing project could not be found."}</p>
          <Link
            to="/marketing/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'brandIdentity', name: 'Brand Identity', icon: Sparkles, count: project.brandIdentity ? 'Ready' : null },
    { id: 'productStrategy', name: 'Product Strategy', icon: Target, count: project.productStrategy ? 'Ready' : null },
    { id: 'productDescription', name: 'Product Description', icon: FileText, count: project.productDescription ? 'Ready' : null },
    { id: 'customerPersona', name: 'Customer Persona', icon: UserCheck, count: project.customerPersona ? 'Ready' : null },
    { id: 'marketingIdeas', name: 'Marketing Ideas', icon: Lightbulb, count: project.marketingIdeas ? 'Ready' : null },
    { id: 'campaigns', name: 'Promotional Campaign', icon: Megaphone, count: project.campaigns ? 'Ready' : null },
    { id: 'socialMediaContent', name: 'Social Media', icon: Share2, count: project.socialMediaContent ? 'Ready' : null },
    { id: 'advertisementCopy', name: 'Advertisement Copy', icon: Tv, count: project.advertisementCopy ? 'Ready' : null },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] font-sans pb-16">
      {/* Header Bar */}
      <div className="glass-panel border-b border-[#E5E0D8] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/marketing/dashboard')}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#0F291E] tracking-tight">{project.title}</h1>
                  <button
                    onClick={handleToggleStatus}
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-colors ${
                      project.status === 'Completed'
                        ? 'bg-[#FAF8F5]merald-50 text-emerald-700 border-emerald-200 hover:bg-[#FAF8F5]merald-100'
                        : 'bg-[#FAF8F5]mber-50 text-amber-700 border-amber-200 hover:bg-[#FAF8F5]mber-100'
                    }`}
                  >
                    {project.status || 'In Progress'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>AI Dynamic Workspace</span>
                </p>
              </div>
            </div>

            {/* Quick Action Badges / Active Selections */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <div className="bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-indigo-400 font-semibold block uppercase tracking-wider text-[10px]">Active Name</span>
                <span className="font-bold text-indigo-900 truncate max-w-[140px] inline-block">
                  {project.selectedProductName || 'Not selected yet'}
                </span>
              </div>

              <div className="bg-purple-50/80 border border-purple-100 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-purple-400 font-semibold block uppercase tracking-wider text-[10px]">Active Tagline</span>
                <span className="font-bold text-purple-900 truncate max-w-[160px] inline-block">
                  {project.selectedTagline || 'Not selected yet'}
                </span>
              </div>

              <div className="bg-[#FAF8F5]merald-50/80 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-emerald-500 font-semibold block uppercase tracking-wider text-[10px]">Active USP</span>
                <span className="font-bold text-emerald-900 truncate max-w-[180px] inline-block">
                  {project.selectedUSP || 'Not selected yet'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Product Idea Banner Card */}
        <div className="glass-panel rounded-2xl p-6 border border-[#E5E0D8]/80 shadow-xs mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F291E]">Product Idea (AI Core Input)</h2>
                <p className="text-xs text-slate-500">All AI modules generate content dynamically from this idea.</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingIdea(!isEditingIdea)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditingIdea ? 'Cancel' : 'Edit Idea'}
            </button>
          </div>

          {isEditingIdea ? (
            <form onSubmit={handleSaveIdea} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  value={ideaForm.title}
                  onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Idea / Concept *</label>
                <textarea
                  rows={3}
                  value={ideaForm.productIdea}
                  onChange={(e) => setIdeaForm({ ...ideaForm, productIdea: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <input
                    type="text"
                    value={ideaForm.productCategory}
                    onChange={(e) => setIdeaForm({ ...ideaForm, productCategory: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Intended Market</label>
                  <input
                    type="text"
                    value={ideaForm.intendedMarket}
                    onChange={(e) => setIdeaForm({ ...ideaForm, intendedMarket: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Approx. Cost</label>
                  <input
                    type="text"
                    value={ideaForm.productCost}
                    onChange={(e) => setIdeaForm({ ...ideaForm, productCost: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Geographic Market</label>
                  <input
                    type="text"
                    value={ideaForm.geographicMarket}
                    onChange={(e) => setIdeaForm({ ...ideaForm, geographicMarket: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingIdea(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModule}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
                >
                  {savingModule ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Product Idea
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-[#0F291E]/90 text-sm leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5E0D8]/60">
                "{project.productIdea}"
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                {project.productCategory && (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-[#E5E0D8]/80">
                    Category: {project.productCategory}
                  </span>
                )}
                {project.intendedMarket && (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-[#E5E0D8]/80">
                    Market: {project.intendedMarket}
                  </span>
                )}
                {project.productCost && (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-[#E5E0D8]/80">
                    Cost Ref: {project.productCost}
                  </span>
                )}
                {project.geographicMarket && (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-[#E5E0D8]/80">
                    Geo: {project.geographicMarket}
                  </span>
                )}
                {project.specialFeatures && (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-[#E5E0D8]/80">
                    Features: {project.specialFeatures}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 border-b border-[#E5E0D8] mb-6 pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'glass-panel text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 border border-[#E5E0D8]/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
                {tab.count && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-[#FAF8F5]merald-100 text-emerald-700'
                    }`}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Card Area */}
        <div className="glass-panel rounded-2xl border border-[#E5E0D8]/80 shadow-xs p-6 min-h-[450px]">
          
          {/* Global Generation Error Display */}
          {genError[activeTab] && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{genError[activeTab]}</span>
              </div>
              <button
                onClick={() => handleGenerateModule(activeTab)}
                className="px-3 py-1 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Top Bar inside Module View */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0F291E] flex items-center gap-2">
                {tabs.find((t) => t.id === activeTab)?.name}
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Dynamic AI Output
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Generated strictly based on product idea: "{project.productIdea.substring(0, 60)}..."
              </p>
            </div>

            <div className="flex items-center gap-2">
              {project[activeTab] && editingModule !== activeTab && (
                <button
                  onClick={() => startEditingModule(activeTab)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Results
                </button>
              )}

              <button
                onClick={() => handleGenerateModule(activeTab)}
                disabled={generating[activeTab]}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                {generating[activeTab] ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{project[activeTab] ? 'Regenerate' : 'Generate Section'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Module-Specific Content Views */}
          {generating[activeTab] ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-[#0F291E]/90 mb-1">Generating Dynamic AI Content</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Gemini AI is analyzing your product idea and crafting custom strategies...
              </p>
            </div>
          ) : !project[activeTab] ? (
            /* Empty State for Module */
            <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#E5E0D8] rounded-2xl bg-[#FAF8F5]/50">
              <div className="p-3 bg-slate-100 text-slate-400 rounded-xl mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#0F291E]/90 mb-1">No generated content for this section yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-5">
                Click generate to dynamically produce intelligence tailored specifically to your product idea.
              </p>
              <button
                onClick={() => handleGenerateModule(activeTab)}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate {tabs.find((t) => t.id === activeTab)?.name}
              </button>
            </div>
          ) : (
            /* Main Display / Edit View */
            <div className="space-y-6">
              
              {/* BRAND IDENTITY MODULE */}
              {activeTab === 'brandIdentity' && (
                <BrandIdentityView
                  data={project.brandIdentity}
                  isEditing={editingModule === 'brandIdentity'}
                  editData={moduleEditData}
                  setEditData={setModuleEditData}
                  onSave={() => handleSaveModuleData('brandIdentity')}
                  onCancel={() => setEditingModule(null)}
                  onSelectName={(name) => handleSelectAttribute('productName', name)}
                  onSelectTagline={(tagline) => handleSelectAttribute('tagline', tagline)}
                  selectedName={project.selectedProductName}
                  selectedTagline={project.selectedTagline}
                  saving={savingModule}
                />
              )}

              {/* PRODUCT STRATEGY MODULE */}
              {activeTab === 'productStrategy' && (
                <ProductStrategyView
                  data={project.productStrategy}
                  isEditing={editingModule === 'productStrategy'}
                  editData={moduleEditData}
                  setEditData={setModuleEditData}
                  onSave={() => handleSaveModuleData('productStrategy')}
                  onCancel={() => setEditingModule(null)}
                  onSelectName={(name) => handleSelectAttribute('productName', name)}
                  onSelectUSP={(usp) => handleSelectAttribute('usp', usp)}
                  selectedName={project.selectedProductName}
                  selectedUSP={project.selectedUSP}
                  saving={savingModule}
                />
              )}

              {/* PRODUCT DESCRIPTION MODULE */}
              {activeTab === 'productDescription' && (
                <ProductDescriptionView
                  data={project.productDescription}
                  isEditing={editingModule === 'productDescription'}
                  editData={moduleEditData}
                  setEditData={setModuleEditData}
                  onSave={() => handleSaveModuleData('productDescription')}
                  onCancel={() => setEditingModule(null)}
                  saving={savingModule}
                />
              )}

              {/* CUSTOMER PERSONA MODULE */}
              {activeTab === 'customerPersona' && (
                <CustomerPersonaView
                  data={project.customerPersona}
                  isEditing={editingModule === 'customerPersona'}
                  editData={moduleEditData}
                  setEditData={setModuleEditData}
                  onSave={() => handleSaveModuleData('customerPersona')}
                  onCancel={() => setEditingModule(null)}
                  saving={savingModule}
                />
              )}

              {/* MARKETING IDEAS MODULE */}
              {activeTab === 'marketingIdeas' && (
                <MarketingIdeasView
                  data={project.marketingIdeas}
                  isEditing={editingModule === 'marketingIdeas'}
                  editData={moduleEditData}
                  setEditData={setModuleEditData}
                  onSave={() => handleSaveModuleData('marketingIdeas')}
                  onCancel={() => setEditingModule(null)}
                  saving={savingModule}
                />
              )}

              {/* PROMOTIONAL CAMPAIGNS MODULE */}
              {activeTab === 'campaigns' && (
                <CampaignsView
                  data={project.campaigns}
                  isEditing={editingModule === 'campaigns'}
                  editData={moduleEditData}
                  setEditData={setModuleEditData}
                  onSave={() => handleSaveModuleData('campaigns')}
                  onCancel={() => setEditingModule(null)}
                  saving={savingModule}
                />
              )}

              {/* SOCIAL MEDIA CONTENT MODULE */}
              {activeTab === 'socialMediaContent' && (
                <SocialMediaView
                  data={project.socialMediaContent}
                  isEditing={editingModule === 'socialMediaContent'}
                  editData={moduleEditData}
                  setEditData={setModuleEditData}
                  onSave={() => handleSaveModuleData('socialMediaContent')}
                  onCancel={() => setEditingModule(null)}
                  saving={savingModule}
                />
              )}

              {/* ADVERTISEMENT COPY MODULE */}
              {activeTab === 'advertisementCopy' && (
                <AdvertisementCopyView
                  data={project.advertisementCopy}
                  isEditing={editingModule === 'advertisementCopy'}
                  editData={moduleEditData}
                  setEditData={setModuleEditData}
                  onSave={() => handleSaveModuleData('advertisementCopy')}
                  onCancel={() => setEditingModule(null)}
                  saving={savingModule}
                />
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS FOR EACH MODULE VIEW & EDIT MODE
// ----------------------------------------------------------------------

function BrandIdentityView({ data, isEditing, editData, setEditData, onSave, onCancel, onSelectName, onSelectTagline, selectedName, selectedTagline, saving }) {
  if (isEditing) {
    return (
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Brand Mission</label>
          <textarea
            rows={2}
            value={editData.mission || ''}
            onChange={(e) => setEditData({ ...editData, mission: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Brand Vision</label>
          <textarea
            rows={2}
            value={editData.vision || ''}
            onChange={(e) => setEditData({ ...editData, vision: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Brand Story</label>
          <textarea
            rows={4}
            value={editData.brandStory || ''}
            onChange={(e) => setEditData({ ...editData, brandStory: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Logo Concept / Prompt</label>
          <textarea
            rows={2}
            value={editData.logoPrompt || ''}
            onChange={(e) => setEditData({ ...editData, logoPrompt: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Brand Tone</label>
          <input
            type="text"
            value={editData.brandTone || ''}
            onChange={(e) => setEditData({ ...editData, brandTone: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onCancel} className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Name Suggestions */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Generated Name Suggestions (Click to Select Active)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.nameSuggestions?.map((item, idx) => {
            const nameStr = typeof item === 'string' ? item : item.name;
            const reasonStr = typeof item === 'object' ? item.reasoning : '';
            const isSelected = selectedName === nameStr;
            return (
              <div
                key={idx}
                onClick={() => onSelectName(nameStr)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 shadow-xs ring-2 ring-indigo-200'
                    : 'glass-panel border-[#E5E0D8] hover:border-indigo-300 hover:bg-[#FAF8F5]/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#0F291E]">{nameStr}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                </div>
                {reasonStr && <p className="text-xs text-slate-500 leading-snug">{reasonStr}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Taglines */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Generated Taglines (Click to Select Active)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.taglineSuggestions?.map((tag, idx) => {
            const isSelected = selectedTagline === tag;
            return (
              <div
                key={idx}
                onClick={() => onSelectTagline(tag)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200'
                    : 'glass-panel border-[#E5E0D8] hover:border-purple-300'
                }`}
              >
                <span className="font-medium text-[#0F291E]/90 italic">"{tag}"</span>
                {isSelected && <Check className="w-4 h-4 text-purple-600" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Brand Mission</h4>
          <p className="text-xs text-slate-700 leading-relaxed">{data.mission || 'N/A'}</p>
        </div>
        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">Brand Vision</h4>
          <p className="text-xs text-slate-700 leading-relaxed">{data.vision || 'N/A'}</p>
        </div>
      </div>

      {/* Brand Story */}
      <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl">
        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Brand Story</h4>
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{data.brandStory || 'N/A'}</p>
      </div>

      {/* Personality & Tone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Brand Personality</h4>
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(data.brandPersonality) ? (
              data.brandPersonality.map((p, i) => (
                <span key={i} className="px-2 py-0.5 glass-panel border border-[#E5E0D8] text-slate-700 text-xs font-medium rounded-md">
                  {p}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-600">{data.brandPersonality}</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Brand Tone</h4>
          <p className="text-xs text-slate-700">{data.brandTone || 'N/A'}</p>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Color Palette Suggestions</h4>
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(data.colorSuggestions) ? (
              data.colorSuggestions.map((c, i) => (
                <span key={i} className="px-2 py-0.5 glass-panel border border-[#E5E0D8] text-slate-700 text-xs rounded-md">
                  {c}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-600">{data.colorSuggestions}</span>
            )}
          </div>
        </div>
      </div>

      {/* Logo Prompt */}
      <div className="p-4 bg-[#0F291E] text-slate-100 rounded-xl">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>AI Logo Generation Prompt</span>
        </div>
        <p className="text-xs text-slate-300 font-mono bg-slate-800 p-3 rounded-lg border border-slate-700">
          {data.logoPrompt || 'N/A'}
        </p>
      </div>
    </div>
  );
}

function ProductStrategyView({ data, isEditing, editData, setEditData, onSave, onCancel, onSelectName, onSelectUSP, selectedName, selectedUSP, saving }) {
  if (isEditing) {
    return (
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Market Positioning Statement</label>
          <textarea
            rows={3}
            value={editData.positioning?.positioningStatement || ''}
            onChange={(e) => setEditData({
              ...editData,
              positioning: { ...(editData.positioning || {}), positioningStatement: e.target.value }
            })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onCancel} className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  const pricing = data.pricing || {};
  const packaging = data.packaging || {};
  const positioning = data.positioning || {};

  return (
    <div className="space-y-6 text-sm">
      {/* Product Naming Strategy */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Product Name Options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.isArray(data.productNaming) && data.productNaming.map((item, idx) => {
            const nameStr = typeof item === 'string' ? item : item.name;
            const isSelected = selectedName === nameStr;
            return (
              <div
                key={idx}
                onClick={() => onSelectName(nameStr)}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                  isSelected ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'glass-panel border-[#E5E0D8] hover:border-indigo-300'
                }`}
              >
                <span className="font-bold text-[#0F291E] text-xs">{nameStr}</span>
                {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unique Selling Proposition (USP) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">USP Suggestions (Click to Select Active)</h3>
        <div className="space-y-2">
          {Array.isArray(data.uspSuggestions) && data.uspSuggestions.map((usp, idx) => {
            const isSelected = selectedUSP === usp;
            return (
              <div
                key={idx}
                onClick={() => onSelectUSP(usp)}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs font-medium ${
                  isSelected ? 'bg-[#FAF8F5]merald-50 border-emerald-500 ring-2 ring-emerald-200 text-emerald-900' : 'glass-panel border-[#E5E0D8] text-[#0F291E]/90 hover:border-emerald-300'
                }`}
              >
                <span>"{usp}"</span>
                {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Recommendations (₹ INR & $ USD) */}
      <div className="p-4 bg-[#FAF8F5]merald-50/50 border border-emerald-200/80 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>AI Pricing Recommendations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-3 rounded-lg border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Suggested Price Range</span>
            <span className="text-base font-extrabold text-[#0F291E]">{pricing.suggestedPriceRange || 'N/A'}</span>
          </div>
          <div className="glass-panel p-3 rounded-lg border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Pricing Strategy</span>
            <span className="text-sm font-bold text-[#0F291E]/90">{pricing.pricingStrategy || 'N/A'}</span>
          </div>
        </div>

        {pricing.reasoning && (
          <p className="text-xs text-slate-700 leading-relaxed glass-panel p-3 rounded-lg border border-emerald-100">
            <strong className="text-[#0F291E]">Reasoning:</strong> {pricing.reasoning}
          </p>
        )}

        {pricing.disclaimer && (
          <p className="text-[11px] text-amber-700 italic flex items-center gap-1.5 bg-[#FAF8F5]mber-50 p-2.5 rounded-lg border border-amber-200">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{pricing.disclaimer}</span>
          </p>
        )}
      </div>

      {/* Positioning */}
      <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-[#0F291E] uppercase tracking-wider">Product Positioning</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-600 block">Market Positioning:</span>
            <p className="text-[#0F291E]/90">{positioning.marketPositioning || 'N/A'}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-600 block">Target Market:</span>
            <p className="text-[#0F291E]/90">{positioning.targetMarket || 'N/A'}</p>
          </div>
        </div>
        {positioning.positioningStatement && (
          <div className="glass-panel p-3 rounded-lg border border-[#E5E0D8] text-xs">
            <span className="font-bold text-indigo-900 block mb-1">Positioning Statement:</span>
            <p className="text-slate-700 italic">"{positioning.positioningStatement}"</p>
          </div>
        )}
      </div>

      {/* Packaging Suggestions */}
      <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-[#0F291E] font-bold text-xs">
          <Package className="w-4 h-4 text-indigo-600" />
          <span>Packaging Suggestions</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="glass-panel p-3 rounded-lg border border-[#E5E0D8]">
            <span className="font-semibold text-slate-500 block text-[10px] uppercase">Packaging Type</span>
            <span className="font-medium text-[#0F291E]">{packaging.type || 'N/A'}</span>
          </div>
          <div className="glass-panel p-3 rounded-lg border border-[#E5E0D8]">
            <span className="font-semibold text-slate-500 block text-[10px] uppercase">Material</span>
            <span className="font-medium text-[#0F291E]">{packaging.material || 'N/A'}</span>
          </div>
          <div className="glass-panel p-3 rounded-lg border border-[#E5E0D8]">
            <span className="font-semibold text-slate-500 block text-[10px] uppercase">Sustainability</span>
            <span className="font-medium text-[#0F291E]">{packaging.sustainability || 'N/A'}</span>
          </div>
        </div>
        {packaging.designConcept && (
          <p className="text-xs text-slate-700 glass-panel p-3 rounded-lg border border-[#E5E0D8]">
            <strong>Design Concept:</strong> {packaging.designConcept}
          </p>
        )}
      </div>
    </div>
  );
}

function ProductDescriptionView({ data, isEditing, editData, setEditData, onSave, onCancel, saving }) {
  if (isEditing) {
    return (
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
          <textarea
            rows={2}
            value={editData.shortDescription || ''}
            onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
          <textarea
            rows={4}
            value={editData.detailedDescription || ''}
            onChange={(e) => setEditData({ ...editData, detailedDescription: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onCancel} className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Short Description (Elevator Pitch)</h4>
        <p className="text-xs text-[#0F291E]/90 leading-relaxed font-medium">{data.shortDescription || 'N/A'}</p>
      </div>

      <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
        <h4 className="text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-2">Detailed Description</h4>
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{data.detailedDescription || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-3">Key Features</h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {Array.isArray(data.keyFeatures) ? (
              data.keyFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))
            ) : (
              <li>{data.keyFeatures}</li>
            )}
          </ul>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="text-xs font-bold text-[#0F291E] uppercase tracking-wider mb-3">Customer Benefits</h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {Array.isArray(data.benefits) ? (
              data.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))
            ) : (
              <li>{data.benefits}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CustomerPersonaView({ data, isEditing, editData, setEditData, onSave, onCancel, saving }) {
  if (isEditing) {
    return (
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Persona Name</label>
          <input
            type="text"
            value={editData.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
          <input
            type="text"
            value={editData.occupation || ''}
            onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onCancel} className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">AI Target Persona</span>
            <h3 className="text-xl font-bold">{data.name || 'Target Persona'}</h3>
            <p className="text-xs text-indigo-100 mt-0.5">
              {data.occupation} • Age: {data.ageRange} • {data.location}
            </p>
          </div>
          {data.incomeLevel && (
            <div className="glass-panel/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white">
              Income: {data.incomeLevel}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="font-bold text-rose-800 uppercase tracking-wider mb-2">Pain Points</h4>
          <ul className="space-y-1.5 text-slate-700">
            {Array.isArray(data.painPoints) ? (
              data.painPoints.map((pt, i) => <li key={i}>• {pt}</li>)
            ) : (
              <li>{data.painPoints}</li>
            )}
          </ul>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="font-bold text-emerald-800 uppercase tracking-wider mb-2">Needs & Motivations</h4>
          <ul className="space-y-1.5 text-slate-700">
            {Array.isArray(data.needs) ? (
              data.needs.map((nd, i) => <li key={i}>• {nd}</li>)
            ) : (
              <li>{data.needs}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <span className="font-bold text-slate-700 block mb-1">Buying Behavior</span>
          <p className="text-slate-600">{data.buyingBehavior || 'N/A'}</p>
        </div>
        <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <span className="font-bold text-slate-700 block mb-1">Preferred Channels</span>
          <p className="text-slate-600">
            {Array.isArray(data.preferredChannels) ? data.preferredChannels.join(', ') : data.preferredChannels}
          </p>
        </div>
        <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <span className="font-bold text-slate-700 block mb-1">Potential Objections</span>
          <p className="text-slate-600">
            {Array.isArray(data.objections) ? data.objections.join(', ') : data.objections}
          </p>
        </div>
      </div>
    </div>
  );
}

function MarketingIdeasView({ data, isEditing, editData, setEditData, onSave, onCancel, saving }) {
  if (isEditing) {
    return (
      <div className="space-y-4 text-xs">
        <p className="text-slate-500">Edit raw JSON or use regenerate to refresh strategies.</p>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onCancel} className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="font-bold text-indigo-900 uppercase tracking-wider mb-2">Online Marketing Ideas</h4>
          <ul className="space-y-2 text-slate-700">
            {Array.isArray(data.onlineMarketing) && data.onlineMarketing.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl">
          <h4 className="font-bold text-purple-900 uppercase tracking-wider mb-2">Offline Marketing Ideas</h4>
          <ul className="space-y-2 text-slate-700">
            {Array.isArray(data.offlineMarketing) && data.offlineMarketing.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 shrink-0" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-xl text-xs">
        <h4 className="font-bold text-[#0F291E] uppercase tracking-wider mb-2">Product Launch Strategy</h4>
        <ul className="space-y-1.5 text-slate-700">
          {Array.isArray(data.launchIdeas) ? (
            data.launchIdeas.map((l, i) => <li key={i}>• {l}</li>)
          ) : (
            <li>{data.launchIdeas}</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function CampaignsView({ data, isEditing, editData, setEditData, onSave, onCancel, saving }) {
  const campaignsList = Array.isArray(data) ? data : [data];

  return (
    <div className="space-y-6 text-sm">
      {campaignsList.map((camp, idx) => (
        <div key={idx} className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Campaign Concept</span>
              <h3 className="text-base font-bold text-[#0F291E]">{camp.name || 'Promotional Campaign'}</h3>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg">
              {camp.duration || '2-4 Weeks'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 block text-[10px] uppercase">Objective</span>
              <p className="text-[#0F291E]/90 font-medium">{camp.objective}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block text-[10px] uppercase">Target Audience</span>
              <p className="text-[#0F291E]/90 font-medium">{camp.targetAudience}</p>
            </div>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl text-xs">
            <span className="font-bold text-slate-700 block mb-1">Promotional Message:</span>
            <p className="text-[#0F291E]/90 italic">"{camp.promotionalMessage}"</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-[#FAF8F5] rounded-lg">
              <span className="font-semibold text-slate-500 block text-[10px] uppercase">Offer Idea</span>
              <span className="text-[#0F291E]/90 font-bold">{camp.offerIdea}</span>
            </div>
            <div className="p-2.5 bg-[#FAF8F5] rounded-lg">
              <span className="font-semibold text-slate-500 block text-[10px] uppercase">Channels</span>
              <span className="text-[#0F291E]/90 font-medium">
                {Array.isArray(camp.channels) ? camp.channels.join(', ') : camp.channels}
              </span>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-lg">
              <span className="font-semibold text-indigo-600 block text-[10px] uppercase">Call to Action</span>
              <span className="text-indigo-900 font-bold">{camp.callToAction}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialMediaView({ data, isEditing, editData, setEditData, onSave, onCancel, saving }) {
  const posts = Array.isArray(data) ? data : [data];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      {posts.map((post, idx) => (
        <div key={idx} className="p-5 bg-[#FAF8F5] border border-[#E5E0D8]/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 glass-panel border border-[#E5E0D8] text-[#0F291E]/90 font-bold text-xs rounded-lg">
              {post.platform || 'Social Media'}
            </span>
            <Share2 className="w-4 h-4 text-slate-400" />
          </div>

          {post.headline && <h4 className="font-bold text-[#0F291E] text-xs">{post.headline}</h4>}

          <div className="glass-panel p-3 rounded-xl border border-[#E5E0D8] text-xs text-[#0F291E]/90 leading-relaxed font-mono whitespace-pre-line">
            {post.caption}
          </div>

          <div className="text-xs text-indigo-600 font-medium">
            {Array.isArray(post.hashtags) ? post.hashtags.join(' ') : post.hashtags}
          </div>

          {post.visualIdea && (
            <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-600">
              <strong>Visual Concept:</strong> {post.visualIdea}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AdvertisementCopyView({ data, isEditing, editData, setEditData, onSave, onCancel, saving }) {
  const ads = Array.isArray(data) ? data : [data];

  return (
    <div className="space-y-4 text-sm">
      {ads.map((ad, idx) => (
        <div key={idx} className="p-5 glass-panel border border-[#E5E0D8] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Ad Variant #{idx + 1}</span>
            <span className="text-xs text-slate-500 font-medium">Target: {ad.targetAudience}</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Headline</span>
            <h3 className="text-base font-extrabold text-[#0F291E]">{ad.headline}</h3>
          </div>

          <div className="p-3.5 bg-[#FAF8F5] rounded-xl text-xs text-[#0F291E]/90 leading-relaxed">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Primary Ad Copy</span>
            {ad.primaryText}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Short Pitch: <strong className="text-[#0F291E]/90">{ad.shortCopy}</strong></span>
            <button className="px-4 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs">
              {ad.callToAction || 'Shop Now'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


