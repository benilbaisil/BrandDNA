import {
  getAdminStatsService,
  getAdminUsersService,
  createAdminUserService,
  toggleUserStatusService,
  deleteUserService,
  getAdminStartupsService,
  deleteStartupService,
  getAdminProjectsService,
  deleteProjectService,
  getAdminReportsService,
  generateAdminReportsService,
  getAdminUserReportService,
  deleteReportService,
  getAdminActivitiesService,
  getAdminIndustryAnalyticsService,
  getAdminSettingsService,
  updateAdminSettingsService,
} from '../services/adminService.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getStats = async (req, res) => {
  try {
    const stats = await getAdminStatsService();
    return sendResponse(res, 200, true, 'Admin stats retrieved', stats);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await getAdminUsersService();
    return sendResponse(res, 200, true, 'Users retrieved', users);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await createAdminUserService(req.body);
    return sendResponse(res, 201, true, 'User created', user);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await toggleUserStatusService(req.params.id);
    return sendResponse(res, 200, true, 'User status updated', user);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserService(req.params.id);
    return sendResponse(res, 200, true, 'User deleted', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const getStartups = async (req, res) => {
  try {
    const startups = await getAdminStartupsService();
    return sendResponse(res, 200, true, 'Startups retrieved', startups);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const deleteStartup = async (req, res) => {
  try {
    const result = await deleteStartupService(req.params.id);
    return sendResponse(res, 200, true, 'Startup deleted', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await getAdminProjectsService();
    return sendResponse(res, 200, true, 'Projects retrieved', projects);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const deleteProject = async (req, res) => {
  try {
    const result = await deleteProjectService(req.params.id);
    return sendResponse(res, 200, true, 'Project deleted', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await getAdminReportsService();
    return sendResponse(res, 200, true, 'Reports retrieved', reports);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const generateReports = async (req, res) => {
  try {
    const reports = await generateAdminReportsService();
    return sendResponse(res, 200, true, 'All executive reports generated successfully', reports);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const getUserReport = async (req, res) => {
  try {
    const report = await getAdminUserReportService(req.params.userId);
    return sendResponse(res, 200, true, 'User report retrieved successfully', report);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const deleteReport = async (req, res) => {
  try {
    const result = await deleteReportService(req.params.id);
    return sendResponse(res, 200, true, 'Report deleted', result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

export const getActivities = async (req, res) => {
  try {
    const activities = await getAdminActivitiesService();
    return sendResponse(res, 200, true, 'Activities retrieved', activities);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const getIndustryAnalytics = async (req, res) => {
  try {
    const analytics = await getAdminIndustryAnalyticsService();
    return sendResponse(res, 200, true, 'Industry analytics retrieved', analytics);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const getSettings = async (req, res) => {
  try {
    const settings = await getAdminSettingsService();
    return sendResponse(res, 200, true, 'Settings retrieved', settings);
  } catch (err) {
    return sendResponse(res, 500, false, err.message);
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await updateAdminSettingsService(req.body);
    return sendResponse(res, 200, true, 'Settings updated successfully', settings);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};
