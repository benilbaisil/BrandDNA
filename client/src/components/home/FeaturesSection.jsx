import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Compass,
  Users,
  Megaphone,
  FileCheck2,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '../ui/Card';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Brand Identity Generator',
      description:
        'Instantly craft unforgettable brand names, taglines, archetypes, and cohesive visual DNA tailored to your market niche.',
      badge: 'Brand Core',
    },
    {
      icon: Compass,
      title: 'Product Strategy Generator',
      description:
        'Develop data-backed value propositions, competitive positioning maps, feature roadmaps, and monetization frameworks.',
      badge: 'Strategy',
    },
    {
      icon: Users,
      title: 'Customer Persona Generator',
      description:
        'Identify target demographics, psychological motivators, pain points, and decision triggers with algorithmic precision.',
      badge: 'Audience Insights',
    },
    {
      icon: Megaphone,
      title: 'AI Marketing Planner',
      description:
        'Generate multi-channel launch campaigns, content calendars, copy angles, and GTM execution Playbooks.',
      badge: 'GTM Execution',
    },
    {
      icon: FileCheck2,
      title: 'AI Report Generator',
      description:
        'Export investor-ready PDF brand documentation, pitch deck briefs, and legal compliance summaries automatically.',
      badge: 'PDF Exports',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description:
        'Monitor brand sentiment trends, trademark availability checks, and market saturation scores in real time.',
      badge: 'Real-time Metrics',
    },
  ];

  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Comprehensive Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Architect a Category-Defining Brand
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Eliminate weeks of agency consulting. BrandDNA AI unifies brand strategy, audience intelligence, and legal readiness into one seamless workflow.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card hoverEffect className="h-full flex flex-col justify-between group relative overflow-hidden">
                  <div>
                    {/* Top Icon & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {feature.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2.5 flex items-center justify-between group-hover:text-blue-600 transition-colors">
                      <span>{feature.title}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
