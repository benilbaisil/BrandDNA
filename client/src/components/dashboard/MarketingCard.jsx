import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Megaphone, RefreshCw, BarChart3, DollarSign, Share2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const MarketingCard = () => {
  const { addToast } = useToast();

  const plan = {
    strategy: 'Thought Leadership Series + Product Hunt Launch Blitz',
    topPlatforms: 'LinkedIn, Twitter/X, YouTube Shorts, Dev.to',
    campaignIdeas: '"3-Minute Brand Challenge" Live Interactive Demos & Founder Case Studies',
    seoScore: '94/100 (Optimized)',
    monthlyBudget: '$1,500 - $3,000 / mo (Organic Focus)',
  };

  return (
    <Card hoverEffect className="text-left border-slate-200/90 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">AI Marketing Planner</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">GTM Strategy & Campaigns</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          onClick={() => addToast('Regenerating AI marketing campaign ideas...', 'info')}
        >
          Generate Again
        </Button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 sm:col-span-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Primary Marketing Strategy</span>
          <p className="font-bold text-slate-900 mt-1">{plan.strategy}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Top Social Platforms</span>
          <p className="font-semibold text-slate-800 mt-1">{plan.topPlatforms}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">SEO Score & Budget</span>
          <p className="font-semibold text-slate-800 mt-1">SEO: {plan.seoScore}</p>
          <p className="text-slate-600 font-medium">{plan.monthlyBudget}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 sm:col-span-2">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Viral Campaign Ideas</span>
          <p className="text-slate-700 mt-1 font-medium">{plan.campaignIdeas}</p>
        </div>
      </div>
    </Card>
  );
};
