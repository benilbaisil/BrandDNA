import { Activity } from '../models/Activity.js';

/**
 * Log a system activity document into MongoDB
 */
export const logActivity = async ({
  action,
  details = '',
  user = null,
  entityType = 'System',
  entityId = null,
}) => {
  try {
    await Activity.create({
      title: action || 'System Event',
      user: user || null,
      type: 'BRAND_GENERATE',
    });
  } catch (err) {
    console.warn('Activity logging notice:', err.message);
  }
};

/**
 * Get recent system activity history
 */
export const getRecentActivities = async (limit = 10) => {
  return await Activity.find()
    .populate('user', 'fullName email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};
