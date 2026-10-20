import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { useToast } from '../../context/ToastContext';
import { ProductModal } from './ProductModal';

export const ProductCatalog = () => {
  const { addToast } = useToast();
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await businessService.getProducts({ status: 'ALL' });
      if (res?.data?.products) {
        setProductsList(res.data.products);
      }
    } catch (err) {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    const handleProductAdded = () => fetchProducts();
    window.addEventListener('product-added-success', handleProductAdded);
    
    const handleOpenAddModal = () => {
      setEditingProduct(null);
      setShowProductModal(true);
    };
    window.addEventListener('open-add-product-modal', handleOpenAddModal);
    
    return () => {
      window.removeEventListener('product-added-success', handleProductAdded);
      window.removeEventListener('open-add-product-modal', handleOpenAddModal);
    };
  }, []);

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to discontinue '${name}'?`)) return;
    try {
      const res = await businessService.deleteProduct(id);
      if (res?.success) {
        addToast(`Product '${name}' discontinued!`, 'success');
        fetchProducts();
      }
    } catch (err) {
      addToast('Failed to discontinue product', 'error');
    }
  };

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-[#E5E0D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, SKU, brand..."
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-3 py-2 pl-8 outline-none focus:border-[#0F382C] font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl px-3 py-2 outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <button
            onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
            className="px-4 py-2 bg-[#0F291E] hover:bg-[#09271E] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-slate-500 font-bold bg-[#FAF8F5]">
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category & Brand</th>
                <th className="p-3.5 text-right">Price</th>
                <th className="p-3.5 text-right">Stock</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {loading ? (
                 <tr>
                 <td colSpan={7} className="p-10 text-center text-slate-400">Loading products...</td>
               </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    No products found matching criteria. Click '+ Add Product' to add one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=200&auto=format&fit=crop'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#E5E0D8] shrink-0"
                      />
                      <div>
                        <span className="font-bold text-[#0F291E] block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{p.description}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 text-[11px] font-bold">{p.sku}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-[#0F291E]/90 block">{p.categoryName || p.category?.name || 'General'}</span>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {p.brand && <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">{p.brand}</span>}
                        {p.sizes && p.sizes.length > 0 && (
                          <span className="text-[9px] font-mono text-slate-500 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                            {p.sizes.slice(0, 3).join(', ')}{p.sizes.length > 3 ? ` +${p.sizes.length - 3}` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-bold text-[#0F291E]">
                      ₹{p.price}
                      {p.discountPrice > 0 && <span className="text-[10px] text-slate-400 line-through block">₹{p.discountPrice}</span>}
                    </td>
                    <td className="p-3.5 text-right font-bold">
                      <span className={p.stock <= 0 ? 'text-rose-600' : p.stock <= 5 ? 'text-amber-600' : 'text-[#0F291E]/90'}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                          className="p-1.5 text-slate-600 hover:text-[#0F291E] hover:bg-stone-100 rounded-lg cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Discontinue Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        editingProduct={editingProduct}
        onSuccess={() => fetchProducts()}
      />
    </div>
  );
};

