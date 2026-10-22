import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Tag,
  Lock,
  LogOut,
  User,
  Grid,
  Dumbbell,
  Compass,
  Footprints,
  Backpack,
  Trophy,
  HeartPulse,
  Flame,
  Check,
  Dna,
  Zap,
  Award,
  ArrowUpRight,
  Activity,
  Droplets,
  Layers,
  KeyRound,
  Menu
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { deliveryService } from '../../services/deliveryService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { useAuth, getRoleRedirectPath } from '../../context/AuthContext';
import { Footer } from '../../components/layout/Footer';
import { getDefaultSizesForCategory } from '../../constants/sizes';
import {
  validatePhoneNumber,
  validateStreet,
  validateCity,
  validateState,
  validatePinCode,
} from '../../utils/validation';
import { storageCache } from '../../utils/storageCache';
import { INITIAL_PRODUCTS } from '../../constants/initialProducts';

// Official 6 Store Categories with AI Images and Exactly 3 Sub-products
const STORE_OFFICIAL_CATEGORIES = [
  {
    id: 'cat-workout',
    name: 'Workout Essentials',
    icon: Dumbbell,
    image: '/images/cat_workout_essentials.jpg',
    badge: 'Gym & Home Workouts',
    tagline: 'Dumbbells, resistance bands & yoga mats engineered for strength.',
    subProducts: ['Dumbbells', 'Resistance bands', 'Yoga mats']
  },
  {
    id: 'cat-hiking',
    name: 'Hiking & Trekking',
    icon: Compass,
    image: '/images/cat_hiking_trekking.jpg',
    badge: 'Outdoor Adventures',
    tagline: 'Trekking poles, camping tents & sleeping bags built for high-altitude trails.',
    subProducts: ['Trekking poles', 'Camping tents', 'Sleeping bags']
  },
  {
    id: 'cat-shoes',
    name: 'Shoes',
    icon: Footprints,
    image: '/images/cat_shoes.jpg',
    badge: 'Sports & Trail Footwear',
    tagline: 'Pro running shoes, rugged hiking boots & training athletic sneakers.',
    subProducts: ['Running shoes', 'Hiking shoes', 'Training shoes']
  },
  {
    id: 'cat-bags',
    name: 'Bags & Backpacks',
    icon: Backpack,
    image: '/images/cat_bags_backpacks.jpg',
    badge: 'Sports & Outdoor Bags',
    tagline: 'Waterproof hiking backpacks, sports duffle bags & gym packs.',
    subProducts: ['Hiking backpacks', 'Sports bags', 'Gym bags']
  },
  {
    id: 'cat-accessories',
    name: 'Sport Accessories',
    icon: Trophy,
    image: '/images/cat_sport_accessories.jpg',
    badge: 'Fitness Tech & Gear',
    tagline: 'Insulated water bottles, smartwatches & fitness tracker bands.',
    subProducts: ['Water bottles', 'Sports watches', 'Fitness trackers']
  },
  {
    id: 'cat-nutrition',
    name: 'Nutrition & Care',
    icon: HeartPulse,
    image: '/images/cat_nutrition_care.jpg',
    badge: 'Recovery & Personal Care',
    tagline: 'Whey protein isolate, energy gels & electrolyte hydration powder.',
    subProducts: ['Protein products', 'Energy products', 'Electrolytes']
  }
];

export const CustomerDashboardPage = () => {
  const { addToast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Storefront loading state - Initialized immediately from cache/fallback for 0ms delay
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue' | 'cart' | 'orders'

  const [dashboardData, setDashboardData] = useState(() => storageCache.get('cust_dashboard', null));
  const [products, setProducts] = useState(() => storageCache.get('all_products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState(() => storageCache.get('all_categories', STORE_OFFICIAL_CATEGORIES));
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search, Filter & Sort for Catalogue
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [specialFilterMode, setSpecialFilterMode] = useState(''); // '' | 'special' | 'bestseller'
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');
  const [selectedSubFilter, setSelectedSubFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_low' | 'price_high'
  const [cataloguePage, setCataloguePage] = useState(1);
  const cataloguePerPage = 6;

  // Payment & Checkout States
  const paymentMethod = 'razorpay';
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrderModal, setConfirmedOrderModal] = useState(null);
  const [razorpayTestModalData, setRazorpayTestModalData] = useState(null);

  // Checkout shipping address (live customer address input)
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

  // Modal States
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [quickViewSelectedSize, setQuickViewSelectedSize] = useState('');
  const [customerReturns, setCustomerReturns] = useState([]);
  const [selectedProductForReturn, setSelectedProductForReturn] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState('Wrong product');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnEvidenceImage, setReturnEvidenceImage] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [customerOtp, setCustomerOtp] = useState(null);
  const [isSyncingTracking, setIsSyncingTracking] = useState(false);

  // Derived telemetry objects
  const profile = dashboardData?.profile || {};
  const recentOrders = dashboardData?.recentOrders || [];

  // Fetch dynamic customer storefront data independently in the background (non-blocking SWR)
  const fetchCustomerData = () => {
    const storedToken = localStorage.getItem('branddna_token') || sessionStorage.getItem('branddna_token');
    const isAuth = isAuthenticated || !!storedToken;

    // 1. Live products background refresh
    businessService.getProducts()
      .then((prodRes) => {
        const fetchedProducts = prodRes?.data?.products || prodRes?.products;
        if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          storageCache.set('all_products', fetchedProducts);
        }
      })
      .catch(() => { });

    // 2. Categories background refresh
    businessService.getCategories()
      .then((catRes) => {
        if (catRes?.data?.categories && catRes.data.categories.length > 0) {
          setCategories(catRes.data.categories);
          storageCache.set('all_categories', catRes.data.categories);
        }
      })
      .catch(() => { });

    // 3. User Telemetry background refresh (dashboard, wishlist, returns)
    if (isAuth) {
      businessService.getCustomerDashboard()
        .then((dashRes) => {
          if (dashRes?.success && dashRes?.data) {
            setDashboardData(dashRes.data);
            storageCache.set('cust_dashboard', dashRes.data);
          }
        })
        .catch(() => { });

      businessService.getWishlist()
        .then((wishRes) => {
          if (wishRes?.success && wishRes?.data?.wishlist) {
            setWishlist(wishRes.data.wishlist.map((p) => p._id));
          }
        })
        .catch(() => { });

      businessService.getReturns()
        .then((retRes) => {
          if (retRes?.data?.returns) {
            setCustomerReturns(retRes.data.returns);
          }
        })
        .catch(() => { });
    }
  };

  // Submit product return request
  const handleCreateReturn = async (e) => {
    e.preventDefault();
    if (!selectedProductForReturn) return;
    setIsSubmittingReturn(true);
    try {
      const payload = {
        orderId: selectedProductForReturn.order._id,
        productId: selectedProductForReturn.item.product?._id || selectedProductForReturn.item.product,
        quantity: Number(returnQuantity),
        reason: returnReason,
        description: returnDescription.trim(),
        evidenceImage: returnEvidenceImage.trim(),
      };
      const res = await businessService.createReturn(payload);
      if (res?.success) {
        addToast(
          `Return ${res.data?.returnDoc?.returnNumber || ''} created successfully under 7-day policy.`,
          'success'
        );
        setSelectedProductForReturn(null);
        setReturnQuantity(1);
        setReturnReason('Wrong product');
        setReturnDescription('');
        setReturnEvidenceImage('');
        fetchCustomerData();
      } else {
        addToast(res?.message || 'Could not submit return request', 'error');
      }
    } catch (err) {
      addToast(
        err?.response?.data?.message || err.message || 'Failed to submit return request',
        'error'
      );
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Helper to open and fetch live tracking modal (Read-Only)
  const handleOpenTrackModal = async (order) => {
    setSelectedTrackingOrder(order);
    setIsSyncingTracking(true);
    setCustomerOtp(null);
    try {
      const res = await deliveryService.getDeliveryTracking(order._id);
      if (res?.success && res?.data) {
        if (res.data.order) setSelectedTrackingOrder(res.data.order);
        if (res.data.history) setTrackingHistory(res.data.history);
        if (res.data.customerOtp) setCustomerOtp(res.data.customerOtp);
      }
    } catch (err) {
      console.error('Error fetching live shipment tracking:', err);
    } finally {
      setIsSyncingTracking(false);
    }
  };

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    const tab = searchParams.get('tab');
    if (cat) {
      setSelectedCatFilter(cat);
      setCataloguePage(1);
    } else {
      setSelectedCatFilter('ALL');
    }
    if (q) {
      const qLower = q.toLowerCase().trim();
      if (qLower === 'special') {
        setSpecialFilterMode('special');
        setCatalogueSearch('');
      } else if (qLower === 'bestseller') {
        setSpecialFilterMode('bestseller');
        setCatalogueSearch('');
      } else {
        setCatalogueSearch(q);
        setSpecialFilterMode('');
      }
      setCataloguePage(1);
    } else {
      setCatalogueSearch('');
      setSpecialFilterMode('');
    }
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const requireLogin = (action = 'perform this action') => {
    if (!isAuthenticated) {
      addToast(`Please sign in to your customer account to ${action}.`, 'info');
      navigate('/login', { state: { from: '/customer/dashboard' } });
      return true;
    }
    return false;
  };

  const handleToggleWishlist = async (product, e) => {
    if (e) e.stopPropagation();
    if (requireLogin('add items to your wishlist')) return;

    try {
      const res = await businessService.toggleWishlist(product._id);
      if (res?.success) {
        setWishlist(res.data.wishlist.map(p => p._id));
        const inWishlist = res.data.wishlist.some(p => p._id === product._id);
        addToast(`Product ${inWishlist ? 'added to' : 'removed from'} wishlist!`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update wishlist', 'error');
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [isAuthenticated]);

  const addToCart = (product, chosenSize = null) => {
    if (requireLogin('add items to your cart')) return;
    if (product.stock <= 0) {
      addToast('Product is currently out of stock!', 'error');
      return;
    }

    const availableSizes = product.sizes && product.sizes.length > 0
      ? product.sizes
      : getDefaultSizesForCategory(product.categoryName || product.category?.name || '');
    const itemSize = chosenSize || (availableSizes.length > 0 ? availableSizes[0] : 'Standard');

    const existing = cart.find((item) => item.product._id === product._id && item.size === itemSize);
    if (existing && existing.quantity >= product.stock) {
      addToast(`Only ${product.stock} units available in stock`, 'error');
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item.product._id === product._id && item.size === itemSize);
      if (existingItem) {
        return prev.map((item) =>
          item.product._id === product._id && item.size === itemSize ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, size: itemSize }];
    });
    addToast(`Added '${product.name}' (Size: ${itemSize}) to cart!`, 'success');
  };

  const updateCartQty = (productId, delta, itemSize) => {
    const itemToUpdate = cart.find(item => item.product._id === productId && (!itemSize || item.size === itemSize));
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
    setCart((prev) => prev.filter((item) => !(item.product._id === productId && (!itemSize || item.size === itemSize))));
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
    if (requireLogin('place an order')) return;
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
        addToast('Razorpay Checkout SDK failed to load. Please check your network connection.', 'error');
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

      // If backend returned a mock order due to invalid keys, simulate checkout
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
        image: products[0]?.images?.[0] || '/images/cat_workout_essentials.jpg',
        ...(razorpayOrderId ? { order_id: razorpayOrderId } : {}),
        prefill: {
          name: cleanShippingAddress.fullName || profile?.fullName || user?.fullName || '',
          email: user?.email || '',
          contact: cleanShippingAddress.phone || '',
        },
        theme: {
          color: '#0B192C',
        },
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
              setActiveTab('orders');
              fetchCustomerData();
            } else {
              addToast(verifyRes?.message || 'Payment verification failed on server', 'error');
            }
          } catch (verifyErr) {
            addToast(
              verifyErr.response?.data?.message || 'Server signature verification failed',
              'error'
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            addToast('Payment process cancelled by user.', 'info');
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

      const razorpay_signature = sigRes.data.signature;

      const verifyRes = await paymentService.verifyPayment({
        razorpay_payment_id,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature,
        items: orderItems,
        shippingAddress,
      });

      if (verifyRes?.success && verifyRes?.data?.order) {
        addToast('Razorpay Payment Verified & Order Created!', 'success');
        setCart([]);
        setConfirmedOrderModal(verifyRes.data.order);
        setRazorpayTestModalData(null);
        setIsCartOpen(false);
        setActiveTab('orders');
        fetchCustomerData();
      } else {
        addToast(verifyRes?.message || 'Payment verification failed on server', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Payment verification failed', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Filter & Sort Catalogue dynamically against MongoDB products & subcategory filters
  let filteredProducts = products.filter((p) => {
    if (p.status && p.status !== 'Active') return false;

    // Special Offers filter: items with discount
    if (specialFilterMode === 'special' || catalogueSearch.trim().toLowerCase() === 'special') {
      const isDiscounted = (p.discountPrice && p.discountPrice > 0 && p.discountPrice > p.price);
      if (!isDiscounted) return false;
    }

    // Bestsellers filter: items in stock
    if (specialFilterMode === 'bestseller' || catalogueSearch.trim().toLowerCase() === 'bestseller') {
      if (p.stock <= 0) return false;
    }

    const isPresetKeyword = (catalogueSearch.trim().toLowerCase() === 'special' || catalogueSearch.trim().toLowerCase() === 'bestseller');
    const effectiveSearch = isPresetKeyword ? '' : (catalogueSearch || selectedSubFilter).toLowerCase().trim();

    const matchesSearch = !effectiveSearch ||
      p.name?.toLowerCase().includes(effectiveSearch) ||
      p.description?.toLowerCase().includes(effectiveSearch) ||
      (p.brand && p.brand.toLowerCase().includes(effectiveSearch)) ||
      (p.sku && p.sku.toLowerCase().includes(effectiveSearch));

    if (selectedCatFilter === 'ALL') return matchesSearch;

    const productCatName = (p.categoryName || p.category?.name || '').toLowerCase().trim();
    const filterCatName = selectedCatFilter.toLowerCase().trim();
    const catId = p.category?._id;

    const matchesCat = (catId === selectedCatFilter) ||
      productCatName.includes(filterCatName) ||
      filterCatName.includes(productCatName);

    return matchesSearch && matchesCat;
  });

  if (sortBy === 'price_low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const totalCatPages = Math.ceil(filteredProducts.length / cataloguePerPage) || 1;
  const paginatedProducts = filteredProducts.slice((cataloguePage - 1) * cataloguePerPage, cataloguePage * cataloguePerPage);

  // Active Category Details Object
  const activeCategoryObj = STORE_OFFICIAL_CATEGORIES.find(
    c => c.name.toLowerCase() === selectedCatFilter.toLowerCase()
  );

  // Top store products for dynamic hero banners
  const featuredSpecialOfferProduct = products.find(p => (p.discountPrice > 0 && p.discountPrice > p.price)) || products[0];
  const featuredBestsellerProduct = products.find(p => p.stock > 0 && p !== featuredSpecialOfferProduct) || products[1] || products[0];

  // Status timeline helper
  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'Placed': return 1;
      case 'Confirmed': return 2;
      case 'Packed': return 3;
      case 'Shipped': return 4;
      case 'Delivered': return 5;
      default: return 1;
    }
  };

  const TRACKING_STEPS = [
    { key: 'Placed', label: 'Placed', icon: Clock, desc: 'Order Placed' },
    { key: 'Confirmed', label: 'Confirmed', icon: ShieldCheck, desc: 'Payment Verified' },
    { key: 'Packed', label: 'Packed', icon: Package, desc: 'Ready for Dispatch' },
    { key: 'Shipped', label: 'Shipped', icon: Truck, desc: 'In Transit' },
    { key: 'Delivered', label: 'Delivered', icon: Sparkles, desc: 'Delivered' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0B192C] selection:text-white flex flex-col justify-between">

      {/* ─────────────────────────────────────────────────────────────
          1. TOP MIDNIGHT NAVY ANNOUNCEMENT BANNER & NAVIGATION
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#060D1A] text-sky-300 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase py-2 sm:py-2.5 px-3 sm:px-4 text-center border-b border-slate-800 flex items-center justify-center gap-1.5 sm:gap-2">
        <Zap className="w-3.5 h-3.5 text-sky-400 animate-pulse shrink-0" />
        <span className="leading-snug">Free Express Delivery on Orders Over ₹1,499 | 100% Authentic BrandDNA Guarantee</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">

          {/* Brand Logo - BrandDNA */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => { setActiveTab('catalogue'); setSelectedCatFilter('ALL'); setCatalogueSearch(''); setSpecialFilterMode(''); setSelectedSubFilter(''); }}
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
          </div>

          {/* Center Navbar Links (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold tracking-widest uppercase text-slate-700">
            <Link to="/" className="hover:text-[#0B192C] transition-colors cursor-pointer">
              Home
            </Link>
            <Link to="/about" className="hover:text-[#0B192C] transition-colors cursor-pointer">
              About
            </Link>
            <button
              id="nav-catalog-btn"
              onClick={() => { setActiveTab('catalogue'); setSelectedCatFilter('ALL'); setCatalogueSearch(''); setSpecialFilterMode(''); setSelectedSubFilter(''); }}
              className={`hover:text-[#0B192C] transition-colors cursor-pointer ${activeTab === 'catalogue' && selectedCatFilter === 'ALL' && !catalogueSearch && !specialFilterMode ? 'text-[#0B192C] underline underline-offset-8 decoration-2 font-extrabold' : ''}`}
            >
              Catalog
            </button>

            <button
              id="nav-my-orders-btn"
              onClick={() => {
                if (requireLogin('view your orders')) return;
                setActiveTab('orders');
              }}
              className={`hover:text-[#0B192C] transition-colors cursor-pointer ${activeTab === 'orders' ? 'text-[#0B192C] underline underline-offset-8 decoration-2 font-extrabold' : ''}`}
            >
              My Orders {isAuthenticated ? `(${recentOrders.length})` : ''}
            </button>
            <button
              onClick={() => {
                if (requireLogin('view your wishlist')) return;
                setActiveTab('wishlist');
              }}
              className={`hover:text-[#0B192C] transition-colors cursor-pointer flex items-center gap-1 ${activeTab === 'wishlist' ? 'text-rose-500 underline underline-offset-8 decoration-2 font-extrabold' : ''}`}
            >
              <Heart className="w-3.5 h-3.5" /> Wishlist {isAuthenticated ? `(${wishlist.length})` : ''}
            </button>
          </nav>

          {/* Right Action Icons, Cart & Mobile Menu Toggle */}
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

            {/* Auth / Guest User Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-stone-200">
                {user?.role && user?.role !== 'customer' && (
                  <Link
                    to={getRoleRedirectPath(user?.role)}
                    className="px-3 py-1.5 rounded-full bg-[#E8F5E9] hover:bg-[#C4E1D4] text-[#0F382C] border border-[#A5D6A7] font-bold text-xs transition-all flex items-center gap-1 shadow-xs mr-1"
                    title={`Go to your ${user?.role} workspace`}
                  >
                    <span>Workspace</span>
                  </Link>
                )}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0B192C] text-white font-bold text-xs flex items-center justify-center border border-sky-600/40">
                  {(user?.fullName || profile?.fullName || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-slate-800">
                  {user?.fullName || profile?.fullName || 'Customer'}
                </span>
                <button
                  id="nav-logout-btn"
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
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

            {/* Mobile Navigation Drawer Hamburger Toggle Button */}
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
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between hover:bg-stone-100 text-slate-800"
                >
                  <span>Home</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between hover:bg-stone-100 text-slate-800"
                >
                  <span>About</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
                <button
                  onClick={() => {
                    setActiveTab('catalogue');
                    setSelectedCatFilter('ALL');
                    setCatalogueSearch('');
                    setSpecialFilterMode('');
                    setSelectedSubFilter('');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${activeTab === 'catalogue' && selectedCatFilter === 'ALL' && !catalogueSearch && !specialFilterMode
                      ? 'bg-[#0B192C] text-white'
                      : 'hover:bg-stone-100 text-slate-800'
                    }`}
                >
                  <span>Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (requireLogin('view your orders')) return;
                    setActiveTab('orders');
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${activeTab === 'orders'
                      ? 'bg-[#0B192C] text-white'
                      : 'hover:bg-stone-100 text-slate-800'
                    }`}
                >
                  <span>My Orders {isAuthenticated ? `(${recentOrders.length})` : ''}</span>
                  <Package className="w-3.5 h-3.5 text-sky-500" />
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (requireLogin('view your wishlist')) return;
                    setActiveTab('wishlist');
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between ${activeTab === 'wishlist'
                      ? 'bg-rose-500 text-white'
                      : 'hover:bg-stone-100 text-rose-600'
                    }`}
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


      {/* MAIN BODY AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">

        {/* ─────────────────────────────────────────────────────────────
            2. ULTRA-PREMIUM MIDNIGHT NAVY AI HERO EDITORIAL BANNER
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'catalogue' && selectedCatFilter === 'ALL' && !catalogueSearch && !specialFilterMode && (
          <section className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#060D1A] text-white min-h-[380px] sm:min-h-[460px] md:min-h-[500px] flex items-center p-6 sm:p-10 md:p-12 border border-slate-800">
            {/* AI Generated High-Fashion Background */}
            <img
              src="/images/branddna_hero_lifestyle.jpg"
              alt="BrandDNA Premium Lifestyle Hero"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060D1A] via-[#060D1A]/85 sm:via-[#060D1A]/80 to-transparent" />

            {/* Content Box */}
            <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-400/30 backdrop-blur-md flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sky-400" /> 2026 BrandDNA Performance Collection
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight sm:leading-[1.1] tracking-tight">
                Engineered for Excellence. Crafted for Life.
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-stone-300 font-medium leading-relaxed max-w-xl">
                Explore elite sports equipment, athletic footwear, and outdoor gear curated specifically from your live BrandDNA catalog.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-3">
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog-grid-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-sky-400 hover:bg-sky-300 text-[#060D1A] font-extrabold text-xs transition-all shadow-xl hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Explore Full Storefront</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('catalogue');
                    setSpecialFilterMode('special');
                    setCatalogueSearch('');
                    const el = document.getElementById('catalog-grid-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>View Special Offers</span>
                  <ArrowUpRight className="w-4 h-4 text-sky-300" />
                </button>
              </div>

              {/* Badges Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-5 sm:pt-6 border-t border-slate-800 max-w-lg text-[10px] sm:text-[11px] font-mono font-semibold text-stone-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" /> <span>100% Authentic Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400 shrink-0" /> <span>Razorpay Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-400 shrink-0" /> <span>Live Order Tracking</span>
                </div>
              </div>
            </div>
          </section>
        )}


        {/* ─────────────────────────────────────────────────────────────
            3. ULTRA-PREMIUM 6 OFFICIAL STORE CATEGORIES (WITH AI IMAGERY)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'catalogue' && selectedCatFilter === 'ALL' && !catalogueSearch && !specialFilterMode && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#0B192C] uppercase">Featured Collections</span>
                <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Official Store Categories <Sparkles className="w-5 h-5 text-[#2563EB]" />
                </h2>
              </div>
              <p className="text-xs text-slate-500">Click any collection card to explore specialized store products.</p>
            </div>

            {/* 6 Category Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STORE_OFFICIAL_CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => { setSelectedCatFilter(cat.name); setCataloguePage(1); setSelectedSubFilter(''); }}
                    className="relative h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-200/80 p-6 flex flex-col justify-between bg-slate-950 text-white"
                  >
                    {/* Category AI Visual Image */}
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Top Badge */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/30 flex items-center gap-1.5">
                        <IconComp className="w-3.5 h-3.5 text-sky-300" /> {cat.badge}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-sky-400 group-hover:text-slate-950 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Bottom Category Info & 3 Sub-product Pills */}
                    <div className="relative z-10 space-y-3">
                      <h3 className="font-serif text-2xl font-bold text-white group-hover:text-sky-300 transition-colors leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-stone-300 font-medium line-clamp-2 leading-relaxed">
                        {cat.tagline}
                      </p>

                      {/* 3 Sub-product pills preview */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {cat.subProducts.map((sub, i) => (
                          <span key={i} className="text-[10px] font-bold bg-white/20 backdrop-blur-md text-sky-200 px-2.5 py-1 rounded-lg border border-white/20">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}


        {/* ─────────────────────────────────────────────────────────────
            4. DYNAMIC SPECIAL OFFER & BESTSELLER SPLIT SHOWCASE CARDS
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'catalogue' && selectedCatFilter === 'ALL' && !catalogueSearch && !specialFilterMode && featuredSpecialOfferProduct && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT BANNER: SPECIAL OFFER */}
            <div className="relative rounded-[32px] overflow-hidden group border border-slate-800 shadow-2xl p-6 sm:p-8 text-white bg-gradient-to-br from-[#060D1A] via-[#0B192C] to-[#1E3E62] flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Left Content Area */}
              <div className="space-y-4 flex-1 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-extrabold tracking-widest uppercase bg-rose-600/90 text-white px-3 py-1 rounded-full border border-rose-400/40 flex items-center gap-1 shadow-md">
                    <Flame className="w-3 h-3 fill-current" /> Special Offer
                  </span>
                  {featuredSpecialOfferProduct.brand && (
                    <span className="text-[10px] font-mono font-bold text-sky-300 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20">
                      {featuredSpecialOfferProduct.brand}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight capitalize tracking-tight">
                  {featuredSpecialOfferProduct.name}
                </h3>

                <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-300 line-clamp-2">
                  {featuredSpecialOfferProduct.description || 'Special store offer on authentic products from our BrandDNA catalog.'}
                </p>

                <div className="flex items-center gap-1 text-amber-400 text-xs pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-white ml-1.5">4.9</span>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div>
                    <span className="text-2xl font-black text-white block">₹{featuredSpecialOfferProduct.price?.toLocaleString('en-IN')}</span>
                    {featuredSpecialOfferProduct.discountPrice > 0 && (
                      <span className="text-xs text-sky-300 line-through">₹{featuredSpecialOfferProduct.discountPrice?.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/customer/product/${featuredSpecialOfferProduct._id}`)}
                    className="ml-auto px-5 py-3 rounded-2xl bg-white hover:bg-sky-50 text-[#0B192C] font-extrabold text-xs transition-all shadow-xl hover:scale-105 cursor-pointer flex items-center gap-2"
                  >
                    <span>View Product</span>
                    <ArrowRight className="w-4 h-4 text-[#0B192C]" />
                  </button>
                </div>
              </div>

              {/* Right Dedicated Studio Pedestal */}
              <div
                onClick={() => navigate(`/customer/product/${featuredSpecialOfferProduct._id}`)}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-b from-slate-100 via-white to-slate-100 p-4 flex items-center justify-center relative shrink-0 shadow-2xl border border-white/30 group-hover:scale-105 transition-transform duration-500 overflow-hidden cursor-pointer"
              >
                <div className="absolute w-36 h-36 rounded-full bg-sky-400/20 blur-xl" />
                <img
                  src={featuredSpecialOfferProduct.images?.[0] || '/images/cat_workout_essentials.jpg'}
                  alt={featuredSpecialOfferProduct.name}
                  className="max-h-44 object-contain drop-shadow-2xl z-10"
                />
              </div>
            </div>

            {/* RIGHT BANNER: BESTSELLERS */}
            {featuredBestsellerProduct && (
              <div className="relative rounded-[32px] overflow-hidden group border border-slate-700 shadow-2xl p-6 sm:p-8 text-white bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0B192C] flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Left Content Area */}
                <div className="space-y-4 flex-1 z-10">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-extrabold tracking-widest uppercase bg-sky-500/90 text-[#060D1A] px-3 py-1 rounded-full border border-sky-300/40 flex items-center gap-1 shadow-md">
                      <Trophy className="w-3 h-3 text-[#060D1A]" /> Bestseller
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-300/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Top Rated
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight capitalize tracking-tight">
                    {featuredBestsellerProduct.name}
                  </h3>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-sky-100 line-clamp-2">
                    {featuredBestsellerProduct.description || 'Our customer favorite item — refined, durable, and engineered for peak demand.'}
                  </p>

                  <div className="flex items-center gap-1 text-amber-400 text-xs pt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-white ml-1.5">5.0</span>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-2xl font-black text-white block">₹{featuredBestsellerProduct.price?.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => navigate(`/customer/product/${featuredBestsellerProduct._id}`)}
                      className="ml-auto px-5 py-3 rounded-2xl bg-sky-400 hover:bg-sky-300 text-[#060D1A] font-extrabold text-xs transition-all shadow-xl hover:scale-105 cursor-pointer flex items-center gap-2"
                    >
                      <span>Shop Bestseller</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Dedicated Studio Pedestal */}
                <div
                  onClick={() => navigate(`/customer/product/${featuredBestsellerProduct._id}`)}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-b from-slate-100 via-white to-slate-100 p-4 flex items-center justify-center relative shrink-0 shadow-2xl border border-white/30 group-hover:scale-105 transition-transform duration-500 overflow-hidden cursor-pointer"
                >
                  <div className="absolute w-36 h-36 rounded-full bg-indigo-400/20 blur-xl" />
                  <img
                    src={featuredBestsellerProduct.images?.[0] || '/images/cat_shoes.jpg'}
                    alt={featuredBestsellerProduct.name}
                    className="max-h-44 object-contain drop-shadow-2xl z-10"
                  />
                </div>
              </div>
            )}

          </section>
        )}


        {/* ─────────────────────────────────────────────────────────────
            5. STOREFRONT CATALOG GRID & SUBCATEGORY TAG FILTERS
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'catalogue' && (
          <section id="catalog-grid-section" className="space-y-8">

            {/* Category Filter Pills Row */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold tracking-widest text-slate-900 uppercase">Browse Categories</h2>
                <span className="text-xs text-slate-400 font-mono">Showing {filteredProducts.length} store items</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => { setSelectedCatFilter('ALL'); setCataloguePage(1); setSelectedSubFilter(''); }}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all cursor-pointer shrink-0 border ${selectedCatFilter === 'ALL'
                      ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#0B192C]'
                    }`}
                >
                  All Products
                </button>

                {STORE_OFFICIAL_CATEGORIES.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedCatFilter.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCatFilter(cat.name); setCataloguePage(1); setSelectedSubFilter(''); }}
                      className={`px-4.5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all cursor-pointer shrink-0 border flex items-center gap-2 ${isSelected
                          ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#0B192C]'
                        }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-300' : 'text-slate-500'}`} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-category Quick Filter Tags Row (If a specific category is active) */}
              {activeCategoryObj && (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                    Filter by {activeCategoryObj.name} Sub-Products:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSubFilter('')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${!selectedSubFilter ? 'bg-[#0B192C] text-white' : 'bg-white text-slate-700 border border-stone-200 hover:border-[#0B192C]'
                        }`}
                    >
                      All {activeCategoryObj.name}
                    </button>
                    {activeCategoryObj.subProducts.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => { setSelectedSubFilter(sub); setCataloguePage(1); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${selectedSubFilter === sub ? 'bg-[#0B192C] text-white font-bold' : 'bg-white text-slate-700 border border-stone-200 hover:border-[#0B192C]'
                          }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Special Mode Announcement Banners */}
            {specialFilterMode === 'special' && (
              <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-sky-500/10 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Special Promotional Offers</h3>
                    <p className="text-[11px] text-slate-500">Showing discounted & promotional gear from our live catalog ({filteredProducts.length} available).</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSpecialFilterMode(''); setCatalogueSearch(''); }}
                  className="px-3.5 py-1.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  Show All Products
                </button>
              </div>
            )}

            {specialFilterMode === 'bestseller' && (
              <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 border border-sky-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Top Bestsellers & Featured Gear</h3>
                    <p className="text-[11px] text-slate-500">Popular athletic equipment and performance gear ({filteredProducts.length} items in stock).</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSpecialFilterMode(''); setCatalogueSearch(''); }}
                  className="px-3.5 py-1.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  Show All Products
                </button>
              </div>
            )}

            {/* Search, Filter & Sort Control Bar */}
            <div className="bg-stone-50 rounded-2xl p-3 sm:p-4 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs shadow-2xs">
              <div className="relative flex-1 max-w-md w-full">
                <input
                  type="text"
                  value={catalogueSearch}
                  onChange={(e) => {
                    setCatalogueSearch(e.target.value);
                    setSpecialFilterMode('');
                    setCataloguePage(1);
                  }}
                  placeholder="Search products by brand, title, description or SKU..."
                  className="w-full bg-white border border-stone-200 text-slate-900 rounded-xl px-3.5 py-2.5 pl-9 outline-none focus:border-[#0B192C] font-medium shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {catalogueSearch && (
                  <button
                    onClick={() => {
                      setCatalogueSearch('');
                      setSpecialFilterMode('');
                    }}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <select
                  value={selectedCatFilter}
                  onChange={(e) => { setSelectedCatFilter(e.target.value); setCataloguePage(1); setSelectedSubFilter(''); }}
                  className="bg-white border border-stone-200 text-slate-800 rounded-xl px-2.5 sm:px-3.5 py-2.5 outline-none font-medium cursor-pointer shadow-2xs w-full text-xs"
                >
                  <option value="ALL">All Categories</option>
                  {STORE_OFFICIAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCataloguePage(1); }}
                  className="bg-white border border-stone-200 text-slate-800 rounded-xl px-2.5 sm:px-3.5 py-2.5 outline-none font-medium cursor-pointer shadow-2xs w-full text-xs"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Dynamic Product Cards Grid (Ultra-Premium Boutique Cards) */}
            {loading && paginatedProducts.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((sk) => (
                  <div key={sk} className="bg-white rounded-[32px] border border-stone-200/80 p-6 space-y-4 animate-pulse">
                    <div className="h-64 bg-slate-100 rounded-2xl" />
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-10 bg-slate-200 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="bg-stone-50 rounded-3xl p-16 text-center border border-stone-200 text-xs text-slate-500 space-y-4 shadow-2xs">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-serif text-base font-bold text-slate-800">No products match your search or filter selection.</p>
                <p className="text-xs text-slate-500">Try clearing your category filter or searching for another item.</p>
                <button
                  onClick={() => {
                    setSelectedCatFilter('ALL');
                    setCatalogueSearch('');
                    setSpecialFilterMode('');
                    setSelectedSubFilter('');
                    fetchCustomerData();
                  }}
                  className="px-6 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-full font-bold text-xs cursor-pointer shadow-md transition-all"
                >
                  Clear All Filters & Reload
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product) => {
                  const hasDiscount = product.discountPrice > 0 && product.discountPrice > product.price;
                  const savings = hasDiscount ? product.discountPrice - product.price : 0;
                  const discountPercent = hasDiscount ? Math.round((savings / product.discountPrice) * 100) : 0;

                  // Spec tags based on category or name
                  const catName = (product.categoryName || product.category?.name || '').toLowerCase();
                  let specBadge = 'Pro Series';
                  if (catName.includes('workout') || catName.includes('gym')) specBadge = 'Heavy Duty';
                  else if (catName.includes('hiking') || catName.includes('trekking')) specBadge = 'All-Weather';
                  else if (catName.includes('shoes')) specBadge = 'Responsive Cushioning';
                  else if (catName.includes('bags')) specBadge = 'Waterproof Reinforced';
                  else if (catName.includes('nutrition')) specBadge = '100% Pure Formula';

                  return (
                    <div
                      key={product._id}
                      id={`product-card-${product._id}`}
                      className="bg-white rounded-[32px] border border-stone-200/90 hover:border-[#1E3E62] shadow-sm hover:shadow-[0_25px_60px_-15px_rgba(11,25,44,0.22)] hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div>
                        {/* Ultra-Premium Product Image Studio Stage */}
                        <div
                          className="h-80 bg-gradient-to-b from-[#0B192C]/[0.03] via-slate-50/80 to-white relative cursor-pointer p-6 flex flex-col items-center justify-center overflow-hidden rounded-t-[32px]"
                          onClick={() => navigate(`/customer/product/${product._id}`)}
                        >
                          {/* Radial Studio Lighting Backdrop */}
                          <div className="absolute w-44 h-44 rounded-full bg-sky-400/10 blur-2xl group-hover:bg-sky-400/25 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

                          {/* Reflective Pedestal Ellipse */}
                          <div className="absolute bottom-6 w-32 h-2.5 bg-[#0B192C]/10 rounded-full blur-sm group-hover:w-44 group-hover:bg-sky-500/25 group-hover:blur-md transition-all duration-500" />

                          {/* Product Image */}
                          <img
                            src={product.images?.[0] || '/images/cat_workout_essentials.jpg'}
                            alt={product.name}
                            className="max-h-60 object-contain group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-out z-10 drop-shadow-md group-hover:drop-shadow-2xl"
                          />

                          {/* Top Badges Overlay */}
                          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-10">
                            {product.brand && (
                              <span className="px-3 py-1 rounded-full text-[9px] font-mono font-extrabold tracking-widest uppercase bg-[#0B192C] text-white shadow-md backdrop-blur-md border border-sky-400/30">
                                {product.brand}
                              </span>
                            )}
                            {hasDiscount && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white shadow-md shadow-rose-500/20 flex items-center gap-1">
                                <Flame className="w-3 h-3 fill-current" /> {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 items-end">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-2xs border border-stone-200 backdrop-blur-md">
                              {product.categoryName || product.category?.name || 'Store Item'}
                            </span>
                            <button
                              onClick={(e) => handleToggleWishlist(product, e)}
                              className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors border border-stone-200/50 cursor-pointer"
                            >
                              <Heart className={`w-4 h-4 ${wishlist.includes(product._id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500 transition-colors'}`} />
                            </button>
                          </div>

                          {/* Floating Glass Quick Action Bar on Hover */}
                          <div className="absolute bottom-5 inset-x-6 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/customer/product/${product._id}`);
                              }}
                              className="w-full py-2.5 rounded-full bg-white/95 hover:bg-[#0B192C] text-slate-900 hover:text-white font-bold text-xs shadow-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-200 hover:border-sky-500"
                            >
                              <Eye className="w-4 h-4 text-sky-500 group-hover:text-sky-300" />
                              <span>View Product Details</span>
                            </button>
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-6 space-y-3">
                          {/* Stock Status & SKU Bar */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">
                              SKU: {product.sku || 'BDNA-PRO'}
                            </span>
                            <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 ${product.stock > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                            </span>
                          </div>

                          {/* Star Ratings & Verified Badge */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-amber-400 text-xs">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                              ))}
                              <span className="text-[11px] font-bold text-slate-800 ml-1.5">4.9</span>
                              <span className="text-[10px] text-slate-400 font-medium">(128)</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {specBadge}
                            </span>
                          </div>

                          {/* Product Title */}
                          <h3
                            onClick={() => navigate(`/customer/product/${product._id}`)}
                            className="font-serif text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#0B192C] cursor-pointer transition-colors line-clamp-1 capitalize"
                          >
                            {product.name}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {product.description || 'Authentic store product engineered for peak athletic & outdoor performance.'}
                          </p>
                        </div>
                      </div>

                      {/* Pricing & Full Action Bar */}
                      <div className="p-6 pt-0 border-t border-stone-100/90 mt-2 space-y-3.5">
                        <div className="flex items-end justify-between pt-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider font-mono">Retail Price</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-slate-900">₹{product.price?.toLocaleString('en-IN')}</span>
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through font-semibold">₹{product.discountPrice?.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>

                          {hasDiscount && (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                              <Tag className="w-3 h-3 text-emerald-600" /> Save ₹{savings?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => navigate(`/customer/product/${product._id}`)}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] hover:from-[#1E3E62] hover:to-[#0B192C] text-white font-extrabold text-xs transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group/btn border border-sky-900/40"
                        >
                          <span>View Product & Buying Options</span>
                          <ArrowRight className="w-4 h-4 text-sky-300 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
              <button
                onClick={() => setCataloguePage((p) => Math.max(1, p - 1))}
                disabled={cataloguePage === 1}
                className="px-3.5 py-2 bg-white hover:bg-stone-100 disabled:opacity-40 text-slate-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer border border-stone-200 shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="text-slate-600 font-medium">Page {cataloguePage} of {totalCatPages}</span>
              <button
                onClick={() => setCataloguePage((p) => Math.min(totalCatPages, p + 1))}
                disabled={cataloguePage === totalCatPages}
                className="px-3.5 py-2 bg-white hover:bg-stone-100 disabled:opacity-40 text-slate-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer border border-stone-200 shadow-2xs"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </section>
        )}


        {/* ─────────────────────────────────────────────────────────────
            6. MY ORDERS & LIVE 5-STEP ORDER TIMELINE
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">BrandDNA Order History & Tracking</h2>
                <p className="text-xs text-slate-500">Track your order progress and review purchase details.</p>
              </div>
              <button
                onClick={() => setActiveTab('catalogue')}
                className="px-4 py-2 bg-[#0B192C] text-white rounded-xl text-xs font-bold hover:bg-[#1E3E62] cursor-pointer"
              >
                Back to Storefront
              </button>
            </div>

            {loading && recentOrders.length === 0 ? (
              <div className="space-y-6">
                {[1, 2, 3].map((sk) => (
                  <div key={sk} className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                      <div className="h-5 bg-slate-200 rounded w-1/4" />
                      <div className="h-6 bg-slate-200 rounded w-1/6" />
                    </div>
                    <div className="h-20 bg-slate-100 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="bg-stone-50 rounded-2xl p-12 text-center border border-stone-200 text-xs text-slate-500 space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">No orders placed yet.</p>
                <button
                  onClick={() => setActiveTab('catalogue')}
                  className="px-5 py-2.5 bg-[#0B192C] text-white rounded-xl font-bold cursor-pointer hover:bg-[#1E3E62]"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {recentOrders.map((order) => {
                  const stepIndex = getStatusStepIndex(order.status);
                  return (
                    <div
                      key={order._id}
                      id={`order-card-${order._id}`}
                      className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm p-6 sm:p-8 space-y-7 hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="font-mono font-black text-slate-900 text-sm sm:text-base tracking-tight break-all">{order.orderNumber || order._id}</span>
                            <span className={`px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold shadow-2xs ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                              {order.paymentStatus || 'Paid'} via {order.paymentMethod?.toUpperCase() || 'RAZORPAY'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 self-stretch sm:self-auto">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Total</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Premium Live Tracking Timeline & Action Bar */}
                      <div className="bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100/60 rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="uppercase tracking-widest text-[11px] font-black text-slate-800">Automatic Shipment Tracking</span>
                            {order.trackingNumber && (
                              <span className="font-mono bg-stone-200/80 px-2 py-0.5 rounded-md text-[10px] text-slate-700 truncate max-w-[130px] sm:max-w-none">
                                {order.trackingNumber}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-indigo-900 bg-sky-100/90 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold border border-sky-300/80 shadow-2xs flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span>{order.shipmentProvider || 'SwiftExpress Courier'}</span>
                              <span className="text-slate-400">|</span>
                              <span className="text-emerald-700">{order.shipmentStatusText || order.shipmentStatus || 'ORDER_PLACED'}</span>
                            </span>
                            <button
                              onClick={() => handleOpenTrackModal(order)}
                              className="px-3.5 sm:px-4 py-1.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-full text-[11px] font-extrabold cursor-pointer flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                            >
                              <Truck className="w-3.5 h-3.5 text-sky-300" />
                              <span>Track Order</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick 7-step Status Progress Bar */}
                        <div className="relative pt-4 pb-1 px-2">
                          <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-700 pb-2">
                            <span>Shipment Progress ({order.shipmentStatusText || 'Order Placed'})</span>
                            {order.estimatedDelivery && (
                              <span className="text-slate-500">Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-sky-500 via-emerald-500 to-[#0B192C] h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${(order.shipmentStatusText?.toUpperCase() === 'DELIVERED' || order.shipmentStatus?.toUpperCase() === 'DELIVERED') ? 100 :
                                    (order.shipmentStatusText?.toUpperCase() === 'OUT_FOR_DELIVERY' || order.shipmentStatus?.toUpperCase() === 'OUT_FOR_DELIVERY') ? 85 :
                                      (order.shipmentStatusText?.toUpperCase() === 'ARRIVED_AT_HUB' || order.shipmentStatus?.toUpperCase() === 'ARRIVED_AT_HUB') ? 70 :
                                        (order.shipmentStatusText?.toUpperCase() === 'IN_TRANSIT' || order.shipmentStatus?.toUpperCase() === 'IN_TRANSIT') ? 55 :
                                          (order.shipmentStatusText?.toUpperCase() === 'PICKED_UP' || order.shipmentStatus?.toUpperCase() === 'PICKED_UP') ? 40 :
                                            (order.shipmentStatusText?.toUpperCase() === 'ORDER_CONFIRMED' || order.shipmentStatus?.toUpperCase() === 'ORDER_CONFIRMED') ? 25 : 10
                                  }%`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Items Showcase with Studio Large Image Pedestals */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                          Purchased Items ({order.items?.length || 1})
                        </span>
                        <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-3xl bg-slate-50/40 p-4 sm:p-6 space-y-4">
                          {order.items?.map((item, idx) => {
                            const itemImg = item.productImage || item.product?.images?.[0] || '/images/cat_workout_essentials.jpg';
                            const itemPrice = item.unitPrice || item.product?.price || 0;
                            const totalItemPrice = item.totalPrice || (itemPrice * item.quantity) || order.totalAmount;

                            return (
                              <div key={idx} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                  {/* Large Studio Product Image Frame */}
                                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-stone-100 p-3 flex items-center justify-center border border-stone-200/90 shadow-md shrink-0 overflow-hidden group hover:border-sky-300 transition-all">
                                    <img
                                      src={itemImg}
                                      alt={item.productName || item.product?.name || 'Ordered Item'}
                                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>

                                  {/* Product Details */}
                                  <div className="space-y-1.5 min-w-0">
                                    <span className="inline-block bg-sky-50 text-indigo-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-sky-200/70 uppercase tracking-wider">
                                      BrandDNA Original
                                    </span>
                                    <p className="font-serif font-extrabold text-slate-900 text-base sm:text-xl leading-snug capitalize truncate">
                                      {item.productName || item.product?.name || 'Store Product'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                      <span>Quantity: <strong className="text-slate-900 font-extrabold text-sm">{item.quantity}</strong></span>
                                      <span>•</span>
                                      <span>Price: <strong className="text-slate-800 font-bold">₹{itemPrice.toLocaleString('en-IN')}</strong></span>
                                      {item.size && (
                                        <>
                                          <span>•</span>
                                          <span>Size: <strong className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-mono font-bold text-xs">{item.size}</strong></span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Line Total & Per-Product Return Action */}
                                <div className="flex flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-stone-100 pt-3 sm:pt-0 gap-3 shrink-0">
                                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Price</span>
                                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                      ₹{totalItemPrice?.toLocaleString('en-IN')}
                                    </span>
                                  </div>

                                  {/* Product-Level Return Policy & Eligibility Display */}
                                  {(() => {
                                    const isDelivered =
                                      order.status === 'Delivered' ||
                                      order.status === 'DELIVERED' ||
                                      order.shipmentStatusText?.toUpperCase() === 'DELIVERED' ||
                                      order.shipmentStatus?.toUpperCase() === 'DELIVERED';

                                    // Rule: Do not show return options for unpaid, cancelled, undelivered, or ineligible orders
                                    if (!isDelivered || order.paymentStatus !== 'Paid') {
                                      return null;
                                    }

                                    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
                                    const deliveryTimestamp = order.deliveredAt ? new Date(order.deliveredAt).getTime() : null;
                                    const returnDeadline = deliveryTimestamp ? new Date(deliveryTimestamp + SEVEN_DAYS_MS) : null;
                                    const now = Date.now();
                                    const isExpired = !deliveryTimestamp || now > (deliveryTimestamp + SEVEN_DAYS_MS);

                                    // If 7 days expired or no valid delivery timestamp
                                    if (isExpired) {
                                      return (
                                        <div className="flex flex-col sm:items-end gap-1">
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-stone-100 text-stone-600 border border-stone-200">
                                            Return period expired (7 days)
                                          </span>
                                          {order.deliveredAt && (
                                            <span className="text-[10px] text-stone-400 font-medium">
                                              Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    }

                                    const prodId = (item.product?._id || item.product).toString();
                                    const itemReturns = customerReturns.filter(
                                      (r) =>
                                        (r.order?._id || r.order)?.toString() === order._id.toString() &&
                                        (r.product?._id || r.product)?.toString() === prodId &&
                                        !['REJECTED', 'Rejected'].includes(r.status)
                                    );

                                    const alreadyReturnedQty = itemReturns.reduce((sum, r) => sum + (r.quantity || 0), 0);
                                    const remainingReturnable = Math.max(0, item.quantity - alreadyReturnedQty);
                                    const latestReturn = itemReturns[itemReturns.length - 1];

                                    if (remainingReturnable <= 0) {
                                      return (
                                        <div className="flex flex-col sm:items-end gap-1">
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                                            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                            <span>Return {latestReturn?.status?.replace('_', ' ') || 'Requested'}</span>
                                            <span className="text-amber-700 font-mono">({latestReturn?.quantity || item.quantity} unit{item.quantity > 1 ? 's' : ''})</span>
                                          </span>
                                          {latestReturn?.refundStatus === 'Processed' && (
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                              Refund Processed: ₹{latestReturn?.refundDetails?.amount || latestReturn?.refundAmount}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="flex flex-col sm:items-end gap-1">
                                        <button
                                          onClick={() => {
                                            setSelectedProductForReturn({
                                              order,
                                              item,
                                              remainingReturnable,
                                              deliveredAt: order.deliveredAt,
                                              returnDeadline,
                                            });
                                            setReturnQuantity(1);
                                          }}
                                          className="px-3.5 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow active:scale-95"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5 text-sky-300" />
                                          <span>Return Product</span>
                                        </button>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                          Window ends: {returnDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        {alreadyReturnedQty > 0 && (
                                          <span className="text-[10px] text-amber-700 font-medium">
                                            ({alreadyReturnedQty} returned, {remainingReturnable} remaining)
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            7. MY WISHLIST
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'wishlist' && (
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> My Wishlist
                </h2>
                <p className="text-xs text-slate-500">Your saved products for later.</p>
              </div>
              <button
                onClick={() => setActiveTab('catalogue')}
                className="px-4 py-2 bg-[#0B192C] text-white rounded-xl text-xs font-bold hover:bg-[#1E3E62] cursor-pointer"
              >
                Back to Storefront
              </button>
            </div>

            {(() => {
              const wishlistedProducts = products.filter(p => wishlist.includes(p._id));
              if (wishlistedProducts.length === 0) {
                return (
                  <div className="bg-stone-50 rounded-3xl p-16 text-center border border-stone-200 text-xs text-slate-500 space-y-4 shadow-2xs">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="font-serif text-base font-bold text-slate-800">Your wishlist is empty.</p>
                    <p className="text-xs text-slate-500">Explore our catalog and save your favorite products.</p>
                    <button
                      onClick={() => setActiveTab('catalogue')}
                      className="px-6 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-full font-bold text-xs cursor-pointer shadow-md transition-all"
                    >
                      Explore Products
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {wishlistedProducts.map((product) => {
                    const hasDiscount = product.discountPrice > 0 && product.discountPrice > product.price;
                    const savings = hasDiscount ? product.discountPrice - product.price : 0;
                    const discountPercent = hasDiscount ? Math.round((savings / product.discountPrice) * 100) : 0;
                    const specBadge = 'Pro Series';

                    return (
                      <div
                        key={product._id}
                        className="bg-white rounded-[32px] border border-stone-200/90 hover:border-[#1E3E62] shadow-sm hover:shadow-[0_25px_60px_-15px_rgba(11,25,44,0.22)] hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div>
                          <div
                            className="h-80 bg-gradient-to-b from-[#0B192C]/[0.03] via-slate-50/80 to-white relative cursor-pointer p-6 flex flex-col items-center justify-center overflow-hidden rounded-t-[32px]"
                            onClick={() => navigate(`/customer/product/${product._id}`)}
                          >
                            <img
                              src={product.images?.[0] || '/images/cat_workout_essentials.jpg'}
                              alt={product.name}
                              className="max-h-60 object-contain group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-out z-10 drop-shadow-md group-hover:drop-shadow-2xl"
                            />
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 items-end">
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-2xs border border-stone-200 backdrop-blur-md">
                                {product.categoryName || product.category?.name || 'Store Item'}
                              </span>
                              <button
                                onClick={(e) => handleToggleWishlist(product, e)}
                                className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors border border-stone-200/50 cursor-pointer"
                              >
                                <Heart className={`w-4 h-4 ${wishlist.includes(product._id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500 transition-colors'}`} />
                              </button>
                            </div>
                          </div>
                          <div className="p-6 space-y-3">
                            <h3
                              onClick={() => navigate(`/customer/product/${product._id}`)}
                              className="font-serif text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#0B192C] cursor-pointer transition-colors line-clamp-1 capitalize"
                            >
                              {product.name}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                              {product.description || 'Authentic store product engineered for peak athletic & outdoor performance.'}
                            </p>
                          </div>
                        </div>
                        <div className="p-6 pt-0 border-t border-stone-100/90 mt-2 space-y-3.5">
                          <div className="flex items-end justify-between pt-4">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider font-mono">Retail Price</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-900">₹{product.price?.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] hover:from-[#1E3E62] hover:to-[#0B192C] text-white font-extrabold text-xs transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4 text-sky-300" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </section>
        )}

      </main>


      {/* ─────────────────────────────────────────────────────────────
          7. SLIDE-OUT SHOPPING CART & CHECKOUT DRAWER
         ───────────────────────────────────────────────────────────── */}
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

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
              >
                {/* Cart Drawer Header */}
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#0B192C]" />
                    <h2 className="font-serif text-lg font-bold text-slate-900">BrandDNA Shopping Cart</h2>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-3 text-slate-400">
                      <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-600 text-sm">Your cart is empty.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="px-5 py-2.5 bg-[#0B192C] text-white rounded-xl text-xs font-bold hover:bg-[#1E3E62] cursor-pointer"
                      >
                        Explore Store Items
                      </button>
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
                            <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
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
                            <button
                              onClick={() => removeFromCart(item.product._id, item.size)}
                              className="text-slate-400 hover:text-rose-600 transition-colors mt-2 cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shipping Address Inputs */}
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

                      {/* Payment Method Selector */}
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

                {/* Cart Bottom Checkout Panel */}
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
                      className="w-full py-3 bg-[#0B192C] hover:bg-[#1E3E62] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
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


      {/* ─────────────────────────────────────────────────────────────
          8. PRODUCT DETAILS QUICK-VIEW MODAL (ULTRA-PREMIUM SHOWCASE)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProductDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D1A]/80 backdrop-blur-md font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="bg-white rounded-[36px] max-w-3xl w-full p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden border border-slate-200"
            >
              {/* Top Accent Header Bar */}
              <div className="bg-[#060D1A] text-sky-300 px-6 py-3 -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-6 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Dna className="w-4 h-4 text-sky-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">BrandDNA Official Product Showcase</span>
                </div>
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Column: Studio Stage Backdrop & Image */}
                <div className="h-80 sm:h-96 bg-gradient-to-b from-[#0B192C]/[0.05] via-slate-50 to-white rounded-3xl p-8 flex flex-col items-center justify-center relative border border-stone-200/80 overflow-hidden group">
                  <div className="absolute w-48 h-48 rounded-full bg-sky-400/15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
                  <img
                    src={selectedProductDetails.images?.[0] || '/images/cat_workout_essentials.jpg'}
                    alt={selectedProductDetails.name}
                    className="max-h-64 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500 z-10"
                  />
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-4 text-[10px] font-mono font-bold text-slate-500 bg-white/90 backdrop-blur-md py-1.5 px-3 rounded-full border border-stone-200 shadow-2xs z-10">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> 100% Authentic</span>
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-sky-600" /> Express Delivery</span>
                  </div>
                </div>

                {/* Right Column: High-End Details & Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {selectedProductDetails.brand ? (
                      <span className="px-3 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-widest bg-[#0B192C] text-white border border-sky-400/30">
                        {selectedProductDetails.brand}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-widest bg-sky-50 text-indigo-700 border border-sky-200">
                        BrandDNA Selection
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-slate-500 bg-stone-100 px-3 py-1 rounded-full font-mono">
                      SKU: {selectedProductDetails.sku || 'BDNA-SPEC'}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {selectedProductDetails.name}
                  </h3>

                  {/* Rating Stars & Stock Beacon */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                      ))}
                      <span className="text-xs font-bold text-slate-900 ml-1.5">4.9 / 5.0</span>
                    </div>

                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${selectedProductDetails.stock > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedProductDetails.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {selectedProductDetails.stock > 0 ? `In Stock (${selectedProductDetails.stock} units)` : 'Out of Stock'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {selectedProductDetails.description || 'Authentic store item engineered specifically for peak performance, durability, and ergonomic perfection.'}
                  </p>

                  {/* Feature Checkmarks List */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Premium Grade Materials
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> 30-Day Return Guarantee
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Razorpay Secured Payment
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Live Tracking Status
                    </div>
                  </div>

                  {/* Price Header */}
                  <div className="flex items-baseline gap-3 pt-2">
                    <span className="text-3xl font-black text-slate-900">₹{selectedProductDetails.price?.toLocaleString('en-IN')}</span>
                    {selectedProductDetails.discountPrice > 0 && selectedProductDetails.discountPrice > selectedProductDetails.price && (
                      <span className="text-base text-slate-400 line-through font-semibold">₹{selectedProductDetails.discountPrice?.toLocaleString('en-IN')}</span>
                    )}
                    {selectedProductDetails.discountPrice > 0 && selectedProductDetails.discountPrice > selectedProductDetails.price && (
                      <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        Save ₹{(selectedProductDetails.discountPrice - selectedProductDetails.price)?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Quick View Size Selector */}
                  {(() => {
                    const qvSizes = selectedProductDetails.sizes && selectedProductDetails.sizes.length > 0
                      ? selectedProductDetails.sizes
                      : getDefaultSizesForCategory(selectedProductDetails.categoryName || selectedProductDetails.category?.name || '');
                    const currentChosenSize = quickViewSelectedSize || (qvSizes.length > 0 ? qvSizes[0] : 'Standard');

                    return (
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold uppercase tracking-wider text-slate-700">Choose Size:</span>
                          <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 text-[11px]">
                            Selected: {currentChosenSize}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {qvSizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setQuickViewSelectedSize(sz)}
                              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${currentChosenSize === sz
                                  ? 'bg-[#0B192C] text-white ring-2 ring-[#0B192C] ring-offset-1 shadow-sm'
                                  : 'bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200'
                                }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Actions */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => {
                        const qvSizes = selectedProductDetails.sizes && selectedProductDetails.sizes.length > 0
                          ? selectedProductDetails.sizes
                          : getDefaultSizesForCategory(selectedProductDetails.categoryName || selectedProductDetails.category?.name || '');
                        addToCart(selectedProductDetails, quickViewSelectedSize || qvSizes[0]);
                      }}
                      disabled={selectedProductDetails.stock <= 0}
                      className="w-full sm:flex-1 py-3.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-slate-900 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-300"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-700" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => {
                        const qvSizes = selectedProductDetails.sizes && selectedProductDetails.sizes.length > 0
                          ? selectedProductDetails.sizes
                          : getDefaultSizesForCategory(selectedProductDetails.categoryName || selectedProductDetails.category?.name || '');
                        addToCart(selectedProductDetails, quickViewSelectedSize || qvSizes[0]);
                        setSelectedProductDetails(null);
                        setIsCartOpen(true);
                      }}
                      disabled={selectedProductDetails.stock <= 0}
                      className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] hover:from-[#1E3E62] hover:to-[#0B192C] disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-sky-900/40"
                    >
                      <Zap className="w-4 h-4 text-sky-300" />
                      <span>Buy Now & Checkout</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─────────────────────────────────────────────────────────────
          9. RAZORPAY INTERACTIVE TEST PAYMENT MODAL
         ───────────────────────────────────────────────────────────── */}
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
                <button
                  onClick={() => setRazorpayTestModalData(null)}
                  className="text-slate-400 hover:text-white"
                >
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
                  onClick={() => {
                    addToast('Payment cancelled by user', 'info');
                    setRazorpayTestModalData(null);
                  }}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─────────────────────────────────────────────────────────────
          10. CONFIRMED ORDER SUCCESS MODAL
         ───────────────────────────────────────────────────────────── */}
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

              <div className="p-4 bg-stone-50 rounded-2xl text-xs space-y-1 text-slate-700 font-medium">
                <p>Total Paid: <span className="font-bold text-slate-900">₹{confirmedOrderModal.totalAmount}</span></p>
                <p>Status: <span className="font-bold text-[#1E3E62]">Confirmed</span></p>
              </div>

              <button
                onClick={() => setConfirmedOrderModal(null)}
                className="w-full py-3 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Track My Order Progress
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─────────────────────────────────────────────────────────────
          11. STRICT 7-DAY PRODUCT RETURN REQUEST MODAL
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProductForReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedProductForReturn(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <RotateCcw className="w-3 h-3 text-emerald-600" /> 7-Day Return Policy
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">Request Product Return</h3>
                <p className="text-xs text-slate-500">
                  Return eligible items within 7 calendar days of confirmed delivery.
                </p>
              </div>

              {/* Product & Order Context Pedestal */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <img
                      src={
                        selectedProductForReturn.item.productImage ||
                        selectedProductForReturn.item.product?.images?.[0] ||
                        '/images/cat_workout_essentials.jpg'
                      }
                      alt=""
                      onError={(e) => { e.target.src = '/images/cat_workout_essentials.jpg'; }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-serif font-bold text-slate-900 text-sm truncate">
                      {selectedProductForReturn.item.productName || selectedProductForReturn.item.product?.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Order: <span className="font-mono font-bold text-slate-800">{selectedProductForReturn.order.orderNumber || selectedProductForReturn.order._id}</span>
                    </p>
                    {selectedProductForReturn.item.size && (
                      <span className="inline-block text-[10px] bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded border border-sky-200">
                        Size: {selectedProductForReturn.item.size}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery & 7-Day Deadline Information */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Delivered Date</span>
                    <strong className="text-slate-800 font-bold">
                      {selectedProductForReturn.deliveredAt
                        ? new Date(selectedProductForReturn.deliveredAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        : 'Confirmed Delivery'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Return Deadline</span>
                    <strong className="text-emerald-700 font-bold">
                      {selectedProductForReturn.returnDeadline
                        ? new Date(selectedProductForReturn.returnDeadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        : '7 days from delivery'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Return Form */}
              <form onSubmit={handleCreateReturn} className="space-y-4 text-xs">
                {/* Quantity to Return */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Quantity to Return</label>
                    <span className="text-[11px] text-slate-400">
                      Max eligible: <strong>{selectedProductForReturn.remainingReturnable}</strong>
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={selectedProductForReturn.remainingReturnable}
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(Math.max(1, Math.min(selectedProductForReturn.remainingReturnable, Number(e.target.value))))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-bold text-slate-900 focus:border-[#0B192C]"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Refund estimate: ₹{returnQuantity * (selectedProductForReturn.item.unitPrice || 0)} (via original payment method)
                  </span>
                </div>

                {/* Return Reason */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-bold text-slate-900 focus:border-[#0B192C]"
                  >
                    <option value="Wrong product">Wrong product</option>
                    <option value="Damaged product">Damaged product</option>
                    <option value="Defective product">Defective product</option>
                    <option value="Incorrect size">Incorrect size</option>
                    <option value="Product not as expected">Product not as expected</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Optional Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows="3"
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    placeholder="Provide details about the issue or reason for returning this item..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-[#0B192C]"
                  />
                </div>

                {/* Optional Evidence Image / Photo URL */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Product Image / Evidence URL <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={returnEvidenceImage}
                    onChange={(e) => setReturnEvidenceImage(e.target.value)}
                    placeholder="https://... photo link of product or defect"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 outline-none font-medium text-slate-800 focus:border-[#0B192C]"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReturn}
                    className="w-full py-3 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingReturn ? (
                      <span>Verifying & Submitting...</span>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>Submit Return Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─────────────────────────────────────────────────────────────
          12. DYNAMIC LIVE SHIPMENT TRACKING MODAL (DEMO SHIPMENT API)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedTrackingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedTrackingOrder(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center shadow-md">
                    <Truck className="w-5 h-5 text-sky-300" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-slate-900">
                      Shipment Tracking #{selectedTrackingOrder.trackingNumber || 'Pending'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Order #{selectedTrackingOrder.orderNumber || selectedTrackingOrder._id} • Courier: <strong className="text-slate-800">{selectedTrackingOrder.shipmentProvider || 'SwiftExpress Courier'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Courier & Delivery Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-stone-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Current Status</span>
                  <span className="font-extrabold text-[#0B192C] flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {selectedTrackingOrder.shipmentStatusText || selectedTrackingOrder.shipmentStatus || 'ORDER_PLACED'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Estimated Delivery</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">
                    {selectedTrackingOrder.estimatedDelivery ? new Date(selectedTrackingOrder.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Dispatch'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Live Tracking</span>
                  <span className="font-semibold text-slate-600 mt-0.5 flex items-center gap-1">
                    {isSyncingTracking ? (
                      <span className="text-sky-600 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" /> Tracking active...
                      </span>
                    ) : (
                      <span>Updated {selectedTrackingOrder.shipmentLastSyncedAt ? new Date(selectedTrackingOrder.shipmentLastSyncedAt).toLocaleTimeString() : 'Just now'}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Customer Delivery OTP Box (Visible when Out for Delivery) */}
              {customerOtp && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-1 text-left">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <KeyRound className="w-4 h-4 text-amber-700" /> Delivery Verification OTP
                  </span>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Provide this secure 6-digit OTP to your delivery agent upon arrival to verify delivery:
                  </p>
                  <div className="text-3xl font-mono font-black tracking-widest text-amber-950 bg-amber-100 p-2.5 rounded-xl text-center border border-amber-300 mt-2 shadow-inner">
                    {customerOtp}
                  </div>
                </div>
              )}

              {/* Visual Workflow Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900 text-left">
                  Visual Tracking Timeline
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    { key: 'Placed', label: 'Placed' },
                    { key: 'Confirmed', label: 'Confirmed' },
                    { key: 'Packed', label: 'Packed' },
                    { key: 'Assigned to Agent', label: 'Assigned' },
                    { key: 'Picked Up', label: 'Picked Up' },
                    { key: 'Out for Delivery', label: 'Out' },
                    { key: 'Delivered', label: 'Delivered' },
                  ].map((step, idx) => {
                    const statusStr = selectedTrackingOrder.status || selectedTrackingOrder.shipmentStatus || 'Placed';
                    const stepOrder = [
                      'Placed', 'Placed', 'Placed', 'Placed',
                      'Confirmed', 'ORDER_CONFIRMED',
                      'Packed', 'PACKED',
                      'Ready for Pickup', 'READY_FOR_PICKUP',
                      'Assigned to Agent', 'ASSIGNED_TO_AGENT',
                      'Picked Up', 'PICKED_UP',
                      'Out for Delivery', 'OUT_FOR_DELIVERY',
                      'Delivered', 'DELIVERED'
                    ];

                    const normStatus = (st) => {
                      if (['Placed', 'ORDER_PLACED'].includes(st)) return 0;
                      if (['Confirmed', 'ORDER_CONFIRMED'].includes(st)) return 1;
                      if (['Packed', 'PACKED'].includes(st)) return 2;
                      if (['Assigned to Agent', 'ASSIGNED_TO_AGENT', 'ACCEPTED'].includes(st)) return 3;
                      if (['Picked Up', 'PICKED_UP'].includes(st)) return 4;
                      if (['Out for Delivery', 'OUT_FOR_DELIVERY'].includes(st)) return 5;
                      if (['Delivered', 'DELIVERED'].includes(st)) return 6;
                      return 0;
                    };

                    const currentStepIdx = normStatus(statusStr);
                    const isDone = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCurrent
                              ? 'bg-[#0B192C] text-white ring-4 ring-sky-300 scale-105 shadow-md'
                              : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-100 text-slate-400 border border-stone-200'
                            }`}
                        >
                          {isDone && !isCurrent ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] font-bold mt-1.5 ${isCurrent ? 'text-slate-900 font-extrabold' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timestamped Tracking Event History */}
              <div className="space-y-3 text-left">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900">
                  Tracking Event Log History
                </h4>

                <div className="border border-stone-200 rounded-2xl divide-y divide-stone-100 max-h-48 overflow-y-auto p-1 bg-stone-50/50">
                  {((!trackingHistory || trackingHistory.length === 0) && (!selectedTrackingOrder.shipmentEvents || selectedTrackingOrder.shipmentEvents.length === 0)) ? (
                    <div className="p-4 text-center text-xs text-slate-400">No tracking events recorded yet.</div>
                  ) : (
                    (trackingHistory.length > 0 ? trackingHistory : selectedTrackingOrder.shipmentEvents || []).slice().reverse().map((ev, i) => (
                      <div key={i} className="p-3 text-xs flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 block">{ev.statusText || ev.status}</span>
                          <p className="text-slate-600">{ev.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono">Location: {ev.location || 'Local Hub'} • Updated by: {ev.updatedByName || 'System'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap bg-white px-2 py-1 rounded-md border border-stone-200 shadow-2xs">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Refresh Action */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-[11px] text-slate-400">
                  Status updated in real-time by Delivery Agent.
                </span>
                <button
                  onClick={() => setSelectedTrackingOrder(null)}
                  className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Close</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─────────────────────────────────────────────────────────────
          12. FOOTER
         ───────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
};
