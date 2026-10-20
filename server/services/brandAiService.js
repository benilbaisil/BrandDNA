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
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ];

  let lastError = null;
  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const text = response?.text;
      if (text) return text;
    } catch (err) {
      console.warn(`Brand AI fallback: model '${model}' failed: ${err.message}`);
      lastError = err;
      await delay(500);
    }
  }
  throw lastError || new Error('All Gemini models failed to respond.');
};

/**
 * Generate full Brand Identity from basic brand inputs
 */
export const generateFullBrandIdentityAI = async (input) => {
  const {
    brandIdea,
    industry = '',
    businessDescription = '',
    targetMarket = '',
    businessGoals = '',
    preferredStyleTone = '',
    productIdea = '',
  } = input;

  const prompt = `
You are a world-class Brand Strategist and Creative Director.
Generate a complete, cohesive Brand Identity dynamically derived strictly from the following business idea and parameters.

INPUT PARAMETERS:
- Brand Idea / Concept: "${brandIdea}"
- Industry: "${industry}"
- Business Description: "${businessDescription}"
- Target Market: "${targetMarket}"
- Business Goals: "${businessGoals}"
- Preferred Style / Tone: "${preferredStyleTone}"
- Product Idea: "${productIdea}"

REQUIREMENTS:
Return ONLY valid JSON matching this exact structure:
{
  "brandIdentity": {
    "brandNames": [
      { "name": "Name 1", "reason": "Strategic reasoning behind this name" },
      { "name": "Name 2", "reason": "Strategic reasoning" },
      { "name": "Name 3", "reason": "Strategic reasoning" },
      { "name": "Name 4", "reason": "Strategic reasoning" }
    ],
    "taglines": [
      { "text": "Tagline 1", "reason": "Why this resonates with target market" },
      { "text": "Tagline 2", "reason": "Why this resonates" },
      { "text": "Tagline 3", "reason": "Why this resonates" }
    ],
    "mission": "Compelling brand mission statement.",
    "vision": "Inspiring brand vision statement for future growth.",
    "brandStory": "Engaging brand origin story highlighting target market pain points and transformation.",
    "brandPersonality": ["Trait 1", "Trait 2", "Trait 3", "Trait 4"],
    "brandTone": ["Tone 1", "Tone 2", "Tone 3"],
    "colorPalette": [
      { "name": "Primary Color", "hex": "#HEXCODE", "usage": "Primary brand identity, logo, CTA" },
      { "name": "Secondary Accent", "hex": "#HEXCODE", "usage": "Backgrounds, highlights" },
      { "name": "Neutral Light", "hex": "#HEXCODE", "usage": "Surfaces and text readability" }
    ],
    "logoConcept": "Detailed description of logo icon, typography style, shape psychology, and visual prompt for AI image generation.",
    "brandPositioning": "Strategic market positioning statement defining unique placement.",
    "brandUSP": "Unique Selling Proposition that sets this brand apart from competitors."
  },
  "productStrategy": {
    "productNames": [
      { "name": "Product Name 1", "reasoning": "Why this fits the brand and product" },
      { "name": "Product Name 2", "reasoning": "Why this fits" }
    ],
    "productUSP": "Unique Selling Proposition specifically for the product.",
    "pricingSuggestions": "Pricing range and strategy (e.g. Premium vs Economy) with rationale.",
    "productPositioning": "How the product is positioned within the market.",
    "packagingSuggestions": "Packaging type, material, and design concept based on the brand identity."
  }
}

Do not include any Markdown text outside the JSON block. Do not hardcode generic placeholder names.
`;

  const raw = await generateWithFallback(prompt);
  return cleanJsonResponse(raw);
};

/**
 * Generate specific Brand Section AI
 */
export const generateBrandSectionAI = async (sectionKey, input) => {
  const { brandIdea, industry = '', targetMarket = '', brandName = '' } = input;

  let prompt = `
You are a senior brand strategy expert.
Context:
- Brand Name: "${brandName || 'Emerging Brand'}"
- Brand Idea: "${brandIdea}"
- Industry: "${industry}"
- Target Market: "${targetMarket}"
`;

  switch (sectionKey) {
    case 'names':
      prompt += `Generate 4 fresh, creative brand name suggestions with rationale. Return JSON: { "brandNames": [{ "name": "...", "reason": "..." }] }`;
      break;
    case 'taglines':
      prompt += `Generate 4 high-converting tagline suggestions with rationale. Return JSON: { "taglines": [{ "text": "...", "reason": "..." }] }`;
      break;
    case 'mission':
      prompt += `Generate an inspiring mission statement. Return JSON: { "mission": "..." }`;
      break;
    case 'vision':
      prompt += `Generate a future-looking vision statement. Return JSON: { "vision": "..." }`;
      break;
    case 'story':
      prompt += `Generate an authentic brand origin story. Return JSON: { "brandStory": "..." }`;
      break;
    case 'personality':
      prompt += `Generate 4 key brand personality traits and tone of voice adjectives. Return JSON: { "brandPersonality": [...], "brandTone": [...] }`;
      break;
    case 'colors':
      prompt += `Generate a 3 to 4 color palette with HEX codes and usage guidelines. Return JSON: { "colorPalette": [{ "name": "...", "hex": "...", "usage": "..." }] }`;
      break;
    case 'logo':
      prompt += `Generate a creative logo prompt and visual concept. Return JSON: { "logoConcept": "..." }`;
      break;
    case 'positioning':
      prompt += `Generate a market positioning statement and brand USP. Return JSON: { "brandPositioning": "...", "brandUSP": "..." }`;
      break;
    default:
      throw new Error(`Unknown brand section key: ${sectionKey}`);
  }

  const raw = await generateWithFallback(prompt);
  return cleanJsonResponse(raw);
};
