import { startupProfileSchema } from '../validators/startupValidator.js';
import {
  getStartupProfileService,
  createStartupProfileService,
  updateStartupProfileService,
  deleteStartupProfileService,
} from '../services/startupService.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getStartupProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await getStartupProfileService(userId);
    return sendResponse(res, 200, true, 'Startup profile fetched successfully', profile);
  } catch (error) {
    next(error);
  }
};

export const createStartupProfile = async (req, res, next) => {
  try {
    const parseResult = startupProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendResponse(
        res,
        400,
        false,
        'Validation error',
        parseResult.error.errors
      );
    }

    const userId = req.user._id || req.user.id;
    const profile = await createStartupProfileService(userId, parseResult.data);
    return sendResponse(res, 201, true, 'Startup profile created successfully', profile);
  } catch (error) {
    next(error);
  }
};

export const updateStartupProfile = async (req, res, next) => {
  try {
    const parseResult = startupProfileSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return sendResponse(
        res,
        400,
        false,
        'Validation error',
        parseResult.error.errors
      );
    }

    const userId = req.user._id || req.user.id;
    const profile = await updateStartupProfileService(userId, parseResult.data);
    return sendResponse(res, 200, true, 'Startup profile updated successfully', profile);
  } catch (error) {
    next(error);
  }
};

export const deleteStartupProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    await deleteStartupProfileService(userId);
    return sendResponse(res, 200, true, 'Startup profile deleted successfully');
  } catch (error) {
    next(error);
  }
};
