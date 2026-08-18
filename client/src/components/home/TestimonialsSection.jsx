import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '../ui/Card';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Alex Vance',
      startup: 'Founder, Synthetix Labs',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      review:
        'BrandDNA AI saved us 3 weeks of back-and-forth with expensive agencies. The product positioning and persona insights were spot on for our YC pitch.',
      rating: 5,
    },
    {
      name: 'Sarah Lin',
      startup: 'Head of Growth, Novaflow',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      review:
        'The legal trademark advisory feature gave us peace of mind before launching globally. Incredible speed and Apple-level polish.',
      rating: 5,
    },
    {
      name: 'Marcus Thorne',
      startup: 'CEO, Horizon Robotics',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      review:
        'We generated our entire marketing plan and buyer personas in under 10 minutes. This is an essential tool for any serious startup founder.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-slate-50/70 border-t border-slate-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Loved By Founders
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Builders Moving at High Velocity
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Here is what startup founders and product strategists say about BrandDNA AI.
          </p>
        </div>

        {/* 3 Clean Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <Card key={index} hoverEffect className="flex flex-col justify-between text-left">
              <div>
                {/* Star Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  "{t.review}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{t.startup}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
