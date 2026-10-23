import { MarketingProduct } from '../models/MarketingProduct.js';
import { Brand } from '../models/Brand.js';
import { sendResponse } from '../utils/apiResponse.js';
import {
  generateFullProductStrategyAI,
  generateProductSectionAI,
  generateProductStrategyFromIdea,
  generateProductStrategySectionFromIdea,
} from '../services/productAiService.js';
import { generateAdPosterAI } from '../services/marketingAdPosterService.js';

// GET /api/marketing-products - Get products (optionally filter by brand)
export const getMarketingProducts = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { brandId } = req.query;

    const query = { createdBy: userId };
    if (brandId) {
      query.brand = brandId;
    }

    const products = await MarketingProduct.find(query)
      .populate('brand', 'brandName industry tagline logoConcept')
      .sort({ updatedAt: -1 });

    return sendResponse(res, 200, true, 'Marketing products retrieved successfully', {
      products,
      totalProducts: products.length,
    });
  } catch (err) {
    console.error('Error fetching marketing products:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to fetch marketing products');
  }
};

// GET /api/marketing-products/:id - Get single product details
export const getMarketingProductById = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const product = await MarketingProduct.findOne({ _id: req.params.id, createdBy: userId }).populate(
      'brand',
      'brandName industry tagline mission vision brandStory brandPersonality brandTone colorPalette brandPositioning brandUSP'
    );

    if (!product) {
      return sendResponse(res, 404, false, 'Product not found or access denied');
    }

    return sendResponse(res, 200, true, 'Marketing product details retrieved', { product });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch product details');
  }
};

// POST /api/marketing-products - Save Product under Brand
export const createMarketingProduct = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      brand,
      productName,
      productIdea,
      category,
      characteristics,
      estimatedCost,
      intendedMarket,
      productObjective,
      description,
      tagline,
      USP,
      pricingSuggestion,
      positioning,
      targetCustomer,
      customerPersona,
      packaging,
      marketingIdeas,
      campaigns,
      socialMediaContent,
      advertisementCopy,
      seoKeywords,
      productNamesSuggestions,
      uspSuggestions,
    } = req.body;

    if (!brand) {
      return sendResponse(res, 400, false, 'Parent Brand association is required');
    }

    // Verify parent Brand exists and belongs to user
    const brandDoc = await Brand.findOne({ _id: brand, createdBy: userId });
    if (!brandDoc) {
      return sendResponse(res, 400, false, 'Invalid or non-existent Brand selected');
    }

    if (!productName || !productName.trim()) {
      return sendResponse(res, 400, false, 'Product name is required');
    }

    if (!productIdea || !productIdea.trim()) {
      return sendResponse(res, 400, false, 'Product idea is required');
    }

    const product = await MarketingProduct.create({
      company: brandDoc.company || null,
      brand: brandDoc._id,
      createdBy: userId,
      productName: productName.trim(),
      productIdea: productIdea.trim(),
      category: category || '',
      characteristics: characteristics || '',
      estimatedCost: estimatedCost || '',
      intendedMarket: intendedMarket || '',
      productObjective: productObjective || '',
      description: description || {},
      tagline: tagline || '',
      USP: USP || [],
      pricingSuggestion: pricingSuggestion || {},
      positioning: positioning || {},
      targetCustomer: targetCustomer || '',
      customerPersona: customerPersona || {},
      packaging: packaging || {},
      marketingIdeas: marketingIdeas || {},
      campaigns: campaigns || [],
      socialMediaContent: socialMediaContent || [],
      advertisementCopy: advertisementCopy || [],
      seoKeywords: seoKeywords || [],
      productNamesSuggestions: productNamesSuggestions || [],
      uspSuggestions: uspSuggestions || [],
      status: 'Active',
    });

    return sendResponse(res, 201, true, 'Product created successfully under brand', { product });
  } catch (err) {
    console.error('Error creating marketing product:', err);
    return sendResponse(res, 400, false, err.message || 'Failed to create marketing product');
  }
};

// PUT /api/marketing-products/:id - Update product
export const updateMarketingProduct = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const product = await MarketingProduct.findOne({ _id: req.params.id, createdBy: userId });

    if (!product) {
      return sendResponse(res, 404, false, 'Product not found or access denied');
    }

    const fieldsToUpdate = [
      'productName',
      'productIdea',
      'category',
      'characteristics',
      'estimatedCost',
      'intendedMarket',
      'productObjective',
      'description',
      'tagline',
      'USP',
      'pricingSuggestion',
      'positioning',
      'targetCustomer',
      'customerPersona',
      'packaging',
      'marketingIdeas',
      'campaigns',
      'socialMediaContent',
      'advertisementCopy',
      'seoKeywords',
      'productNamesSuggestions',
      'uspSuggestions',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    return sendResponse(res, 200, true, 'Product updated successfully', { product });
  } catch (err) {
    console.error('Error updating product:', err);
    return sendResponse(res, 400, false, err.message || 'Failed to update product');
  }
};

// DELETE /api/marketing-products/:id - Delete product
export const deleteMarketingProduct = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const product = await MarketingProduct.findOneAndDelete({ _id: req.params.id, createdBy: userId });

    if (!product) {
      return sendResponse(res, 404, false, 'Product not found or access denied');
    }

    return sendResponse(res, 200, true, 'Product deleted successfully');
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to delete product');
  }
};

// POST /api/marketing-products/ai/generate-strategy - Generate 5 Product Strategy sections from Product Idea
export const generateProductStrategyFromIdeaController = async (req, res) => {
  try {
    const { productIdea } = req.body;
    if (!productIdea || !productIdea.trim()) {
      return sendResponse(res, 400, false, 'Product Idea is required for strategy generation');
    }

    const aiResult = await generateProductStrategyFromIdea(productIdea.trim());

    return sendResponse(res, 200, true, 'Product strategy generated dynamically by Gemini AI', {
      aiResult,
    });
  } catch (err) {
    console.error('Error generating Product Strategy from Idea:', err);
    return sendResponse(
      res,
      500,
      false,
      err.message || 'Unable to generate Product Strategy. Please try again.'
    );
  }
};

// POST /api/marketing-products/ai/regenerate-section - Regenerate individual section
export const regenerateStrategySectionFromIdeaController = async (req, res) => {
  try {
    const { sectionKey, productIdea, productName } = req.body;

    if (!sectionKey) {
      return sendResponse(res, 400, false, 'Section key is required');
    }

    if (!productIdea || !productIdea.trim()) {
      return sendResponse(res, 400, false, 'Product Idea is required for section regeneration');
    }

    const sectionResult = await generateProductStrategySectionFromIdea(
      sectionKey,
      productIdea.trim(),
      productName || ''
    );

    return sendResponse(res, 200, true, `Section '${sectionKey}' regenerated successfully`, {
      sectionKey,
      sectionResult,
    });
  } catch (err) {
    console.error(`Error regenerating section '${req.body.sectionKey}':`, err);
    return sendResponse(
      res,
      500,
      false,
      err.message || 'Unable to regenerate section. Please try again.'
    );
  }
};

// POST /api/marketing-products/strategy/save - Save Product Strategy to MongoDB
export const saveProductStrategyController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      productId,
      productIdea,
      productName,
      tagline,
      shortDescription,
      detailedDescription,
      productNamesSuggestions,
      usps,
      USP,
      pricingSuggestion,
      positioning,
      positioningStatement,
      targetSegment,
      keyBenefit,
      competitiveMoat,
      packaging,
      adPosterData,
    } = req.body;

    if (!productIdea || !productIdea.trim()) {
      return sendResponse(res, 400, false, 'Product Idea is required to save product strategy');
    }

    const selectedName = (productName && productName.trim()) ? productName.trim() : 'Untitled Product Strategy';

    let productDoc;
    if (productId) {
      productDoc = await MarketingProduct.findOne({ _id: productId, createdBy: userId });
    }

    if (!productDoc) {
      // Find matching product by name or idea for this user to avoid duplicates on repeat saves
      productDoc = await MarketingProduct.findOne({
        createdBy: userId,
        $or: [
          { productName: selectedName },
          { productIdea: productIdea.trim() },
        ],
      });
    }

    const posData = positioning || {};
    if (positioningStatement) posData.positioningStatement = positioningStatement;
    if (targetSegment) posData.targetMarket = targetSegment;
    if (competitiveMoat) posData.competitiveAdvantage = competitiveMoat;
    if (keyBenefit) posData.customerNeed = keyBenefit;

    if (productDoc) {
      productDoc.productIdea = productIdea.trim();
      productDoc.productName = selectedName;
      if (tagline !== undefined) productDoc.tagline = tagline;
      if (shortDescription || detailedDescription) {
        productDoc.description = {
          shortDescription: shortDescription || productDoc.description?.shortDescription || '',
          detailedDescription: detailedDescription || productDoc.description?.detailedDescription || '',
        };
      }
      if (productNamesSuggestions) productDoc.productNamesSuggestions = productNamesSuggestions;
      if (usps) productDoc.usps = usps;
      if (USP) productDoc.USP = USP;
      if (pricingSuggestion) productDoc.pricingSuggestion = pricingSuggestion;
      productDoc.positioning = { ...productDoc.positioning, ...posData };
      if (packaging) productDoc.packaging = packaging;
      if (adPosterData) {
        productDoc.adPosterData = { ...productDoc.adPosterData, ...adPosterData };
        productDoc.adPosterStatus = 'Saved';
      }
      await productDoc.save();
    } else {
      productDoc = await MarketingProduct.create({
        createdBy: userId,
        productName: selectedName,
        productIdea: productIdea.trim(),
        tagline: tagline || '',
        description: {
          shortDescription: shortDescription || '',
          detailedDescription: detailedDescription || '',
        },
        productNamesSuggestions: productNamesSuggestions || [],
        usps: usps || [],
        USP: USP || usps || [],
        pricingSuggestion: pricingSuggestion || {},
        positioning: posData,
        packaging: packaging || {},
        adPosterData: adPosterData || {},
        adPosterStatus: adPosterData?.headline ? 'Saved' : 'Not Generated',
        status: 'Active',
      });
    }

    return sendResponse(res, 200, true, 'Product strategy saved to MongoDB successfully', {
      product: productDoc,
    });
  } catch (err) {
    console.error('Error saving product strategy:', err);
    return sendResponse(res, 400, false, err.message || 'Failed to save product strategy');
  }
};

// GET /api/marketing-products/strategy/latest - Get latest saved strategy for user
export const getLatestProductStrategyController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const latestProduct = await MarketingProduct.findOne({ createdBy: userId }).sort({ updatedAt: -1 });

    return sendResponse(res, 200, true, 'Latest saved product strategy retrieved', {
      product: latestProduct || null,
    });
  } catch (err) {
    console.error('Error fetching latest product strategy:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to fetch saved product strategy');
  }
};

// POST /api/marketing-products/:id/generate-ad-poster - Generate AI Ad Poster for saved product
export const generateAdPosterController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    const productDoc = await MarketingProduct.findById(id).populate('brand');
    if (!productDoc) {
      return sendResponse(res, 404, false, 'Saved product not found');
    }

    // Verify user authorization: owner or admin/marketing_staff role
    const userRole = req.user?.role;
    if (productDoc.createdBy.toString() !== userId.toString() && userRole !== 'admin' && userRole !== 'marketing_staff') {
      return sendResponse(res, 403, false, 'Not authorized to generate poster for this product');
    }

    // Generate Poster using backend Gemini service and saved strategy
    const posterData = await generateAdPosterAI(productDoc, productDoc.brand);

    productDoc.adPosterData = posterData;
    productDoc.adPosterStatus = 'Generated';
    productDoc.adPosterCreatedAt = new Date();
    await productDoc.save();

    return sendResponse(res, 200, true, 'AI Ad Poster generated successfully from saved strategy', {
      product: productDoc,
      adPosterData: posterData,
    });
  } catch (err) {
    console.error('Error generating AI Ad Poster:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to generate AI Ad Poster');
  }
};

// GET /api/marketing-products/:id/ad-poster - Get AI Ad Poster for saved product
export const getAdPosterController = async (req, res) => {
  try {
    const { id } = req.params;
    const productDoc = await MarketingProduct.findById(id).populate('brand');

    if (!productDoc) {
      return sendResponse(res, 404, false, 'Product not found');
    }

    return sendResponse(res, 200, true, 'Ad poster retrieved', {
      adPosterData: productDoc.adPosterData,
      adPosterStatus: productDoc.adPosterStatus,
      adPosterCreatedAt: productDoc.adPosterCreatedAt,
      product: productDoc,
    });
  } catch (err) {
    console.error('Error fetching ad poster:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to fetch ad poster');
  }
};

// POST /api/marketing-products/:id/regenerate-ad-poster - Regenerate AI Ad Poster
export const regenerateAdPosterController = async (req, res) => {
  return generateAdPosterController(req, res);
};

// POST /api/marketing-products/:id/save-ad-poster - Save/Update poster data
export const saveAdPosterController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;
    const { adPosterData, adPosterUrl } = req.body;

    const productDoc = await MarketingProduct.findById(id);
    if (!productDoc) {
      return sendResponse(res, 404, false, 'Product not found');
    }

    if (adPosterData) {
      productDoc.adPosterData = { ...productDoc.adPosterData, ...adPosterData };
    }
    if (adPosterUrl) {
      productDoc.adPosterUrl = adPosterUrl;
    }
    productDoc.adPosterStatus = 'Saved';
    await productDoc.save();

    return sendResponse(res, 200, true, 'Ad poster saved successfully', {
      product: productDoc,
    });
  } catch (err) {
    console.error('Error saving ad poster:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to save ad poster');
  }
};


