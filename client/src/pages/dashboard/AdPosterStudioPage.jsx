import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Tag,
  Palette,
  Type,
  Layout,
  Building2,
  Target,
  ArrowRight,
  Eye,
  Sliders,
  Zap,
  Users,
  ShieldCheck,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { startupService } from '../../services/startupService';
import { brandService } from '../../services/brandService';
import { productStrategyService } from '../../services/productStrategyService';
import { personaService } from '../../services/personaService';
import { useToast } from '../../context/ToastContext';

export const AdPosterStudioPage = () => {
  const { addToast } = useToast();
  const showToast = (msg, type = 'success') => addToast(msg, type);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Consolidated Brand DNA & Product Context loaded from Database
  const [brandContext, setBrandContext] = useState({
    brandName: 'Pulari',
    companyName: 'Pulari',
    industry: 'E-commerce / Artisanal Confectionery',
    targetAudience: 'Modern Consumers & Connoisseurs',
    tagline: 'Artisanal Luxury Chocolates Handcrafted with Pure Cocoa',
    missionStatement: 'Delivering uncompromised artisanal chocolates made with direct-trade single-origin cacao.',
    brandPersonality: 'Visionary, Sophisticated, Authentic, Premium',
    productName: 'Pulari ChocoDrop',
    shortDescription: 'Velvety smooth 100% organic cacao drops handcrafted with zero refined sugars.',
    usps: [
      { title: '100% Organic Cacao', description: 'Zero refined sugars or artificial additives.' },
      { title: 'Single-Origin Direct Trade', description: 'Sourced directly from sustainable cocoa farms.' },
      { title: 'Velvety Melt-in-Mouth Texture', description: 'Slow-tempered artisanal chocolate drops.' }
    ],
    positioningStatement: 'For chocolate lovers who demand pure quality, Pulari ChocoDrop offers uncompromised artisanal taste with zero refined sugars.',
    personas: [
      {
        personaName: 'Sarah, the Busy Founder',
        demographics: { age: '28-35', occupation: 'Tech Founder' },
        painPoints: { primaryChallenge: 'Needs healthy, premium snacks during long strategy sessions.' }
      }
    ]
  });

  // Selected Campaign Angle Focus ('hero_launch' | 'usp_spotlight' | 'persona_focus' | 'positioning_quote')
  const [campaignAngle, setCampaignAngle] = useState('hero_launch');

  // Poster Overlay Customization State
  const [posterStyle, setPosterStyle] = useState('commercial_luxury');
  const [colorTheme, setColorTheme] = useState('choco_cream'); // choco_cream | emerald_gold | dark_luxury | velvet_rose
  const [fontFamily, setFontFamily] = useState('serif'); // serif | sans | mono
  const [activePosterSeed, setActivePosterSeed] = useState(42);

  const [headlineText, setHeadlineText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [badgeText, setBadgeText] = useState('OFFICIAL LAUNCH');
  const [ctaText, setCtaText] = useState('Explore Product');

  // Generated Midjourney / DALL-E Prompt
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Dynamically generate AI Product Image URL based on user's exact Product Name and Industry
  const getProductPosterImageUrl = (ctx = brandContext, style = posterStyle, seed = activePosterSeed) => {
    const pName = ctx?.productName || ctx?.brandName || ctx?.companyName || 'Product Showcase';
    const ind = ctx?.industry || 'Business Services';

    let styleKeyword = 'hero product studio photography, sleek aesthetic pedestal display, luxury key lighting, 8k commercial photo';
    if (style === 'emerald_luxury') styleKeyword = 'emerald and gold luxury product hero shot, dark studio atmosphere, premium lighting';
    if (style === 'minimalist_cream') styleKeyword = 'soft cream organic background, natural morning sunlight, minimalist clean product photo';
    if (style === 'dark_studio') styleKeyword = 'dark cinematic studio background, dramatic rim lighting, sleek futuristic product showcase';

    const promptStr = `professional commercial ad poster shot of ${pName}, ${ind} category, ${styleKeyword}`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(promptStr)}?width=800&height=1000&nologo=true&seed=${seed}`;
  };

  // High quality Unsplash industry fallback if network fails
  const getIndustryFallbackImage = (industry = '', style = posterStyle) => {
    const ind = (industry || '').toLowerCase();

    if (ind.includes('tech') || ind.includes('saas') || ind.includes('ai') || ind.includes('software')) {
      return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop';
    }
    if (ind.includes('food') || ind.includes('beverage') || ind.includes('choco') || ind.includes('coffee') || ind.includes('bakery') || ind.includes('restaurant')) {
      return 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1200&auto=format&fit=crop';
    }
    if (ind.includes('beauty') || ind.includes('cosmetic') || ind.includes('wellness') || ind.includes('skincare') || ind.includes('health') || ind.includes('fitness')) {
      return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop';
    }
    if (ind.includes('fashion') || ind.includes('apparel') || ind.includes('luxury') || ind.includes('clothing') || ind.includes('jewel')) {
      return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop';
    }
    if (ind.includes('estate') || ind.includes('property') || ind.includes('home') || ind.includes('decor') || ind.includes('interior')) {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop';
    }

    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop';
  };

  // Fetch ALL previous details from database
  useEffect(() => {
    fetchAllBrandDetails();
  }, []);

  const fetchAllBrandDetails = async () => {
    setLoading(true);
    try {
      const [profileRes, brandRes, strategyRes, personaRes] = await Promise.allSettled([
        startupService.getProfile(),
        brandService.getIdentity(),
        productStrategyService.getStrategy(),
        personaService.getPersonas(),
      ]);

      let company = 'Master Brand';
      let ind = 'Business Services';
      let target = 'Modern Consumers & Enterprises';

      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        const p = profileRes.value.data;
        company = p.companyName || company;
        ind = p.industry || ind;
        target = p.targetAudience || target;
      }

      let bName = company;
      let tag = '';
      let miss = '';
      let pers = '';

      if (brandRes.status === 'fulfilled' && brandRes.value?.data) {
        const b = brandRes.value.data.brand || brandRes.value.data;
        bName = b.brandName || bName;
        tag = b.tagline || tag;
        miss = b.missionStatement || miss;
        pers = b.brandPersonality || pers;
      }

      let pName = bName;
      let desc = tag || 'High-performance solution tailored for your market needs.';
      let uspsList = [];
      let posStmt = '';

      if (strategyRes.status === 'fulfilled' && strategyRes.value?.data) {
        const s = strategyRes.value.data.strategy || strategyRes.value.data;
        pName = s.productName || pName;
        desc = s.shortDescription || s.detailedDescription || desc;
        if (s.usps && Array.isArray(s.usps) && s.usps.length > 0) {
          uspsList = s.usps;
        }
        posStmt = s.positioningStatement || posStmt;
      }

      let personaList = [];
      if (personaRes.status === 'fulfilled' && personaRes.value?.data) {
        const pData = personaRes.value.data;
        personaList = pData.personas || (Array.isArray(pData) ? pData : []);
      }

      if (uspsList.length === 0) {
        uspsList = [{ title: 'Institutional Quality', description: desc }];
      }

      const mergedContext = {
        brandName: bName,
        companyName: company,
        industry: ind,
        targetAudience: target,
        tagline: tag || desc,
        missionStatement: miss,
        brandPersonality: pers,
        productName: pName,
        shortDescription: desc,
        usps: uspsList,
        positioningStatement: posStmt,
        personas: personaList,
      };

      setBrandContext(mergedContext);

      // Auto-apply initial poster headline & subtitle from loaded user data
      applyCampaignAngle('hero_launch', mergedContext);
    } catch (err) {
      console.error('Error fetching accumulated brand context:', err);
      showToast('Loaded brand context.', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Apply Campaign Angle derived from user's saved brand & strategy details
  const applyCampaignAngle = (angle, ctx = brandContext) => {
    setCampaignAngle(angle);

    const bName = ctx.brandName || ctx.companyName || 'Master Brand';
    const pName = ctx.productName || bName;
    const tag = ctx.tagline || ctx.shortDescription || `Elevating your ${ctx.industry || 'business'}`;
    const firstUsp = ctx.usps && ctx.usps[0] ? ctx.usps[0] : { title: 'Institutional Quality', description: 'Built for high performance' };
    const firstPersona = ctx.personas && ctx.personas[0] ? ctx.personas[0] : null;

    if (angle === 'hero_launch') {
      setHeadlineText(`Experience ${pName}`);
      setSubtitleText(tag);
      setBadgeText('OFFICIAL LAUNCH');
      setCtaText('Explore Product');
    } else if (angle === 'usp_spotlight') {
      setHeadlineText(firstUsp.title);
      setSubtitleText(`${firstUsp.description} • Powered by ${bName}`);
      setBadgeText('SIGNATURE USP');
      setCtaText('Learn More');
    } else if (angle === 'persona_focus') {
      const targetName = firstPersona ? firstPersona.personaName.split(',')[0] : ctx.targetAudience || 'Ideal Customers';
      setHeadlineText(`Designed for ${targetName}`);
      const challenge = firstPersona?.painPoints?.primaryChallenge || firstPersona?.painPoints?.specificFrustrations?.[0] || 'Built specifically to solve your core challenges.';
      setSubtitleText(challenge);
      setBadgeText('ICP TARGETED');
      setCtaText('Get Started');
    } else if (angle === 'positioning_quote') {
      const pos = ctx.positioningStatement || `${pName} sets the new standard in ${ctx.industry || 'the industry'}.`;
      setHeadlineText(`Next-Gen ${ctx.industry || 'Solution'}`);
      setSubtitleText(pos.length > 120 ? pos.substring(0, 117) + '...' : pos);
      setBadgeText('BRAND POSITIONING');
      setCtaText('View Details');
    }

    // Synthesize Midjourney prompt using exact user brand details
    synthesizePrompt(angle, ctx);
  };

  // Synthesize Midjourney AI prompt with exact user database attributes
  const synthesizePrompt = (angle = campaignAngle, ctx = brandContext) => {
    const bName = ctx.brandName || ctx.companyName || 'Master Brand';
    const pName = ctx.productName || bName;
    const ind = ctx.industry || 'Business Services';
    const uspStr = ctx.usps && ctx.usps.length > 0 ? ctx.usps.map((u) => u.title).join(', ') : 'High Quality Execution';
    const firstPersona = ctx.personas && ctx.personas[0] ? ctx.personas[0] : null;
    const targetName = firstPersona ? firstPersona.personaName : ctx.targetAudience || 'Target Audience';

    let promptText = `Professional commercial advertisement poster for "${pName}" by ${bName}. High-end commercial aesthetic tailored for the ${ind} industry. `;

    if (angle === 'hero_launch') {
      promptText += `Hero packaging / product showcase centered on a modern minimalist pedestal, cinematic studio lighting, soft key light reflections. Key elements: ${uspStr}. Professional commercial photography, 85mm lens, depth of field, 8k resolution, minimalist advertisement layout. --ar 4:5 --v 6.0`;
    } else if (angle === 'usp_spotlight') {
      promptText += `Feature spotlight highlighting core advantage (${uspStr}). Clean macro detail studio shot, sleek gradient glass background, crisp key lighting, 8k resolution commercial layout. --ar 4:5 --v 6.0`;
    } else if (angle === 'persona_focus') {
      promptText += `Contextual lifestyle advertisement tailored for ${targetName}. Authentic environment showcasing seamless product experience, soft warm ambient lighting, editorial quality layout. --ar 4:5 --v 6.0`;
    } else if (angle === 'positioning_quote') {
      promptText += `Editorial brand positioning advertisement poster. Bold architectural backdrop, elegant soft shadows, luxury corporate aesthetic, crisp minimalist poster design. --ar 4:5 --v 6.0`;
    }

    setGeneratedPrompt(promptText);
  };

  const handleGeneratePosterAI = () => {
    setGenerating(true);
    const newSeed = Math.floor(Math.random() * 90000) + 1000;
    setActivePosterSeed(newSeed);
    setTimeout(() => {
      applyCampaignAngle(campaignAngle, brandContext);
      setGenerating(false);
      showToast(`Generated fresh AI poster image & prompt for ${brandContext.productName || 'your product'}!`, 'success');
    }, 600);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedPrompt(true);
    showToast('Midjourney v6 Prompt Copied to Clipboard!', 'info');
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Preset Color Palettes
  const themeStyles = {
    choco_cream: {
      bg: 'from-[#2C1810]/90 via-[#3D2317]/80 to-transparent',
      text: 'text-amber-100',
      accent: 'bg-amber-400 text-slate-950',
      btn: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    },
    emerald_gold: {
      bg: 'from-[#062C22]/90 via-[#0A4737]/80 to-transparent',
      text: 'text-emerald-100',
      accent: 'bg-emerald-400 text-slate-950',
      btn: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
    },
    dark_luxury: {
      bg: 'from-slate-950/95 via-slate-900/85 to-transparent',
      text: 'text-white',
      accent: 'bg-white text-slate-950',
      btn: 'bg-white text-slate-950 hover:bg-slate-100',
    },
    velvet_rose: {
      bg: 'from-[#3B0712]/90 via-[#580A1C]/80 to-transparent',
      text: 'text-rose-100',
      accent: 'bg-rose-400 text-slate-950',
      btn: 'bg-rose-400 text-slate-950 hover:bg-rose-300',
    },
  };

  const currentTheme = themeStyles[colorTheme] || themeStyles.choco_cream;
  const currentImage = getProductPosterImageUrl(brandContext, posterStyle, activePosterSeed);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 font-mono">Loading Saved Brand DNA & Product Context...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-24 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                Module 06: Marketing & Ad Studio
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Synced with Saved Brand DNA
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight mt-2">
              AI Commercial Advertisement Poster Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generating commercial ad posters powered by your saved Brand DNA (<strong className="text-slate-800">{brandContext.brandName}</strong>) & Product Strategy (<strong className="text-slate-800">{brandContext.productName}</strong>).
            </p>
          </div>

          <button
            onClick={handleGeneratePosterAI}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Synthesizing...' : 'Regenerate Poster AI'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SYNCED BRAND DNA & PRODUCT STRATEGY DATA BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Synced Brand DNA & Product Context Details
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Pulled directly from MongoDB database</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Master Brand</span>
            <p className="font-extrabold text-slate-900 text-sm truncate">{brandContext.brandName}</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Active Product</span>
            <p className="font-extrabold text-slate-900 text-sm truncate">{brandContext.productName}</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Primary USP</span>
            <p className="font-semibold text-slate-800 truncate">{brandContext.usps[0]?.title || '100% Organic Cacao'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Target Persona</span>
            <p className="font-semibold text-slate-800 truncate">
              {brandContext.personas[0]?.personaName || 'Sarah, the Busy Founder'}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CAMPAIGN ANGLE SELECTOR BASED ON PREVIOUS DETAILS
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Select Campaign Angle (Powered by Saved Brand Data)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Click angle to auto-update poster overlays</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'hero_launch',
              title: 'Hero Product Launch',
              desc: `Focuses on ${brandContext.productName}`,
              icon: Target,
            },
            {
              id: 'usp_spotlight',
              title: 'USP Feature Spotlight',
              desc: brandContext.usps[0]?.title || '100% Organic Cacao',
              icon: Sparkles,
            },
            {
              id: 'persona_focus',
              title: 'Target Persona Angle',
              desc: `Solves ${brandContext.personas[0]?.personaName?.split(',')[0] || 'Customer'} pain point`,
              icon: Users,
            },
            {
              id: 'positioning_quote',
              title: 'Brand Positioning',
              desc: 'Strategic brand promise',
              icon: ShieldCheck,
            },
          ].map((angle) => {
            const Icon = angle.icon;
            const isActive = campaignAngle === angle.id;
            return (
              <button
                key={angle.id}
                onClick={() => applyCampaignAngle(angle.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-[#D6E6EC] bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/10 text-amber-400' : 'bg-slate-200 text-slate-700'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <p className="font-bold text-xs">{angle.title}</p>
                  <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {angle.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN STUDIO WORKSPACE GRID
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Interactive Poster Canvas Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" /> Live Poster Studio Preview
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              4:5 Commercial Print Aspect
            </span>
          </div>

          {/* CANVAS PREVIEW CARD */}
          <div
            id="ad-poster-canvas"
            className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group select-none flex flex-col justify-between p-6 sm:p-8 text-left transition-all"
          >
            {/* Background Image Layer: Generated dynamically based on user's exact product */}
            <img
              src={getProductPosterImageUrl(brandContext, posterStyle, activePosterSeed)}
              alt={`Commercial AI Advertisement for ${brandContext.productName || 'Product'}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getIndustryFallbackImage(brandContext.industry, posterStyle);
              }}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            />

            {/* Gradient Overlay for Typography Contrast */}
            <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.bg} transition-colors duration-500`} />

            {/* TOP OVERLAY: Brand Header & Offer Badge */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-white/80 block">
                  {brandContext.brandName}
                </span>
                <span className="text-[9px] font-sans text-white/60 tracking-wider">
                  COMMERCIAL COLLECTION
                </span>
              </div>

              {badgeText && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md ${currentTheme.accent}`}>
                  {badgeText}
                </span>
              )}
            </div>

            {/* CENTER PRODUCT FOCUS AREA */}
            <div className="relative z-10 my-auto text-center space-y-2 py-8">
              <span className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-mono border border-white/20">
                {brandContext.productName}
              </span>
            </div>

            {/* BOTTOM OVERLAY: Headline, Subtitle & Call-to-Action */}
            <div className="relative z-10 space-y-3 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <h2
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${currentTheme.text} ${
                    fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans'
                  }`}
                >
                  {headlineText}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed max-w-sm">
                  {subtitleText}
                </p>
              </div>

              {ctaText && (
                <div className="pt-2">
                  <button className={`px-5 py-2.5 rounded-full font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer ${currentTheme.btn}`}>
                    <span>{ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-mono">
            Interactive Live Canvas • Rendered with {brandContext.brandName} Brand Identity
          </p>
        </div>

        {/* Right Column: Poster Customization Studio Controls & Prompts (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Midjourney AI Commercial Prompt Synthesizer */}
          <div className="p-6 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  AI Commercial Studio Prompt (Midjourney v6)
                </h3>
              </div>

              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Midjourney Prompt'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed relative group">
              <p className="pr-8">{generatedPrompt}</p>
            </div>
          </div>

          {/* Section 2: Visual Style & Backdrop Selection */}
          <div className="p-6 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layout className="w-4 h-4 text-blue-600" /> Poster Backdrop Concept
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'commercial_luxury', label: 'Commercial Studio', desc: 'Hero Showcase' },
                { id: 'emerald_luxury', label: 'Emerald Velvet', desc: 'Gold Accents' },
                { id: 'minimalist_cream', label: 'Soft Cream', desc: 'Minimal Organic' },
                { id: 'dark_studio', label: 'Dark Cinematic', desc: 'Moody Rim Light' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => { setPosterStyle(style.id); synthesizePrompt(campaignAngle, brandContext); }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    posterStyle === style.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-[#D6E6EC] bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-bold text-xs">{style.label}</p>
                  <p className={`text-[10px] mt-0.5 ${posterStyle === style.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {style.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Color Palette Theme & Typography Selector */}
          <div className="p-6 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600" /> Color Theme Palette & Font Style
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Color Palette Switcher */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Color Palette</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'choco_cream', name: 'Choco Cream' },
                    { id: 'emerald_gold', name: 'Emerald Gold' },
                    { id: 'dark_luxury', name: 'Midnight Dark' },
                    { id: 'velvet_rose', name: 'Velvet Crimson' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setColorTheme(t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        colorTheme === t.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family Switcher */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Typography Style</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'serif', name: 'Luxury Serif' },
                    { id: 'sans', name: 'Clean Sans' },
                    { id: 'mono', name: 'Modern Mono' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontFamily(f.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        fontFamily === f.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Live Typography Content Controls */}
          <div className="p-6 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-600" /> Live Poster Copy Overlays
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                  Main Headline Text
                </label>
                <input
                  type="text"
                  value={headlineText}
                  onChange={(e) => setHeadlineText(e.target.value)}
                  className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-2.5 outline-none font-semibold transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                  Subtitle / Tagline Copy
                </label>
                <input
                  type="text"
                  value={subtitleText}
                  onChange={(e) => setSubtitleText(e.target.value)}
                  className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                    Promotional Badge
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-2.5 outline-none font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                    Call to Action Button
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-2.5 outline-none font-semibold transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdPosterStudioPage;
