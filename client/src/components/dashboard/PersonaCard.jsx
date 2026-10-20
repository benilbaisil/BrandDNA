import React from 'react';
import { Card } from '../ui/Card';
import { Users, Target, UserCheck, Heart, ShoppingBag, Share2 } from 'lucide-react';

export const PersonaCard = () => {
  const persona = {
    name: 'Tech Founder Alex',
    ageGroup: '28 - 42 Years Old',
    occupation: 'Startup Founder & Product Leader',
    painPoints: 'Slow branding agency turnaround times, high agency costs, legal trademark uncertainty.',
    interests: 'AI tools, SaaS scalability, venture fundraising, rapid MVP iteration.',
    buyingBehaviour: 'High willingness to pay for software that saves engineering/founder time.',
    preferredPlatform: 'LinkedIn, Twitter/X, GitHub, Product Hunt',
  };

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">Customer Persona Profile</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Primary Target Archetype</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
          Archetype Match: 98%
        </span>
      </div>

      {/* Persona Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age Group & Occupation</span>
          <p className="font-bold text-[#0F291E] mt-1">{persona.name} ({persona.ageGroup})</p>
          <p className="text-slate-600 font-medium mt-0.5">{persona.occupation}</p>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]/60">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Key Pain Points</span>
          <p className="text-slate-700 mt-1 leading-snug">{persona.painPoints}</p>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]/60">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Buying Behaviour</span>
          <p className="text-slate-700 mt-1 leading-snug">{persona.buyingBehaviour}</p>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]/60">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Preferred Platforms</span>
          <p className="font-semibold text-[#0F291E]/90 mt-1">{persona.preferredPlatform}</p>
        </div>
      </div>
    </Card>
  );
};

