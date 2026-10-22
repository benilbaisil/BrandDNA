import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Package,
  Building2,
  Trash2,
  Edit,
  Eye,
  ArrowRight,
  Filter,
  RefreshCw,
  AlertCircle,
  Tag
} from 'lucide-react';
import { marketingProductService } from '../../../services/marketingProductService';
import { brandService } from '../../../services/brandService';
import { useToast } from '../../../context/ToastContext';

export default function ProductsListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setError(null);
      
      const [prodRes, brandRes] = await Promise.all([
        marketingProductService.getProducts(),
        brandService.getBrands(),
      ]);

      if (prodRes.success && Array.isArray(prodRes.data.products)) {
        setProducts(prodRes.data.products);
      } else {
        setProducts([]);
      }

      if (brandRes.success && Array.isArray(brandRes.data.brands)) {
        setBrands(brandRes.data.brands);
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      return;
    }
    try {
      const res = await marketingProductService.deleteProduct(id);
      if (res.success) {
        addToast(`Product "${name}" deleted`, 'success');
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesBrand = selectedBrandFilter ? p.brand?._id === selectedBrandFilter : true;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (p.productName && p.productName.toLowerCase().includes(q)) ||
      (p.productIdea && p.productIdea.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));
    return matchesBrand && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-6 rounded-2xl border border-[#E5E0D8]/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-md uppercase tracking-wider">
                Module 2
              </span>
              <h1 className="text-xl font-extrabold text-[#0F291E] tracking-tight">Product Strategy & Marketing</h1>
            </div>
            <p className="text-xs text-slate-500">
              Manage AI product strategies, pricing recommendations, customer personas, and campaigns linked to your brands.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/marketing/products/create"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product</span>
            </Link>
          </div>
        </div>

        {/* Search & Brand Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs glass-panel border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Brand Filter Dropdown */}
            <div className="relative w-full sm:w-64">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedBrandFilter}
                onChange={(e) => setSelectedBrandFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs glass-panel border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium text-slate-700"
              >
                <option value="">All Brands ({brands.length})</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.brandName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Saved Products: <strong className="text-[#0F291E]">{products.length}</strong>
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 text-xs">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold mb-2">{error}</p>
            <button
              onClick={fetchInitialData}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State - STRICT NO STATIC DATA */
          <div className="py-20 glass-panel border border-dashed border-[#E5E0D8] rounded-2xl text-center flex flex-col items-center justify-center p-6 shadow-xs">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#0F291E]/90 mb-1">
              {searchQuery || selectedBrandFilter ? 'No matching products found' : 'No products created yet.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              {searchQuery || selectedBrandFilter
                ? 'Try adjusting your filters or search terms.'
                : 'Associate products under your saved brands and generate full AI strategy & marketing playbooks.'}
            </p>
            {!searchQuery && !selectedBrandFilter && (
              <Link
                to="/marketing/products/create"
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Product</span>
              </Link>
            )}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod._id}
                className="glass-panel border border-[#E5E0D8]/80 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {prod.brand?.brandName || 'Brand'}
                        </span>
                        {prod.category && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md">
                            {prod.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#0F291E] group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {prod.productName}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 bg-[#FAF8F5] p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                    "{prod.productIdea}"
                  </p>

                  {prod.pricingSuggestion?.suggestedPriceRange && (
                    <div className="flex items-center justify-between text-xs bg-[#FAF8F5]merald-50/60 p-2 rounded-lg border border-emerald-100 mb-3">
                      <span className="text-[10px] font-bold uppercase text-emerald-700">AI Suggested Price</span>
                      <span className="font-extrabold text-[#0F291E]">{prod.pricingSuggestion.suggestedPriceRange}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(prod.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteProduct(prod._id, prod.productName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/marketing/products/${prod._id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>View Strategy</span>
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


