import React, { useState, useEffect } from 'react';
import { marketingProductService } from '../../services/marketingProductService';
import { useToast } from '../../context/ToastContext';
import { X, Wand2, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';

export const AdPosterModal = ({ productId, onClose }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [posterData, setPosterData] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchPoster();
    }
  }, [productId]);

  const fetchPoster = async () => {
    setLoading(true);
    try {
      const res = await marketingProductService.getAdPoster(productId);
      if (res.success && res.data.poster) {
        setPosterData(res.data.poster);
      }
    } catch (err) {
      // If 404, it just means it hasn't been generated yet, which is fine.
      if (err.response?.status !== 404) {
        console.error('Failed to load ad poster:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (isRegenerate = false) => {
    setGenerating(true);
    try {
      const apiCall = isRegenerate 
        ? marketingProductService.regenerateAdPoster(productId)
        : marketingProductService.generateAdPoster(productId);
        
      const res = await apiCall;
      if (res.success && res.data.poster) {
        setPosterData(res.data.poster);
        addToast(`Ad Poster ${isRegenerate ? 'regenerated' : 'generated'} successfully!`, 'success');
      }
    } catch (err) {
      console.error('Failed to generate ad poster:', err);
      addToast(err.response?.data?.message || 'Failed to generate ad poster.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F291E]/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="glass-panel rounded-3xl p-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-slate-700">Loading poster data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0F291E]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="glass-panel rounded-[2rem] max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 glass-panel sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F291E]">AI Ad Poster Studio</h2>
              <p className="text-xs text-slate-500">Transform your strategy into a high-converting visual concept</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5] flex flex-col items-center justify-center min-h-[400px]">
          {generating ? (
            <div className="text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <Wand2 className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="font-bold text-lg text-[#0F291E]">Synthesizing Product Strategy...</h3>
              <p className="text-sm text-slate-500">Our AI is designing your advertisement copy & theme.</p>
            </div>
          ) : !posterData ? (
            <div className="max-w-md text-center space-y-6 glass-panel p-10 rounded-3xl border border-[#E5E0D8] shadow-sm">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                <Wand2 className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F291E] mb-2">Ready to Create?</h3>
                <p className="text-slate-500 text-sm">
                  Generate a beautifully themed advertising poster layout using the saved product idea, USPs, and pricing strategy.
                </p>
              </div>
              <button 
                onClick={() => handleGenerate(false)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Wand2 className="w-5 h-5" />
                Generate AI Ad Poster
              </button>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Poster Preview Canvas */}
              <div className="lg:col-span-8 flex justify-center">
                <div 
                  className="w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] rounded-3xl shadow-xl overflow-hidden relative flex flex-col justify-between p-8 sm:p-12 transition-all"
                  style={{ backgroundColor: posterData.themeColors?.bg || '#F8FAFC' }}
                >
                  {/* Decorative Elements */}
                  <div 
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"
                    style={{ backgroundColor: posterData.themeColors?.accent || '#4F46E5' }}
                  />
                  <div 
                    className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 translate-y-1/3 -translate-x-1/3"
                    style={{ backgroundColor: posterData.themeColors?.primary || '#0F172A' }}
                  />

                  {/* Top Bar */}
                  <div className="relative z-10 flex justify-between items-start">
                    <span 
                      className="text-sm font-bold tracking-widest uppercase"
                      style={{ color: posterData.themeColors?.text || '#0F172A' }}
                    >
                      {posterData.brandNameText}
                    </span>
                    {posterData.primaryUSP && (
                      <span 
                        className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm"
                        style={{ 
                          backgroundColor: posterData.themeColors?.accent || '#4F46E5',
                          color: '#FFFFFF'
                        }}
                      >
                        {posterData.primaryUSP}
                      </span>
                    )}
                  </div>

                  {/* Main Copy */}
                  <div className="relative z-10 space-y-4 max-w-xl mt-8">
                    <h1 
                      className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
                      style={{ color: posterData.themeColors?.primary || '#0F172A' }}
                    >
                      {posterData.headline}
                    </h1>
                    <p 
                      className="text-lg sm:text-xl font-medium leading-relaxed opacity-90"
                      style={{ color: posterData.themeColors?.text || '#334155' }}
                    >
                      {posterData.subheadline}
                    </p>
                  </div>

                  {/* Bottom Bar / CTA */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-12">
                    <div className="space-y-1">
                      <p 
                        className="text-sm font-bold opacity-80"
                        style={{ color: posterData.themeColors?.text || '#334155' }}
                      >
                        {posterData.positioningMessage}
                      </p>
                      <p 
                        className="text-2xl font-bold"
                        style={{ color: posterData.themeColors?.primary || '#0F172A' }}
                      >
                        {posterData.pricingText}
                      </p>
                    </div>
                    <button 
                      className="px-8 py-4 rounded-2xl font-bold text-sm tracking-wider shadow-lg hover:scale-105 transition-transform"
                      style={{ 
                        backgroundColor: posterData.themeColors?.primary || '#0F172A',
                        color: '#FFFFFF'
                      }}
                    >
                      {posterData.ctaText}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Configuration */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel p-6 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-4">
                  <h3 className="font-bold text-[#0F291E] flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-indigo-600" />
                    AI Concept Settings
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Visual Concept (Prompt)</span>
                      <p className="text-xs text-slate-700 bg-[#FAF8F5] p-3 rounded-xl border border-slate-100 mt-1">
                        {posterData.visualConcept}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Image Prompt Base</span>
                      <p className="text-xs text-slate-700 bg-[#FAF8F5] p-3 rounded-xl border border-slate-100 mt-1 line-clamp-3">
                        {posterData.imagePrompt}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Theme Palette</span>
                      <div className="flex gap-2">
                        {Object.entries(posterData.themeColors || {}).map(([key, hex]) => (
                          <div key={key} className="flex-1 flex flex-col items-center gap-1.5">
                            <div 
                              className="w-full aspect-square rounded-xl shadow-inner border border-black/5"
                              style={{ backgroundColor: hex }}
                              title={`${key}: ${hex}`}
                            />
                            <span className="text-[9px] font-mono text-slate-500 uppercase">{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => handleGenerate(true)}
                    className="py-3 glass-panel hover:bg-[#FAF8F5] border border-[#E5E0D8] text-slate-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Variation
                  </button>
                  <button 
                    onClick={() => {
                      addToast('Export to PDF feature is a placeholder.', 'info');
                    }}
                    className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Export Concept (PDF)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


