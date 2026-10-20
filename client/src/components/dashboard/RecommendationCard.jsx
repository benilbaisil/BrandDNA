import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, Lightbulb, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const RecommendationCard = () => {
  const { addToast } = useToast();

  const recommendations = [
    { id: 1, title: 'Improve your tagline', action: 'Optimize Tagline', tag: 'High Impact', icon: Lightbulb, color: 'text-amber-600 bg-amber-50' },
    { id: 2, title: 'Complete your customer persona', action: 'Add Pain Points', tag: 'Recommended', icon: Sparkles, color: 'text-blue-600 bg-blue-50' },
    { id: 3, title: 'Generate a marketing report', action: 'Export PDF Brief', tag: 'Strategy', icon: ShieldAlert, color: 'text-indigo-600 bg-indigo-50' },
    { id: 4, title: 'Your profile is 85% complete', action: 'Complete Profile', tag: '85% Score', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">AI Recommendations</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Automated Optimization Suggestions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <div key={rec.id} className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8]/60 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${rec.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-[#0F291E] leading-tight">{rec.title}</h4>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 glass-panel border border-[#E5E0D8] px-2 py-0.5 rounded">
                  {rec.tag}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E5E0D8]/60 flex justify-end">
                <button
                  onClick={() => addToast(`Executing AI recommendation: ${rec.action}`, 'info')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>{rec.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

