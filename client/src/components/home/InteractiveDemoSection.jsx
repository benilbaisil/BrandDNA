import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Copy, RefreshCw, Dna } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useToast } from '../../context/ToastContext';

export const InteractiveDemoSection = () => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: 'Luminary Health',
    industry: 'Digital Wellness & AI Diagnostics',
    audience: 'Busy Tech Professionals & Executives',
    offer: 'Personalized AI health coaching based on biometric tracking',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      addToast('Brand DNA generated successfully!', 'success');
    }, 1000);
  };

  const handleCopy = () => {
    setCopied(true);
    addToast('Brand blueprint copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Interactive Playground
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Try BrandDNA AI Live Right Now
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Fill in your startup details on the left and see how our AI instantly shapes your brand identity and strategic positioning.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Startup Profile Form */}
          <div className="lg:col-span-5 text-left">
            <Card className="border-slate-200/90 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Startup Profile Setup</h3>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <Input
                  label="Startup Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Luminary Health"
                  required
                />
                
                <Input
                  label="Industry Domain"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g. AI Diagnostics, SaaS, Fintech"
                  required
                />

                <Input
                  label="Target Audience"
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  placeholder="e.g. High-performing founders & teams"
                  required
                />

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-700">
                    Core Offer & Solution <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="offer"
                    rows="3"
                    value={formData.offer}
                    onChange={handleInputChange}
                    className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 px-3.5 py-2.5 outline-none transition-all"
                    placeholder="Describe what your product does..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2 shadow-md shadow-blue-500/20"
                  isLoading={isGenerating}
                  icon={isGenerating ? RefreshCw : Sparkles}
                >
                  {isGenerating ? 'Generating Brand DNA...' : 'Generate Brand DNA'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Dynamic AI Output Preview */}
          <div className="lg:col-span-7 text-left">
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white card-shadow relative overflow-hidden min-h-[460px] flex flex-col justify-between">
              
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <Dna className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-blue-400 font-mono font-semibold">AI OUTPUT PREVIEW</span>
                      <h4 className="text-base font-bold text-white leading-tight">
                        {formData.name || 'Your Brand'} Blueprint
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy DNA'}</span>
                  </button>
                </div>

                {/* Output Content */}
                <div className="mt-6 space-y-6">
                  {/* Generated Brand Positioning */}
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Suggested Tagline & Mantra</span>
                    <p className="text-lg font-semibold text-blue-300 mt-1 italic">
                      "{formData.name ? formData.name : 'Brand'} — Elevating {formData.audience || 'your audience'} through intelligent precision."
                    </p>
                  </div>

                  {/* Core Value Pillar Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Primary Archetype</span>
                      <p className="text-sm font-semibold text-white mt-0.5">The Empowering Guide</p>
                      <p className="text-xs text-slate-400 mt-1">Tone: Authoritative, empathetic, highly refined.</p>
                    </div>

                    <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">Strategic Moat</span>
                      <p className="text-sm font-semibold text-white mt-0.5">{formData.industry || 'Market Domain'}</p>
                      <p className="text-xs text-slate-400 mt-1">Solves friction for {formData.audience || 'customers'}.</p>
                    </div>
                  </div>

                  {/* Persona Snapshot */}
                  <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Target Persona Profile</span>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      <strong className="text-white">Ideal Customer:</strong> {formData.audience || 'Target users'}. Seeking high efficiency, seamless integration, and validated results.
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      <strong className="text-white">Core Offer Impact:</strong> {formData.offer || 'Value offering'}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Confidence Score: <strong className="text-emerald-400 font-mono">99.4%</strong></span>
                <span>Powered by BrandDNA Engine</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
