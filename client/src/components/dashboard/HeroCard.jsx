import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const HeroCard = ({ onCreateProject, onContinueProject }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden text-left">
      {/* Background Glow Accents */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-medium border border-white/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Brand Intelligence Workspace</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
          Welcome back!
        </h2>

        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl">
          Continue building your startup's brand with AI-powered insights, product positioning, and legal advisory tools.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={PlusCircle}
            onClick={onCreateProject}
            className="bg-white text-blue-700 hover:bg-slate-100 border-none font-semibold shadow-md"
          >
            Create New Project
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
            onClick={onContinueProject}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium"
          >
            Continue Project
          </Button>
        </div>
      </div>
    </div>
  );
};
