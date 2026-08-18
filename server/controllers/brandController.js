import {
  getUserBrandIdentityService,
  generateAIInsightsService,
  generateUserBrandService,
  getUserProjectsService,
  createUserProjectService,
  deleteUserProjectService,
  getUserReportsService,
} from '../services/brandService.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getBrandIdentity = async (req, res) => {
  try {
    const data = await getUserBrandIdentityService(req.user._id || req.user.id);
    return sendResponse(res, 200, true, 'Brand identity retrieved', data);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const generateAIInsights = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const insights = await generateAIInsightsService(userId);
    return sendResponse(res, 200, true, 'AI Brand Strategy & SWOT Generated Successfully', insights);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const generateBrandDNA = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const brand = await generateUserBrandService(userId, req.body);
    return sendResponse(res, 200, true, 'AI Brand Identity Generated', brand);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const projects = await getUserProjectsService(userId);
    return sendResponse(res, 200, true, 'User projects retrieved', projects);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const createUserProject = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const project = await createUserProjectService(userId, req.body);
    return sendResponse(res, 201, true, 'Project created', project);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const deleteUserProject = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const result = await deleteUserProjectService(userId, req.params.id);
    return sendResponse(res, 200, true, 'Project deleted', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const getUserReports = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const reports = await getUserReportsService(userId);
    return sendResponse(res, 200, true, 'User reports retrieved', reports);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};
