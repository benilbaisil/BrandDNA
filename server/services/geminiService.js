import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
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

const formatProfileContext = (profile) => {
  if (!profile) return 'No profile context available.';
  return `
    - Business Type: ${profile.businessType || 'N/A'}
    - Industry: ${profile.industry || 'N/A'} (Other: ${profile.otherIndustry || 'N/A'})
    - Business Stage: ${profile.businessStage || 'N/A'}
    - Country/Region: ${profile.country || 'N/A'} ${profile.region || ''}
    - Description: ${profile.businessDescription || profile.companyDescription || 'N/A'}
    - Problem Statement: ${profile.problemStatement || 'N/A'}
    - Business Goals: ${Array.isArray(profile.businessGoals) ? profile.businessGoals.join(', ') : 'N/A'}
    - Website: ${profile.website || 'N/A'}
  `;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Robust AI content generation with automatic model fallback and retries
 */
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
 * Legacy full-identity generator (retained for backward compatibility)
 */
export const generateBrandAssets = async (profile) => {
  const prompt = `
    You are an expert Brand Strategist and Copywriter.
    Based on the following startup profile, generate core brand identity assets.
    The response must be strictly in JSON format matching this structure perfectly, with no markdown formatting or extra text outside the JSON block:
    {
      "brandName": "A creative, catchy brand name",
      "tagline": "A short, memorable tagline",
      "missionStatement": "A strong mission statement explaining the 'why' and core purpose",
      "visionStatement": "An inspiring vision statement outlining the future goal",
      "brandStory": "A compelling 2-3 paragraph brand story",
      "brandPersonality": "3-5 adjectives describing the brand's tone and personality"
    }

    Startup Profile Context:
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    const parsedData = cleanJsonResponse(rawText);
    if (Array.isArray(parsedData.brandPersonality)) {
      parsedData.brandPersonality = parsedData.brandPersonality.join(', ');
    }
    return parsedData;
  } catch (error) {
    console.error('Gemini AI Generation Error:', error);
    throw new Error('Failed to generate brand identity using AI.');
  }
};

/**
 * 1. BRAND NAME GENERATOR
 */
export const generateBrandNameAI = async (profile) => {
  const prompt = `
    You are a world-class Brand Naming Specialist.
    Generate 5 distinctive, memorable, and high-impact brand names for a business with the following profile.
    Return strictly a JSON array of 5 objects, with keys "name" and "rationale".

    Response format:
    [
      { "name": "NovaNest", "rationale": "Combines modern innovation with a safe, solid foundation." },
      { "name": "Verdio", "rationale": "Reflects growth, vitality, and forward-thinking momentum." }
    ]

    Business Context:
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Brand Name Generation Error:', error);
    throw new Error('Unable to generate name suggestions right now. Please try again.');
  }
};

/**
 * 2. TAGLINE GENERATOR
 */
export const generateTaglineAI = async (profile, brandName) => {
  const prompt = `
    You are an expert Brand Positioning Strategist.
    Generate 5 compelling, concise, and memorable taglines for a business.
    Consider the brand name: ${brandName || 'Not yet selected'}.
    Return strictly a JSON array of strings containing the 5 taglines.

    Response format:
    [
      "Innovation Made Simple",
      "Building a Better Tomorrow",
      "Smart Ideas. Real Impact.",
      "Designed for What's Next",
      "Empowering Your Future"
    ]

    Business Context:
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Tagline Generation Error:', error);
    throw new Error('Unable to generate taglines right now. Please try again.');
  }
};

/**
 * 3. MISSION STATEMENT GENERATOR
 */
export const generateMissionAI = async (profile, brandName) => {
  const prompt = `
    You are a Strategic Brand Consultant.
    Generate 3 distinct mission statements for a company.
    Brand Name context: ${brandName || 'Our Business'}.
    A good mission statement clarifies core purpose, who they serve, and how they deliver value.
    Return strictly a JSON array of 3 strings.

    Response format:
    [
      "Our mission is to make sustainable living accessible through intelligent, eco-friendly products.",
      "We empower businesses to scale seamlessly with automated, human-centered technology.",
      "To eliminate operational complexity for creators by delivering intuitive digital tools."
    ]

    Business Context:
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Mission Generation Error:', error);
    throw new Error('Unable to generate mission statements right now. Please try again.');
  }
};

/**
 * 4. VISION STATEMENT GENERATOR
 */
export const generateVisionAI = async (profile, brandName, selectedMission) => {
  const prompt = `
    You are a Visionary Corporate Copywriter.
    Generate 3 inspiring vision statements for a business.
    Brand Name: ${brandName || 'Our Business'}.
    Selected Mission Context: ${selectedMission || 'N/A'}.
    A vision statement outlines long-term aspirational future impact and industry leadership.
    Return strictly a JSON array of 3 strings.

    Response format:
    [
      "To become the world's most trusted partner in sustainable business transformation.",
      "To pioneer a global ecosystem where every entrepreneur can turn ideas into thriving enterprises.",
      "To redefine industry standards through relentless innovation and customer-first design."
    ]

    Business Context:
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Vision Generation Error:', error);
    throw new Error('Unable to generate vision statements right now. Please try again.');
  }
};

/**
 * 5. BRAND STORY GENERATOR
 */
export const generateBrandStoryAI = async (profile, brandName, selectedMission, selectedVision) => {
  const prompt = `
    You are a Master Brand Storyteller.
    Generate 3 distinct Brand Story options for this business.
    Brand Name: ${brandName || 'Our Brand'}.
    Mission context: ${selectedMission || 'N/A'}.
    Vision context: ${selectedVision || 'N/A'}.

    Each story option should have a catchy title and a compelling 2-3 paragraph content block.
    Return strictly a JSON array of 3 objects with keys "title" and "content".

    Response format:
    [
      {
        "title": "The Catalyst of Change",
        "content": "Paragraph 1 detailing the origin and problem...\\n\\nParagraph 2 describing the solution and mission...\\n\\nParagraph 3 looking ahead to the future."
      },
      {
        "title": "Pioneering the Future",
        "content": "Paragraph 1...\\n\\nParagraph 2..."
      }
    ]

    Business Context:
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Brand Story Generation Error:', error);
    throw new Error('Unable to generate brand stories right now. Please try again.');
  }
};

/**
 * 6. BRAND PERSONALITY GENERATOR
 */
export const generateBrandPersonalityAI = async (profile, brandName, selectedMission) => {
  const prompt = `
    You are a Brand Psychology Specialist.
    Analyze the business profile and suggest 6-8 fitting brand personality traits (adjectives like Innovative, Trustworthy, Bold, Friendly, Premium, Empathetic, Agile, Visionary).
    Also provide a concise explanation (1-2 sentences) of why these traits align with the business goals and industry.

    Return strictly a JSON object with keys "traits" (array of strings) and "explanation" (string).

    Response format:
    {
      "traits": ["Innovative", "Friendly", "Trustworthy", "Bold", "Premium"],
      "explanation": "These traits were selected because they align with your business industry, target market, and goals."
    }

    Business Context:
    - Brand Name: ${brandName || 'N/A'}
    - Mission Context: ${selectedMission || 'N/A'}
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Brand Personality Generation Error:', error);
    throw new Error('Unable to generate brand personality traits right now. Please try again.');
  }
};

/**
 * 7. LOGO PROMPT GENERATOR
 */
export const generateLogoPromptAI = async (profile, brandName) => {
  const prompt = `
    You are an expert Brand Identity Designer & AI Image Prompt Specialist.
    Generate 3 distinct creative logo design concepts and AI image generation prompts for a brand.
    Brand Name: ${brandName || 'Our Brand'}.
    
    Return strictly a JSON array of 3 objects with keys:
    "conceptName": "Short descriptive title",
    "style": "Minimalist / Abstract / Geometric / Lettermark / Emblem",
    "promptText": "Detailed Midjourney / DALL-E / Imagen prompt for generating this logo icon",
    "visualDescription": "Explanation of the icon symbols, shape geometry, and visual meaning"

    Business Context:
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Logo Prompt Generation Error:', error);
    return [
      {
        conceptName: "Minimalist Geometry",
        style: "Geometric Vector Mark",
        promptText: `Vector logo icon for ${brandName || 'Brand'}, minimalist geometry, clean lines, high contrast, white background`,
        visualDescription: "Modern geometric shapes representing forward momentum, precision, and trust."
      },
      {
        conceptName: "Abstract Emblem",
        style: "Abstract Vector",
        promptText: `Abstract emblem logo for ${brandName || 'Brand'}, premium luxury, clean vector symbol, isolated on white`,
        visualDescription: "Interlocking organic loops symbolizing seamless harmony and capability."
      }
    ];
  }
};

/**
 * 8. COLOR PSYCHOLOGY GENERATOR
 */
export const generateColorPsychologyAI = async (profile, brandName) => {
  const prompt = `
    You are a Color Psychology & Visual Design Strategist.
    Recommend a tailored color palette for this brand with color psychology rationale.
    Brand Name: ${brandName || 'Our Brand'}.

    Return strictly a JSON object with:
    "palette": [
      { "role": "Primary Brand Color", "hex": "#1E293B", "name": "Slate Obsidian", "psychology": "Conveys authority, stability, and professional trust." },
      { "role": "Primary Accent", "hex": "#6366F1", "name": "Electric Indigo", "psychology": "Inspires innovation, creativity, and modern technology." },
      { "role": "Secondary Accent", "hex": "#10B981", "name": "Emerald Green", "psychology": "Represents growth, vitality, and sustainability." },
      { "role": "Background Porcelain", "hex": "#F8FAFC", "name": "Soft Off-White", "psychology": "Provides clean readability and high contrast." }
    ],
    "colorPsychologyRationale": "Comprehensive 2-sentence summary explaining why these colors resonate with the target audience and industry."

    Business Context:
    ${formatProfileContext(profile)}
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    return cleanJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Color Psychology Error:', error);
    return {
      palette: [
        { role: "Primary Brand Color", hex: "#0F172A", name: "Obsidian Slate", psychology: "Authority and structural foundation." },
        { role: "Primary Accent", hex: "#4F46E5", name: "Indigo", psychology: "Innovation, vision, and technology." },
        { role: "Highlight Accent", hex: "#10B981", name: "Emerald", psychology: "Growth, vitality, and clarity." }
      ],
      colorPsychologyRationale: "Tailored palette balancing corporate trust with vibrant modern energy."
    };
  }
};

/**
 * 9. URL IMAGE PROMPT GENERATOR
 */
export const generateImagePromptFromUrl = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header').remove();
    
    // Get text content
    let textContent = $('body').text().replace(/\s+/g, ' ').trim();
    if (textContent.length > 5000) {
      textContent = textContent.substring(0, 5000); // Limit context length
    }

    const prompt = `
      You are an expert prompt engineer for AI image generation.
      Based on the following extracted text from a product webpage, create a highly detailed, premium, professional e-commerce advertising poster prompt for this product.
      The prompt should be written to be used directly by a high-end diffusion model (like Flux or Midjourney).
      Include:
      - The product as the main hero placed prominently in the center.
      - A fitting realistic environment based on the product.
      - Cinematic lighting, realistic product photography, premium aesthetics, clean composition, sharp details.
      - Clean empty space at the top and bottom for text.
      - No people, no logos, no watermark, no random text, no distorted objects.
      
      Extracted Text:
      "${textContent}"
      
      Return ONLY the final prompt text string. No markdown formatting, no JSON, no introduction.
    `;

    const generatedPrompt = await generateWithFallback(prompt);
    return generatedPrompt.replace(/^"|"$/g, '').trim(); // Remove quotes if added
  } catch (error) {
    console.error('Error generating prompt from URL:', error);
    // Fallback prompt if scraping fails
    return "Create a premium professional e-commerce advertising poster for a modern product. Show the product as the main hero, placed prominently in the center, with a realistic environment in the background. Use cinematic lighting, realistic product photography, premium brand aesthetics, clean composition, sharp details, and a sophisticated commercial advertising style. Leave clean empty space at the top and bottom for adding text later. No people, no logos, no watermark, no random text.";
  }
};

/**
 * 10. PRODUCT DETAILS IMAGE PROMPT GENERATOR
 */
export const generateImagePromptFromProductDetails = async (productDetails) => {
  try {
    const prompt = `
      You are an expert prompt engineer for AI image generation.
      Based on the following product details, create a highly detailed, premium, professional e-commerce advertising poster prompt for this product.
      The prompt should be written to be used directly by a high-end diffusion model (like Flux or Midjourney).
      Include:
      - The product as the main hero placed prominently in the center.
      - A fitting realistic environment based on the product.
      - Cinematic lighting, realistic product photography, premium aesthetics, clean composition, sharp details.
      - Explicitly instruct the image generation model to write the product name "${productDetails.name || productDetails.productName || 'Modern Product'}" and a short catchy marketing slogan as stylized typography in the poster. 
      - The typography should be bold, legible, and match the premium aesthetic.
      - Do NOT use random gibberish text.
      - No people, no distorted objects, no watermarks.
      
      Product Details:
      Name: ${productDetails.name || productDetails.productName || 'Modern Product'}
      Category: ${productDetails.categoryName || productDetails.category || ''}
      Description: ${typeof productDetails.description === 'string' ? productDetails.description : (productDetails.description?.shortDescription || productDetails.productIdea || '')}
      Key Features: ${(productDetails.description?.keyFeatures || []).join(', ')}
      Target Audience: ${productDetails.intendedMarket || productDetails.positioning?.targetMarket || 'General Consumers'}
      
      Return ONLY the final prompt text string. No markdown formatting, no JSON, no introduction.
    `;

    const generatedPrompt = await generateWithFallback(prompt);
    return generatedPrompt.replace(/^"|"$/g, '').trim(); // Remove quotes if added
  } catch (error) {
    console.error('Error generating prompt from Product Details:', error);
    return "Create a premium professional e-commerce advertising poster for a modern product. Show the product as the main hero, placed prominently in the center, with a realistic environment in the background. Use cinematic lighting, realistic product photography, premium brand aesthetics, clean composition, sharp details, and a sophisticated commercial advertising style. Leave clean empty space at the top and bottom for adding text later. No people, no logos, no watermark, no random text.";
  }
};

