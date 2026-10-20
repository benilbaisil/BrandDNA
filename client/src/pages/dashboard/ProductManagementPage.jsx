import React from 'react';
import { Package } from 'lucide-react';
import { ProductCatalog } from '../../components/dashboard/ProductCatalog';

export const ProductManagementPage = () => {
  return (
    <div className="space-y-6 text-left selection:bg-[#0F291E] selection:text-white">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-[#E5E0D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0F291E]/10 text-[#0F291E] flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Product Management
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#0F291E] mt-1">Shop Product Catalog</h1>
          <p className="text-xs text-slate-500">Edit, remove, or add new products to the customer shop.</p>
        </div>
      </div>

      <div className="mt-4">
        <ProductCatalog />
      </div>
    </div>
  );
};


