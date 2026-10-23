import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const getAIClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

/**
 * Generate commercial advertising studio backdrop / visual using Cloudflare Workers AI (Flux Schnell)
 */
export const generateCloudAdImage = async (prompt) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || '';

  if (!accountId || !apiToken) {
    console.warn('Cloudflare credentials not configured, skipping cloud image generation.');
    return null;
  }

  const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

  try {
    const response = await axios.post(
      cloudflareUrl,
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 35000,
      }
    );

    if (response.data?.success && response.data?.result?.image) {
      return response.data.result.image; // base64 string
    } else {
      console.warn('Cloudflare AI response error:', response.data?.errors);
      return null;
    }
  } catch (err) {
    console.error('Cloudflare Workers AI generation error:', err.response?.data || err.message);
    return null;
  }
};

const cleanJsonResponse = (rawText) => {
  if (!rawText) return null;
  let text = rawText.trim();
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (markdownMatch && markdownMatch[1]) {
    text = markdownMatch[1].trim();
  } else {
    const firstBracket = text.search(/[\{\[]/);
    const lastBracket = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      text = text.substring(firstBracket, lastBracket + 1);
    }
  }
  return JSON.parse(text);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithFallback = async (prompt) => {
  const ai = getAIClient();
  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
  ];

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      lastError = err;
      const errMsg = err.message || String(err);
      console.warn(`Ad Poster AI Fallback - Model ${model} failed:`, errMsg.slice(0, 100));
      if (
        errMsg.includes('404') ||
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('503') ||
        errMsg.includes('high demand') ||
        errMsg.includes('no longer available') ||
        errMsg.includes('not found')
      ) {
        continue;
      }
      await delay(200);
    }
  }

  throw lastError || new Error('All Gemini model candidates failed for Ad Poster generation.');
};

/**
 * Generate AI Ad Poster Concept strictly based on Product Data (Inventory Product or Saved Strategy)
 * Uses Gemini for advertising copy and Cloudflare Workers AI for the cloud visual background.
 */
export const generateAdPosterAI = async (productData, brandData = null) => {
  if (!productData) {
    throw new Error('Product data is required to generate ad poster.');
  }

  // Handle both inventory Product and MarketingProduct schemas
  const productName = productData.name || productData.productName || 'Featured Product';
  const productIdea = productData.productIdea || (typeof productData.description === 'string' ? productData.description : productData.description?.shortDescription) || '';
  const category = productData.categoryName || productData.category?.name || productData.category || 'Store Product';
  const sku = productData.sku || '';

  // Exact product image URL or base64
  let productImageUrl = '';
  if (Array.isArray(productData.images) && productData.images.length > 0) {
    productImageUrl = productData.images[0];
  } else if (typeof productData.image === 'string' && productData.image) {
    productImageUrl = productData.image;
  } else if (productData.productImageUrl) {
    productImageUrl = productData.productImageUrl;
  }
  
  // Extract USPs safely
  let uspsText = '';
  if (Array.isArray(productData.usps) && productData.usps.length > 0) {
    uspsText = productData.usps.map((u) => typeof u === 'string' ? u : `${u.title || ''}: ${u.description || ''}`).join(' | ');
  } else if (Array.isArray(productData.USP) && productData.USP.length > 0) {
    uspsText = productData.USP.join(' | ');
  } else if (productData.tagline) {
    uspsText = productData.tagline;
  } else if (productData.specifications && typeof productData.specifications === 'object') {
    const specEntries = Object.entries(productData.specifications instanceof Map ? Object.fromEntries(productData.specifications) : productData.specifications);
    if (specEntries.length > 0) {
      uspsText = specEntries.map(([k, v]) => `${k}: ${v}`).join(' | ');
    }
  }

  // Pricing info safely
  let pricingInfo = '';
  if (productData.price !== undefined && productData.price !== null) {
    const formattedPrice = `₹${Number(productData.price).toLocaleString('en-IN')}`;
    if (productData.discountPrice && productData.discountPrice > productData.price) {
      pricingInfo = `${formattedPrice} (Was ₹${Number(productData.discountPrice).toLocaleString('en-IN')})`;
    } else {
      pricingInfo = formattedPrice;
    }
  } else if (productData.pricingSuggestion?.suggestedPriceRange || productData.pricingSuggestion?.priceINR) {
    pricingInfo = productData.pricingSuggestion?.suggestedPriceRange || productData.pricingSuggestion?.priceINR;
  }

  // Positioning info safely
  const positioningInfo = productData.positioning?.positioningStatement || 
                          productData.positioning?.marketPositioning || 
                          productData.positioning?.targetMarket || 
                          (productData.brand ? `Official ${productData.brand} Performance Gear` : 'Designed for peak performance and everyday lifestyle.');

  // Brand Info
  const brandName = brandData?.brandName || productData.brand?.brandName || productData.brand || 'BrandDNA';
  const brandTagline = brandData?.tagline || '';

  const prompt = `
You are a World-Class E-Commerce Advertising Creative Director & Copywriter.
Create an AI Advertisement Poster Copy & Visual Theme Concept strictly derived from the PRODUCT DATA from MongoDB.

SOURCE OF TRUTH (PRODUCT DATA):
- Brand Name: "${brandName}" ${brandTagline ? `("${brandTagline}")` : ''}
- Product Name: "${productName}"
- Category: "${category}"
- SKU: "${sku}"
- Product Description / Concept: "${productIdea || 'Authentic store merchandise engineered for superior quality.'}"
- Saved Unique Selling Propositions (USPs): "${uspsText || 'Engineered for exceptional durability and comfort.'}"
- Saved Positioning: "${positioningInfo || 'Designed for customers who value excellence.'}"
- Price: "${pricingInfo || 'Available on store'}"

STRICT GUIDELINES:
1. Do NOT invent false claims, unmentioned ratings, or fake discounts.
2. Rely strictly on the provided product data above.
3. Keep text concise, punchy, high-converting, and free of typos.
4. Provide a cohesive theme color palette (primary hex, accent hex, background hex, text hex) appropriate for the category and brand.
5. Provide a detailed imagePrompt for Cloudflare Workers AI (Flux Schnell) to generate a commercial advertising backdrop / podium / environment suitable for displaying this product.

Return ONLY a valid JSON object matching this exact structure:
{
  "headline": "Short, high-impact promotional headline (4-8 words)",
  "subheadline": "Persuasive sub-headline highlighting key benefit (10-16 words)",
  "primaryUSP": "Core USP highlight title/badge (2-5 words)",
  "positioningMessage": "Short brand positioning message derived from saved strategy",
  "pricingText": "${pricingInfo ? pricingInfo : 'Available Now'}",
  "ctaText": "Call-to-Action copy (e.g., 'Shop Now', 'Explore Collection', 'Order Today')",
  "categoryText": "${category}",
  "brandNameText": "${brandName}",
  "themeColors": {
    "primary": "#0F172A",
    "accent": "#4F46E5",
    "bg": "#F8FAFC",
    "text": "#0F172A"
  },
  "layoutStyle": "modern_hero",
  "visualConcept": "Brief visual concept description for poster background/image",
  "imagePrompt": "Detailed commercial advertising studio environment prompt for Flux: Studio product photography environment for ${productName}, commercial e-commerce advertising backdrop, dramatic studio lighting, minimalist pedestal, cinematic depth of field, 8k resolution, clean empty space in center for hero product"
}

Return ONLY valid JSON. Do not include raw markdown wrappers outside the JSON block.
`;

  let parsed = null;
  try {
    const rawText = await generateWithFallback(prompt);
    parsed = cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error in Gemini Ad Poster copy generation:', error);
  }

  // Construct structured result
  const result = {
    headline: parsed?.headline || `Elevate Your Game with ${productName}`,
    subheadline: parsed?.subheadline || (productIdea || 'Engineered with premium materials for peak performance.'),
    primaryUSP: parsed?.primaryUSP || (uspsText.split('|')[0]?.trim() || 'Premium Engineering'),
    positioningMessage: parsed?.positioningMessage || positioningInfo || 'Official BrandDNA Store Collection.',
    pricingText: parsed?.pricingText || pricingInfo || 'Available Now',
    ctaText: parsed?.ctaText || 'Shop Now',
    categoryText: parsed?.categoryText || category || 'Store Product',
    brandNameText: parsed?.brandNameText || brandName,
    themeColors: {
      primary: parsed?.themeColors?.primary || '#0F172A',
      accent: parsed?.themeColors?.accent || '#4F46E5',
      bg: parsed?.themeColors?.bg || '#F8FAFC',
      text: parsed?.themeColors?.text || '#0F172A',
    },
    layoutStyle: parsed?.layoutStyle || 'modern_hero',
    visualConcept: parsed?.visualConcept || `Commercial advertising showcase of ${productName}.`,
    imagePrompt: parsed?.imagePrompt || `Premium commercial product photography studio environment for ${productName}, cinematic studio lighting, minimalist luxury pedestal, depth of field, sharp details, commercial ad background`,
    productImageUrl: productImageUrl || '',
    cloudImageBase64: '',
    cloudImageUrl: '',
  };

  // 2. Call the Cloud (Cloudflare Workers AI Flux-1-schnell) to generate the commercial visual!
  try {
    console.log(`📡 Calling Cloudflare Workers AI for product: "${productName}"...`);
    const cloudImageBase64 = await generateCloudAdImage(result.imagePrompt);
    if (cloudImageBase64) {
      result.cloudImageBase64 = cloudImageBase64;
      result.cloudImageUrl = `data:image/jpeg;base64,${cloudImageBase64}`;
      console.log(`✅ Cloudflare image generated successfully (${cloudImageBase64.length} bytes)`);
    }
  } catch (cloudErr) {
    console.warn('Cloudflare image generation skipped due to error:', cloudErr.message);
  }

  return result;
};
