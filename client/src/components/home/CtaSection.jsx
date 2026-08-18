import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, PhoneCall } from 'lucide-react';
import { Button } from '../ui/Button';

export const CtaSection = () => {
  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-blue-50/80 to-slate-50 border border-blue-100 rounded-3xl p-8 sm:p-14 text-center max-w-5xl mx-auto shadow-sm relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant AI Brand Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Start Building Your Brand Today
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Join thousands of founders, marketers, and strategists using AI to launch category-defining brands in record time.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="shadow-lg shadow-blue-500/25">
                  Get Started Free
                </Button>
              </Link>
              <a href="#contact">
                <Button variant="outline" size="lg" icon={PhoneCall}>
                  Contact Sales
                </Button>
              </a>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              No credit card required • Free plan available • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
