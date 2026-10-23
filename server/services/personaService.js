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

/**
 * Formats Startup Profile, Brand Identity, and Product Strategy into an accumulated context block.
 */
export const formatAccumulatedContext = (profile, brand, strategy) => {
  const brandName = brand?.brandName || profile?.companyName || 'Master Brand';
  const industry = profile?.industry || 'Technology / Business Services';
  const targetAudience = profile?.targetAudience || 'Modern Consumers & Enterprises';
  const missionStatement = brand?.missionStatement || 'N/A';
  const brandPersonality = brand?.brandPersonality || 'N/A';
  const brandStory = brand?.brandStory || 'N/A';
  const productName = strategy?.productName || 'Flagship Offering';
  const shortDescription = strategy?.shortDescription || strategy?.detailedDescription || 'N/A';
  const positioningStatement = strategy?.positioningStatement || 'N/A';
  const usps = Array.isArray(strategy?.usps)
    ? strategy.usps.map((u) => `${u.title}: ${u.description}`).join('; ')
    : 'N/A';

  return `
=== ACCUMULATED BRAND & PRODUCT CONTEXT ===
- Startup Industry: ${industry}
- Primary Target Audience Context: ${targetAudience}
- Master Brand Name: ${brandName}
- Brand Mission: ${missionStatement}
- Brand Personality: ${brandPersonality}
- Brand Story Overview: ${brandStory}
- Selected Product Name: ${productName}
- Product Pitch / Description: ${shortDescription}
- Unique Selling Propositions (USPs): ${usps}
- Product Positioning Statement: ${positioningStatement}
`;
};

/**
 * Generates 2 distinct customer personas using Gemini LLM.
 */
export const generateCustomerPersonasAI = async (profile, brand, strategy, userHint = '') => {
  const contextBlock = formatAccumulatedContext(profile, brand, strategy);

  const prompt = `
You are an expert Market Researcher and Consumer Psychology Specialist.
Your task is to analyze the accumulated Startup Profile, Brand Identity, and Product Strategy context provided below, and construct 2 distinct, highly realistic Target Customer Personas for this business.

CRITICAL REQUIREMENT:
You MUST generate an array of EXACTLY 2 distinct customer personas representing two different key buyer profiles / ICP segments.

CURRENCY REQUIREMENT:
All income levels MUST be displayed in Indian Rupee (INR / ₹) (e.g. "₹6 Lakhs - ₹12 Lakhs / yr", "₹8,00,000 - ₹15,00,000 / yr", or "₹50,000 - ₹1,00,000 / month"). DO NOT use USD ($).

Return strictly a valid JSON array containing 2 objects with this EXACT structure:
[
  {
    "personaName": "Fictional Name and Title (e.g. 'Sarah, the Busy Founder')",
    "demographics": {
      "age": "28 - 35",
      "location": "Urban Tech Hub / Remote",
      "income": "₹6 Lakhs - ₹12 Lakhs / yr",
      "occupation": "Job Title / Role",
      "details": "A concise paragraph summarizing their background and daily work context."
    },
    "interests": {
      "hobbies": ["Hobby 1", "Hobby 2", "Hobby 3"],
      "values": ["Core Value 1", "Core Value 2", "Core Value 3"],
      "mediaConsumption": ["Media Channel 1", "Media Channel 2", "Media Channel 3"],
      "details": "A short summary of their media habits and content preferences."
    },
    "buyingBehaviour": {
      "shoppingHabits": "Specific description of how they research and purchase software/services.",
      "decisionDrivers": "Key factors driving their purchasing decisions.",
      "priceSensitivity": "Price sensitivity level (e.g. 'Moderate - Willing to pay for high ROI').",
      "details": "Summary of decision making style and buying process."
    },
    "painPoints": {
      "specificFrustrations": [
        "Frustration 1 that the product solves",
        "Frustration 2 that the product solves",
        "Frustration 3 that the product solves"
      ],
      "primaryChallenge": "Single biggest pain point or challenge.",
      "details": "Summary explaining why existing solutions fail them and how this product fixes it."
    }
  },
  {
    "personaName": "Second Fictional Name and Title (e.g. 'Marcus, the Strategic Product Marketer')",
    "demographics": {
      "age": "34 - 42",
      "location": "Suburban Tech Corridor",
      "income": "₹10 Lakhs - ₹18 Lakhs / yr",
      "occupation": "Job Title / Role",
      "details": "Background context for second persona."
    },
    "interests": {
      "hobbies": ["Hobby 1", "Hobby 2"],
      "values": ["Core Value 1", "Core Value 2"],
      "mediaConsumption": ["Media 1", "Media 2"],
      "details": "Summary for second persona."
    },
    "buyingBehaviour": {
      "shoppingHabits": "Buying habits details.",
      "decisionDrivers": "Decision drivers details.",
      "priceSensitivity": "Price sensitivity.",
      "details": "Summary of buying behaviour."
    },
    "painPoints": {
      "specificFrustrations": [
        "Frustration 1",
        "Frustration 2",
        "Frustration 3"
      ],
      "primaryChallenge": "Primary challenge.",
      "details": "Summary of pain points."
    }
  }
]

${contextBlock}
${userHint ? `- Additional User Input / Focus: ${userHint}` : ''}
`;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('AI Customer Persona Generation Error:', error);
    throw new Error('Failed to generate customer personas using AI.');
  }
};
