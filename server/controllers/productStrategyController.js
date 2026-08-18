import { ProductStrategy } from '../models/ProductStrategy.js';
import { BrandIdentity } from '../models/BrandIdentity.js';
import { StartupProfile } from '../models/StartupProfile.js';
import { sendResponse } from '../utils/apiResponse.js';
import {
  generateProductNamesAI,
  generateProductDescriptionAI,
  generateProductUSPAI,
  generateProductPositioningAI,
  generateFullProductStrategyChainAI,
} from '../services/productStrategyService.js';

const getUserContext = async (userId) => {
  const profile = await StartupProfile.findOne({ owner: userId });
  let brand = await BrandIdentity.findOne({ user: userId });
  if (!brand) {
    brand = await BrandIdentity.create({ user: userId });
  }
  let strategy = await ProductStrategy.findOne({ user: userId });
  if (!strategy) {
    strategy = await ProductStrategy.create({ user: userId });
  }
  return { profile, brand, strategy };
};

// 1. GET /api/product-strategy
export const getStrategy = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand, strategy } = await getUserContext(userId);

    return sendResponse(res, 200, true, 'Product strategy retrieved', {
      strategy,
      brandContext: {
        brandName: brand?.brandName || profile?.companyName || '',
        tagline: brand?.tagline || '',
        missionStatement: brand?.missionStatement || '',
        visionStatement: brand?.visionStatement || '',
        brandPersonality: brand?.brandPersonality || '',
        industry: profile?.industry || '',
      },
    });
  } catch (err) {
    console.error('Error fetching product strategy:', err);
    return sendResponse(res, 500, false, err.message || 'Error fetching strategy');
  }
};

// 2. POST /api/product-strategy/save
export const saveStrategy = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let strategy = await ProductStrategy.findOne({ user: userId });
    if (!strategy) {
      strategy = new ProductStrategy({ user: userId });
    }

    const {
      productName,
      productTagline,
      shortDescription,
      detailedDescription,
      targetAudience,
      usps,
      positioningStatement,
      targetSegment,
      keyBenefit,
      competitiveMoat,
      perceptualAngle,
      valuePillars,
    } = req.body;

    if (productName !== undefined) strategy.productName = productName;
    if (productTagline !== undefined) strategy.productTagline = productTagline;
    if (shortDescription !== undefined) strategy.shortDescription = shortDescription;
    if (detailedDescription !== undefined) strategy.detailedDescription = detailedDescription;
    if (targetAudience !== undefined) strategy.targetAudience = targetAudience;
    if (usps !== undefined) strategy.usps = usps;
    if (positioningStatement !== undefined) strategy.positioningStatement = positioningStatement;
    if (targetSegment !== undefined) strategy.targetSegment = targetSegment;
    if (keyBenefit !== undefined) strategy.keyBenefit = keyBenefit;
    if (competitiveMoat !== undefined) strategy.competitiveMoat = competitiveMoat;
    if (perceptualAngle !== undefined) strategy.perceptualAngle = perceptualAngle;
    if (valuePillars !== undefined) strategy.valuePillars = valuePillars;

    await strategy.save();
    return sendResponse(res, 200, true, 'Product strategy saved successfully', { strategy });
  } catch (err) {
    console.error('Error saving product strategy:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to save product strategy');
  }
};

// 3. POST /api/product-strategy/generate-names (Chain Step 1)
export const generateNames = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand, strategy } = await getUserContext(userId);
    const userHint = req.body?.userHint || '';

    const suggestions = await generateProductNamesAI(profile, brand, userHint);
    strategy.productNameSuggestions = suggestions;
    await strategy.save();

    return sendResponse(res, 200, true, 'Product name suggestions generated', { suggestions });
  } catch (err) {
    console.error('Error generating product names:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate product names right now.');
  }
};

// 4. POST /api/product-strategy/generate-description (Chain Step 2)
export const generateDescription = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand, strategy } = await getUserContext(userId);

    const productName = req.body?.productName || strategy.productName || brand.brandName || profile?.companyName;
    const userHint = req.body?.userHint || '';

    const result = await generateProductDescriptionAI(profile, brand, productName, userHint);
    strategy.descriptionSuggestions = [result];
    if (req.body?.applySelection) {
      strategy.productName = productName;
      strategy.shortDescription = result.shortPitch;
      strategy.detailedDescription = result.fullDescription;
    }
    await strategy.save();

    return sendResponse(res, 200, true, 'Product description generated', { description: result });
  } catch (err) {
    console.error('Error generating product description:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate product description right now.');
  }
};

// 5. POST /api/product-strategy/generate-usp (Chain Step 3)
export const generateUSP = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand, strategy } = await getUserContext(userId);

    const productName = req.body?.productName || strategy.productName;
    const description = req.body?.description || strategy.shortDescription || strategy.detailedDescription;
    const userHint = req.body?.userHint || '';

    const usps = await generateProductUSPAI(profile, brand, productName, description, userHint);
    strategy.uspSuggestions = usps;
    if (req.body?.applySelection) {
      strategy.usps = usps;
    }
    await strategy.save();

    return sendResponse(res, 200, true, 'Product USPs generated', { usps });
  } catch (err) {
    console.error('Error generating USPs:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate USPs right now.');
  }
};

// 6. POST /api/product-strategy/generate-positioning (Chain Step 4)
export const generatePositioning = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand, strategy } = await getUserContext(userId);

    const productName = req.body?.productName || strategy.productName;
    const description = req.body?.description || strategy.shortDescription;
    const usps = req.body?.usps || strategy.usps;
    const userHint = req.body?.userHint || '';

    const positioning = await generateProductPositioningAI(profile, brand, productName, description, usps, userHint);
    strategy.positioningSuggestions = [positioning];
    if (req.body?.applySelection) {
      strategy.positioningStatement = positioning.positioningStatement;
      strategy.targetSegment = positioning.targetSegment;
      strategy.keyBenefit = positioning.keyBenefit;
      strategy.competitiveMoat = positioning.competitiveMoat;
      strategy.perceptualAngle = positioning.perceptualAngle;
      strategy.valuePillars = positioning.valuePillars;
    }
    await strategy.save();

    return sendResponse(res, 200, true, 'Product positioning generated', { positioning });
  } catch (err) {
    console.error('Error generating product positioning:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate product positioning right now.');
  }
};

// 7. POST /api/product-strategy/generate-all (1-Click Chained Pipeline)
export const generateAllChained = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand, strategy } = await getUserContext(userId);
    const userHint = req.body?.productIdea || req.body?.userHint || '';

    const chainedResult = await generateFullProductStrategyChainAI(profile, brand, userHint);

    strategy.productName = chainedResult.productName;
    strategy.productTagline = chainedResult.productTagline;
    strategy.shortDescription = chainedResult.shortDescription;
    strategy.detailedDescription = chainedResult.detailedDescription;
    strategy.usps = chainedResult.usps;
    strategy.positioningStatement = chainedResult.positioning.positioningStatement;
    strategy.targetSegment = chainedResult.positioning.targetSegment;
    strategy.keyBenefit = chainedResult.positioning.keyBenefit;
    strategy.competitiveMoat = chainedResult.positioning.competitiveMoat;
    strategy.perceptualAngle = chainedResult.positioning.perceptualAngle;
    strategy.valuePillars = chainedResult.positioning.valuePillars;

    strategy.productNameSuggestions = chainedResult.suggestions.productNameSuggestions;
    strategy.descriptionSuggestions = chainedResult.suggestions.descriptionSuggestions;
    strategy.uspSuggestions = chainedResult.suggestions.uspSuggestions;
    strategy.positioningSuggestions = chainedResult.suggestions.positioningSuggestions;

    await strategy.save();

    return sendResponse(res, 200, true, '1-Click Chained Product Strategy Generated Successfully', {
      strategy,
      chainedResult,
    });
  } catch (err) {
    console.error('Error in 1-Click prompt chain:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to generate full chained product strategy.');
  }
};
