import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { brandService } from '../../services/brandService';

export const BrandCard = () => {
  const { addToast } = useToast();
  const [copiedField, setCopiedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState({
    name: '',
    tagline: '',
    personality: '',
    mission: '',
    vision: '',
  });

  const fetchBrand = async () => {
    try {
      const res = await brandService.getIdentity();
      if (res && res.success && res.data?.brand) {
        const b = res.data.brand;
        setBrandData({
          name: b.brandName || '',
          tagline: b.tagline || '',
          personality: b.personality || '',
          mission: b.mission || '',
          vision: b.vision || '',
        });
      }
    } catch (err) {
      // Keep default state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  const handleCopy = (field, text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    addToast(`${field} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegenerate = async (field) => {
    try {
      addToast(`Regenerating AI ${field} with MongoDB Atlas...`, 'info');
      const res = await brandService.generateBrand({
        tagline: 'Empowering High-Velocity Teams with Autonomous AI Intelligence.',
      });
      if (res && res.success && res.data) {
        setBrandData((prev) => ({
          ...prev,
          tagline: res.data.tagline || prev.tagline,
        }));
        addToast('AI Brand Identity updated and saved to database!', 'success');
      }
    } catch (err) {
      addToast('Regeneration failed', 'error');
    }
  };

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">AI Brand Identity Preview</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Live MongoDB Atlas Database Asset</p>
          </div>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
          MongoDB Connected
        </span>
      </div>

      {/* Brand Elements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Brand Name & Tagline */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Brand Name & Tagline</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleCopy('Tagline', brandData.tagline)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                  title="Copy Tagline"
                >
                  {copiedField === 'Tagline' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleRegenerate('Tagline')}
                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-200/60"
                  title="Regenerate"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className="text-lg font-extrabold text-[#0F291E]">{brandData.name}</h4>
            <p className="text-xs italic text-slate-600 mt-1">"{brandData.tagline}"</p>
          </div>
        </div>

        {/* Brand Personality */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Brand Personality</span>
              <button
                onClick={() => handleCopy('Personality', brandData.personality)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                {copiedField === 'Personality' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="font-semibold text-[#0F291E]/90 leading-relaxed mt-1">{brandData.personality}</p>
          </div>
        </div>

        {/* Mission */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Mission Statement</span>
              <button
                onClick={() => handleCopy('Mission', brandData.mission)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                {copiedField === 'Mission' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-slate-700 leading-relaxed mt-1 font-normal">{brandData.mission}</p>
          </div>
        </div>

        {/* Vision */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Vision Statement</span>
              <button
                onClick={() => handleCopy('Vision', brandData.vision)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                {copiedField === 'Vision' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-slate-700 leading-relaxed mt-1 font-normal">{brandData.vision}</p>
          </div>
        </div>

      </div>
    </Card>
  );
};

