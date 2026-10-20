import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Target,
  Sparkles,
  ArrowRight,
  Trash2,
  DollarSign,
  Package,
  Layers,
  Clock,
  Plus,
  Edit3,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { marketingProductService } from '../../services/marketingProductService';
import { useToast } from '../../context/ToastContext';
import { AdPosterModal } from './AdPosterModal';

export const SavedStrategiesPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedPosterId, setSelectedPosterId] = useState(null);

  useEffect(() => {
    fetchSavedStrategies();
  }, []);

  const fetchSavedStrategies = async () => {
    setLoading(true);
    try {
      const res = await marketingProductService.getProducts();
      if (res?.success && Array.isArray(res?.data?.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching saved strategies:', err);
      addToast(err.response?.data?.message || 'Failed to fetch saved strategies from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this strategy'}" from MongoDB?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await marketingProductService.deleteProduct(id);
      if (res?.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        addToast(`Strategy "${name || 'Item'}" deleted successfully!`, 'success');
      }
    } catch (err) {
      console.error('Error deleting strategy:', err);
      addToast('Failed to delete strategy from MongoDB.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E] p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#E5E0D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0F291E] text-white rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MongoDB Strategy Collection</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F291E] tracking-tight mt-2">
              Saved Product Strategies
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View, manage, load, and edit all AI-generated product strategies saved to MongoDB.
            </p>
          </div>

          <Link
            to="/marketing/product-strategy"
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create New Strategy</span>
          </Link>
        </div>

        {/* Main List */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500 font-mono">Loading saved strategies from MongoDB...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border-2 border-dashed border-[#E5E0D8] space-y-4">
            <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-[#0F291E]">No Product Strategies Saved Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Create a product idea in the Product Strategy module and click 'Save Product Strategy'.</p>
            </div>
            <Link
              to="/marketing/product-strategy"
              className="px-5 py-2.5 bg-[#0F291E] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Open Product Strategy Tool</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((prod) => {
              const priceText = prod.pricingSuggestion?.suggestedPriceRange || 'N/A';
              const formattedDate = new Date(prod.updatedAt || prod.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={prod._id}
                  className="glass-panel p-6 rounded-3xl border border-[#E5E0D8]/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
                          Saved Product Strategy
                        </span>
                        <h3 className="text-lg font-extrabold text-[#0F291E] group-hover:text-indigo-600 transition-colors">
                          {prod.productName || 'Untitled Strategy'}
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-[#E5E0D8] shrink-0">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Product Idea Callout */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Product Idea</span>
                      <p className="text-xs text-slate-700 font-medium line-clamp-2 italic">"{prod.productIdea}"</p>
                    </div>

                    {/* USPs Tags */}
                    {Array.isArray(prod.usps) && prod.usps.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">USPs</span>
                        <div className="flex flex-wrap gap-1.5">
                          {prod.usps.slice(0, 3).map((u, i) => (
                            <span key={i} className="text-[10px] font-semibold text-emerald-800 bg-[#FAF8F5]merald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              {typeof u === 'string' ? u : u.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing & Positioning */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]/80">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Price Range</span>
                        <span className="font-bold text-[#0F291E] text-xs">{priceText}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]/80">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Packaging</span>
                        <span className="font-bold text-[#0F291E] text-xs truncate block">{prod.packaging?.type || 'Standard Box'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleDelete(prod._id, prod.productName)}
                      disabled={deletingId === prod._id}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete from MongoDB"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPosterId(prod._id)}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Ad Poster</span>
                      </button>

                      <button
                        onClick={() => navigate(`/marketing/product-strategy?id=${prod._id}`)}
                        className="px-4 py-2 bg-[#0F291E] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {selectedPosterId && (
        <AdPosterModal 
          productId={selectedPosterId} 
          onClose={() => setSelectedPosterId(null)} 
        />
      )}
    </div>
  );
};

export default SavedStrategiesPage;


