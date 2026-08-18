import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const StrategyCard = () => {
  const { addToast } = useToast();

  const strategy = {
    productName: 'AuraCraft AI Suite v2',
    usp: 'Instant AI Brand Identity + Legal Trademark Advisory in 3 minutes.',
    positioning: 'Category Leader for High-Velocity Founders & Product Managers',
    pricing: 'Freemium ($0 Free / $49 Pro Monthly / $499 Enterprise Annual)',
  };

  return (
    <Card hoverEffect className="text-left border-slate-200/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Product Strategy Preview</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Value Proposition & Monetization</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Product Name & USP</span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{strategy.productName}</h4>
          <p className="text-slate-600 mt-1 font-normal">{strategy.usp}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Product Positioning</span>
            <p className="font-semibold text-slate-800 mt-1 leading-snug">{strategy.positioning}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Pricing Strategy</span>
            <p className="font-semibold text-slate-800 mt-1 leading-snug">{strategy.pricing}</p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => addToast('Opening full product strategy report...', 'info')}
        >
          View Full Strategy
        </Button>
      </div>
    </Card>
  );
};
