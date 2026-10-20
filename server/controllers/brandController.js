import { Brand } from '../models/Brand.js';
import { MarketingProduct } from '../models/MarketingProduct.js';
import { sendResponse } from '../utils/apiResponse.js';
import { generateFullBrandIdentityAI, generateBrandSectionAI } from '../services/brandAiService.js';

// GET /api/brands - Fetch all brands for authenticated user
export const getBrands = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const brands = await Brand.find({ createdBy: userId }).sort({ updatedAt: -1 });

    // Populate product count per brand
    const brandsWithCounts = await Promise.all(
      brands.map(async (brand) => {
        const productCount = await MarketingProduct.countDocuments({ brand: brand._id });
        return {
          ...brand.toObject(),
          productCount,
        };
      })
    );

    return sendResponse(res, 200, true, 'Brands retrieved successfully', {
      brands: brandsWithCounts,
      totalBrands: brandsWithCounts.length,
    });
  } catch (err) {
    console.error('Error fetching brands:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to fetch brands');
  }
};

// GET /api/brands/:id - Fetch brand details + products under brand
export const getBrandById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const brand = await Brand.findOne({ _id: req.params.id, createdBy: userId });

    if (!brand) {
      return sendResponse(res, 404, false, 'Brand not found or access denied');
    }

    // Fetch products belonging to this brand
    const products = await MarketingProduct.find({ brand: brand._id }).sort({ updatedAt: -1 });

    return sendResponse(res, 200, true, 'Brand details retrieved successfully', {
      brand,
      products,
      productCount: products.length,
    });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch brand details');
  }
};

// POST /api/brands - Create a new Brand
export const createBrand = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      brandName,
      industry,
      businessDescription,
      targetMarket,
      businessGoals,
      preferredStyleTone,
      brandIdea,
      tagline,
      mission,
      vision,
      brandStory,
      brandPersonality,
      brandTone,
      colorPalette,
      logoConcept,
      brandPositioning,
      brandUSP,
      nameSuggestions,
      taglineSuggestions,
    } = req.body;

    if (!brandName || !brandName.trim()) {
      return sendResponse(res, 400, false, 'Brand name is required');
    }

    const brand = await Brand.create({
      createdBy: userId,
      brandName: brandName.trim(),
      industry: industry || '',
      businessDescription: businessDescription || '',
      targetMarket: targetMarket || '',
      businessGoals: businessGoals || '',
      preferredStyleTone: preferredStyleTone || '',
      brandIdea: brandIdea || '',
      tagline: tagline || '',
      mission: mission || '',
      vision: vision || '',
      brandStory: brandStory || '',
      brandPersonality: brandPersonality || [],
      brandTone: brandTone || [],
      colorPalette: colorPalette || [],
      logoConcept: logoConcept || '',
      brandPositioning: brandPositioning || '',
      brandUSP: brandUSP || '',
      nameSuggestions: nameSuggestions || [],
      taglineSuggestions: taglineSuggestions || [],
      status: 'Active',
    });

    return sendResponse(res, 201, true, 'Brand created successfully', { brand });
  } catch (err) {
    console.error('Error creating brand:', err);
    return sendResponse(res, 400, false, err.message || 'Failed to create brand');
  }
};

// PUT /api/brands/:id - Update an existing Brand
export const updateBrand = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const brand = await Brand.findOne({ _id: req.params.id, createdBy: userId });

    if (!brand) {
      return sendResponse(res, 404, false, 'Brand not found or access denied');
    }

    const fieldsToUpdate = [
      'brandName',
      'industry',
      'businessDescription',
      'targetMarket',
      'businessGoals',
      'preferredStyleTone',
      'brandIdea',
      'tagline',
      'mission',
      'vision',
      'brandStory',
      'brandPersonality',
      'brandTone',
      'colorPalette',
      'logoConcept',
      'brandPositioning',
      'brandUSP',
      'nameSuggestions',
      'taglineSuggestions',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        brand[field] = req.body[field];
      }
    });

    await brand.save();
    return sendResponse(res, 200, true, 'Brand updated successfully', { brand });
  } catch (err) {
    console.error('Error updating brand:', err);
    return sendResponse(res, 400, false, err.message || 'Failed to update brand');
  }
};

// DELETE /api/brands/:id - Delete a Brand
export const deleteBrand = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const brand = await Brand.findOneAndDelete({ _id: req.params.id, createdBy: userId });

    if (!brand) {
      return sendResponse(res, 404, false, 'Brand not found or access denied');
    }

    // Also delete associated products under this brand
    await MarketingProduct.deleteMany({ brand: brand._id });

    return sendResponse(res, 200, true, 'Brand and associated products deleted successfully');
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to delete brand');
  }
};

// POST /api/brands/ai/generate - Generate full Brand Identity using Gemini
export const generateBrandAI = async (req, res) => {
  try {
    const { brandIdea, industry, businessDescription, targetMarket, businessGoals, preferredStyleTone, productIdea } = req.body;

    if (!brandIdea || !brandIdea.trim()) {
      return sendResponse(res, 400, false, 'Brand Idea / Concept is required for AI generation');
    }

    const aiResult = await generateFullBrandIdentityAI({
      brandIdea: brandIdea.trim(),
      industry,
      businessDescription,
      targetMarket,
      businessGoals,
      preferredStyleTone,
      productIdea,
    });

    return sendResponse(res, 200, true, 'Brand Identity generated dynamically by Gemini AI', { aiResult });
  } catch (err) {
    console.error('Error generating Brand AI:', err);
    return sendResponse(
      res,
      500,
      false,
      err.message || 'Unable to generate Brand Identity. Please try again.'
    );
  }
};

// POST /api/brands/ai/generate/:sectionKey - Generate individual brand section
export const generateBrandSectionAIController = async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const { brandIdea, industry, targetMarket, brandName } = req.body;

    if (!brandIdea || !brandIdea.trim()) {
      return sendResponse(res, 400, false, 'Brand Idea is required for section AI generation');
    }

    const result = await generateBrandSectionAI(sectionKey, {
      brandIdea,
      industry,
      targetMarket,
      brandName,
    });

    return sendResponse(res, 200, true, `Generated brand section '${sectionKey}' successfully`, {
      sectionKey,
      result,
    });
  } catch (err) {
    console.error(`Error generating brand section '${req.params.sectionKey}':`, err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate content. Please try again.');
  }
};
