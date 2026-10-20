import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Star,
  Truck,
  RotateCcw,
  Lock,
  Sparkles,
  Dumbbell,
  Compass,
  Footprints,
  Backpack,
  Trophy,
  HeartPulse,
  ChevronRight,
  Headphones,
  ArrowUpRight
} from 'lucide-react';
import { businessService } from '../services/businessService';
import { useAuth, getRoleRedirectPath } from '../context/AuthContext';

export const HomePage = () => {
  const [dbProducts, setDbProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await businessService.getProducts();
        if (res?.data?.products && res.data.products.length > 0) {
          setDbProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching home page products:', err);
      }
    };
    loadProducts();
  }, []);

  const { user, isAuthenticated } = useAuth();

  const getTargetRoute = (customerPath = '/customer/dashboard') => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'customer') return customerPath;
    return getRoleRedirectPath(user?.role);
  };

  const displayProducts = dbProducts.filter((p) => !p.status || p.status === 'Active');

  // Curated high quality sport & outdoor images for editorial categories
  const categories = [
    {
      name: 'Workout Essentials',
      desc: 'Gym gear & fitness apparel',
      img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
      href: '/products?category=Workout%20Essentials'
    },
    {
      name: 'Hiking & Trekking',
      desc: 'Tents, poles & mountain tools',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
      href: '/products?category=Hiking%20%26%20Trekking'
    },
    {
      name: 'Shoes',
      desc: 'Trail runners & mountain boots',
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
      href: '/products?category=Shoes'
    },
    {
      name: 'Bags & Backpacks',
      desc: 'Trekking packs & duffels',
      img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
      href: '/products?category=Bags%20%26%20Backpacks'
    },
    {
      name: 'Sport Accessories',
      desc: 'Bottles, bands & gear',
      img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600&auto=format&fit=crop',
      href: '/products?category=Sport%20Accessories'
    },
    {
      name: 'Nutrition & Care',
      desc: 'Hydration & recovery supplements',
      img: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=600&auto=format&fit=crop',
      href: '/products?category=Nutrition%20%26%20Care'
    }
  ];

  return (
    <div className="bg-[#FAF8F5] font-sans text-slate-800 space-y-16 pb-20">
      
      {/* ─────────────────────────────────────────────────────────────
          1. NEW ARRIVALS HORIZONTAL SHOWCASE (MATCHING REFERENCE IMAGE)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-200/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#0F291E] uppercase">
              NEW ARRIVALS
            </h2>
            <Link
              to={getTargetRoute('/customer/dashboard')}
              className="text-xs font-semibold text-stone-500 hover:text-[#0F382C] flex items-center gap-1 transition-colors"
            >
              <span>Explore All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal Product Showcase Row (Cutout Style Pristine White Display) */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-4 px-2">
            {displayProducts.length === 0 ? (
              <div className="w-full text-center py-8 text-xs text-stone-400 font-medium">
                Loading store catalogue items...
              </div>
            ) : (
              displayProducts.map((product) => (
                <Link
                  key={product._id}
                  to={getTargetRoute(`/customer/product/${product._id}`)}
                  className="flex flex-col items-center group shrink-0 w-36 sm:w-44 text-center cursor-pointer"
                >
                  <div className="w-36 h-36 sm:w-44 sm:h-44 bg-white rounded-2xl p-4 border border-stone-100 group-hover:border-stone-300 transition-all flex items-center justify-center relative overflow-hidden group-hover:scale-105 duration-300">
                    <img
                      src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'}
                      alt={product.name}
                      className="max-h-32 sm:max-h-36 object-contain drop-shadow-sm"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#0F382C] mt-3 line-clamp-1">
                    {product.name}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500 font-semibold mt-0.5">
                    ₹{product.price}
                  </span>
                </Link>
              ))
            )}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. EDITORIAL PROMOTIONAL SPLIT SECTION (MATCHING REFERENCE IMAGE)
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
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 uppercase block">
                SPECIAL OFFER
              </span>
            </div>

            <div className="relative z-10 space-y-4 max-w-md pt-20">
              <p className="font-serif text-xl sm:text-2xl font-normal leading-relaxed text-stone-100">
                Up to 40% off — discover this season's finest trekking gear, trail footwear & outdoor essentials.
              </p>
              <div>
                <Link
                  to={getTargetRoute('/customer/dashboard?search=special')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0F291E] text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  <span>Shop Special Offers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
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

            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 uppercase block">
                BESTSELLERS
              </span>
            </div>

            <div className="relative z-10 space-y-4 max-w-sm pt-20">
              <p className="font-serif text-xl sm:text-2xl font-normal leading-relaxed text-stone-100">
                The gear our athletes return to most — refined, durable, and always in demand.
              </p>
              <div>
                <Link
                  to={getTargetRoute('/customer/dashboard?search=bestseller')}
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
              to={getTargetRoute(`/customer/dashboard?category=${encodeURIComponent(cat.name)}`)}
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
          4. STORE CATALOGUE GRID (FROM REAL MONGODB DATA)
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Featured Catalogue
          </h2>
          <Link
            to={getTargetRoute('/customer/dashboard')}
            className="text-xs font-bold text-[#0F382C] hover:underline flex items-center gap-1"
          >
            <span>View Full Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-stone-200 text-center text-slate-500 text-xs font-medium">
              No products found in backend database. Add products via Admin / Inventory dashboard.
            </div>
          ) : (
            displayProducts.slice(0, 8).map((p) => (
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
                  <span className="text-sm font-bold text-slate-900 font-mono">₹{p.price}</span>
                  <Link
                    to={getTargetRoute(`/customer/product/${p._id}`)}
                    className="px-3.5 py-1.5 bg-[#0F382C] hover:bg-[#08221B] text-white rounded-full text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3 text-emerald-300" />
                    <span>Buy</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. TRUST & SERVICE HIGHLIGHTS
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700">
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
              <Lock className="w-5 h-5 text-[#0F382C]" />
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
              <p className="text-[11px] text-slate-500">Expert gear recommendations</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};


