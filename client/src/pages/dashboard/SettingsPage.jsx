import React, { useState } from 'react';
import {
  Settings,
  Key,
  CreditCard,
  Check,
  Copy,
  Bot
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const SettingsPage = () => {
  const { addToast } = useToast();

  const [activeModel, setActiveModel] = useState(() => {
    return localStorage.getItem('branddna_user_ai_model') || 'branddna-v4';
  });

  const [apiKey] = useState('bd_sk_live_99f482a17b03c8b4e');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSelectModel = (modelId, modelName) => {
    setActiveModel(modelId);
    localStorage.setItem('branddna_user_ai_model', modelId);
    addToast(`Default AI Engine updated to ${modelName}`, 'success');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    addToast('Developer API Key copied to clipboard', 'info');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
          System & Workspace Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Settings & AI Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure active neural models, team access permissions, API keys, and enterprise billing.
        </p>
      </div>

      {/* AI Engine Model Selector */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <span>Active AI Strategy Engine</span>
        </h3>
        <p className="text-xs text-slate-500">Select the neural model for brand generation & legal scanning.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[
            {
              id: 'branddna-v4',
              name: 'BrandDNA-V4 Enterprise',
              speed: 'Ultra Fast (120ms)',
              desc: 'Custom trained on 14M USPTO records & 500k top startup brand decks.',
            },
            {
              id: 'gpt-4o',
              name: 'OpenAI GPT-4o Enterprise',
              speed: 'High Reasoning (450ms)',
              desc: 'Standard multi-modal model for creative marketing copy.',
            },
            {
              id: 'claude-3-5',
              name: 'Claude 3.5 Sonnet',
              speed: 'Deep Nuance (380ms)',
              desc: 'Optimized for long-form legal documents & contract strategy.',
            }
          ].map((model) => (
            <div
              key={model.id}
              onClick={() => handleSelectModel(model.id, model.name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all select-none flex flex-col justify-between ${
                activeModel === model.id
                  ? 'bg-blue-50/50 border-blue-600 text-slate-900 shadow-sm font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{model.name}</h4>
                  {activeModel === model.id && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <span className="text-[10px] font-mono text-blue-600 font-bold block">{model.speed}</span>
                <p className="text-[11px] leading-relaxed text-slate-500 font-normal">{model.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Key Manager */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <span>Developer API Keys</span>
        </h3>
        <p className="text-xs text-slate-500">Use this token to query BrandDNA AI programmatically in your applications.</p>

        <div className="flex items-center gap-2 max-w-xl">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 rounded-xl px-3.5 py-2.5 outline-none"
          />
          <button
            onClick={handleCopyKey}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            {copiedKey ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{copiedKey ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Usage & Billing */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Usage & Billing Tier</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-mono font-bold">
            Enterprise Tier ($99/mo)
          </span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">USPTO Legal Scans Used</span>
              <span className="font-mono text-slate-500">1,420 / Unlimited</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-emerald-600 w-1/4 rounded-full" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">Brand DNA Generative AI Credits</span>
              <span className="font-mono text-slate-500">8,500 / 10,000</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-blue-600 w-4/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
