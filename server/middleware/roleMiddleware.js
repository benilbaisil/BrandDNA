import { sendResponse } from '../utils/apiResponse.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        `User role '${req.user?.role || 'guest'}' is not authorized to access this resource`
      );
    }
    next();
  };
};
