import { StartupProfile } from '../models/StartupProfile.js';
import { BrandIdentity } from '../models/BrandIdentity.js';
import {
  generateBrandNameAI,
  generateTaglineAI,
  generateMissionAI,
  generateVisionAI,
  generateBrandStoryAI,
  generateBrandPersonalityAI,
} from '../services/geminiService.js';
import { sendResponse } from '../utils/apiResponse.js';

/**
 * Helper to fetch user context
 */
const getUserContext = async (userId) => {
  const profile = await StartupProfile.findOne({ owner: userId });
  if (!profile) {
    throw new Error('Please save your Business Details first before generating AI brand assets.');
  }
  let brand = await BrandIdentity.findOne({ user: userId });
  if (!brand) {
    brand = await BrandIdentity.create({ user: userId });
  }
  return { profile, brand };
};

// 1. POST /api/ai/brand-name
export const generateBrandName = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand } = await getUserContext(userId);

    const suggestions = await generateBrandNameAI(profile);
    brand.brandNameSuggestions = suggestions;
    await brand.save();

    return sendResponse(res, 200, true, 'Brand name suggestions generated', { suggestions });
  } catch (err) {
    console.error('Error generating brand name:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate suggestions right now. Please try again.');
  }
};

// 2. POST /api/ai/tagline
export const generateTagline = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand } = await getUserContext(userId);

    const selectedBrandName = req.body?.brandName || brand.brandName || profile.companyName;
    const suggestions = await generateTaglineAI(profile, selectedBrandName);
    brand.taglineSuggestions = suggestions;
    await brand.save();

    return sendResponse(res, 200, true, 'Tagline suggestions generated', { suggestions });
  } catch (err) {
    console.error('Error generating tagline:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate suggestions right now. Please try again.');
  }
};

// 3. POST /api/ai/mission
export const generateMission = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand } = await getUserContext(userId);

    const selectedBrandName = req.body?.brandName || brand.brandName || profile.companyName;
    const suggestions = await generateMissionAI(profile, selectedBrandName);
    brand.missionSuggestions = suggestions;
    await brand.save();

    return sendResponse(res, 200, true, 'Mission statement suggestions generated', { suggestions });
  } catch (err) {
    console.error('Error generating mission:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate suggestions right now. Please try again.');
  }
};

// 4. POST /api/ai/vision
export const generateVision = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand } = await getUserContext(userId);

    const selectedBrandName = req.body?.brandName || brand.brandName || profile.companyName;
    const selectedMission = req.body?.missionStatement || brand.missionStatement;
    const suggestions = await generateVisionAI(profile, selectedBrandName, selectedMission);
    brand.visionSuggestions = suggestions;
    await brand.save();

    return sendResponse(res, 200, true, 'Vision statement suggestions generated', { suggestions });
  } catch (err) {
    console.error('Error generating vision:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate suggestions right now. Please try again.');
  }
};

// 5. POST /api/ai/brand-story
export const generateBrandStory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand } = await getUserContext(userId);

    const selectedBrandName = req.body?.brandName || brand.brandName || profile.companyName;
    const selectedMission = req.body?.missionStatement || brand.missionStatement;
    const selectedVision = req.body?.visionStatement || brand.visionStatement;

    const suggestions = await generateBrandStoryAI(profile, selectedBrandName, selectedMission, selectedVision);
    brand.brandStorySuggestions = suggestions;
    await brand.save();

    return sendResponse(res, 200, true, 'Brand story suggestions generated', { suggestions });
  } catch (err) {
    console.error('Error generating brand story:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate suggestions right now. Please try again.');
  }
};

// 6. POST /api/ai/brand-personality
export const generateBrandPersonality = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand } = await getUserContext(userId);

    const selectedBrandName = req.body?.brandName || brand.brandName || profile.companyName;
    const selectedMission = req.body?.missionStatement || brand.missionStatement;

    const result = await generateBrandPersonalityAI(profile, selectedBrandName, selectedMission);
    brand.brandPersonalitySuggestions = result.traits;
    brand.brandPersonalityExplanation = result.explanation;
    await brand.save();

    return sendResponse(res, 200, true, 'Brand personality traits generated', result);
  } catch (err) {
    console.error('Error generating brand personality:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate suggestions right now. Please try again.');
  }
};
