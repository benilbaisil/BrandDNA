import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Mountain,
  Zap,
  Activity,
  HeartHandshake,
  Layers,
  Leaf
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="bg-[#FAF8F5] font-sans text-slate-800 space-y-20 pb-24">
      
      {/* ─────────────────────────────────────────────────────────────
          1. EDITORIAL HERO SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-200/60 pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Top Breadcrumb & Tag */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#0F382C] uppercase">
            <Link to="/" className="text-stone-400 hover:text-stone-700 transition-colors">
              HOME
            </Link>
            <span className="text-stone-300">/</span>
            <span className="bg-[#E8F5E9] text-[#0F382C] px-2.5 py-0.5 rounded-full border border-[#C4E1D4]">
              ABOUT BRAND. SPORTS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-800 uppercase block">
                THE CRAFT & PERFORMANCE PHILOSOPHY
              </span>
              
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0F291E] tracking-tight leading-[1.15]">
                Engineered for the summit. Refined for the everyday.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-2xl">
                Born on rugged trails and high-altitude mountain passes, <strong className="text-[#0F291E] font-semibold">brand. sports</strong> designs precision equipment, athletic footwear, and outdoor apparel that withstand extreme weather while elevating your daily movement.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="px-7 py-3.5 rounded-full bg-[#0F382C] hover:bg-[#08221B] text-white text-xs font-bold transition-all shadow-md hover:scale-102 flex items-center gap-2 group"
                >
                  <span>Explore The Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#pillars"
                  className="px-6 py-3.5 rounded-full bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-stone-200 text-[#0F291E] text-xs font-bold transition-all"
                >
                  Our Standards
                </a>
              </div>
            </div>

            {/* Right Editorial Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-stone-200/80 shadow-xl group">
                <img
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop"
                  alt="High altitude mountaineering gear testing"
                  className="w-full h-[420px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08221B]/90 via-[#08221B]/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-300">
                      HIMALAYAN TESTING FACILITY
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold">
                    Tested across 4,500m peaks in sub-zero winds.
                  </h3>
                  <p className="text-xs text-stone-300 font-medium opacity-90">
                    No prototype enters our catalog until it survives 100+ hours in unpredictable elements.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. KEY METRICS & PROOF POINTS
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-2">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-[#0F291E]">100%</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Athlete Tested</h4>
            <p className="text-xs text-stone-500">Every product verified under real outdoor load.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-2">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-[#0F291E]">24+</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Live Gear Designs</h4>
            <p className="text-xs text-stone-500">Curated across 6 essential sport disciplines.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-2">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-[#0F291E]">30 Days</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Field Guarantee</h4>
            <p className="text-xs text-stone-500">Hassle-free inspection & returns workflow.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-2">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-[#0F291E]">0%</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Synthetic Compromise</h4>
            <p className="text-xs text-stone-500">Reinforced ripstops, alloy zippers & breathable membranes.</p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. OUR ORIGIN STORY & MANIFESTO
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] rounded-3xl border border-stone-200/80 p-8 sm:p-14 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest text-[#0F382C] uppercase block">
              OUR ORIGIN STORY
            </span>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0F291E] tracking-tight leading-snug">
              Built because ordinary sportswear failed when it mattered most.
            </h2>

            <div className="space-y-4 text-stone-600 text-sm sm:text-base leading-relaxed">
              <p>
                We started Brand. Sports out of frustration with disposable, over-marketed athletic gear. Traditional outdoor brands either delivered heavy, archaic equipment or fragile activewear that frayed after two washes.
              </p>
              <p>
                We chose a different standard: <strong className="text-[#0F291E] font-medium">functional minimalism</strong>. By sourcing ripstop nylon, aerospace-grade zippers, and dual-density EVA outsoles, we engineer items that feel lightweight on trail runs and bulletproof in rocky terrain.
              </p>
              <p>
                Whether you are ascending a mountain pass, lifting in early morning discipline, or commuting through a monsoon drizzle, our equipment is built to support your pursuit.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-6">
              <div>
                <span className="font-serif font-bold text-lg text-slate-900 block">Benil Baisil</span>
                <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">Founder & Head of Product</span>
              </div>
              <div className="h-10 w-px bg-stone-300" />
              <div>
                <span className="font-serif font-bold text-lg text-slate-900 block">BrandDNA Labs</span>
                <span className="text-xs font-mono text-stone-500 uppercase tracking-wider">Kerala & Bangalore, IN</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600&auto=format&fit=crop"
                alt="Trekking expedition"
                className="rounded-2xl w-full h-56 object-cover border border-stone-200/80 shadow-xs"
              />
              <img
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop"
                alt="Strength and workout training"
                className="rounded-2xl w-full h-64 object-cover border border-stone-200/80 shadow-xs"
              />
            </div>
            <div className="space-y-4 pt-6">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
                alt="Performance footwear craft"
                className="rounded-2xl w-full h-64 object-cover border border-stone-200/80 shadow-xs"
              />
              <img
                src="https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600&auto=format&fit=crop"
                alt="Accessories and bottles"
                className="rounded-2xl w-full h-56 object-cover border border-stone-200/80 shadow-xs"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FOUR PILLARS OF CRAFTSMANSHIP
         ───────────────────────────────────────────────────────────── */}
      <section id="pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#0F382C] uppercase block mb-1">
              THE BRANDDNA STANDARD
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Four Pillars of Our Engineering
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm">
            How we translate athlete feedback into indestructible everyday equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F382C] flex items-center justify-center border border-[#C4E1D4]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Material Architecture
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We select ballistic cordura fabrics, abrasion-shielded ripstops, and waterproof breathable coatings tested against monsoon torrential downpours.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 tracking-wider uppercase pt-2 border-t border-stone-100 block">
              REINFORCED ANCHORS
            </span>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F382C] flex items-center justify-center border border-[#C4E1D4]">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Ergonomic Biomechanics
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Backpack load transfers weight to your pelvic cradle, while our footwear lasts maintain natural toe splay to prevent trail fatigue and blistering.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 tracking-wider uppercase pt-2 border-t border-stone-100 block">
              WEIGHT BALANCED
            </span>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F382C] flex items-center justify-center border border-[#C4E1D4]">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Sustainable Longevity
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We reject seasonal obsolescence. Our repair-ready design philosophy prioritizes modular buckles and replaceable strap webbing that lasts decades.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 tracking-wider uppercase pt-2 border-t border-stone-100 block">
              LIFETIME REPAIRABLE
            </span>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#0F382C] flex items-center justify-center border border-[#C4E1D4]">
                <Mountain className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Field Athlete Feedback
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Real mountaineering guides and marathoners evaluate our gear across 100+ kilometers of terrain before any design enters public production.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 tracking-wider uppercase pt-2 border-t border-stone-100 block">
              PRO GUIDES TESTED
            </span>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CUSTOMER PROMISE & SERVICE HIGHLIGHTS
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xs space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Our Commitment to Every Athlete
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Reliable service, guaranteed delivery, and transparent policies behind every order.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-stone-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#0F382C]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-900">Complimentary Shipping</h4>
                <p className="text-[11px] text-stone-500">Free delivery across India on orders over ₹2,999.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-[#0F382C]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-900">30-Day Hassle-Free Returns</h4>
                <p className="text-[11px] text-stone-500">Fast online inspection and instant wallet refund.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0F382C]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-900">Verified Razorpay Payments</h4>
                <p className="text-[11px] text-stone-500">PCI-DSS compliant 256-bit encrypted checkout.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5 text-[#0F382C]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-900">Direct Equipment Care</h4>
                <p className="text-[11px] text-stone-500">Expert gear advice and fitting recommendations.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. BOTTOM CALL TO ACTION
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#08221B] text-white p-8 sm:p-14 lg:p-16 border border-stone-200/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase block">
              READY FOR THE ASCENT?
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Equip yourself with gear built for the real journey.
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-medium">
              Explore our full collection of athlete-tested apparel, boots, backpacks, and accessories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/products"
              className="px-8 py-3.5 rounded-full bg-white text-[#0F291E] font-bold text-xs hover:bg-[#E8F5E9] transition-all shadow-md flex items-center gap-2"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4 text-[#0F382C]" />
            </Link>
            <Link
              to="/"
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all text-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
