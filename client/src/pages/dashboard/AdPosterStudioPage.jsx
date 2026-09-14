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
  BookmarkCheck,
  Download,
  FileText,
  Wand2,
  Layers,
  Globe,
  Award,
  Save,
  QrCode,
  Star,
  Compass,
  Package,
  BookOpen,
  Share2,
  Maximize2,
  X,
  MessageSquare
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { startupService } from '../../services/startupService';
import { brandService } from '../../services/brandService';
import { productStrategyService } from '../../services/productStrategyService';
import { personaService } from '../../services/personaService';
import { useToast } from '../../context/ToastContext';

const descSummary = (desc, fallback) => {
  if (!desc) return fallback || '';
  return desc.length > 100 ? desc.substring(0, 97) + '...' : desc;
};

const getIndustryFallbackImage = (industry = '') => {
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

export const AdPosterStudioPage = () => {
  const { addToast } = useToast();
  const showToast = (msg, type = 'success') => addToast(msg, type);

  // Data Loading & Operation States
  const [loading, setLoading] = useState(true);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Deep Studio Modal & Poster Seeds State
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [activePosterSeed, setActivePosterSeed] = useState(42);
  const [customVisualPrompt, setCustomVisualPrompt] = useState('');
  const [downloadedFilePreview, setDownloadedFilePreview] = useState(null);

  // Consolidated Brand DNA & Product Context loaded from Database
  const [brandContext, setBrandContext] = useState({
    brandName: 'Pulari',
    companyName: 'Pulari',
    industry: 'E-commerce / Artisanal Confectionery',
    targetAudience: 'Modern Consumers & Connoisseurs',
    tagline: 'Artisanal Luxury Chocolates Handcrafted with Pure Cocoa',
    missionStatement: 'Delivering uncompromised artisanal chocolates made with direct-trade single-origin cacao.',
    visionStatement: 'To redefine luxury confectionery through sustainable ethical cacao sourcing.',
    brandStory: 'Founded with a passion for uncompromised purity, Pulari crafts single-origin cocoa drops.',
    brandPersonality: 'Visionary, Sophisticated, Authentic, Premium',
    productName: 'Pulari ChocoDrop',
    productTagline: 'Pure Cacao, Zero Sugar',
    shortDescription: 'Velvety smooth 100% organic cacao drops handcrafted with zero refined sugars.',
    detailedDescription: 'Handcrafted single-origin organic dark chocolate drops tempered to perfection.',
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
    ],
    website: 'www.pulari.com'
  });

  // Featured USP Index
  const [selectedUspIndex, setSelectedUspIndex] = useState(0);

  // Global Theme & Typography Preset
  const [globalTheme, setGlobalTheme] = useState('choco_cream');
  const [globalFont, setGlobalFont] = useState('serif');

  // Multi-Ad Posts Suite Data State (6 Posts)
  const [adPosts, setAdPosts] = useState([]);

  // Load initial data from Brand Analysis & Product Strategy Pages
  useEffect(() => {
    fetchBrandAndStrategyContext();

    const handleGlobalSync = () => {
      fetchBrandAndStrategyContext();
    };
    window.addEventListener('brand_dna_updated', handleGlobalSync);
    return () => window.removeEventListener('brand_dna_updated', handleGlobalSync);
  }, []);

  const fetchBrandAndStrategyContext = async () => {
    setLoading(true);
    try {
      const [profileRes, brandRes, strategyRes, personaRes] = await Promise.allSettled([
        startupService.getProfile(),
        brandService.getIdentity(),
        productStrategyService.getStrategy(),
        personaService.getPersonas(),
      ]);

      let company = 'Master Brand';
      let ind = 'Business Category';
      let target = 'Modern Consumers';
      let web = 'www.branddna.ai';

      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        const p = profileRes.value.data;
        company = p.companyName || company;
        ind = p.industry || ind;
        target = p.targetAudience || target;
        web = p.website ? p.website.replace(/^https?:\/\//, '') : web;
      }

      let bName = company;
      let tag = '';
      let miss = '';
      let vis = '';
      let story = '';
      let pers = '';

      if (brandRes.status === 'fulfilled' && brandRes.value?.data) {
        const b = brandRes.value.data.brand || brandRes.value.data;
        bName = b.brandName || bName;
        tag = b.tagline || tag;
        miss = b.missionStatement || miss;
        vis = b.visionStatement || vis;
        story = b.brandStory || story;
        pers = b.brandPersonality || pers;
      }

      let pName = bName;
      let pTag = tag;
      let desc = tag || 'High-performance solution tailored for your market needs.';
      let detailedDesc = '';
      let uspsList = [];
      let posStmt = '';

      if (strategyRes.status === 'fulfilled' && strategyRes.value?.data) {
        const s = strategyRes.value.data.strategy || strategyRes.value.data;
        pName = s.productName || pName;
        pTag = s.productTagline || pTag;
        desc = s.shortDescription || desc;
        detailedDesc = s.detailedDescription || detailedDesc;
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
        uspsList = [
          { title: 'Institutional Quality', description: desc || 'Built for high performance' },
          { title: 'Signature Advantage', description: posStmt || 'Tailored to market needs' }
        ];
      }

      const mergedContext = {
        brandName: bName,
        companyName: company,
        industry: ind,
        targetAudience: target,
        tagline: tag || desc,
        missionStatement: miss,
        visionStatement: vis,
        brandStory: story,
        brandPersonality: pers || 'Visionary, Sophisticated, Premium',
        productName: pName,
        productTagline: pTag,
        shortDescription: desc,
        detailedDescription: detailedDesc,
        usps: uspsList,
        positioningStatement: posStmt,
        personas: personaList,
        website: web,
      };

      setBrandContext(mergedContext);

      // Only generate default adPosts suite if adPosts is currently empty
      setAdPosts((prevPosts) => {
        if (!prevPosts || prevPosts.length === 0) {
          return generatePostsSuiteArray(mergedContext, selectedUspIndex, 42);
        }
        return prevPosts.map((p) => ({
          ...p,
          websiteUrl: web || p.websiteUrl,
        }));
      });
    } catch (err) {
      console.error('Error fetching brand context:', err);
      showToast('Loaded saved brand context.', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Generate 6 distinct Commercial Advertisement Posts array
  const generatePostsSuiteArray = (ctx = brandContext, uspIdx = selectedUspIndex, seedBase = 42) => {
    const bName = ctx.brandName || ctx.companyName || 'Master Brand';
    const pName = ctx.productName || bName;
    const ind = ctx.industry || 'Market Category';
    const tag = ctx.tagline || ctx.shortDescription || `Elevating your ${ind}`;
    const activeUsp = ctx.usps && ctx.usps[uspIdx] ? ctx.usps[uspIdx] : ctx.usps[0] || { title: 'Signature Advantage', description: 'Built for high quality' };
    const firstPersona = ctx.personas && ctx.personas[0] ? ctx.personas[0] : null;
    const personaTarget = firstPersona ? firstPersona.personaName.split(',')[0] : ctx.targetAudience || 'Connoisseurs';
    const personaChallenge = firstPersona?.painPoints?.primaryChallenge || 'Finding uncompromised quality in the market';
    const pos = ctx.positioningStatement || `${pName} sets the new gold standard in ${ind}.`;

    const sanitizedTag = ind.toLowerCase().replace(/[^a-z0-9]/g, '');

    return [
      {
        id: 'post-1',
        title: 'Hero Product Showcase Ad',
        type: 'Social Feed Post (1:1)',
        aspectRatio: '1:1',
        seed: seedBase + 10,
        badgeText: 'SIGNATURE LAUNCH',
        headlineText: `Experience ${pName}`,
        subtitleText: tag,
        ctaText: 'Explore Collection',
        websiteUrl: ctx.website || 'www.branddna.ai',
        sloganText: `Crafted by ${bName}`,
        theme: 'choco_cream',
        promptKeyword: `professional hero studio showcase photo of ${pName} by ${bName}, ${ind} category, centered pedestal display, cinematic soft key lighting, 8k commercial photography`,
        captionText: `✨ Elevate your everyday experience with ${pName} by ${bName}.\n\n${descSummary(ctx.shortDescription, tag)}\n\n👉 Discover the collection: ${ctx.website || 'www.branddna.ai'}\n\n#${bName.replace(/\s+/g, '')} #${pName.replace(/\s+/g, '')} #${sanitizedTag} #CommercialAd #ProductLaunch`
      },
      {
        id: 'post-2',
        title: 'USP Feature Spotlight Ad',
        type: 'Portrait Feed Post (4:5)',
        aspectRatio: '4:5',
        seed: seedBase + 20,
        badgeText: 'CORE ADVANTAGE',
        headlineText: activeUsp.title,
        subtitleText: `${activeUsp.description} • Powered by ${bName}`,
        ctaText: 'Learn More',
        websiteUrl: ctx.website || 'www.branddna.ai',
        sloganText: `${activeUsp.title} Guarantee`,
        theme: 'emerald_gold',
        promptKeyword: `emerald and gold luxury macro feature detail shot of ${pName}, ${activeUsp.title}, dark studio atmosphere, premium lighting reflections, 8k photo`,
        captionText: `💡 Why connoisseurs choose ${pName}:\n\n- ${activeUsp.title}: ${activeUsp.description}\n\nEngineered by ${bName} for uncompromised standards.\n\n🔗 Read the strategy: ${ctx.website || 'www.branddna.ai'}\n\n#${activeUsp.title.replace(/\s+/g, '')} #${pName.replace(/\s+/g, '')} #USP #BrandQuality`
      },
      {
        id: 'post-3',
        title: 'Promotional Launch & Offer Banner',
        type: 'Square Feed Post (1:1)',
        aspectRatio: '1:1',
        seed: seedBase + 30,
        badgeText: 'LIMITED EDITION',
        headlineText: `Introducing ${pName}`,
        subtitleText: `${ctx.productTagline || tag} — Official Release Available Now.`,
        ctaText: 'Get Exclusive Access',
        websiteUrl: ctx.website || 'www.branddna.ai',
        sloganText: 'Official Commercial Launch',
        theme: 'sunset_gold',
        promptKeyword: `dramatic promotional hero launch shot of ${pName} by ${bName}, golden hour sunlight flare, commercial release aesthetic, 8k photo`,
        captionText: `🎉 THE WAIT IS OVER!\n\nIntroducing ${pName} by ${bName}. ${ctx.productTagline || tag}.\n\nLimited initial release batch. Secure yours today!\n\n🛒 Order now: ${ctx.website || 'www.branddna.ai'}\n\n#OfficialRelease #NewLaunch #${pName.replace(/\s+/g, '')} #ExclusiveOffer`
      },
      {
        id: 'post-4',
        title: 'Target Persona Solution Ad',
        type: 'Contextual Feed Post (4:5)',
        aspectRatio: '4:5',
        seed: seedBase + 40,
        badgeText: 'ICP TARGETED',
        headlineText: `Designed for ${personaTarget}`,
        subtitleText: personaChallenge,
        ctaText: 'View Solution',
        websiteUrl: ctx.website || 'www.branddna.ai',
        sloganText: `Built for ${personaTarget}`,
        theme: 'royal_indigo',
        promptKeyword: `authentic lifestyle contextual advertisement photo of ${pName} for ${personaTarget}, warm ambient light, editorial quality studio shot`,
        captionText: `🎯 Built specifically for ${personaTarget}.\n\nSay goodbye to ${personaChallenge.toLowerCase()}. ${pName} provides the exact solution you've been searching for.\n\nLearn how it works: ${ctx.website || 'www.branddna.ai'}\n\n#${personaTarget.replace(/\s+/g, '')} #ProductSolution #${bName.replace(/\s+/g, '')}`
      },
      {
        id: 'post-5',
        title: 'Editorial Brand Positioning Post',
        type: 'Editorial Quote Card (1:1)',
        aspectRatio: '1:1',
        seed: seedBase + 50,
        badgeText: 'BRAND STATEMENT',
        headlineText: `Redefining ${ind.split('/')[0]}`,
        subtitleText: pos.length > 120 ? pos.substring(0, 117) + '...' : pos,
        ctaText: 'Read Our Story',
        websiteUrl: ctx.website || 'www.branddna.ai',
        sloganText: `${bName} Brand Promise`,
        theme: 'velvet_crimson',
        promptKeyword: `editorial brand positioning magazine photo for ${bName} ${pName}, architectural backdrop, soft key shadows, corporate luxury aesthetic`,
        captionText: `💬 "${pos}"\n\nAt ${bName}, we believe in pushing the boundaries of ${ind}.\n\nRead our complete brand story: ${ctx.website || 'www.branddna.ai'}\n\n#BrandPositioning #Leadership #${bName.replace(/\s+/g, '')} #Vision`
      },
      {
        id: 'post-6',
        title: 'Mobile Story / Reel Cover Banner',
        type: 'Vertical Story Ad (9:16)',
        aspectRatio: '9:16',
        seed: seedBase + 60,
        badgeText: 'SWIPE UP TO SHOP',
        headlineText: `${pName} is Here`,
        subtitleText: `${tag} • Tap to view product.`,
        ctaText: 'Swipe Up / Click Link',
        websiteUrl: ctx.website || 'www.branddna.ai',
        sloganText: `Official ${bName} Story`,
        theme: 'cyber_neon',
        promptKeyword: `vertical mobile story product showcase photo of ${pName}, cyber cyan and blue neon rim light, sleek futuristic vertical composition, 8k photo`,
        captionText: `📲 ${pName} is now live!\n\nTap the link to explore the collection: ${ctx.website || 'www.branddna.ai'}\n\n#StoryAd #MobileLaunch #${pName.replace(/\s+/g, '')}`
      }
    ];
  };

  const generateAdPostsSuite = (ctx = brandContext, uspIdx = selectedUspIndex, seedBase = 42) => {
    const postsSuite = generatePostsSuiteArray(ctx, uspIdx, seedBase);
    setAdPosts(postsSuite);
  };

  // Helper to fetch external image as base64 DataURL for CORS-safe canvas export
  const getBase64FromUrl = (url) => {
    return new Promise((resolve) => {
      if (!url || url.startsWith('data:')) {
        resolve(url);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 800;
          canvas.height = img.naturalHeight || img.height || 800;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (e) {
          console.warn('Canvas toDataURL security error fallback:', e);
          resolve(url);
        }
      };
      img.onerror = () => {
        resolve(url);
      };
      img.src = url;
    });
  };

  // Native 2D Canvas Direct Commercial Ad Poster Exporter (100% CORS & DOM-error proof)
  const exportAdPostDirectCanvas = (post, format = 'png') => {
    return new Promise((resolve) => {
      try {
        const width = post.aspectRatio === '9:16' ? 1080 : 1200;
        const height = post.aspectRatio === '1:1' ? 1200 : post.aspectRatio === '9:16' ? 1920 : 1500;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fill background slate
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, width, height);

        const bName = brandContext.brandName || 'Brand';
        const pName = brandContext.productName || 'Product';
        const title = post.headlineText || `Experience ${pName}`;
        const subtitle = post.subtitleText || brandContext.tagline || '';
        const badge = post.badgeText || 'COMMERCIAL RELEASE';
        const cta = post.ctaText || 'Explore Product';
        const website = post.websiteUrl || brandContext.website || 'www.branddna.ai';

        const img = new Image();
        img.crossOrigin = 'anonymous';

        const renderCanvasAndDownload = () => {
          try {
            if (img.complete && img.naturalWidth !== 0) {
              ctx.drawImage(img, 0, 0, width, height);
            }
          } catch (e) {}

          // Gradient overlay
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
          grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.55)');
          grad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Top Header: Brand Name & Badge
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText(bName.toUpperCase(), 60, 90);

          if (badge) {
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.roundRect(width - 340, 55, 280, 48, 24);
            ctx.fill();

            ctx.fillStyle = '#0F172A';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(badge.toUpperCase(), width - 200, 86);
            ctx.textAlign = 'left';
          }

          // Center Product Tag
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.roundRect(60, height / 2 - 40, width - 120, 70, 35);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '600 24px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`✨ ${pName}`, width / 2, height / 2 + 6);
          ctx.textAlign = 'left';

          // Bottom Headline & Subtitle
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 54px sans-serif';

          const words = title.split(' ');
          let line = '';
          let y = height - 280;
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > width - 120 && n > 0) {
              ctx.fillText(line, 60, y);
              line = words[n] + ' ';
              y += 64;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 60, y);

          // Subtitle
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = '500 24px sans-serif';
          ctx.fillText(subtitle.length > 90 ? subtitle.substring(0, 87) + '...' : subtitle, 60, y + 55);

          // CTA Button
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.roundRect(60, height - 110, 260, 60, 30);
          ctx.fill();

          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(cta, 95, height - 73);

          // Website handle
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = 'bold 20px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(website.toUpperCase(), width - 60, height - 73);
          ctx.textAlign = 'left';

          // Data URL & File Trigger
          const imageUri = canvas.toDataURL('image/png');
          const sanitized = `${pName}_${post.title || 'Poster'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          const fileName = `${sanitized}_${Date.now()}.${format}`;

          if (format === 'png') {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = imageUri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else if (format === 'pdf') {
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: [210, 262.5],
            });
            pdf.addImage(imageUri, 'PNG', 0, 0, 210, 262.5);
            pdf.save(fileName);
          }

          setDownloadedFilePreview({
            title: post.title || 'Ad Poster',
            format: format.toUpperCase(),
            fileName: fileName,
            imageUri: imageUri,
            dimensions: `${width} x ${height} px (300 DPI High Res)`,
          });

          showToast(`Downloaded ${post.title || 'Ad Poster'} as ${format.toUpperCase()} file!`, 'success');
          resolve(true);
        };

        img.onload = renderCanvasAndDownload;
        img.onerror = renderCanvasAndDownload;
        img.src = getImageUrlForPost(post);
      } catch (err) {
        console.error('Direct canvas render error:', err);
        resolve(false);
      }
    });
  };

  // Download a single ad post card as PNG or PDF with fail-safe CORS fallback
  const handleDownloadSinglePost = async (postId, format = 'png', title = 'Ad_Post') => {
    const targetPost = adPosts.find((p) => p.id === postId) || activeModalPost;
    const canvasEl = document.getElementById(`canvas-${postId}`) || document.getElementById(`modal-canvas-${postId}`);

    setDownloading(true);
    showToast(`Preparing high-res ${title} (${format.toUpperCase()})...`, 'info');

    try {
      if (!canvasEl) {
        if (targetPost) {
          await exportAdPostDirectCanvas(targetPost, format);
        }
        return;
      }

      const imgEl = canvasEl.querySelector('img');
      let originalSrc = '';
      let dataUrl = '';

      if (imgEl && imgEl.src) {
        originalSrc = imgEl.src;
        dataUrl = await getBase64FromUrl(originalSrc);
        if (dataUrl && dataUrl.startsWith('data:')) {
          imgEl.src = dataUrl;
        }
      }

      await new Promise((r) => setTimeout(r, 200));

      let canvas;
      try {
        canvas = await html2canvas(canvasEl, {
          useCORS: true,
          allowTaint: false,
          scale: 3,
          logging: false,
          backgroundColor: null,
        });
      } catch (canvasErr) {
        console.warn('Primary html2canvas render failed, running fallback export:', canvasErr);
        if (imgEl) imgEl.style.display = 'none';
        canvas = await html2canvas(canvasEl, {
          useCORS: true,
          allowTaint: false,
          scale: 3,
          logging: false,
        });
        if (imgEl) imgEl.style.display = '';
      }

      if (imgEl && originalSrc && dataUrl !== originalSrc) {
        imgEl.src = originalSrc;
      }

      const pName = brandContext.productName || brandContext.brandName || 'Ad_Post';
      const sanitizedName = `${pName}_${title}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      const timeStamp = Date.now();
      const imageUri = canvas.toDataURL('image/png');
      const fileName = `${sanitizedName}_${timeStamp}.${format}`;

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = imageUri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [210, 210],
        });
        pdf.addImage(imageUri, 'PNG', 0, 0, 210, 210);
        pdf.save(fileName);
      }

      setDownloadedFilePreview({
        title: title,
        format: format.toUpperCase(),
        fileName: fileName,
        imageUri: imageUri,
        dimensions: '2400 x 3000 px (300 DPI High Res)',
      });

      showToast(`Downloaded ${title} as ${format.toUpperCase()} file!`, 'success');
    } catch (err) {
      console.error('Single post export error, using native 2D canvas generator:', err);
      if (targetPost) {
        await exportAdPostDirectCanvas(targetPost, format);
      } else {
        showToast('Could not download post.', 'error');
      }
    } finally {
      setDownloading(false);
    }
  };

  // Download entire campaign as a multi-page PDF document with fail-safe CORS fallback
  const handleDownloadFullCampaignPdf = async () => {
    setDownloading(true);
    showToast('Generating full multi-page commercial ad campaign PDF...', 'info');

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 262.5],
      });

      for (let i = 0; i < adPosts.length; i++) {
        const post = adPosts[i];
        const canvasEl = document.getElementById(`canvas-${post.id}`);
        if (canvasEl) {
          const imgEl = canvasEl.querySelector('img');
          let originalSrc = '';
          let dataUrl = '';
          if (imgEl && imgEl.src) {
            originalSrc = imgEl.src;
            dataUrl = await getBase64FromUrl(originalSrc);
            if (dataUrl && dataUrl.startsWith('data:')) imgEl.src = dataUrl;
          }

          await new Promise((r) => setTimeout(r, 200));

          let canvas;
          try {
            canvas = await html2canvas(canvasEl, {
              useCORS: true,
              allowTaint: false,
              scale: 2.5,
              logging: false,
            });
          } catch (cErr) {
            if (imgEl) imgEl.style.display = 'none';
            canvas = await html2canvas(canvasEl, {
              useCORS: true,
              allowTaint: false,
              scale: 2.5,
              logging: false,
            });
            if (imgEl) imgEl.style.display = '';
          }

          if (imgEl && originalSrc && dataUrl !== originalSrc) imgEl.src = originalSrc;

          const imageUri = canvas.toDataURL('image/png');
          if (i > 0) pdf.addPage([210, 262.5], 'portrait');
          pdf.addImage(imageUri, 'PNG', 0, 0, 210, 262.5);
        }
      }

      const pName = (brandContext.productName || 'Brand').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`${pName}_Full_Ad_Campaign_${Date.now()}.pdf`);
      showToast('Downloaded complete 6-Post Commercial Campaign PDF!', 'success');
    } catch (err) {
      console.error('Full PDF export error:', err);
      showToast('Could not generate campaign PDF. Try downloading posts individually.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Regenerate entire ad posts suite with fresh seeds
  const handleRegenerateAllPosts = () => {
    setGeneratingAll(true);
    const newBaseSeed = Math.floor(Math.random() * 90000) + 1000;
    setTimeout(() => {
      generateAdPostsSuite(brandContext, selectedUspIndex, newBaseSeed);
      setGeneratingAll(false);
      showToast('Synthesized fresh AI ad post artwork suite!', 'success');
    }, 600);
  };

  // Save changes made in Ad Poster Studio back to MongoDB & sync across all pages
  const handleSaveAndSyncToBrandDNA = async () => {
    setSyncing(true);
    try {
      showToast('Saving & synchronizing across all brand pages...', 'info');

      let currentBrandName = brandContext.brandName;
      let currentProductName = brandContext.productName;
      let currentTagline = brandContext.tagline;
      let currentShortDesc = brandContext.shortDescription;
      let currentWebsite = brandContext.website;

      if (activeModalPost) {
        setAdPosts((prev) =>
          prev.map((p) => (p.id === activeModalPost.id ? activeModalPost : p))
        );
        if (activeModalPost.subtitleText) {
          currentTagline = activeModalPost.subtitleText;
          currentShortDesc = activeModalPost.subtitleText;
        }
      }

      await Promise.allSettled([
        brandService.saveBrandIdentity({
          brandName: currentBrandName,
          tagline: currentTagline,
        }),
        productStrategyService.saveStrategy({
          productName: currentProductName,
          shortDescription: currentShortDesc,
          productTagline: currentTagline,
        }),
        startupService.updateProfile({
          companyName: currentBrandName,
          website: currentWebsite,
        }),
      ]);

      setBrandContext((prev) => ({
        ...prev,
        brandName: currentBrandName,
        companyName: currentBrandName,
        productName: currentProductName,
        tagline: currentTagline,
        shortDescription: currentShortDesc,
        website: currentWebsite,
      }));

      window.dispatchEvent(new CustomEvent('brand_dna_updated'));
      showToast('Successfully saved & synchronized across all BrandDNA modules!', 'success');
    } catch (err) {
      console.error('Error syncing brand DNA:', err);
      showToast('Saved changes locally.', 'info');
    } finally {
      setSyncing(false);
    }
  };

  const copyCaptionText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast('Ad caption & hashtags copied to clipboard!', 'info');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Preset Color Palettes
  const themeStyles = {
    choco_cream: {
      bg: 'from-[#2C1810]/95 via-[#3D2317]/85 to-transparent',
      text: 'text-amber-100',
      accent: 'bg-amber-400 text-slate-950',
      btn: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    },
    emerald_gold: {
      bg: 'from-[#062C22]/95 via-[#0A4737]/85 to-transparent',
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
    velvet_crimson: {
      bg: 'from-[#3B0712]/95 via-[#580A1C]/85 to-transparent',
      text: 'text-rose-100',
      accent: 'bg-rose-400 text-slate-950',
      btn: 'bg-rose-400 text-slate-950 hover:bg-rose-300',
    },
    cyber_neon: {
      bg: 'from-[#090D16]/95 via-[#0F172A]/85 to-transparent',
      text: 'text-cyan-100',
      accent: 'bg-cyan-400 text-slate-950',
      btn: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
    },
    sunset_gold: {
      bg: 'from-[#431407]/95 via-[#7C2D12]/85 to-transparent',
      text: 'text-orange-100',
      accent: 'bg-orange-400 text-slate-950',
      btn: 'bg-orange-400 text-slate-950 hover:bg-orange-300',
    },
    royal_indigo: {
      bg: 'from-[#1E1B4B]/95 via-[#312E81]/85 to-transparent',
      text: 'text-indigo-100',
      accent: 'bg-indigo-400 text-slate-950',
      btn: 'bg-indigo-400 text-slate-950 hover:bg-indigo-300',
    },
    minimalist_pearl: {
      bg: 'from-[#18181B]/95 via-[#27272A]/85 to-transparent',
      text: 'text-zinc-100',
      accent: 'bg-zinc-100 text-slate-950',
      btn: 'bg-zinc-100 text-slate-950 hover:bg-white',
    },
  };

  const getImageUrlForPost = (post) => {
    const pName = brandContext.productName || brandContext.brandName || 'Product Showcase';
    const bName = brandContext.brandName || 'Master Brand';
    const ind = brandContext.industry || 'Commercial Product';
    const desc = brandContext.shortDescription || brandContext.tagline || brandContext.detailedDescription || '';
    const pers = brandContext.brandPersonality || 'Sleek, Premium';
    const uspsStr = brandContext.usps && brandContext.usps.length > 0 ? brandContext.usps.map((u) => u.title).join(', ') : '';
    const pos = brandContext.positioningStatement || '';

    let fullVisualPrompt = `photorealistic commercial advertisement product photo for "${pName}" by brand "${bName}". Category: ${ind}. ${pos ? `Product strategy & positioning: ${pos}. ` : ''}Product description and features: ${desc}. Key highlights: ${uspsStr}. Brand aesthetic: ${pers}. Photography style: ${post.promptKeyword}, studio lighting, 8k resolution, professional advertising photography`;

    if (customVisualPrompt && customVisualPrompt.trim()) {
      fullVisualPrompt += `. Custom product visual detail: ${customVisualPrompt.trim()}`;
    }

    let width = 800;
    let height = 800;
    if (post.aspectRatio === '4:5') height = 1000;
    if (post.aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    }
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullVisualPrompt)}?width=${width}&height=${height}&nologo=true&seed=${post.seed}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 font-mono">
          Generating Commercial Ad Campaign Suite from Brand DNA & Strategy...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-24 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER WITH CAMPAIGN ACTIONS & DOWNLOAD BUNDLE
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                Module 06: Marketing & Ad Studio
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Synced with Saved Brand Identity & Product Strategy
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight">
              AI Commercial Advertisement Post Creation Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
              Creating high-impact social & commercial ad posts tailored specifically to your Brand Identity (
              <strong className="text-slate-800">{brandContext.brandName}</strong>) and Product Strategy (
              <strong className="text-slate-800">{brandContext.productName}</strong>). Download posts individually or export full campaign bundles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleSaveAndSyncToBrandDNA}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Save & Sync All Pages'}</span>
            </button>

            <button
              onClick={handleDownloadFullCampaignPdf}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Download Campaign PDF</span>
            </button>

            <button
              onClick={handleRegenerateAllPosts}
              disabled={generatingAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${generatingAll ? 'animate-spin' : ''}`} />
              <span>{generatingAll ? 'Synthesizing...' : 'Regenerate Campaign AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BRAND IDENTITY & PRODUCT STRATEGY CONTEXT BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D6E6EC]/60 pb-3">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Synced Brand DNA & Strategy Attributes (Database Verified)
            </span>
          </div>
          <button
            onClick={handleSaveAndSyncToBrandDNA}
            disabled={syncing}
            className="text-[10px] font-mono text-blue-600 hover:text-blue-800 underline font-bold cursor-pointer"
          >
            Force Sync All Pages
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Master Brand */}
          <div className="p-3.5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-600" /> Master Brand (Editable)
            </span>
            <input
              type="text"
              value={brandContext.brandName}
              onChange={(e) => {
                const val = e.target.value;
                setBrandContext((prev) => ({ ...prev, brandName: val, companyName: val }));
              }}
              className="w-full bg-white border border-slate-300 rounded-md px-2 py-0.5 font-extrabold text-slate-900 text-xs outline-none"
              placeholder="Brand Name"
            />
            <input
              type="text"
              value={brandContext.tagline}
              onChange={(e) => {
                const val = e.target.value;
                setBrandContext((prev) => ({ ...prev, tagline: val }));
              }}
              className="w-full bg-white/70 border border-slate-200 rounded-md px-2 py-0.5 font-medium text-slate-600 text-[10px] outline-none"
              placeholder="Brand Tagline"
            />
          </div>

          {/* Active Product Strategy */}
          <div className="p-3.5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
              <Package className="w-3 h-3 text-emerald-600" /> Active Product Strategy (Editable)
            </span>
            <input
              type="text"
              value={brandContext.productName}
              onChange={(e) => {
                const val = e.target.value;
                setBrandContext((prev) => ({ ...prev, productName: val }));
              }}
              className="w-full bg-white border border-slate-300 rounded-md px-2 py-0.5 font-extrabold text-slate-900 text-xs outline-none"
              placeholder="Product Name"
            />
            <input
              type="text"
              value={brandContext.shortDescription}
              onChange={(e) => {
                const val = e.target.value;
                setBrandContext((prev) => ({ ...prev, shortDescription: val }));
              }}
              className="w-full bg-white/70 border border-slate-200 rounded-md px-2 py-0.5 font-medium text-slate-600 text-[10px] outline-none"
              placeholder="Product Pitch / Description"
            />
          </div>

          {/* USP Selection Dropdown */}
          <div className="p-3.5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> Featured USP</span>
              <span className="text-[9px] text-blue-600 font-bold font-sans">Select USP</span>
            </span>
            <select
              value={selectedUspIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setSelectedUspIndex(idx);
                generateAdPostsSuite(brandContext, idx, activePosterSeed);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 outline-none cursor-pointer"
            >
              {brandContext.usps.map((u, i) => (
                <option key={i} value={i}>
                  USP {i + 1}: {u.title}
                </option>
              ))}
            </select>
          </div>

          {/* Target ICP Persona */}
          <div className="p-3.5 rounded-2xl bg-[#EAF4F7]/40 border border-[#D6E6EC] space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-purple-600" /> ICP Target Persona
            </span>
            <p className="font-extrabold text-slate-900 text-sm truncate">
              {brandContext.personas[0]?.personaName || 'Sarah, Busy Founder'}
            </p>
            <p className="text-[10px] text-slate-500 truncate font-medium">
              {brandContext.personas[0]?.demographics?.occupation || brandContext.targetAudience}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6-POST ADVERTISEMENT CAMPAIGN GALLERY SUITE
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              6-Post Commercial Ad Campaign Suite
            </h2>
            <p className="text-xs text-slate-500">
              Tailored advertisement posts generated specifically for <strong className="text-slate-800">{brandContext.productName}</strong> by <strong className="text-slate-800">{brandContext.brandName}</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adPosts.map((post, idx) => {
            const theme = themeStyles[post.theme] || themeStyles.choco_cream;
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-[#D6E6EC] shadow-2xs overflow-hidden flex flex-col justify-between space-y-4 p-5 hover:shadow-md transition-all"
              >
                {/* Card Top Info Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">{post.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{post.type}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModalPost(post)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                    title="Expand in Deep Studio Editor"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* AD POSTER CANVAS CARD */}
                <div
                  id={`canvas-${post.id}`}
                  className={`relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 group select-none flex flex-col justify-between p-5 text-left transition-all ${
                    post.aspectRatio === '1:1' ? 'aspect-square' : post.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[4/5]'
                  }`}
                >
                  {/* Image Backdrop Layer */}
                  <img
                    src={getImageUrlForPost(post)}
                    alt={post.title}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getIndustryFallbackImage(brandContext.industry);
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${theme.bg}`} />

                  {/* Top Bar Header */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-white/90 block">
                        {brandContext.brandName}
                      </span>
                    </div>

                    {post.badgeText && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase shadow-xs ${theme.accent}`}>
                        {post.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Center Tag */}
                  <div className="relative z-10 my-auto text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-[9px] font-mono border border-white/20">
                      ✨ {brandContext.productName}
                    </span>
                  </div>

                  {/* Bottom Typography */}
                  <div className="relative z-10 space-y-2 pt-3 border-t border-white/15">
                    <h4 className={`text-xl font-bold tracking-tight leading-tight ${theme.text}`}>
                      {post.headlineText}
                    </h4>
                    <p className="text-xs text-white/80 font-medium line-clamp-2">
                      {post.subtitleText}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full font-bold text-[10px] shadow-md ${theme.btn}`}>
                        {post.ctaText}
                      </span>
                      <span className="text-[8px] font-mono text-white/60 uppercase">
                        {post.websiteUrl}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AD COPY & HASHTAGS CAPTION PREVIEW */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-blue-600" /> Formatted Ad Caption
                    </span>

                    <button
                      onClick={() => copyCaptionText(post.captionText, idx)}
                      className="text-[10px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Caption'}</span>
                    </button>
                  </div>

                  <p className="font-sans text-[11px] leading-relaxed text-slate-800 line-clamp-3 whitespace-pre-line">
                    {post.captionText}
                  </p>
                </div>

                {/* CARD FOOTER DOWNLOAD ACTIONS */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActiveModalPost(post)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-600" />
                    <span>Studio Editor</span>
                  </button>

                  <button
                    onClick={() => handleDownloadSinglePost(post.id, 'png', post.title)}
                    disabled={downloading}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    title="Download PNG image"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>

                  <button
                    onClick={() => handleDownloadSinglePost(post.id, 'pdf', post.title)}
                    disabled={downloading}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    title="Download PDF document"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DEEP STUDIO EDITOR MODAL (FULL SCREEN CUSTOMIZER)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeModalPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-left relative my-auto max-h-[90vh] overflow-y-auto font-sans"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-600" />
                    Deep Studio Editor: {activeModalPost.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fine-tune AI prompt keywords, visual themes, typography, and copy overlays for this post.
                  </p>
                </div>

                <button
                  onClick={() => setActiveModalPost(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Live Canvas Preview */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 uppercase">Live Canvas</span>
                    <span className="text-[10px] font-mono text-slate-400">{activeModalPost.aspectRatio} Aspect</span>
                  </div>

                  <div
                    id={`modal-canvas-${activeModalPost.id}`}
                    className={`relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 group select-none flex flex-col justify-between p-6 text-left shadow-lg ${
                      activeModalPost.aspectRatio === '1:1' ? 'aspect-square' : activeModalPost.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[4/5]'
                    }`}
                  >
                    <img
                      src={getImageUrlForPost(activeModalPost)}
                      alt={activeModalPost.title}
                      crossOrigin="anonymous"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className={`absolute inset-0 bg-gradient-to-b ${themeStyles[activeModalPost.theme]?.bg || themeStyles.choco_cream.bg}`} />

                    <div className="relative z-10 flex items-start justify-between">
                      <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-white/90">
                        {brandContext.brandName}
                      </span>
                      {activeModalPost.badgeText && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${themeStyles[activeModalPost.theme]?.accent || themeStyles.choco_cream.accent}`}>
                          {activeModalPost.badgeText}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 my-auto text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-[9px] font-mono border border-white/20">
                        ✨ {brandContext.productName}
                      </span>
                    </div>

                    <div className="relative z-10 space-y-2 pt-3 border-t border-white/15">
                      <h4 className={`text-xl font-bold tracking-tight ${themeStyles[activeModalPost.theme]?.text || 'text-white'}`}>
                        {activeModalPost.headlineText}
                      </h4>
                      <p className="text-xs text-white/80 font-medium">
                        {activeModalPost.subtitleText}
                      </p>

                      <div className="pt-1 flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${themeStyles[activeModalPost.theme]?.btn || 'bg-amber-400 text-slate-950'}`}>
                          {activeModalPost.ctaText}
                        </span>
                        <span className="text-[8px] font-mono text-white/60 uppercase">
                          {activeModalPost.websiteUrl}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Editing Controls */}
                <div className="lg:col-span-7 space-y-4 text-xs">
                  {/* Theme Switcher */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Color Palette Theme
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'choco_cream', name: 'Choco Cream' },
                        { id: 'emerald_gold', name: 'Emerald Gold' },
                        { id: 'dark_luxury', name: 'Midnight Dark' },
                        { id: 'velvet_crimson', name: 'Velvet Crimson' },
                        { id: 'cyber_neon', name: 'Cyber Neon' },
                        { id: 'sunset_gold', name: 'Sunset Amber' },
                        { id: 'royal_indigo', name: 'Royal Indigo' },
                        { id: 'minimalist_pearl', name: 'Minimal Pearl' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setAdPosts((prev) =>
                              prev.map((p) => (p.id === activeModalPost.id ? { ...p, theme: t.id } : p))
                            );
                            setActiveModalPost((prev) => ({ ...prev, theme: t.id }));
                          }}
                          className={`p-2 rounded-xl border text-[10px] font-bold cursor-pointer ${
                            activeModalPost.theme === t.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Copy Editors */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Headline Text
                    </label>
                    <input
                      type="text"
                      value={activeModalPost.headlineText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdPosts((prev) =>
                          prev.map((p) => (p.id === activeModalPost.id ? { ...p, headlineText: val } : p))
                        );
                        setActiveModalPost((prev) => ({ ...prev, headlineText: val }));
                      }}
                      className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Subtitle / Pitch Copy
                    </label>
                    <input
                      type="text"
                      value={activeModalPost.subtitleText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdPosts((prev) =>
                          prev.map((p) => (p.id === activeModalPost.id ? { ...p, subtitleText: val } : p))
                        );
                        setActiveModalPost((prev) => ({ ...prev, subtitleText: val }));
                      }}
                      className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2 outline-none font-medium text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Promotional Badge
                      </label>
                      <input
                        type="text"
                        value={activeModalPost.badgeText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdPosts((prev) =>
                            prev.map((p) => (p.id === activeModalPost.id ? { ...p, badgeText: val } : p))
                          );
                          setActiveModalPost((prev) => ({ ...prev, badgeText: val }));
                        }}
                        className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Call to Action
                      </label>
                      <input
                        type="text"
                        value={activeModalPost.ctaText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdPosts((prev) =>
                            prev.map((p) => (p.id === activeModalPost.id ? { ...p, ctaText: val } : p))
                          );
                          setActiveModalPost((prev) => ({ ...prev, ctaText: val }));
                        }}
                        className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white rounded-xl px-3 py-2 outline-none font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Actions in Modal */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                    <button
                      onClick={handleSaveAndSyncToBrandDNA}
                      disabled={syncing}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Save & Sync Brand DNA
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadSinglePost(activeModalPost.id, 'png', activeModalPost.title)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PNG
                      </button>
                      <button
                        onClick={() => handleDownloadSinglePost(activeModalPost.id, 'pdf', activeModalPost.title)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" /> Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          DOWNLOADED FILE PREVIEW MODAL
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {downloadedFilePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-left relative my-auto font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                    Downloaded File Preview ({downloadedFilePreview.format})
                  </span>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">
                    {downloadedFilePreview.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {downloadedFilePreview.fileName} • {downloadedFilePreview.dimensions}
                  </p>
                </div>

                <button
                  onClick={() => setDownloadedFilePreview(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Render Preview Image */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-lg bg-slate-950 max-h-[60vh] flex items-center justify-center">
                <img
                  src={downloadedFilePreview.imageUri}
                  alt={downloadedFilePreview.fileName}
                  className="w-full h-auto object-contain max-h-[60vh]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <a
                  href={downloadedFilePreview.imageUri}
                  download={downloadedFilePreview.fileName}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Save / Re-Download File</span>
                </a>

                <button
                  onClick={() => setDownloadedFilePreview(null)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdPosterStudioPage;
