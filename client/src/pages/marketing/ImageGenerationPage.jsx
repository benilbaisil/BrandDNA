import React, { useState, useEffect } from 'react';
import { Wand2, Image as ImageIcon, Loader2, Package, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { businessService } from '../../services/businessService';

const ImageGenerationPage = () => {
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [promptUsed, setPromptUsed] = useState('');

  const selectedProduct = products.find(p => p._id === productId);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await businessService.getProducts();
        if (response.success) {
          setProducts(response.data.products || []);
        } else {
          setProducts(response.products || response.data || []); 
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    setImage(null);
    setPromptUsed('');

    try {
      const response = await api.post('/marketing/generate-image-from-product', { productId });
      if (response.data.success) {
        setImage(response.data.data.image);
        setPromptUsed(response.data.data.prompt);
      } else {
        setError(response.data.message || 'Failed to generate image');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-[calc(100vh-100px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Wand2 className="w-8 h-8 text-indigo-400" />
          </div>
          AI Image Generator
        </h1>
        <p className="text-slate-400 mt-3 text-lg">
          Select a product from your store below. Our AI will automatically analyze its details, craft a professional studio photography prompt, and generate a premium advertising image.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B192C] rounded-2xl p-6 border border-[#1E3E62]/60 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              Source Product
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Select Product</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-slate-500" />
                  </div>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3.5 bg-[#040912] border border-[#1E3E62]/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="" disabled>-- Select a product --</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name || product.productName || 'Unnamed Product'}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Choose a product from your inventory/store to generate a marketing image.
                </p>
                {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="mt-4 p-3 bg-[#040912] rounded-xl border border-[#1E3E62]/40 flex items-center gap-4">
                    <img src={selectedProduct.images[0]} alt="Product Preview" className="w-16 h-16 object-cover rounded-lg border border-[#1E3E62]/60" />
                    <div>
                      <p className="text-sm font-semibold text-white">Reference Image</p>
                      <p className="text-xs text-slate-400">This exact image will be used by the AI model.</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !productId || products.length === 0}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Advertising Image
                  </>
                )}
                <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></div>
              </button>
            </form>
          </div>

          {promptUsed && (
            <div className="bg-[#0B192C] rounded-2xl p-6 border border-[#1E3E62]/60 shadow-xl">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-400" />
                AI Generated Prompt
              </h3>
              <div className="p-4 bg-[#040912] rounded-xl border border-[#1E3E62]/40 text-sm text-slate-300 italic leading-relaxed">
                "{promptUsed}"
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-7">
          <div className="bg-[#0B192C] rounded-2xl border border-[#1E3E62]/60 shadow-xl h-full min-h-[400px] flex flex-col relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B192C]/80 backdrop-blur-sm z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 animate-spin border-t-indigo-500"></div>
                  <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <p className="mt-4 font-medium text-indigo-300 animate-pulse">Analyzing Product & Generating Image...</p>
                <p className="mt-2 text-xs text-slate-400 max-w-xs text-center">
                  This takes about 10-20 seconds. We are reading the product details, crafting a studio photography prompt, and generating a high-res image.
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Generation Failed</h3>
                <p className="text-slate-400">{error}</p>
              </div>
            ) : image ? (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex-1 bg-[#040912] rounded-xl border border-[#1E3E62]/40 overflow-hidden flex items-center justify-center group relative">
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt="AI Generated Product"
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Download Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={`data:image/jpeg;base64,${image}`}
                      download={`generated-product-${Date.now()}.jpg`}
                      className="px-6 py-3 bg-white text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                    >
                      Download Image
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[#1E3E62]/40 rounded-xl m-6">
                <div className="w-20 h-20 bg-[#1E3E62]/20 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No Image Generated Yet</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Select a product on the left and click Generate to see the AI magic. The resulting image will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationPage;
