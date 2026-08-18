import { Router } from 'express';
import {
  getStats,
  getUsers,
  createUser,
  toggleUserStatus,
  deleteUser,
  getStartups,
  deleteStartup,
  getProjects,
  deleteProject,
  getReports,
  generateReports,
  getUserReport,
  deleteReport,
  getActivities,
  getIndustryAnalytics,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect all admin endpoints for authenticated admin users
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/startups', getStartups);
router.delete('/startups/:id', deleteStartup);

router.get('/projects', getProjects);
router.delete('/projects/:id', deleteProject);

router.get('/reports', getReports);
router.post('/reports/generate', generateReports);
router.get('/reports/user/:userId', getUserReport);
router.delete('/reports/:id', deleteReport);

router.get('/activities', getActivities);
router.get('/industry-analytics', getIndustryAnalytics);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
