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
      console.warn(`Model ${model} failed:`, errMsg.slice(0, 100));

      // If model not found, quota exceeded, or high demand, move instantly to the next model
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

  throw lastError || new Error('All Gemini model candidates failed.');
};

/**
  Formats the core Brand DNA and Startup Profile into a prompt injection block
 */
export const formatBrandDNAContext = (profile, brand) => {
  const masterBrandName = brand?.brandName || profile?.companyName || 'Unspecified Brand';
  const tagline = brand?.tagline || 'N/A';
  const mission = brand?.missionStatement || 'N/A';
  const vision = brand?.visionStatement || 'N/A';
  const personality = brand?.brandPersonality || 'N/A';
  const story = brand?.brandStory || 'N/A';
  const businessType = profile?.businessType || 'N/A';
  const industry = profile?.industry || 'N/A';
  const problemStatement = profile?.problemStatement || 'N/A';

  return `
=== MASTER BRAND DNA CONTEXT ===
- Master Brand Name: ${masterBrandName}
- Brand Tagline: ${tagline}
- Brand Mission: ${mission}
- Brand Vision: ${vision}
- Brand Personality / Tone: ${personality}
- Brand Story Overview: ${story}
- Industry: ${industry}
- Business Model / Type: ${businessType}
- Key Customer Problem: ${problemStatement}
`;
};

/**
 * Prompt Chain Step 1: Product Name Generation (Directly derived from Master Brand Details)
 */
export const generateProductNamesAI = async (profile, brand, userHint = '') => {
  const brandContext = formatBrandDNAContext(profile, brand);
  const masterBrandName = brand?.brandName || profile?.companyName || 'Master Brand';

  const prompt = `
You are a Senior Product Strategist and Brand Naming Architect.
Your task is to generate 5 high-impact, market-ready Product / Solution / Feature names specifically for a product offering by "${masterBrandName}".

CRITICAL REQUIREMENT:
Every single product name generated MUST be directly derived from and explicitly based on the Master Brand details provided below:
1. **Master Brand Name Connection**: The product names should directly extend, incorporate, or morph "${masterBrandName}" (e.g. "${masterBrandName} Studio", "${masterBrandName} Engine", "${masterBrandName} Vault", "${masterBrandName} Copilot", "${masterBrandName} Flow", or brand-morphed variants that tie directly back to ${masterBrandName}).
2. **Brand Values & Personality Alignment**: Reflect the exact tone, personality traits (${brand?.brandPersonality || 'N/A'}), mission, and industry context of the brand.
3. **Problem Solved**: Directly align with the brand's core mission and customer problem.

Return strictly a JSON array of 5 objects matching this JSON structure:
[
  {
    "name": "Product Name (derived from ${masterBrandName})",
    "tagline": "A punchy, 4-8 word sub-tagline for the product",
    "rationale": "Explicit explanation detailing how this product name directly builds upon ${masterBrandName}'s brand identity, mission, and personality.",
    "brandAlignmentScore": 98
  }
]

${brandContext}
${userHint ? `- User Specific Product Hint / Focus: ${userHint}` : ''}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('AI Product Name Generation Error:', error);
    throw new Error('Failed to generate product names using AI prompt chain.');
  }
};

/**
 * Prompt Chain Step 2: Product Description Generation (Chained from Selected Product Name + Brand DNA)
 */
export const generateProductDescriptionAI = async (profile, brand, productName, userHint = '') => {
  const brandContext = formatBrandDNAContext(profile, brand);
  const targetProductName = productName || brand?.brandName || 'Flagship Product';

  const prompt = `
You are an expert SaaS & Tech Product Strategist.
Generate a comprehensive Product Description for "${targetProductName}".
IMPORTANT: You MUST chain your product narrative directly to the Master Brand DNA Context provided below, maintaining consistency in tone, mission, and problem framing.

Return strictly a JSON object with this structure:
{
  "shortPitch": "A compelling 1-2 sentence elevator pitch of the product.",
  "fullDescription": "A detailed 3-paragraph product description covering problem-solution fit, core capability, and emotional/business outcome.",
  "keyFeatures": [
    "Feature 1 with key benefit",
    "Feature 2 with key benefit",
    "Feature 3 with key benefit",
    "Feature 4 with key benefit"
  ],
  "valueNarrative": "A concise paragraph explaining why this product is uniquely positioned under the Master Brand identity."
}

${brandContext}
- Selected Product Name: ${targetProductName}
${userHint ? `- User Product Strategy Focus: ${userHint}` : ''}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('AI Product Description Generation Error:', error);
    throw new Error('Failed to generate product description using AI prompt chain.');
  }
};

/**
 * Prompt Chain Step 3: USP Generation (Chained from Product Name + Description + Brand DNA)
 */
export const generateProductUSPAI = async (profile, brand, productName, description, userHint = '') => {
  const brandContext = formatBrandDNAContext(profile, brand);
  const targetProductName = productName || 'Flagship Product';

  const prompt = `
You are a Competitive Differentiation Specialist.
Generate 4-5 Unique Selling Propositions (USPs) for "${targetProductName}".
IMPORTANT: Chain this analysis with the Master Brand DNA and Product Description context below to highlight true defensible moats and unique value levers.

Return strictly a JSON array of objects with this structure:
[
  {
    "title": "Short USP Title",
    "description": "Clear explanation of what makes this unique and defensible.",
    "impact": "Game Changer", // Select from "Game Changer", "High", "Strategic"
    "category": "Differentiation" // Select from "Differentiation", "Technology", "Usability", "Cost/ROI", "Speed"
  }
]

${brandContext}
- Target Product Name: ${targetProductName}
- Product Description Context: ${typeof description === 'object' ? description.shortPitch || description.fullDescription : description || 'N/A'}
${userHint ? `- User Strategic Focus: ${userHint}` : ''}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('AI USP Generation Error:', error);
    throw new Error('Failed to generate USPs using AI prompt chain.');
  }
};

/**
 * Prompt Chain Step 4: Product Positioning Framework (Chained from Name + Description + USPs + Brand DNA)
 */
export const generateProductPositioningAI = async (profile, brand, productName, description, usps, userHint = '') => {
  const brandContext = formatBrandDNAContext(profile, brand);
  const targetProductName = productName || 'Flagship Product';
  const uspSummary = Array.isArray(usps)
    ? usps.map((u) => `- ${u.title}: ${u.description}`).join('\n')
    : 'N/A';

  const prompt = `
You are a World-Class Product Marketing & Positioning Strategist.
Construct a Strategic Product Positioning Package for "${targetProductName}".
IMPORTANT: Chain all parameters (Master Brand DNA, Product Name, Description, and USPs) to create a tight, coherent market positioning framework.

Return strictly a JSON object matching this structure:
{
  "positioningStatement": "For [target customer] who [customer need], ${targetProductName} is a [market category] that [key benefit/delighter] unlike [primary alternatives], because [proof/moat].",
  "targetSegment": "Detailed description of the primary ICP (Ideal Customer Profile) and segment.",
  "keyBenefit": "The core single line transformation or value delivered.",
  "competitiveMoat": "The primary defensible advantage or structural moat.",
  "perceptualAngle": "The psychological positioning market angle (e.g. 'Enterprise grade performance with consumer-simple design').",
  "valuePillars": [
    "Pillar 1: Name & summary",
    "Pillar 2: Name & summary",
    "Pillar 3: Name & summary"
  ]
}

${brandContext}
- Product Name: ${targetProductName}
- Product Pitch: ${typeof description === 'object' ? description.shortPitch : description || 'N/A'}
- USPs Context:
${uspSummary}
${userHint ? `- Additional User Guidelines: ${userHint}` : ''}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('AI Product Positioning Generation Error:', error);
    throw new Error('Failed to generate product positioning framework using AI prompt chain.');
  }
};

/**
 * Chained 1-Click Master Generator (Runs Step 1 -> Step 2 -> Step 3 -> Step 4 sequentially)
 */
export const generateFullProductStrategyChainAI = async (profile, brand, userHint = '') => {
  // Step 1: Names
  const names = await generateProductNamesAI(profile, brand, userHint);
  const selectedNameObj = names[0] || { name: brand?.brandName || 'Core Product', tagline: '' };
  const productName = selectedNameObj.name;

  // Step 2: Description (Chained from Name + DNA)
  const description = await generateProductDescriptionAI(profile, brand, productName, userHint);

  // Step 3: USPs (Chained from Name + Description + DNA)
  const usps = await generateProductUSPAI(profile, brand, productName, description, userHint);

  // Step 4: Positioning (Chained from Name + Description + USPs + DNA)
  const positioning = await generateProductPositioningAI(profile, brand, productName, description, usps, userHint);

  return {
    productName,
    productTagline: selectedNameObj.tagline || '',
    shortDescription: description.shortPitch || '',
    detailedDescription: description.fullDescription || '',
    keyFeatures: description.keyFeatures || [],
    valueNarrative: description.valueNarrative || '',
    usps,
    positioning,
    suggestions: {
      productNameSuggestions: names,
      descriptionSuggestions: [description],
      uspSuggestions: usps,
      positioningSuggestions: [positioning],
    },
  };
};

/**
 * PRICING SUGGESTIONS GENERATOR
 */
export const generatePricingSuggestionsAI = async (profile, brand, productName, userHint = '') => {
  const brandContext = formatBrandDNAContext(profile, brand);
  const targetProductName = productName || 'Flagship Product';

  const prompt = `
You are a SaaS & Product Pricing Strategist.
Generate strategic pricing recommendations for "${targetProductName}".
Provide 3 pricing tiers with suggested price ranges in INR (₹) and USD ($), along with billing frequency and pricing strategy rationale.

Return strictly a JSON object matching this structure:
{
  "pricingStrategy": "Value-Based / Tiered / Freemium / Premium",
  "strategyRationale": "Short 2-sentence explanation of why this pricing model fits the product & market segment.",
  "tiers": [
    {
      "tierName": "Starter",
      "priceINR": "₹999 / mo",
      "priceUSD": "$12 / mo",
      "targetSegment": "Early-stage founders & solo creators",
      "includedFeatures": ["Core features", "Standard support", "Basic export"]
    },
    {
      "tierName": "Pro Growth",
      "priceINR": "₹2,999 / mo",
      "priceUSD": "$39 / mo",
      "targetSegment": "Growing teams & scaling businesses",
      "includedFeatures": ["Everything in Starter", "Advanced AI tools", "Priority support", "Custom branding"]
    },
    {
      "tierName": "Enterprise",
      "priceINR": "₹9,999 / mo",
      "priceUSD": "$129 / mo",
      "targetSegment": "Large organizations & agencies",
      "includedFeatures": ["Unlimited usage", "Dedicated account manager", "Custom API & SLAs"]
    }
  ]
}

${brandContext}
- Target Product: ${targetProductName}
${userHint ? `- User Guidelines: ${userHint}` : ''}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('AI Pricing Suggestions Error:', error);
    return {
      pricingStrategy: "Value-Based Tiered Pricing",
      strategyRationale: "Aligns price with customer scale and realized business value.",
      tiers: [
        { tierName: "Starter", priceINR: "₹1,499 / mo", priceUSD: "$19 / mo", targetSegment: "Individual Users", includedFeatures: ["Core Features", "Standard Support"] },
        { tierName: "Professional", priceINR: "₹3,999 / mo", priceUSD: "$49 / mo", targetSegment: "Growing Companies", includedFeatures: ["Full Suite", "Priority AI", "Analytics"] }
      ]
    };
  }
};

/**
 * PACKAGING SUGGESTIONS GENERATOR
 */
export const generatePackagingSuggestionsAI = async (profile, brand, productName, userHint = '') => {
  const brandContext = formatBrandDNAContext(profile, brand);
  const targetProductName = productName || 'Flagship Product';

  const prompt = `
You are a Product Packaging & Unboxing Experience Architect.
Design packaging guidelines and unboxing experience suggestions for "${targetProductName}".

Return strictly a JSON object matching this structure:
{
  "packagingStyle": "Minimalist Eco-Luxury / Modern Tech Matte / Premium Box Set",
  "materials": "Recyclable kraft paperboard, soy-based inks, tactile velvet-touch coating",
  "unboxingExperience": "Step-by-step unboxing flow detailing opening sequence, insert card, and brand touchpoint.",
  "visualDetails": {
    "primaryColor": "Matte Obsidian Black with Foil Accent",
    "typographyStyle": "Clean Geometric Sans-Serif font embossing",
    "finish": "Soft-touch matte box with spot-UV logo highlighting"
  },
  "sustainabilityHighlight": "100% biodegradable & plastic-free certified packaging."
}

${brandContext}
- Target Product: ${targetProductName}
${userHint ? `- User Guidelines: ${userHint}` : ''}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('AI Packaging Suggestions Error:', error);
    return {
      packagingStyle: "Eco-Friendly Premium Box",
      materials: "Recycled corrugated card with eco-soy print",
      unboxingExperience: "Smooth lid-lift revealing personalized welcome card and product placement.",
      visualDetails: { primaryColor: "Slate Grey", typographyStyle: "Modern Sans-Serif", finish: "Matte Finish" },
      sustainabilityHighlight: "Zero-plastic eco-conscious materials."
    };
  }
};

