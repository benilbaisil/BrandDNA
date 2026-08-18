import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Building2, Edit3, CheckCircle2, Globe } from 'lucide-react';

export const StartupCard = ({ startup }) => {
  const data = startup || {
    companyName: 'AuraCraft AI',
    industry: 'Digital Health & AI Diagnostics',
    businessGoal: 'Scale ARR to $1M & Launch Global Campaign',
    targetAudience: 'Busy Founders, Executives & Tech Professionals',
    status: 'Verified Profile',
  };

  return (
    <Card hoverEffect className="text-left border-slate-200/90 flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{data.companyName}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{data.industry}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {data.status || 'Active Profile'}
          </span>
        </div>

        {/* Startup Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Business Goal</span>
            <p className="font-semibold text-slate-800 line-clamp-2">{data.businessGoal || data.businessGoals}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Target Audience</span>
            <p className="font-semibold text-slate-800 line-clamp-2">{data.targetAudience}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile CTA */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
        <Link to="/startup-profile">
          <Button variant="outline" size="sm" icon={Edit3}>
            Edit Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
};
