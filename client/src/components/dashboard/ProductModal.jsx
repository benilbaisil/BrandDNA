import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Plus } from 'lucide-react';
import { businessService } from '../../services/businessService';
import { useToast } from '../../context/ToastContext';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import { getDefaultSizesForCategory } from '../../constants/sizes';

const PRESET_PRODUCT_IMAGES = [
  { name: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop' },
  { name: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop' },
  { name: 'Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
  { name: 'Linen Shirt', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop' },
  { name: 'Beauty Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop' },
  { name: 'Espresso Maker', url: 'https://images.unsplash.com/photo-1517668808822-9eaa03afd2af?q=80&w=600&auto=format&fit=crop' },
  { name: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop' },
  { name: 'Wireless Mouse', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop' },
];

export const ProductModal = ({ isOpen, onClose, editingProduct = null, onSuccess }) => {
  const { addToast } = useToast();
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    categoryName: '',
    brand: '',
    price: '',
    discountPrice: '',
    stock: '10',
    status: 'Active',
    image: '',
    sizes: ['S', 'M', 'L', 'XL'],
    description: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        categoryName: editingProduct.categoryName || editingProduct.category?.name || '',
        brand: editingProduct.brand || '',
        price: editingProduct.price || '',
        discountPrice: editingProduct.discountPrice || '',
        stock: editingProduct.stock ?? 0,
        status: editingProduct.status || 'Active',
        image: editingProduct.images?.[0] || '',
        sizes: editingProduct.sizes && editingProduct.sizes.length > 0
          ? editingProduct.sizes
          : getDefaultSizesForCategory(editingProduct.categoryName || editingProduct.category?.name || ''),
        description: editingProduct.description || '',
      });
    } else {
      setProductForm({
        name: '',
        sku: '',
        categoryName: '',
        brand: '',
        price: '',
        discountPrice: '',
        stock: '10',
        status: 'Active',
        image: '',
        sizes: ['S', 'M', 'L', 'XL'],
        description: '',
      });
    }
    setNewSizeInput('');
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be under 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setProductForm((prev) => ({ ...prev, image: event.target.result }));
      addToast('Local product image loaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSize = (sizeToRemove) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).filter((s) => s !== sizeToRemove),
    }));
  };

  const handleAddCustomSize = () => {
    const trimmed = newSizeInput.trim();
    if (!trimmed) return;
    if ((productForm.sizes || []).includes(trimmed)) {
      addToast(`Size '${trimmed}' already added`, 'info');
      setNewSizeInput('');
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      sizes: [...(prev.sizes || []), trimmed],
    }));
    setNewSizeInput('');
    addToast(`Added size: ${trimmed}`, 'success');
  };

  const handleApplyPresetSizes = (presetSizes, label) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: presetSizes,
    }));
    addToast(`Applied ${label} sizes`, 'info');
  };

  const handleSaveProductForm = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      addToast('Please fill in Product Name and Price.', 'error');
      return;
    }
    if (!productForm.categoryName || !productForm.categoryName.trim()) {
      addToast('Please select a Category before adding the product.', 'error');
      return;
    }

    setSubmittingProduct(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        categoryName: productForm.categoryName.trim(),
        brand: productForm.brand.trim(),
        price: Number(productForm.price),
        discountPrice: Number(productForm.discountPrice || 0),
        stock: Number(productForm.stock || 0),
        status: productForm.status,
        images: productForm.image ? [productForm.image.trim()] : undefined,
        sizes: productForm.sizes && productForm.sizes.length > 0
          ? productForm.sizes
          : getDefaultSizesForCategory(productForm.categoryName),
        description: productForm.description.trim(),
      };

      let res;
      if (editingProduct) {
        res = await businessService.updateProduct(editingProduct._id, payload);
      } else {
        res = await businessService.createProduct(payload);
      }

      if (res?.success) {
        addToast(
          editingProduct
            ? `Product '${productForm.name}' updated successfully!`
            : `Product '${productForm.name}' added to MongoDB & Customer Shop!`,
          'success'
        );
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product to database', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F291E]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#E5E0D8] max-w-xl w-full shadow-2xl space-y-5 text-left my-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-serif text-xl font-bold text-[#0F291E]">
            {editingProduct ? 'Edit Product Details' : 'Add New Product to Shop'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="e.g. Wireless Ergonomic Mouse"
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none focus:border-[#0F382C] font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">SKU (Auto-generated if empty)</label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="e.g. MOUSE-ERG-01"
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none focus:border-[#0F382C] font-medium font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category <span className="text-rose-500">*</span></label>
              <select
                required
                value={productForm.categoryName}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setProductForm((prev) => ({
                    ...prev,
                    categoryName: newCat,
                    sizes: !editingProduct ? getDefaultSizesForCategory(newCat) : (prev.sizes?.length ? prev.sizes : getDefaultSizesForCategory(newCat)),
                  }));
                }}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none focus:border-[#0F382C] font-medium cursor-pointer"
              >
                <option value="" disabled>Select a Category...</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={productForm.brand}
                onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                placeholder="e.g. NovaTech"
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none focus:border-[#0F382C] font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="e.g. 1299"
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none focus:border-[#0F382C] font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Original / Strikethrough Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={productForm.discountPrice}
                onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                placeholder="e.g. 1599"
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none focus:border-[#0F382C] font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                placeholder="e.g. 25"
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none focus:border-[#0F382C] font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={productForm.status}
                onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none font-medium cursor-pointer"
              >
                <option value="Active">Active (Visible in Shop)</option>
                <option value="Inactive">Inactive (Hidden from Shop)</option>
              </select>
            </div>
          </div>

          {/* SIZES MANAGEMENT SECTION */}
          <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E5E0D8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="block font-bold text-[#0F291E]/90 text-xs flex items-center gap-1.5">
                <span>Available Product Sizes / Options</span>
                <span className="text-[10px] font-normal text-slate-500">({productForm.sizes?.length || 0} active)</span>
              </label>
              <div className="flex items-center gap-1 text-[10px] flex-wrap">
                <span className="text-slate-400 font-semibold mr-0.5">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPresetSizes(['XS', 'S', 'M', 'L', 'XL', '2XL'], 'Apparel')}
                  className="px-2 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold cursor-pointer"
                >
                  Apparel
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetSizes(['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'], 'Shoes')}
                  className="px-2 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold cursor-pointer"
                >
                  Shoes
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetSizes(['Small (20L)', 'Medium (35L)', 'Large (50L)'], 'Bags')}
                  className="px-2 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold cursor-pointer"
                >
                  Bags
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetSizes(['250g', '500g', '1kg', '2kg'], 'Nutrition')}
                  className="px-2 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold cursor-pointer"
                >
                  Weight
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetSizes(['One Size', 'Regular'], 'Standard')}
                  className="px-2 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold cursor-pointer"
                >
                  Standard
                </button>
              </div>
            </div>

            {/* Selected Size Pills */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[30px] pt-1">
              {productForm.sizes && productForm.sizes.length > 0 ? (
                productForm.sizes.map((sz, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F291E] text-white font-mono text-[11px] font-bold shadow-2xs"
                  >
                    <span>{sz}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(sz)}
                      className="hover:text-rose-300 transition-colors ml-0.5 p-0.5 cursor-pointer"
                      title={`Remove size ${sz}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 italic">No sizes added. Click a preset above or add custom size below.</span>
              )}
            </div>

            {/* Custom Size Input */}
            <div className="flex items-center gap-2 pt-1.5 border-t border-[#E5E0D8]/70">
              <input
                type="text"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSize();
                  }
                }}
                placeholder="Type custom size (e.g. UK 10.5, 3XL, 750ml) and press Enter"
                className="flex-1 bg-white border border-[#E5E0D8] rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-[#0F382C] font-medium"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 bg-[#0F291E] hover:bg-[#09271E] text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
          <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E5E0D8]">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-[#0F291E]/90 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#0F291E]" /> Product Image <span className="text-rose-500">*</span>
              </label>
              <label className="text-[11px] font-bold text-[#0F291E] hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-20 h-20 rounded-xl glass-panel border border-stone-300 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                {productForm.image ? (
                  <img
                    src={productForm.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=200&auto=format&fit=crop'; }}
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-0.5 opacity-60" />
                    <span className="text-[9px] block">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="Paste image URL (https://...)"
                  className="w-full glass-panel border border-[#E5E0D8] rounded-xl p-2 text-xs outline-none focus:border-[#0F382C] font-medium"
                />
                {productForm.image && (
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, image: '' })}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
            <div className="pt-2 border-t border-[#E5E0D8]/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">Quick 1-Click Sample Images:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setProductForm({ ...productForm, image: preset.url });
                      addToast(`Attached sample image: ${preset.name}`, 'info');
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all shrink-0 cursor-pointer ${
                      productForm.image === preset.url
                        ? 'bg-[#0F291E] text-white border-[#0F382C]'
                        : 'glass-panel text-slate-700 border-[#E5E0D8] hover:border-[#0F382C]'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-3.5 h-3.5 rounded object-cover" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Enter product features, specifications, and details..."
              className="w-full bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-2.5 outline-none focus:border-[#0F382C] font-medium resize-none"
            ></textarea>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingProduct}
              className="px-5 py-2.5 bg-[#0F291E] hover:bg-[#09271E] text-white font-bold rounded-xl cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{submittingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Shop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

