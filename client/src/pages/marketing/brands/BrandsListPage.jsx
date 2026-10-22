import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Sparkles,
  Building2,
  Trash2,
  Edit,
  Eye,
  Layers,
  ArrowRight,
  Package,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { brandService } from '../../../services/brandService';
import { useToast } from '../../../context/ToastContext';

export default function BrandsListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setError(null);
      const res = await brandService.getBrands();
      if (res.success && Array.isArray(res.data.brands)) {
        setBrands(res.data.brands);
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch saved brands');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete brand "${name}"? All associated products under this brand will also be removed.`)) {
      return;
    }
    try {
      const res = await brandService.deleteBrand(id);
      if (res.success) {
        addToast(`Brand "${name}" deleted successfully`, 'success');
        setBrands((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete brand', 'error');
    }
  };

  const filteredBrands = brands.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.brandName && b.brandName.toLowerCase().includes(q)) ||
      (b.industry && b.industry.toLowerCase().includes(q)) ||
      (b.brandIdea && b.brandIdea.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-6 rounded-2xl border border-[#E5E0D8]/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-md uppercase tracking-wider">
                Module 1
              </span>
              <h1 className="text-xl font-extrabold text-[#0F291E] tracking-tight">Brand Management</h1>
            </div>
            <p className="text-xs text-slate-500">
              Create, view, and manage AI-generated brand identities stored in MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/marketing/brands/create"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Brand</span>
            </Link>
          </div>
        </div>

        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brands by name, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs glass-panel border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Saved Brands: <strong className="text-[#0F291E]">{brands.length}</strong>
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 text-xs">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold mb-2">{error}</p>
            <button
              onClick={fetchBrands}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredBrands.length === 0 ? (
          /* Empty State - STRICT NO STATIC DATA */
          <div className="py-20 glass-panel border border-dashed border-[#E5E0D8] rounded-2xl text-center flex flex-col items-center justify-center p-6 shadow-xs">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#0F291E]/90 mb-1">
              {searchQuery ? 'No matching brands found' : 'No brands created yet.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              {searchQuery
                ? `No brands match your search query "${searchQuery}".`
                : 'Start by creating your first brand with Gemini AI assistance.'}
            </p>
            {!searchQuery && (
              <Link
                to="/marketing/brands/create"
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Brand</span>
              </Link>
            )}
          </div>
        ) : (
          /* Brands Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand._id}
                className="glass-panel border border-[#E5E0D8]/80 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {brand.brandName ? brand.brandName[0].toUpperCase() : 'B'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#0F291E] group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {brand.brandName}
                        </h3>
                        {brand.industry && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {brand.industry}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {brand.tagline && (
                    <p className="text-xs italic text-slate-600 mb-3 bg-[#FAF8F5] p-2.5 rounded-xl border border-slate-100">
                      "{brand.tagline}"
                    </p>
                  )}

                  {brand.businessDescription && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {brand.businessDescription}
                    </p>
                  )}

                  {/* Color palette preview */}
                  {Array.isArray(brand.colorPalette) && brand.colorPalette.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Colors:</span>
                      {brand.colorPalette.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-[#E5E0D8]"
                          style={{ backgroundColor: c.hex || '#6366f1' }}
                          title={`${c.name || 'Color'}: ${c.hex}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-600 font-medium">
                    <Package className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{brand.productCount || 0} Products</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(brand._id, brand.brandName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/marketing/brands/${brand._id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>View Brand</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


