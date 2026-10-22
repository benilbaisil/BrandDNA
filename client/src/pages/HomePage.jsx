import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Star,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Headphones,
  ArrowUpRight,
  Play,
  Pause,
  Zap
} from 'lucide-react';
import { businessService } from '../services/businessService';
import { useAuth, getRoleRedirectPath } from '../context/AuthContext';
import { INITIAL_PRODUCTS } from '../constants/initialProducts';

export const HomePage = () => {
  const [dbProducts, setDbProducts] = useState(INITIAL_PRODUCTS);
  const { user, isAuthenticated } = useAuth();

  // Slide-by-slide Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);

  // Responsive visible cards count
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else if (width < 1280) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Handle smooth scroll if hash present in URL
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    }
  }, []);

  // Fetch real active products immediately for all visitors (public catalogue preview)
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const res = await businessService.getProducts();
        if (isMounted && res?.data?.products && res.data.products.length > 0) {
          const active = res.data.products.filter((p) => !p.status || p.status === 'Active');
          if (active.length > 0) {
            setDbProducts(active);
          }
        }
      } catch (err) {
        console.warn('Error fetching live products for homepage:', err.message);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayProducts = dbProducts.filter((p) => !p.status || p.status === 'Active');
  const maxSlide = Math.max(0, displayProducts.length - visibleCount);

  // Snappy next/prev slide navigation
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  }, [maxSlide]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  }, [maxSlide]);

  // Fast auto-advance (2.4 seconds) with instant response
  useEffect(() => {
    if (!isAutoPlaying || isHovered || displayProducts.length <= visibleCount) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 2400);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, displayProducts.length, visibleCount, nextSlide]);

  const getTargetLinkProps = (targetPath = '/products') => {
    if (!isAuthenticated) {
      return {
        to: '/login',
        state: { from: targetPath, message: 'Please sign in to view complete details and order.' }
      };
    }
    return { to: targetPath };
  };

  // Curated high quality sport & outdoor images for editorial categories
  const categories = [
    {
      name: 'Workout Essentials',
      desc: 'Gym gear & fitness apparel',
      img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      href: '/customer/dashboard?category=Workout%20Essentials'
    },
    {
      name: 'Hiking & Trekking',
      desc: 'Tents, poles & mountain tools',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
      href: '/customer/dashboard?category=Hiking%20%26%20Trekking'
    },
    {
      name: 'Shoes',
      desc: 'Trail runners & mountain boots',
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
      href: '/customer/dashboard?category=Shoes'
    },
    {
      name: 'Bags & Backpacks',
      desc: 'Trekking packs & duffels',
      img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
      href: '/customer/dashboard?category=Bags%20%26%20Backpacks'
    },
    {
      name: 'Sport Accessories',
      desc: 'Bottles, bands & gear',
      img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600&auto=format&fit=crop',
      href: '/customer/dashboard?category=Sport%20Accessories'
    },
    {
      name: 'Nutrition & Care',
      desc: 'Hydration & recovery supplements',
      img: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=600&auto=format&fit=crop',
      href: '/customer/dashboard?category=Nutrition%20%26%20Care'
    }
  ];

  return (
    <div className="bg-[#FAF8F5] font-sans text-slate-800 space-y-16 pb-20">

      {/* ─────────────────────────────────────────────────────────────
          1. NEW ARRIVALS — ULTRA-FAST SLIDE-BY-SLIDE PRODUCT SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-200/60 py-8 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Header Row: Title, Live indicator, Fast controls & Explore All */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-mono font-bold tracking-widest text-[#0F291E] uppercase">
                NEW ARRIVALS
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE CATALOG ({displayProducts.length})
              </span>
            </div>

            {/* Fast Slider Navigation Controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 mr-2 text-[11px] font-mono font-semibold text-stone-500">
                <span>{String(currentSlide + 1).padStart(2, '0')}</span>
                <span>/</span>
                <span>{String(maxSlide + 1).padStart(2, '0')}</span>
              </div>

              {/* Autoplay Pause / Play button */}
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="w-8 h-8 rounded-full border border-stone-200 bg-[#FAF8F5] hover:bg-stone-200/70 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                title={isAutoPlaying ? 'Pause fast auto-sliding' : 'Resume fast auto-sliding'}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              {/* Prev Slide Button */}
              <button
                type="button"
                onClick={prevSlide}
                id="slider-prev-btn"
                className="w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-[#0F382C] hover:text-white hover:border-[#0F382C] flex items-center justify-center text-stone-700 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Next Slide Button */}
              <button
                type="button"
                onClick={nextSlide}
                id="slider-next-btn"
                className="w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-[#0F382C] hover:text-white hover:border-[#0F382C] flex items-center justify-center text-stone-700 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-stone-200 mx-1" />

              <Link
                {...getTargetLinkProps('/customer/dashboard')}
                className="text-xs font-semibold text-[#0F382C] hover:underline flex items-center gap-1 transition-colors pl-1"
              >
                <span>Explore All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Slide-by-Slide Track Container with Hardware Acceleration */}
          <div
            className="relative overflow-hidden py-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            ref={sliderRef}
          >
            <div
              className="flex items-stretch transition-transform ease-out will-change-transform"
              style={{
                transform: `translateX(-${currentSlide * (100 / visibleCount)}%)`,
                transitionDuration: '320ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {displayProducts.map((product) => {
                const discount = product.discountPrice && product.discountPrice > product.price
                  ? Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product._id}
                    className="shrink-0 p-2 select-none"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <div className="h-full bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-600/60 hover:shadow-lg transition-all duration-200 flex flex-col justify-between p-4 group relative overflow-hidden">

                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 line-clamp-1">
                          {product.categoryName || product.category?.name || 'Gear'}
                        </span>

                        {discount > 0 ? (
                          <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            {discount}% OFF
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Product Image */}
                      <Link
                        {...getTargetLinkProps(`/customer/product/${product._id}`)}
                        className="block my-2 h-40 sm:h-44 bg-[#FAF8F5] rounded-xl p-3 flex items-center justify-center relative overflow-hidden cursor-pointer"
                      >
                        <img
                          src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'}
                          alt={product.name}
                          loading="eager"
                          className="max-h-36 sm:max-h-40 w-auto object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-xs"
                        />
                      </Link>

                      {/* Details */}
                      <div className="space-y-1.5 pt-2">
                        {product.brand && (
                          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest block">
                            {product.brand}
                          </span>
                        )}
                        <h3 className="font-serif text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#0F382C] transition-colors" title={product.name}>
                          {product.name}
                        </h3>

                        {/* Price & Action */}
                        <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                ₹{product.price?.toLocaleString('en-IN')}
                              </span>
                              {product.discountPrice > product.price && (
                                <span className="text-[11px] font-mono text-stone-400 line-through">
                                  ₹{product.discountPrice?.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            {...getTargetLinkProps(`/customer/product/${product._id}`)}
                            className="px-3 py-1.5 rounded-full bg-[#0F382C] hover:bg-[#08221B] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 active:scale-95"
                          >
                            <ShoppingBag className="w-3 h-3 text-emerald-300" />
                            <span>Shop</span>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Fast Slider Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {Array.from({ length: maxSlide + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${currentSlide === idx ? 'w-6 bg-[#0F382C]' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. EDITORIAL PROMOTIONAL SPLIT SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-stone-200/80 shadow-md min-h-[500px]">

          {/* Left Block: SPECIAL OFFER (Lifestyle Editorial Outdoor Photo) */}
          <div className="relative bg-[#1C3026] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden group min-h-[380px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop"
              alt="Outdoor Trekking Special Offer"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08221B] via-transparent to-transparent opacity-80" />

            <div className="relative z-10 space-y-2">

            </div>

            <div className="relative z-10 space-y-4 max-w-md pt-20">
              <p className="font-serif text-xl sm:text-2xl font-normal leading-relaxed text-stone-100">
                Up to 40% off — discover this season's finest trekking gear, trail footwear & outdoor essentials.
              </p>

            </div>
          </div>

          {/* Right Block: BESTSELLERS (Rich Dark Forest Block with Featured Product) */}
          <div className="relative bg-[#08221B] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden min-h-[380px] lg:min-h-full">
            <div className="absolute right-0 top-0 bottom-0 w-3/4 opacity-80 pointer-events-none">
              <img
                src={displayProducts[0]?.images?.[0] || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop'}
                alt="Bestselling Product"
                className="w-full h-full object-contain object-right"
              />
            </div>



            <div className="relative z-10 space-y-4 max-w-sm pt-20">
              <p className="font-serif text-xl sm:text-2xl font-normal leading-relaxed text-stone-100">
                The gear our athletes return to most — refined, durable, and always in demand.
              </p>
              <div>
                <Link
                  {...getTargetLinkProps('/customer/dashboard?search=bestseller')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F382C] border border-emerald-600/40 text-white text-xs font-bold hover:bg-[#154E3E] transition-colors shadow-sm"
                >
                  <span>View Bestsellers</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORIES SHOWCASE GRID (6 CORE SPORTS CATEGORIES)
         ───────────────────────────────────────────────────────────── */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Curated Categories
          </h2>
          <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest">
            6 CATEGORIES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              {...getTargetLinkProps(cat.href)}
              className="group relative h-72 rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08221B]/90 via-[#08221B]/30 to-transparent" />

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-widest">
                  EXPLORE
                </span>
                <h3 className="font-serif text-xl font-bold text-white leading-snug">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-300 font-medium opacity-90">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. STORE CATALOGUE GRID (REAL ACTIVE PRODUCTS)
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              Featured Catalogue
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Explore athlete-tested trail gear, performance footwear, and active lifestyle apparel
            </p>
          </div>
          <Link
            {...getTargetLinkProps('/customer/dashboard')}
            className="text-xs font-bold text-[#0F382C] hover:underline flex items-center gap-1"
          >
            <span>View Full Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.slice(0, 8).map((p) => {
            const discount = p.discountPrice && p.discountPrice > p.price
              ? Math.round(((p.discountPrice - p.price) / p.discountPrice) * 100)
              : 0;

            return (
              <div
                key={p._id}
                className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group p-4"
              >
                <div>
                  <div className="h-48 bg-[#FAF8F5] rounded-2xl overflow-hidden relative p-4 flex items-center justify-center mb-4">
                    {p.brand && (
                      <span className="absolute top-3 left-3 bg-[#0F382C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                        {p.brand}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                        {discount}% OFF
                      </span>
                    )}
                    <img
                      src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'}
                      alt={p.name}
                      className="max-h-40 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 font-semibold block uppercase tracking-wider">
                      {p.categoryName || p.category?.name || 'Gear'}
                    </span>
                    <h3 className="font-serif text-sm font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#0F382C] transition-colors">
                      {p.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between mt-2 border-t border-stone-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      ₹{p.price?.toLocaleString('en-IN')}
                    </span>
                    {p.discountPrice > p.price && (
                      <span className="text-[11px] font-mono text-stone-400 line-through">
                        ₹{p.discountPrice?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <Link
                    {...getTargetLinkProps(`/customer/product/${p._id}`)}
                    className="px-3.5 py-1.5 bg-[#0F382C] hover:bg-[#08221B] text-white rounded-full text-xs font-bold transition-all shadow-2xs flex items-center gap-1 active:scale-95"
                  >
                    <ShoppingBag className="w-3 h-3 text-emerald-300" />
                    <span>Buy</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ABOUT BRAND. SPORTS EDITORIAL SECTION
         ───────────────────────────────────────────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#0F382C] uppercase bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#C4E1D4] inline-block">
              ABOUT BRAND. SPORTS
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0F291E] tracking-tight leading-snug">
              Engineered for the summit. Refined for the everyday.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
              We design precision gear, athletic footwear, and outdoor equipment engineered to withstand extreme mountain conditions while elevating your daily movement. Every product is athlete-tested across rugged terrain before release.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F382C] hover:bg-[#08221B] text-white text-xs font-bold transition-all shadow-xs group"
              >
                <span>Read Full Brand Story</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#0F291E] text-xs font-bold hover:bg-stone-100 transition-colors"
              >
                <span>Explore Catalog</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border border-stone-200/80 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
                alt="Brand. Sports Mountain Field Testing"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. TRUST & SERVICE HIGHLIGHTS
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-stone-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#0F382C]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Complimentary Express Shipping</h4>
              <p className="text-[11px] text-slate-500">On all orders over ₹2,999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-[#0F382C]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">30-Day Hassle-Free Returns</h4>
              <p className="text-[11px] text-slate-500">Easy online inspection workflow</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#0F382C]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Razorpay Verified Payments</h4>
              <p className="text-[11px] text-slate-500">256-bit encrypted checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-[#0F382C]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">24/7 Athlete Concierge</h4>
              <p className="text-[11px] text-slate-500">Dedicated equipment specialist support</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
