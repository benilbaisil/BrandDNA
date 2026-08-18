import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Cpu,
  Sparkles,
  Layers,
  Send,
  Download
} from 'lucide-react';

export const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Startup Profile',
      description: 'Enter basic details about your vision, industry domain, core product offering, and target market.',
      icon: Building2,
    },
    {
      number: '02',
      title: 'AI Understands Your Business',
      description: 'Our specialized intelligence models analyze global market data, competitors, and positioning gaps.',
      icon: Cpu,
    },
    {
      number: '03',
      title: 'Generate Brand Identity',
      description: 'Receive tailored brand name candidates, taglines, mission statements, and visual identity guidelines.',
      icon: Sparkles,
    },
    {
      number: '04',
      title: 'Build Product Strategy',
      description: 'Unlock structured feature roadmaps, value propositions, pricing tiers, and competitive differentiators.',
      icon: Layers,
    },
    {
      number: '05',
      title: 'Generate Marketing Plan',
      description: 'Get actionable multi-channel acquisition funnels, social content calendars, and email launch copy.',
      icon: Send,
    },
    {
      number: '06',
      title: 'Download Report',
      description: 'Export an investor-ready PDF brand blueprint and complete strategy report in one click.',
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50/70 border-y border-slate-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Simple 6-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How BrandDNA AI Works
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            From raw concept to launch-ready brand strategy in 6 simple, automated steps.
          </p>
        </div>

        {/* 6 Connected Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 card-shadow relative flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 tracking-tighter">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Bottom step status pill */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Step {step.number} of 06</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
