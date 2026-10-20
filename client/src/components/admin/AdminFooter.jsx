import React from 'react';

export const AdminFooter = () => {
  return (
    <footer className="mt-12 pt-6 border-t border-[#E5E0D8]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-700">BrandDNA AI</span>
        <span>• Admin Control Center</span>
        <span>• Version 2.4.0</span>
      </div>

      <div className="flex items-center gap-6">
        <a href="#support" className="hover:text-slate-600 transition-colors">Admin Support</a>
        <a href="#docs" className="hover:text-slate-600 transition-colors">System Documentation</a>
      </div>
    </footer>
  );
};

