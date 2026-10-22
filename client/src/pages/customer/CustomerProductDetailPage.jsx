import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Search,
  Filter,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Tag,
  Lock,
  LogOut,
  User,
  Dna,
  Zap,
  Award,
  ArrowUpRight,
  Check,
  Flame,
  ArrowLeft,
  Heart,
  Menu
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { useAuth, getRoleRedirectPath } from '../../context/AuthContext';
import { Footer } from '../../components/layout/Footer';
import { getDefaultSizesForCategory, SIZE_GUIDE_CHART } from '../../constants/sizes';
import {
  validatePhoneNumber,
  validateStreet,
  validateCity,
  validateState,
  validatePinCode,
} from '../../utils/validation';

export const CustomerProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();

  const [product, setProduct] = useState({
    name: '',
    brand: '',
    categoryName: '',
    description: '',
    price: 0,
    discountPrice: 0,
    images: ['/images/cat_workout_essentials.jpg'],
    sizes: [],
    stock: 1,
    inStock: true,
  });
  const [productNotFound, setProductNotFound] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cart & Checkout State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const paymentMethod = 'razorpay';
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrderModal, setConfirmedOrderModal] = useState(null);
  const [razorpayTestModalData, setRazorpayTestModalData] = useState(null);

  // Shipping address (live customer address input)
  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: user?.phone || '',
  });

  const [addressErrors, setAddressErrors] = useState({});
  const [addressTouched, setAddressTouched] = useState({});

  const validateAddressField = (field, value, currentAddr = address) => {
    let error = null;
    if (field === 'fullName') {
      if (!value || !value.trim()) error = 'Full name is required';
      else if (value.trim().length < 2) error = 'Full name must be at least 2 characters';
    } else if (field === 'street') {
      error = validateStreet(value);
    } else if (field === 'city') {
      error = validateCity(value);
    } else if (field === 'state') {
      error = validateState(value);
    } else if (field === 'zipCode') {
      error = validatePinCode(value, currentAddr.country || 'India');
    } else if (field === 'phone') {
      if (!value || !value.trim()) {
        error = 'Phone number is required';
      } else {
        const pRes = validatePhoneNumber(value);
        if (!pRes.isValid) error = pRes.error;
      }
    }

    setAddressErrors((prev) => {
      const updated = { ...prev };
      if (error) updated[field] = error;
      else delete updated[field];
      return updated;
    });
    return error;
  };

  const handleAddressChange = (field, value) => {
    const updated = { ...address, [field]: value };
    setAddress(updated);
    if (addressTouched[field]) {
      validateAddressField(field, value, updated);
    }
  };

  const handleAddressBlur = (field) => {
    setAddressTouched((prev) => ({ ...prev, [field]: true }));
    validateAddressField(field, address[field], address);
  };

  // Fetch product details & similar products
  const fetchProductData = async () => {
    try {
      // 1. Fetch current product
      const res = await businessService.getProductById(id);
      let currentProd = null;
      if (res?.data?.product) {
        currentProd = res.data.product;
      } else if (res?.product) {
        currentProd = res.product;
      } else if (res?.data) {
        currentProd = res.data;
      }

      if (currentProd) {
        setProduct(currentProd);
        setProductNotFound(false);
        const prodSizes = currentProd.sizes && currentProd.sizes.length > 0
          ? currentProd.sizes
          : getDefaultSizesForCategory(currentProd.categoryName || currentProd.category?.name || '');
        if (prodSizes.length > 0) {
          setSelectedSize(prodSizes[0]);
        }
      } else {
        setProductNotFound(true);
      }

      if (isAuthenticated) {
        try {
          const wishRes = await businessService.getWishlist();
          if (wishRes?.success && wishRes?.data?.wishlist) {
            setWishlist(wishRes.data.wishlist.map(p => p._id));
          }
        } catch (e) {
          console.warn('Failed to fetch wishlist', e);
        }
      }

      // 2. Fetch all products to find similar items in the same category
      const allRes = await businessService.getProducts();
      const allProds = allRes?.data?.products || allRes?.products || [];

      if (currentProd && allProds.length > 0) {
        const currentCat = (currentProd.categoryName || currentProd.category?.name || currentProd.category || '').toString().toLowerCase().trim();

        const filteredSimilar = allProds.filter(p => {
          if (p._id === currentProd._id) return false; // exclude current
          const pCat = (p.categoryName || p.category?.name || p.category || '').toString().toLowerCase().trim();
          return pCat === currentCat || pCat.includes(currentCat) || currentCat.includes(pCat);
        });

        // If not enough exact matches, fallback to top available products
        if (filteredSimilar.length > 0) {
          setSimilarProducts(filteredSimilar.slice(0, 4));
        } else {
          setSimilarProducts(allProds.filter(p => p._id !== currentProd._id).slice(0, 4));
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setProductNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, isAuthenticated]);

  const handleToggleWishlist = async (productObj, e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please sign in to add items to your wishlist.', 'info');
      navigate('/login', { state: { from: `/customer/product/${productObj._id}` } });
      return;
    }

    try {
      const res = await businessService.toggleWishlist(productObj._id);
      if (res?.success) {
        setWishlist(res.data.wishlist.map(p => p._id));
        const inWishlist = res.data.wishlist.some(p => p._id === productObj._id);
        addToast(`Product ${inWishlist ? 'added to' : 'removed from'} wishlist!`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update wishlist', 'error');
    }
  };

  const addToCart = (prodToAdd, qtyToAdd = 1, openDrawer = false, chosenSize = null) => {
    if (!prodToAdd) return;
    if (prodToAdd.stock <= 0) {
      addToast('Product is currently out of stock!', 'error');
      return;
    }

    const availableSizes = prodToAdd.sizes && prodToAdd.sizes.length > 0
      ? prodToAdd.sizes
      : getDefaultSizesForCategory(prodToAdd.categoryName || prodToAdd.category?.name || '');
    const itemSize = chosenSize || selectedSize || (availableSizes.length > 0 ? availableSizes[0] : 'Standard');

    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === prodToAdd._id && item.size === itemSize);
      if (existing) {
        const newQty = existing.quantity + qtyToAdd;
        if (newQty > prodToAdd.stock) {
          addToast(`Cannot add more than ${prodToAdd.stock} available units in stock`, 'error');
          return prev;
        }
        return prev.map((item) =>
          item.product._id === prodToAdd._id && item.size === itemSize
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [...prev, { product: prodToAdd, quantity: qtyToAdd, size: itemSize }];
    });

    addToast(`Added ${qtyToAdd}x '${prodToAdd.name}' (Size: ${itemSize}) to cart!`, 'success');
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const updateCartQty = (productId, delta, itemSize) => {
    const itemToUpdate = cart.find(
      (item) => item.product._id === productId && (!itemSize || item.size === itemSize)
    );
    if (!itemToUpdate) return;

    const newQty = itemToUpdate.quantity + delta;
    if (newQty > itemToUpdate.product.stock) {
      addToast(`Cannot exceed available stock (${itemToUpdate.product.stock})`, 'error');
      return;
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId && (!itemSize || item.size === itemSize)) {
            const updatedQty = item.quantity + delta;
            return updatedQty > 0 ? { ...item, quantity: updatedQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId, itemSize) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product._id === productId && (!itemSize || item.size === itemSize)))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      addToast('Your cart is empty', 'error');
      return;
    }

    // Live validation across all required shipping fields
    const errors = {};
    ['fullName', 'street', 'city', 'state', 'zipCode', 'phone'].forEach((field) => {
      const err = validateAddressField(field, address[field], address);
      if (err) errors[field] = err;
    });

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      addToast('Please complete all valid shipping address details before checkout', 'error');
      return;
    }

    const phoneRes = validatePhoneNumber(address.phone);
    const cleanShippingAddress = {
      fullName: address.fullName.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      zipCode: address.zipCode.trim(),
      country: address.country || 'India',
      phone: phoneRes.normalized || address.phone.trim(),
    };

    const orderItems = cart.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      size: item.size || 'Standard',
    }));

    try {
      setIsProcessingPayment(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        addToast('Razorpay SDK failed to load. Check network connection.', 'error');
        setIsProcessingPayment(false);
        return;
      }

      const orderRes = await paymentService.createPaymentOrder({
        items: orderItems,
        shippingAddress: cleanShippingAddress,
      });

      if (!orderRes?.success || !orderRes?.data) {
        addToast(orderRes?.message || 'Failed to create Razorpay payment order', 'error');
        setIsProcessingPayment(false);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      if (razorpayOrderId && razorpayOrderId.startsWith('order_test_')) {
        setRazorpayTestModalData({
          razorpayOrderId,
          amount,
          orderItems,
          shippingAddress: cleanShippingAddress,
        });
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: keyId || '',
        amount: amount,
        currency: currency || 'INR',
        name: 'BrandDNA Store',
        description: 'Secure Checkout Payment',
        image: product?.images?.[0] || '/images/cat_workout_essentials.jpg',
        ...(razorpayOrderId ? { order_id: razorpayOrderId } : {}),
        prefill: {
          name: cleanShippingAddress.fullName || user?.fullName || '',
          email: user?.email || '',
          contact: cleanShippingAddress.phone || '',
        },
        theme: { color: '#0B192C' },
        handler: async function (response) {
          try {
            setIsProcessingPayment(true);
            const verifyRes = await paymentService.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
              razorpay_signature: response.razorpay_signature,
              items: orderItems,
              shippingAddress: cleanShippingAddress,
            });

            if (verifyRes?.success && verifyRes?.data?.order) {
              addToast('Razorpay Payment Successful & Verified!', 'success');
              setCart([]);
              setConfirmedOrderModal(verifyRes.data.order);
              setIsCartOpen(false);
            } else {
              addToast(verifyRes?.message || 'Payment verification failed', 'error');
            }
          } catch (verifyErr) {
            addToast(verifyErr.response?.data?.message || 'Signature verification failed', 'error');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            addToast('Payment process cancelled.', 'info');
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        addToast(
          `Payment Failed: ${response.error?.description || response.error?.reason || 'Transaction declined'}`,
          'error'
        );
        setIsProcessingPayment(false);
      });
      razorpayInstance.open();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to launch Razorpay checkout', 'error');
      setIsProcessingPayment(false);
    }
  };

  const handleSimulateTestPaymentSuccess = async () => {
    if (!razorpayTestModalData) return;
    try {
      setIsProcessingPayment(true);
      const razorpay_payment_id = `pay_test_${Date.now().toString().slice(-8)}`;
      const { razorpayOrderId, orderItems, shippingAddress } = razorpayTestModalData;

      const sigRes = await paymentService.generateTestSignature({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id,
      });

      if (!sigRes?.success || !sigRes?.data?.signature) {
        addToast('Failed to generate test signature', 'error');
        return;
      }

      const verifyRes = await paymentService.verifyPayment({
        razorpay_payment_id,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: sigRes.data.signature,
        items: orderItems,
        shippingAddress,
      });

      if (verifyRes?.success && verifyRes?.data?.order) {
        addToast('Razorpay Payment Verified & Order Created!', 'success');
        setCart([]);
        setConfirmedOrderModal(verifyRes.data.order);
        setRazorpayTestModalData(null);
        setIsCartOpen(false);
      } else {
        addToast(verifyRes?.message || 'Payment verification failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Payment verification failed', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };



  if (productNotFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-4 font-sans text-slate-800">
        <Package className="w-16 h-16 text-slate-300" />
        <h2 className="font-serif text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for may have been removed or updated.</p>
        <button
          onClick={() => navigate('/customer/dashboard')}
          className="px-6 py-2.5 bg-[#0B192C] text-white rounded-full text-xs font-bold hover:bg-[#1E3E62]"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const hasDiscount = product.discountPrice > 0 && product.discountPrice > product.price;
  const savings = hasDiscount ? product.discountPrice - product.price : 0;
  const discountPercent = hasDiscount ? Math.round((savings / product.discountPrice) * 100) : 0;
  const categoryName = product.categoryName || product.category?.name || 'Store Collection';
  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : getDefaultSizesForCategory(categoryName);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0B192C] selection:text-white flex flex-col justify-between">

      {/* TOP ANNOUNCEMENT BANNER */}
      <div className="bg-[#060D1A] text-sky-300 text-[11px] font-mono tracking-widest uppercase py-2.5 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
        <span>Free Express Delivery on Orders Over ₹1,499 | 100% Authentic BrandDNA Guarantee</span>
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform border border-sky-700/40 shrink-0">
              <Dna className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-extrabold text-xl sm:text-2xl tracking-tight text-[#0B192C] flex items-center gap-1">
                BrandDNA<span className="text-sky-500 font-sans text-2xl sm:text-3xl leading-none">.</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase leading-none">
                Performance Store
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold tracking-widest uppercase text-slate-700">
            <button onClick={() => navigate('/')} className="hover:text-[#0B192C] transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-[#0B192C] transition-colors cursor-pointer">
              About
            </button>
            <button onClick={() => navigate('/products')} className="hover:text-[#0B192C] transition-colors cursor-pointer">
              Catalog
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  addToast('Please sign in to view your orders.', 'info');
                  navigate('/login', { state: { from: '/customer/dashboard?tab=orders' } });
                  return;
                }
                navigate('/customer/dashboard?tab=orders');
              }}
              className="hover:text-[#0B192C] transition-colors cursor-pointer"
            >
              My Orders {isAuthenticated ? '' : ''}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  addToast('Please sign in to view your wishlist.', 'info');
                  navigate('/login', { state: { from: '/customer/dashboard?tab=wishlist' } });
                  return;
                }
                navigate('/customer/dashboard?tab=wishlist');
              }}
              className="hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5" /> Wishlist {isAuthenticated ? `(${wishlist.length})` : ''}
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#0B192C] hover:bg-[#1E3E62] text-white transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shadow-md hover:scale-105"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden xs:inline">Cart</span>
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded-full text-[10px] text-white">
                {cartItemCount}
              </span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-stone-200">
                {user?.role && user?.role !== 'customer' && (
                  <button
                    onClick={() => navigate(getRoleRedirectPath(user?.role))}
                    className="px-3 py-1.5 rounded-full bg-[#E8F5E9] hover:bg-[#C4E1D4] text-[#0F382C] border border-[#A5D6A7] font-bold text-xs transition-all flex items-center gap-1 shadow-xs mr-1 cursor-pointer"
                    title={`Go to your ${user?.role} workspace`}
                  >
                    <span>Workspace</span>
                  </button>
                )}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0B192C] text-white font-bold text-xs flex items-center justify-center border border-sky-600/40">
                  {(user?.fullName || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-slate-800">
                  {user?.fullName || 'Customer'}
                </span>
                <button onClick={logout} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-200">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs transition-all cursor-pointer font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3.5 py-1.5 rounded-full bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Navigation Drawer Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-800 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/98 backdrop-blur-md border-b border-stone-200 overflow-hidden shadow-xl"
            >
              <div className="px-5 py-4 space-y-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-stone-100 text-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>Home</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/about'); }}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-stone-100 text-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>About</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/products'); }}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-stone-100 text-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>



                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!isAuthenticated) {
                      addToast('Please sign in to view your orders.', 'info');
                      navigate('/login', { state: { from: '/customer/dashboard?tab=orders' } });
                      return;
                    }
                    navigate('/customer/dashboard?tab=orders');
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-stone-100 text-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>My Orders</span>
                  <Package className="w-3.5 h-3.5 text-sky-500" />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!isAuthenticated) {
                      addToast('Please sign in to view your wishlist.', 'info');
                      navigate('/login', { state: { from: '/customer/dashboard?tab=wishlist' } });
                      return;
                    }
                    navigate('/customer/dashboard?tab=wishlist');
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-stone-100 text-rose-600 transition-colors flex items-center justify-between"
                >
                  <span>Wishlist {isAuthenticated ? `(${wishlist.length})` : ''}</span>
                  <Heart className="w-3.5 h-3.5" />
                </button>

                {!isAuthenticated && (
                  <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                      className="py-2.5 rounded-xl bg-stone-100 text-slate-800 font-bold text-center text-xs"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                      className="py-2.5 rounded-xl bg-[#0B192C] text-white font-bold text-center text-xs"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MARKETING STAFF WORKSPACE TOOLBAR (Restricted to Marketing Team & Admin Only) */}
      {(user?.role === 'marketing_staff' || user?.role === 'admin') && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-indigo-100 border-b border-indigo-800/60 py-2.5 px-4 sm:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px] uppercase font-bold border border-indigo-400/30">
                Marketing Staff
              </span>
              <span className="font-semibold text-slate-200">
                Generate or customize official ad campaigns in Marketing Studio
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marketing/ad-poster', { state: { mode: 'existing', productId: product?._id } })}
              className="px-3.5 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-102 self-end sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Ad in Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* BREADCRUMB BAR */}
      <div className="bg-stone-50 border-b border-stone-200/80 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => navigate('/customer/dashboard')} className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
            </button>
            <span>/</span>
            <span className="hover:text-slate-900 cursor-pointer" onClick={() => navigate(`/customer/dashboard?category=${encodeURIComponent(categoryName)}`)}>
              {categoryName}
            </span>
            <span>/</span>
            <span className="font-bold text-slate-900 truncate max-w-xs capitalize">{product.name}</span>
          </div>

          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase hidden sm:block">
            SKU: {product.sku || 'BDNA-PRO'}
          </span>
        </div>
      </div>

      {/* MAIN PRODUCT INFORMATION & BUYING SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">

        {/* TWO-COLUMN PRODUCT SHOWCASE STAGE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: HIGH-DEFINITION STUDIO STAGE */}
          <div className="space-y-5 sm:space-y-6">
            <div className="h-[320px] sm:h-[440px] lg:h-[480px] bg-gradient-to-b from-[#0B192C]/[0.04] via-slate-50/80 to-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 flex flex-col items-center justify-center relative border border-stone-200/90 shadow-lg overflow-hidden group">
              {/* Radial Background Studio Lighting */}
              <div className="absolute w-64 h-64 rounded-full bg-sky-400/15 blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
              <div className="absolute bottom-8 w-52 h-3 bg-[#0B192C]/10 rounded-full blur-md group-hover:w-64 group-hover:bg-sky-500/25 transition-all duration-500" />

              <img
                src={product.images?.[0] || '/images/cat_workout_essentials.jpg'}
                alt={product.name}
                className="max-h-[340px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 z-10"
              />

              {/* Badges Overlay */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 items-start z-10">
                {product.brand && (
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-mono font-extrabold tracking-widest uppercase bg-[#0B192C] text-white shadow-md backdrop-blur-md border border-sky-400/30">
                    {product.brand}
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" /> {discountPercent}% OFF
                  </span>
                )}
              </div>

              <span className="absolute top-6 right-6 px-3.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-2xs border border-stone-200 backdrop-blur-md z-10 font-mono">
                {categoryName}
              </span>
            </div>

            {/* TRUST & GUARANTEE BADGES BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-sky-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-900">100% Authentic</p>
                <p className="text-[9px] text-slate-400">Direct Factory Stock</p>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-center space-y-1">
                <Truck className="w-5 h-5 text-sky-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-900">Express Delivery</p>
                <p className="text-[9px] text-slate-400">Dispatch in 24 Hrs</p>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-center space-y-1">
                <CreditCard className="w-5 h-5 text-sky-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-900">Razorpay Verified</p>
                <p className="text-[9px] text-slate-400">HMAC Encrypted</p>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-center space-y-1">
                <RotateCcw className="w-5 h-5 text-sky-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-900">30-Day Returns</p>
                <p className="text-[9px] text-slate-400">Hassle-Free Policy</p>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN: PRODUCT SPECIFICATIONS & BUYING OPTIONS */}
          <div className="space-y-6">

            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  {categoryName}
                </span>

                <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${product.stock > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Currently Out of Stock'}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-900 leading-tight capitalize tracking-tight">
                {product.name}
              </h1>

              {/* Rating stars & verified review summary */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-900 ml-1">4.9 / 5.0</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">128 Verified Buyer Reviews</span>
              </div>
            </div>

            {/* PRICING & DISCOUNTS BOX */}
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200/90 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Retail Price</span>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-slate-900">₹{product.price?.toLocaleString('en-IN')}</span>
                {hasDiscount && (
                  <span className="text-lg text-slate-400 line-through font-semibold">₹{product.discountPrice?.toLocaleString('en-IN')}</span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-xl shadow-2xs">
                    Save ₹{savings?.toLocaleString('en-IN')} ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Inclusive of all taxes. Free express shipping applied at checkout.</p>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900">Product Overview</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {product.description || 'Authentic store product engineered specifically for peak performance, high durability, and ergonomic perfection.'}
              </p>
            </div>

            {/* KEY SPECIFICATIONS CHECKLIST */}
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900">Key Features & Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Pro-Grade Performance Materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Ergonomic Precision Engineering</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Weather Resistant & Durable</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>1-Year Official BrandDNA Warranty</span>
                </div>
              </div>
            </div>

            {/* SIZE CHOOSING OPTION */}
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200/90 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900">
                    Select Size
                  </span>
                  {selectedSize && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#0B192C] text-white shadow-2xs">
                      Selected: {selectedSize}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer transition-colors hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span>Size Guide</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {availableSizes.map((sizeOption) => {
                  const isSelected = selectedSize === sizeOption;
                  return (
                    <button
                      key={sizeOption}
                      type="button"
                      onClick={() => setSelectedSize(sizeOption)}
                      className={`min-w-[52px] px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${isSelected
                        ? 'bg-[#0B192C] text-white ring-2 ring-[#0B192C] ring-offset-2 scale-105 shadow-md'
                        : 'bg-white text-slate-700 border border-stone-200 hover:border-slate-400 hover:bg-stone-100/80'
                        }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-sky-300" />}
                      <span>{sizeOption}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-stone-200/70">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Authentic BrandDNA fit. True to standard sizing.
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {availableSizes.length} size options available
                </span>
              </div>
            </div>

            {/* QUANTITY SELECTOR & BUYING OPTIONS (EXCLUSIVE TO THIS PAGE) */}
            <div className="p-6 bg-[#060D1A] text-white rounded-3xl space-y-5 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">Select Purchase Quantity</span>
                <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-xl border border-white/20">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-extrabold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* MAIN DUAL ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => addToCart(product, quantity, false, selectedSize)}
                  disabled={product.stock <= 0}
                  className="py-4 rounded-2xl bg-white hover:bg-sky-50 disabled:opacity-50 text-[#060D1A] font-extrabold text-xs transition-all shadow-lg hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-[#060D1A]" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={() => addToCart(product, quantity, true, selectedSize)}
                  disabled={product.stock <= 0}
                  className="py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-300 hover:from-sky-300 hover:to-sky-200 disabled:opacity-50 text-[#060D1A] font-black text-xs transition-all shadow-xl hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-[#060D1A]" />
                  <span>Buy Now & Checkout</span>
                </button>
              </div>

              <button
                onClick={(e) => handleToggleWishlist(product, e)}
                className={`w-full py-4 rounded-2xl font-extrabold text-xs transition-all shadow-md hover:scale-102 cursor-pointer flex items-center justify-center gap-2 border ${wishlist.includes(product._id) ? 'bg-rose-50/10 border-rose-500/50 text-rose-400 hover:bg-rose-500/20' : 'bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white'}`}
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(product._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{wishlist.includes(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-3">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-sky-400" /> Razorpay SSL 256-bit Encrypted Checkout</span>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SIMILAR PRODUCTS SECTION (SAME CATEGORY)
           ───────────────────────────────────────────────────────────── */}
        {similarProducts.length > 0 && (
          <section className="space-y-8 pt-8 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#0B192C] uppercase">
                  Explore Related Store Items
                </span>
                <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Similar Products in {categoryName} <Sparkles className="w-5 h-5 text-sky-500" />
                </h2>
              </div>
              <button
                onClick={() => navigate(`/customer/dashboard?category=${encodeURIComponent(categoryName)}`)}
                className="text-xs font-bold text-[#0B192C] hover:underline flex items-center gap-1"
              >
                View All {categoryName} Items <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SIMILAR PRODUCTS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((simProd) => {
                const simHasDiscount = simProd.discountPrice > 0 && simProd.discountPrice > simProd.price;
                return (
                  <div
                    key={simProd._id}
                    onClick={() => {
                      navigate(`/customer/product/${simProd._id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white rounded-3xl border border-stone-200/90 hover:border-[#0B192C] shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer overflow-hidden p-5"
                  >
                    <div>
                      {/* Image stage */}
                      <div className="h-56 bg-stone-50 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden mb-4">
                        <img
                          src={simProd.images?.[0] || '/images/cat_workout_essentials.jpg'}
                          alt={simProd.name}
                          className="max-h-44 object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white text-slate-700 shadow-2xs border border-stone-200">
                          {simProd.brand || categoryName}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current text-amber-400" />
                          ))}
                          <span className="text-[10px] font-bold text-slate-700 ml-1">4.9</span>
                        </div>

                        <h4 className="font-serif text-base font-extrabold text-slate-900 group-hover:text-[#0B192C] transition-colors line-clamp-1 capitalize">
                          {simProd.name}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2">
                          {simProd.description || 'Authentic store product engineered for peak performance.'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-slate-900">₹{simProd.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View Product <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>


      {/* SLIDE-OUT CART & CHECKOUT DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
              >
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#0B192C]" />
                    <h2 className="font-serif text-lg font-bold text-slate-900">BrandDNA Shopping Cart</h2>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-3 text-slate-400">
                      <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-600 text-sm">Your cart is empty.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {cart.map((item, idx) => (
                        <div key={`${item.product._id}-${item.size || 'std'}-${idx}`} className="py-4 flex items-center justify-between gap-4">
                          <img
                            src={item.product.images?.[0] || '/images/cat_workout_essentials.jpg'}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-xl object-contain border border-stone-100 p-1 shrink-0 bg-stone-50"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate capitalize">{item.product.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[11px] text-slate-400 font-semibold">₹{item.product.price} each</p>
                              {item.size && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-indigo-700 text-[10px] font-mono font-bold border border-sky-200">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateCartQty(item.product._id, -1, item.size)}
                                className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQty(item.product._id, 1, item.size)}
                                className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-900 block">
                              ₹{item.product.price * item.quantity}
                            </span>
                            <button onClick={() => removeFromCart(item.product._id, item.size)} className="text-slate-400 hover:text-rose-600 mt-2 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 mt-6">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-slate-700" /> Shipping Details
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div>
                          <input
                            type="text"
                            value={address.fullName}
                            onChange={(e) => handleAddressChange('fullName', e.target.value)}
                            onBlur={() => handleAddressBlur('fullName')}
                            placeholder="Full Name *"
                            className={`w-full bg-white border rounded-lg p-2 outline-none font-medium transition-all ${addressErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                              }`}
                          />
                          {addressErrors.fullName && (
                            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{addressErrors.fullName}</p>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={address.street}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            onBlur={() => handleAddressBlur('street')}
                            placeholder="Street Address (min 5 characters) *"
                            className={`w-full bg-white border rounded-lg p-2 outline-none font-medium transition-all ${addressErrors.street ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                              }`}
                          />
                          {addressErrors.street && (
                            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{addressErrors.street}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              value={address.city}
                              onChange={(e) => handleAddressChange('city', e.target.value)}
                              onBlur={() => handleAddressBlur('city')}
                              placeholder="City *"
                              className={`w-full bg-white border rounded-lg p-2 outline-none font-medium transition-all ${addressErrors.city ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                                }`}
                            />
                            {addressErrors.city && (
                              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{addressErrors.city}</p>
                            )}
                          </div>

                          <div>
                            <input
                              type="text"
                              value={address.state}
                              onChange={(e) => handleAddressChange('state', e.target.value)}
                              onBlur={() => handleAddressBlur('state')}
                              placeholder="State *"
                              className={`w-full bg-white border rounded-lg p-2 outline-none font-medium transition-all ${addressErrors.state ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                                }`}
                            />
                            {addressErrors.state && (
                              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{addressErrors.state}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              maxLength={6}
                              value={address.zipCode}
                              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                              onBlur={() => handleAddressBlur('zipCode')}
                              placeholder="PIN Code (6 digits) *"
                              className={`w-full bg-white border rounded-lg p-2 outline-none font-medium transition-all ${addressErrors.zipCode ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                                }`}
                            />
                            {addressErrors.zipCode && (
                              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{addressErrors.zipCode}</p>
                            )}
                          </div>

                          <div>
                            <input
                              type="text"
                              value={address.phone}
                              onChange={(e) => handleAddressChange('phone', e.target.value)}
                              onBlur={() => handleAddressBlur('phone')}
                              placeholder="Phone (e.g. 9876543210) *"
                              className={`w-full bg-white border rounded-lg p-2 outline-none font-medium transition-all ${addressErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200 focus:border-[#0B192C]'
                                }`}
                            />
                            {addressErrors.phone ? (
                              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{addressErrors.phone}</p>
                            ) : address.phone && !addressErrors.phone && addressTouched.phone ? (
                              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Valid phone
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 block uppercase">Payment Method</label>
                        <div className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 text-xs font-bold flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-900">
                            <CreditCard className="w-4 h-4 text-sky-600" />
                            <span>Razorpay Secure Payment</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            VERIFIED
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t border-stone-100 space-y-3 bg-white">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-900">₹{cartTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Shipping</span>
                      <span className="font-bold text-[#1E3E62]">FREE</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-stone-100">
                      <span>Total Amount</span>
                      <span className="text-base text-slate-900">₹{cartTotal}</span>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessingPayment || Object.keys(addressErrors).length > 0}
                      className="w-full py-3.5 bg-[#0B192C] hover:bg-[#1E3E62] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Order...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-sky-300" />
                          <span>Pay with Razorpay</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* RAZORPAY TEST MODE MODAL */}
      <AnimatePresence>
        {razorpayTestModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="bg-[#0B192C] text-white p-4 -m-6 mb-4 flex items-center justify-between border-b border-sky-900/40">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-sky-400" />
                  <span className="font-bold text-sm">BrandDNA Razorpay Sandbox</span>
                </div>
                <button onClick={() => setRazorpayTestModalData(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-sky-50 text-indigo-900 rounded-xl border border-sky-200">
                  <p className="font-bold">Razorpay Test Mode Active</p>
                  <p className="text-[11px] text-indigo-700">Order ID: {razorpayTestModalData.razorpayOrderId}</p>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900">
                  <span>Amount to Pay</span>
                  <span>₹{razorpayTestModalData.amount / 100}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSimulateTestPaymentSuccess}
                  disabled={isProcessingPayment}
                  className="w-full py-3 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isProcessingPayment ? 'Verifying HMAC Signature...' : 'Complete Razorpay Payment (Test Success)'}
                </button>
                <button
                  onClick={() => setRazorpayTestModalData(null)}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMED ORDER SUCCESS MODAL */}
      <AnimatePresence>
        {confirmedOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-sky-100 text-indigo-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900">BrandDNA Order Confirmed!</h3>
              <p className="text-xs text-slate-500">
                Thank you for shopping with us. Order <span className="font-mono font-bold text-slate-900">#{confirmedOrderModal.orderNumber || confirmedOrderModal._id}</span> has been placed.
              </p>
              <button
                onClick={() => {
                  setConfirmedOrderModal(null);
                  navigate('/customer/dashboard?tab=orders');
                }}
                className="w-full py-3 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Track My Order Progress
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE SIZE GUIDE MODAL */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-indigo-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900">Official BrandDNA Size Guide</h3>
                    <p className="text-[11px] text-slate-400">Measurement reference & fit instructions</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {categoryName.toLowerCase().includes('shoe') || categoryName.toLowerCase().includes('footwear') ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Find your perfect athletic footwear fit by matching your foot length (heel to toe).
                  </p>
                  <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-50 font-mono text-[10px] uppercase text-slate-500 border-b border-stone-200">
                        <tr>
                          <th className="p-3">UK Size</th>
                          <th className="p-3">US Size</th>
                          <th className="p-3">EU Size</th>
                          <th className="p-3">Foot Length</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium">
                        {SIZE_GUIDE_CHART.shoes.map((row) => (
                          <tr key={row.uk} className={selectedSize === row.uk ? 'bg-sky-50/70 font-bold text-sky-900' : ''}>
                            <td className="p-3 font-mono">{row.uk}</td>
                            <td className="p-3">{row.us}</td>
                            <td className="p-3">{row.eu}</td>
                            <td className="p-3 font-mono">{row.cm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Measurements are in inches. If you prefer a tighter athletic fit, size down; for a relaxed feel, choose your standard size.
                  </p>
                  <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-50 font-mono text-[10px] uppercase text-slate-500 border-b border-stone-200">
                        <tr>
                          <th className="p-3">Size</th>
                          <th className="p-3">Chest</th>
                          <th className="p-3">Waist</th>
                          <th className="p-3">Hips</th>
                          <th className="p-3">Profile Fit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium">
                        {SIZE_GUIDE_CHART.apparel.map((row) => (
                          <tr key={row.size} className={selectedSize === row.size ? 'bg-sky-50/70 font-bold text-sky-900' : ''}>
                            <td className="p-3 font-mono">{row.size}</td>
                            <td className="p-3">{row.chest}</td>
                            <td className="p-3">{row.waist}</td>
                            <td className="p-3">{row.hips}</td>
                            <td className="p-3 font-semibold text-sky-700">{row.fit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">Need personalized sizing assistance?</p>
                <p className="text-[11px] text-slate-500">
                  Every BrandDNA order comes with our complimentary 30-Day Hassle-Free Size Exchange guarantee.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="px-6 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Got It, Thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};
