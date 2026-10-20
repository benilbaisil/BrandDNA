import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const getAIClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
    'gemini-3.6-flash',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
  ];

  let lastError = null;
  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        const text = response?.text;
        if (text) return text;
      } catch (err) {
        lastError = err;
        const errMsg = err.message || String(err);
        console.warn(`Product AI fallback: model '${model}' (attempt ${attempt + 1}) failed: ${errMsg}`);
        if (errMsg.includes('404') || errMsg.includes('no longer available') || errMsg.includes('not found')) {
          break;
        }
        if (attempt < 2) {
          await delay(800 * (attempt + 1));
        }
      }
    }
  }
  throw lastError || new Error('All Gemini AI model candidates are currently busy. Please try again in a moment.');
};

/**
 * Generate complete Product Identity, Strategy & Marketing using Brand Context
 */
export const generateFullProductStrategyAI = async (input) => {
  const {
    brandContext = {},
    productIdea,
    category = '',
    characteristics = '',
    estimatedCost = '',
    intendedMarket = '',
    productObjective = '',
  } = input;

  const prompt = `
You are an expert Chief Product Officer & Marketing Director.
Generate a complete Product Identity, Product Strategy, Customer Persona, Packaging Concept, and Multi-channel Marketing Content.

CRITICAL REQUIREMENT:
The product MUST seamlessly align with and be inspired by its Parent Brand Context below.

PARENT BRAND CONTEXT:
- Brand Name: "${brandContext.brandName || 'Emerging Brand'}"
- Industry: "${brandContext.industry || ''}"
- Brand Tagline: "${brandContext.tagline || ''}"
- Brand Mission: "${brandContext.mission || ''}"
- Brand Personality: "${Array.isArray(brandContext.brandPersonality) ? brandContext.brandPersonality.join(', ') : brandContext.brandPersonality || ''}"
- Brand Positioning: "${brandContext.brandPositioning || ''}"
- Brand USP: "${brandContext.brandUSP || ''}"

PRODUCT INPUTS:
- Product Idea / Concept: "${productIdea}"
- Category: "${category}"
- Product Characteristics: "${characteristics}"
- Estimated Cost Info: "${estimatedCost || 'Not provided'}"
- Intended Market: "${intendedMarket || 'General Market'}"
- Business Objective: "${productObjective || 'Market Entry'}"

REQUIREMENTS:
Return ONLY valid JSON matching this exact structure:
{
  "productNamesSuggestions": [
    { "name": "Name 1", "reasoning": "Product feature fit", "fitWithBrand": "How it complements ${brandContext.brandName || 'Brand'}" },
    { "name": "Name 2", "reasoning": "Market appeal", "fitWithBrand": "Brand alignment" },
    { "name": "Name 3", "reasoning": "Positioning fit", "fitWithBrand": "Brand alignment" }
  ],
  "tagline": "Product-specific tagline",
  "description": {
    "shortDescription": "Compelling elevator pitch summary.",
    "detailedDescription": "Comprehensive overview highlighting value proposition and problem solved.",
    "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
  },
  "uspSuggestions": [
    "Unique selling point 1 derived directly from product idea",
    "Unique selling point 2 highlighting brand synergy"
  ],
  "pricingSuggestion": {
    "suggestedPriceRange": "₹XXX - ₹YYY ($XX - $YY)",
    "pricingStrategy": "Premium / Penetration / Competitive / Value-Based",
    "reasoning": "Strategic explanation based on category, brand positioning, and estimated cost.",
    "disclaimer": "${estimatedCost ? 'Based on user cost estimate.' : 'AI market-oriented estimate based on category benchmarking.'}"
  },
  "positioning": {
    "marketPositioning": "Market position within industry",
    "targetMarket": "Specific target segment",
    "customerNeed": "Core problem or desire fulfilled",
    "competitiveAdvantage": "Edge over competing alternatives",
    "differentiation": "Key differentiators",
    "positioningStatement": "Formal positioning statement for marketing"
  },
  "customerPersona": {
    "name": "Persona Name (e.g. Eco-Conscious Professional)",
    "ageRange": "22-35",
    "occupation": "Target Occupation",
    "location": "Urban / Metropolitan",
    "incomeLevel": "₹6L - ₹12L PA ($40k-$80k)",
    "interests": ["Interest 1", "Interest 2"],
    "lifestyle": "Description of daily lifestyle and habits",
    "needs": ["Need 1", "Need 2"],
    "painPoints": ["Pain Point 1", "Pain Point 2"],
    "buyingBehavior": "Description of purchasing decisions",
    "purchaseMotivation": "Primary driver to buy",
    "preferredChannels": ["Instagram", "E-commerce", "Direct Store"],
    "objections": ["Price concern", "Quality doubt"]
  },
  "packaging": {
    "type": "Packaging box / bottle / sleeve",
    "material": "Sustainable paperboard / glass / recycled PET",
    "designConcept": "Visual branding design concept reflecting parent brand aesthetic",
    "labelInfo": "Essential messaging to highlight on label",
    "sustainability": "Eco-friendly packaging attributes",
    "unboxingConcept": "Memorable customer unboxing experience"
  },
  "marketingIdeas": {
    "objective": "Primary marketing objective",
    "awarenessStrategy": "Strategy to build initial buzz",
    "acquisitionStrategy": "Growth campaign to acquire first 1,000 customers",
    "launchStrategy": "Phased launch playbook",
    "onlineMarketing": ["Social ads", "Influencer seeding", "SEO content"],
    "offlineMarketing": ["Pop-up events", "Retail partnerships"],
    "influencerIdeas": ["Micro-influencer campaign idea"],
    "contentIdeas": ["Educational video series", "Before & after posts"],
    "promotionalIdeas": ["Launch discount bundle"]
  },
  "campaigns": [
    {
      "name": "Launch Campaign Name",
      "objective": "Brand awareness and initial trials",
      "targetAudience": "Primary persona",
      "concept": "Creative campaign theme",
      "promotionalMessage": "Hero marketing message",
      "offerIdea": "Early bird 15% off",
      "channels": ["Instagram", "Facebook", "Email"],
      "duration": "4 weeks",
      "callToAction": "Shop Now & Save"
    }
  ],
  "socialMediaContent": [
    {
      "platform": "Instagram",
      "headline": "Scroll-stopping Headline",
      "caption": "Engaging post caption highlighting product benefits and brand values.",
      "hashtags": ["#BrandName", "#ProductCategory", "#TrendingHashtag"],
      "callToAction": "Link in bio to order today!",
      "visualIdea": "High-contrast product shot in natural lighting with brand colors."
    },
    {
      "platform": "LinkedIn",
      "headline": "B2B / Professional Pitch Headline",
      "caption": "Story-driven post focusing on innovation and sustainability behind the product.",
      "hashtags": ["#Innovation", "#ProductLaunch", "#Industry"],
      "callToAction": "Connect with us to learn more.",
      "visualIdea": "Infographic showing key product benefits vs traditional alternatives."
    }
  ],
  "advertisementCopy": [
    {
      "headline": "High-converting Ad Headline",
      "primaryText": "Persuasive ad copy addressing target audience pain points.",
      "shortCopy": "Punchy 1-line ad text",
      "callToAction": "Get Yours Today",
      "targetAudience": "Target segment",
      "creativeConcept": "Short video showing product feature in action"
    }
  ],
  "seoKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4"]
}

Do not output raw Markdown outside JSON. All outputs must be tailored specifically to the product idea and parent brand context.
`;

  const raw = await generateWithFallback(prompt);
  return cleanJsonResponse(raw);
};

/**
 * Generate ONLY the 5 required Product Strategy sections strictly based on Product Idea:
 * 1. Product Naming
 * 2. USP
 * 3. Pricing Suggestions
 * 4. Product Positioning
 * 5. Packaging Suggestions
 */
export const generateProductStrategyFromIdea = async (productIdea) => {
  if (!productIdea || !productIdea.trim()) {
    throw new Error('Product Idea is required for strategy generation.');
  }

  const prompt = `
You are a Senior Product Strategist & Market Architect.
Analyze the following PRODUCT IDEA and generate a comprehensive AI Product Strategy containing ONLY the 5 sections below:

PRODUCT IDEA:
"${productIdea.trim()}"

CRITICAL INSTRUCTIONS:
1. Do NOT use static or hardcoded product data. Dynamically generate every detail based solely on the provided Product Idea.
2. Product Naming must provide 4 distinct, catchy name suggestions. Each name MUST have explicit reasoning explaining why it fits the product idea.
3. USP must provide 3-4 defensible unique selling propositions with title and description.
4. Pricing Suggestions must include realistic price ranges in INR (₹) and USD ($), a pricing strategy, AI reasoning based on the product idea, and a clear disclaimer.
5. Product Positioning must include market positioning, target market, customer need, competitive advantage, and a formal positioning statement.
6. Packaging Suggestions must include packaging type, material, design concept, label info, sustainability attributes, and unboxing experience.

Return strictly a JSON object matching this exact structure:
{
  "productNamesSuggestions": [
    { "name": "Name 1", "reasoning": "Reason derived from product idea feature/outcome." },
    { "name": "Name 2", "reasoning": "Reason derived from product idea market appeal." },
    { "name": "Name 3", "reasoning": "Reason derived from product idea positioning." },
    { "name": "Name 4", "reasoning": "Reason derived from product idea branding." }
  ],
  "usps": [
    { "title": "USP 1 Title", "description": "Detailed description of defensible moat." },
    { "title": "USP 2 Title", "description": "Detailed description of unique value lever." },
    { "title": "USP 3 Title", "description": "Detailed description of key advantage." }
  ],
  "pricingSuggestion": {
    "suggestedPriceRange": "₹1,499 - ₹3,999 / $19 - $49",
    "priceINR": "₹1,499 - ₹3,999",
    "priceUSD": "$19 - $49",
    "pricingStrategy": "Value-Based Tiered Pricing",
    "reasoning": "Detailed justification based on product idea value proposition.",
    "disclaimer": "AI market-oriented estimate based on target category benchmarking."
  },
  "positioning": {
    "marketPositioning": "Strategic position within the market category",
    "targetMarket": "Specific ideal customer profile and market segment",
    "customerNeed": "Core pain point or desire addressed by the idea",
    "competitiveAdvantage": "Primary structural advantage over existing solutions",
    "positioningStatement": "For [target market] who [customer need], this product is a [category] that [key benefit] unlike [alternatives] because [competitive advantage]."
  },
  "packaging": {
    "type": "Custom Rigid Box / Eco-friendly Sleeve / Stand-up Pouch",
    "material": "Recyclable kraft board with soy-based ink",
    "designConcept": "Minimalist aesthetic featuring clean typography and tactile finish",
    "labelInfo": "Key feature highlights, usage instructions, eco-certifications",
    "sustainability": "100% plastic-free, biodegradable, recyclable packaging",
    "unboxingConcept": "Layered unboxing sequence with custom welcome card"
  }
}

Return ONLY valid JSON. No raw Markdown or commentary outside the JSON block.
`;

  const raw = await generateWithFallback(prompt);
  return cleanJsonResponse(raw);
};

/**
 * Regenerate ONLY the selected individual section based on Product Idea
 */
export const generateProductStrategySectionFromIdea = async (sectionKey, productIdea, currentProductName = '') => {
  if (!productIdea || !productIdea.trim()) {
    throw new Error('Product Idea is required for section regeneration.');
  }

  let prompt = `
You are a Senior Product Strategist.
Regenerate ONLY the '${sectionKey}' section for the product idea below.

PRODUCT IDEA: "${productIdea.trim()}"
${currentProductName ? `- Active Product Name: "${currentProductName}"` : ''}

`;

  switch (sectionKey) {
    case 'naming':
      prompt += `
Generate 4 new, distinctive product name suggestions with reasoning.
Return JSON:
{
  "productNamesSuggestions": [
    { "name": "...", "reasoning": "..." }
  ]
}
`;
      break;

    case 'usp':
      prompt += `
Generate 3-4 new Unique Selling Propositions (USPs) with title and description.
Return JSON:
{
  "usps": [
    { "title": "...", "description": "..." }
  ]
}
`;
      break;

    case 'pricing':
      prompt += `
Generate new pricing suggestions with price ranges (INR and USD), pricing strategy, reasoning, and disclaimer.
Return JSON:
{
  "pricingSuggestion": {
    "suggestedPriceRange": "...",
    "priceINR": "...",
    "priceUSD": "...",
    "pricingStrategy": "...",
    "reasoning": "...",
    "disclaimer": "..."
  }
}
`;
      break;

    case 'positioning':
      prompt += `
Generate new product positioning details.
Return JSON:
{
  "positioning": {
    "marketPositioning": "...",
    "targetMarket": "...",
    "customerNeed": "...",
    "competitiveAdvantage": "...",
    "positioningStatement": "..."
  }
}
`;
      break;

    case 'packaging':
      prompt += `
Generate new packaging suggestions.
Return JSON:
{
  "packaging": {
    "type": "...",
    "material": "...",
    "designConcept": "...",
    "labelInfo": "...",
    "sustainability": "...",
    "unboxingConcept": "..."
  }
}
`;
      break;

    default:
      throw new Error(`Invalid section key: ${sectionKey}`);
  }

  prompt += `\nReturn ONLY valid JSON. No markdown wrapper outside the JSON block.`;

  const raw = await generateWithFallback(prompt);
  return cleanJsonResponse(raw);
};

export const generateProductSectionAI = generateProductStrategySectionFromIdea;


