import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  // Check Bearer token in headers or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendResponse(res, 401, false, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_key_branddna_2026'
    );

    // Try finding user in DB or provide request identity
    if (User.db && User.db.readyState === 1) {
      req.user = await User.findById(decoded.id).select('-password');
    }

    if (!req.user) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || 'startup_owner',
      };
    }

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed or expired');
  }
};
