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

const buildContextBlock = (params) => {
  const {
    productIdea,
    productCategory,
    intendedMarket,
    productCost,
    specialFeatures,
    businessObjective,
    geographicMarket,
    selectedProductName,
    selectedTagline,
    selectedUSP,
  } = params;

  return `
=== PRIMARY PRODUCT IDEA CONTEXT ===
- Product Idea / Concept: ${productIdea || 'Unspecified Product Idea'}
- Product Category: ${productCategory || 'N/A'}
- Intended Target Market: ${intendedMarket || 'N/A'}
- Approximate Product Cost: ${productCost || 'Not specified (Market-oriented estimation)'}
- Special Features: ${specialFeatures || 'N/A'}
- Business Objective: ${businessObjective || 'N/A'}
- Geographic Market: ${geographicMarket || 'N/A'}
- Selected Product Name Context: ${selectedProductName || 'N/A'}
- Selected Tagline Context: ${selectedTagline || 'N/A'}
- Selected USP Context: ${selectedUSP || 'N/A'}
`;
};

/**
 * 1. AI BRAND IDENTITY GENERATOR
 */
export const generateBrandIdentityAI = async (params) => {
  const contextBlock = buildContextBlock(params);
  const prompt = `
You are a Senior Brand Strategist & Identity Architect.
Generate a complete, cohesive Brand Identity Package explicitly derived from the Product Idea Context below.

CRITICAL REQUIREMENT:
All generated assets MUST be dynamically tailored to the specific product idea provided. Do NOT use predefined or generic static output.

Return strictly a JSON object matching this structure:
{
  "productNames": [
    { "name": "Name 1", "tagline": "Sub tagline 1", "rationale": "Reason tied to product idea" },
    { "name": "Name 2", "tagline": "Sub tagline 2", "rationale": "Reason tied to product idea" },
    { "name": "Name 3", "tagline": "Sub tagline 3", "rationale": "Reason tied to product idea" }
  ],
  "taglines": [
    "Tagline Option 1",
    "Tagline Option 2",
    "Tagline Option 3"
  ],
  "mission": "Strong mission statement clarifying purpose and value delivered.",
  "vision": "Inspiring long-term vision statement for this product brand.",
  "brandStory": "A compelling 2-3 paragraph origin story and brand narrative.",
  "brandPersonality": ["Trait 1", "Trait 2", "Trait 3", "Trait 4", "Trait 5"],
  "brandTone": "Description of voice and tone (e.g., Empowering, Professional, Friendly)",
  "logoPrompt": {
    "conceptName": "Logo Concept Title",
    "style": "Minimalist Vector / Geometric Emblem",
    "promptText": "Detailed AI image generator prompt (Midjourney/DALL-E format) for the logo mark",
    "visualDescription": "Visual representation of icon geometry and symbols"
  },
  "colorPsychology": {
    "rationale": "Explanation of why these colors fit the product idea and market.",
    "colors": [
      { "name": "Primary Accent", "hex": "#1E293B", "role": "Dominant Brand Color", "psychology": "Trust & authority" },
      { "name": "Secondary Accent", "hex": "#6366F1", "name": "Indigo", "role": "Action Accent", "psychology": "Innovation" },
      { "name": "Highlight", "hex": "#10B981", "name": "Emerald", "role": "Highlight", "psychology": "Growth & vitality" }
    ]
  }
}

${contextBlock}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error generating Brand Identity AI:', error);
    throw new Error('Failed to generate Brand Identity based on product idea.');
  }
};

/**
 * 2. PRODUCT STRATEGY MODULE (Naming, USP, Pricing, Positioning, Packaging)
 */
export const generateProductStrategyAI = async (params) => {
  const contextBlock = buildContextBlock(params);
  const prompt = `
You are a World-Class Product Manager & Pricing Specialist.
Generate a Strategic Product Package explicitly derived from the Product Idea Context below.

CRITICAL INSTRUCTION FOR PRICING:
Provide a suggested price range in INR (₹) and USD ($), select a pricing strategy (Premium / Competitive / Value-based / Penetration), and give AI reasoning. If cost info is not specified, explicitly state that pricing is an estimated market-oriented suggestion.

Return strictly a JSON object matching this structure:
{
  "productNames": [
    { "name": "Product Name 1", "tagline": "Sub tagline", "rationale": "Explanation" },
    { "name": "Product Name 2", "tagline": "Sub tagline", "rationale": "Explanation" }
  ],
  "usps": [
    { "title": "USP Title 1", "description": "Defensible unique moat", "impact": "Game Changer", "category": "Differentiation" },
    { "title": "USP Title 2", "description": "Defensible unique moat", "impact": "High", "category": "Technology" }
  ],
  "pricing": {
    "suggestedPriceINR": "₹999 – ₹2,499",
    "suggestedPriceUSD": "$15 – $35",
    "pricingStrategy": "Value-Based Tiered Pricing",
    "reasoning": "AI-generated justification based on product idea and target market.",
    "isEstimated": true
  },
  "positioning": {
    "marketPositioning": "Psychological positioning angle in market",
    "targetMarket": "Specific target market segment derived from idea",
    "customerNeed": "Primary customer pain point solved",
    "competitiveAdvantage": "Core structural advantage",
    "positioningStatement": "For [target market] who [need], [Product] is a [category] that [benefit] unlike [alternatives] because [moat].",
    "differentiationPoints": ["Point 1", "Point 2", "Point 3"]
  },
  "packaging": {
    "packagingType": "Custom Printed Box / Stand-up Pouch",
    "packagingMaterial": "Recyclable kraft paperboard with soy ink",
    "designConcept": "Minimalist matte finish with foiled typography",
    "visualStyle": "Clean, modern aesthetic with high contrast text",
    "labelInformation": "Product highlights, usage directions, eco certifications",
    "sustainabilitySuggestions": "100% plastic-free, biodegradable materials",
    "unboxingConcept": "Layered unboxing sequence with welcome insert card"
  }
}

${contextBlock}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error generating Product Strategy AI:', error);
    throw new Error('Failed to generate Product Strategy based on product idea.');
  }
};

/**
 * 3. PRODUCT DESCRIPTION GENERATOR
 */
export const generateProductDescriptionAI = async (params) => {
  const contextBlock = buildContextBlock(params);
  const prompt = `
You are a Senior Product Copywriter.
Generate a comprehensive Product Description package strictly tailored to the Product Idea Context below.

Return strictly a JSON object with this structure:
{
  "shortDescription": "Compelling 1-2 sentence elevator pitch of the product.",
  "detailedDescription": "Comprehensive 3-paragraph product description detailing the product origin, capabilities, and customer outcome.",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "suitableCustomer": "Exact target customer profile best suited for this product",
  "productHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
}

${contextBlock}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error generating Product Description AI:', error);
    throw new Error('Failed to generate product description.');
  }
};

/**
 * 4. CUSTOMER PERSONA GENERATOR
 */
export const generateCustomerPersonaAI = async (params) => {
  const contextBlock = buildContextBlock(params);
  const prompt = `
You are a Customer Psychology & Behavioral Market Researcher.
Generate a detailed Target Customer Persona derived directly from the Product Idea Context below.

Return strictly a JSON object matching this structure:
{
  "personaName": "Full Name (e.g. Alex Rivera)",
  "ageRange": "25-34 years",
  "occupation": "Job Title / Role",
  "location": "Target Region / City Tier",
  "incomeINR": "₹8 Lakhs – ₹15 Lakhs / annum",
  "interests": ["Interest 1", "Interest 2", "Interest 3"],
  "lifestyle": "Description of daily routine, values, and habits",
  "needs": ["Need 1", "Need 2", "Need 3"],
  "painPoints": ["Pain Point 1", "Pain Point 2", "Pain Point 3"],
  "buyingBehaviour": "How they evaluate products, research habits, and decision triggers",
  "purchaseMotivation": "The primary emotional or functional driver for purchase",
  "preferredChannels": ["Instagram", "LinkedIn", "Search", "Word-of-Mouth"],
  "objections": ["Objection 1", "Objection 2"]
}

${contextBlock}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error generating Customer Persona AI:', error);
    throw new Error('Failed to generate customer persona.');
  }
};

/**
 * 5. MARKETING STRATEGY IDEAS GENERATOR
 */
export const generateMarketingIdeasAI = async (params) => {
  const contextBlock = buildContextBlock(params);
  const prompt = `
You are a Growth Marketing Director.
Generate creative, actionable marketing strategies specifically customized for the Product Idea Context below.

Return strictly a JSON object matching this structure:
{
  "marketingObjectives": ["Objective 1", "Objective 2"],
  "awarenessStrategies": ["Strategy 1", "Strategy 2"],
  "customerAcquisitionIdeas": ["Idea 1", "Idea 2"],
  "productLaunchIdeas": ["Launch Idea 1", "Launch Idea 2"],
  "onlineMarketingIdeas": ["Digital Tactic 1", "Digital Tactic 2"],
  "offlineMarketingIdeas": ["Experiential Tactic 1", "Experiential Tactic 2"],
  "influencerIdeas": ["Influencer Niche & Campaign Concept"],
  "contentIdeas": ["Content Topic 1", "Content Topic 2"],
  "promotionalOpportunities": ["Co-marketing or Event Opportunity 1"]
}

${contextBlock}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error generating Marketing Ideas AI:', error);
    throw new Error('Failed to generate marketing strategy ideas.');
  }
};

/**
 * 6. PROMOTIONAL CAMPAIGN GENERATOR
 */
export const generateCampaignAI = async (params) => {
  const contextBlock = buildContextBlock(params);
  const prompt = `
You are a Campaign Director.
Generate a structured Promotional Campaign tailored to the Product Idea Context below.

Return strictly a JSON object with this structure:
{
  "campaignName": "Catchy Campaign Name",
  "objective": "Primary goal of the campaign",
  "targetAudience": "Specific audience segment",
  "campaignConcept": "Core creative theme & storytelling hook",
  "promotionalMessage": "Key hero promotional message",
  "offerIdea": "Compelling launch discount, bundle, or gift offer",
  "suggestedChannels": ["Instagram Ads", "Email Newsletter", "Google Search"],
  "campaignDuration": "4 Weeks (Launch Phase)",
  "callToAction": "Direct CTA button copy"
}

${contextBlock}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error generating Campaign AI:', error);
    throw new Error('Failed to generate promotional campaign.');
  }
};

/**
 * 7. SOCIAL MEDIA CONTENT GENERATOR
 */
export const generateSocialMediaContentAI = async (params) => {
  const contextBlock = buildContextBlock(params);
  const prompt = `
You are a Social Media Content Strategist.
Generate platform-specific social media content for Instagram, Facebook, LinkedIn, and X/Twitter based on the Product Idea Context below.

Return strictly a JSON array of 4 objects matching this structure:
[
  {
    "platform": "Instagram",
    "headline": "Punchy Hook Line",
    "postCaption": "Engaging caption with story, value proposition, and emojis.",
    "hashtags": "#ProductIdea #BrandName #Category",
    "callToAction": "Link in bio to get yours!",
    "contentConcept": "Carousel post showing problem vs solution",
    "suggestedVisualIdea": "High quality product hero shot in natural lighting"
  },
  {
    "platform": "LinkedIn",
    "headline": "Professional Industry Insight",
    "postCaption": "Thought-leadership post connecting the product innovation to industry trends.",
    "hashtags": "#Innovation #Leadership #Tech",
    "callToAction": "Visit our website to learn more.",
    "contentConcept": "Behind the scenes story of product development",
    "suggestedVisualIdea": "Infographic diagram of product features"
  },
  {
    "platform": "Facebook",
    "headline": "Community Spotlight",
    "postCaption": "Relatable family/community focused caption emphasizing practical benefits.",
    "hashtags": "#Lifestyle #Quality",
    "callToAction": "Shop Now with launch discount.",
    "contentConcept": "User testimonial or lifestyle demonstration video",
    "suggestedVisualIdea": "Video clip of customer using the product"
  },
  {
    "platform": "X/Twitter",
    "headline": "Short Bold Statement",
    "postCaption": "Punchy 280-character thread starter.",
    "hashtags": "#BuildInPublic",
    "callToAction": "Retweet and check out the launch!",
    "contentConcept": "Quick poll or feature spotlight",
    "suggestedVisualIdea": "Sleek GIF animation"
  }
]

${contextBlock}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error generating Social Media Content AI:', error);
    throw new Error('Failed to generate social media content.');
  }
};

/**
 * 8. ADVERTISEMENT COPY GENERATOR
 */
export const generateAdvertisementCopyAI = async (params) => {
  const contextBlock = buildContextBlock(params);
  const prompt = `
You are an Advertising Copywriter & Performance Marketer.
Generate 2 distinct ad copy concepts (Meta / Google Ads format) for the Product Idea Context below.

Return strictly a JSON array of 2 objects matching this structure:
[
  {
    "adConceptName": "High-Converting Benefit Angle",
    "headline": "Punchy Ad Headline (Under 40 chars)",
    "primaryText": "Engaging primary text highlighting pain point and solution.",
    "shortCopy": "1-line sub-headline for banner ads",
    "cta": "Shop Now / Get Started / Order Today",
    "targetAudience": "Target demographics & interests",
    "advertisementConcept": "Visual creative direction (e.g., UGC style video, side-by-side comparison)"
  },
  {
    "adConceptName": "Urgency & Launch Special Angle",
    "headline": "Limited Launch Offer Headline",
    "primaryText": "Urgency driven ad copy highlighting exclusive launch pricing.",
    "shortCopy": "Limited stock available",
    "cta": "Claim Offer",
    "targetAudience": "Early adopters & deal seekers",
    "advertisementConcept": "Motion graphic poster with price badge"
  }
]

${contextBlock}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Error generating Ad Copy AI:', error);
    throw new Error('Failed to generate advertisement copy.');
  }
};
