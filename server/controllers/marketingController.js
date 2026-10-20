import { MarketingContent } from '../models/MarketingContent.js';
import { Campaign } from '../models/Campaign.js';
import { StartupProfile } from '../models/StartupProfile.js';
import { BrandIdentity } from '../models/BrandIdentity.js';
import { MarketingProduct } from '../models/MarketingProduct.js';
import { Product } from '../models/Product.js';
import { sendResponse } from '../utils/apiResponse.js';
import {
  generateBrandNameAI,
  generateTaglineAI,
  generateMissionAI,
  generateVisionAI,
  generateBrandStoryAI,
  generateBrandPersonalityAI,
  generateLogoPromptAI,
  generateColorPsychologyAI,
  generateImagePromptFromUrl,
  generateImagePromptFromProductDetails,
} from '../services/geminiService.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import {
  generateProductNamesAI,
  generateProductDescriptionAI,
  generateProductUSPAI,
  generateProductPositioningAI,
  generatePricingSuggestionsAI,
  generatePackagingSuggestionsAI,
} from '../services/productStrategyService.js';

// GET /api/marketing/content
export const getMarketingContents = async (req, res) => {
  try {
    const { status, contentType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (contentType) filter.contentType = contentType;

    const contents = await MarketingContent.find(filter)
      .populate('createdBy', 'fullName email')
      .populate('approvedBy', 'fullName email')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Marketing contents retrieved', { contents });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch marketing contents');
  }
};

// POST /api/marketing/content (Marketing Staff submits AI content)
export const submitMarketingContent = async (req, res) => {
  try {
    const { contentType, title, contentData } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!contentType || !title || !contentData) {
      return sendResponse(res, 400, false, 'ContentType, title, and contentData are required');
    }

    const content = await MarketingContent.create({
      contentType,
      title,
      contentData: typeof contentData === 'object' ? JSON.stringify(contentData, null, 2) : String(contentData),
      status: 'Submitted',
      createdBy: userId,
    });

    return sendResponse(res, 201, true, 'Marketing content submitted for Admin approval', { content });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to submit marketing content');
  }
};

// PUT /api/marketing/content/:id/approve (Admin approves/rejects content)
export const approveMarketingContent = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body; // Approved | Rejected | Published
    const userId = req.user?._id || req.user?.id;

    const content = await MarketingContent.findById(req.params.id);
    if (!content) {
      return sendResponse(res, 404, false, 'Marketing content not found');
    }

    content.status = status || 'Approved';
    content.reviewNotes = reviewNotes || '';
    content.approvedBy = userId;
    await content.save();

    return sendResponse(res, 200, true, `Marketing content status updated to ${content.status}`, { content });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to update content approval');
  }
};

// GET /api/marketing/campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Campaigns retrieved', { campaigns });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch campaigns');
  }
};

// POST /api/marketing/campaigns
export const createCampaign = async (req, res) => {
  try {
    const { title, description, startDate, endDate, budget } = req.body;
    const userId = req.user?._id || req.user?.id;

    const campaign = await Campaign.create({
      title,
      description,
      startDate,
      endDate,
      budget: Number(budget || 0),
      status: 'Draft',
      approvalStatus: 'PendingApproval',
      createdBy: userId,
    });

    return sendResponse(res, 201, true, 'Campaign created successfully', { campaign });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to create campaign');
  }
};

// POST /api/marketing/generate-brand (4. AI Brand Identity Generator)
export const generateMarketingBrandAI = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { industry, targetAudience, description, tone, companyName } = req.body || {};

    let profile = await StartupProfile.findOne({ owner: userId });
    const profileContext = {
      companyName: companyName || profile?.companyName || 'Brand',
      industry: industry || profile?.industry || 'General Business',
      targetAudience: targetAudience || profile?.targetAudience || 'Target Market',
      businessDescription: description || profile?.businessDescription || 'Quality products and services',
      businessType: profile?.businessType || 'B2C/B2B',
      country: profile?.country || 'Global',
    };

    const names = await generateBrandNameAI(profileContext).catch(() => []);
    const topBrandName = names?.[0]?.name || profileContext.companyName || 'Brand';

    const [taglines, missions, visions, stories, personality, logoPrompts, colorPsychology] = await Promise.all([
      generateTaglineAI(profileContext, topBrandName).catch(() => []),
      generateMissionAI(profileContext, topBrandName).catch(() => []),
      generateVisionAI(profileContext, topBrandName, '').catch(() => []),
      generateBrandStoryAI(profileContext, topBrandName, '', '').catch(() => []),
      generateBrandPersonalityAI(profileContext, topBrandName, '').catch(() => ({ traits: [], explanation: '' })),
      generateLogoPromptAI(profileContext, topBrandName).catch(() => []),
      generateColorPsychologyAI(profileContext, topBrandName).catch(() => ({ palette: [], colorPsychologyRationale: '' })),
    ]);

    return sendResponse(res, 200, true, 'Brand identity generated through AI', {
      brandName: topBrandName,
      names,
      taglines,
      missions,
      visions,
      stories,
      personality,
      logoPrompts,
      colorPsychology,
    });
  } catch (err) {
    console.error('Marketing Brand AI Error:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to generate brand details through AI');
  }
};

// POST /api/marketing/generate-product (5. Product Strategy Module)
export const generateMarketingProductAI = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { brandName, category, features, targetMarket, problemSolved } = req.body || {};

    let profile = await StartupProfile.findOne({ owner: userId });
    let brand = await BrandIdentity.findOne({ user: userId });

    const profileContext = {
      companyName: brandName || brand?.brandName || profile?.companyName || 'Master Brand',
      industry: category || profile?.industry || 'Consumer Products',
      businessDescription: problemSolved || profile?.businessDescription || 'Innovative products',
    };

    const brandContext = {
      brandName: brandName || brand?.brandName || profileContext.companyName,
      tagline: brand?.tagline || '',
      missionStatement: brand?.missionStatement || '',
      visionStatement: brand?.visionStatement || '',
      brandPersonality: brand?.brandPersonality || '',
    };

    const userHint = `Category: ${category || 'General'}. Key Features: ${features || 'Standard'}. Target Market: ${targetMarket || 'Consumers'}. Problem Solved: ${problemSolved || 'Needs'}`;

    const names = await generateProductNamesAI(profileContext, brandContext, userHint).catch(() => []);
    const selectedProductName = names?.[0]?.name || `${brandContext.brandName} Prime`;

    const description = await generateProductDescriptionAI(profileContext, brandContext, selectedProductName, userHint).catch(() => null);
    const usps = await generateProductUSPAI(profileContext, brandContext, selectedProductName, description?.fullDescription || '', userHint).catch(() => []);
    const positioning = await generateProductPositioningAI(profileContext, brandContext, selectedProductName, description?.fullDescription || '', usps, userHint).catch(() => null);
    const pricing = await generatePricingSuggestionsAI(profileContext, brandContext, selectedProductName, userHint).catch(() => null);
    const packaging = await generatePackagingSuggestionsAI(profileContext, brandContext, selectedProductName, userHint).catch(() => null);

    return sendResponse(res, 200, true, 'Product strategy module details generated through AI', {
      productNames: names,
      selectedProductName,
      description,
      usps,
      positioning,
      pricing,
      packaging,
    });
  } catch (err) {
    console.error('Marketing Product AI Error:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to generate product details through AI');
  }
};

// POST /api/marketing/generate-image-from-url
export const generateProductImageFromUrlController = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return sendResponse(res, 400, false, 'Product URL is required');
    }

    // 1. Ask Gemini to extract details and generate a prompt
    const prompt = await generateImagePromptFromUrl(url);

    // 2. Call Cloudflare AI Image Generation
    const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

    if (!ACCOUNT_ID || !API_TOKEN) {
      return sendResponse(res, 500, false, 'Cloudflare credentials not configured in environment variables. Please add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.');
    }

    const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

    const response = await axios.post(
      cloudflareUrl,
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data.success) {
      console.error('Cloudflare Error:', response.data.errors);
      return sendResponse(res, 500, false, 'Failed to generate image with Cloudflare AI');
    }

    const imageData = response.data.result.image;

    return sendResponse(res, 200, true, 'Product image generated successfully', {
      image: imageData,
      prompt: prompt
    });

  } catch (err) {
    console.error('Image Generation Error:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to generate image from URL');
  }
};

// POST /api/marketing/generate-image-from-product
export const generateProductImageFromStoreController = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return sendResponse(res, 400, false, 'Product ID is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found in inventory');
    }

    // 1. Ask Gemini to generate a prompt based on product details
    const prompt = await generateImagePromptFromProductDetails(product);

    // 2. Call Cloudflare AI Image Generation
    const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

    if (!ACCOUNT_ID || !API_TOKEN) {
      return sendResponse(res, 500, false, 'Cloudflare credentials not configured in environment variables. Please add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.');
    }

    const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

    const response = await axios.post(
      cloudflareUrl,
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 35000,
      }
    );

    if (!response.data || !response.data.success) {
      console.error('Cloudflare Error:', response.data?.errors);
      return sendResponse(res, 500, false, 'Failed to generate image with Cloudflare AI');
    }

    const imageData = response.data.result.image;

    return sendResponse(res, 200, true, 'Product image generated successfully', {
      image: imageData,
      prompt: prompt
    });

  } catch (err) {
    if (err.response && err.response.status === 429) {
      console.error('Cloudflare Rate Limit Reached (429)');
      return sendResponse(res, 429, false, 'Cloudflare AI rate limit reached. Please wait a few moments and try again.');
    }
    console.error('Image Generation Error:', err.response ? err.response.data : err.message);
    return sendResponse(res, 500, false, err.message || 'Failed to generate image from product store');
  }
};


