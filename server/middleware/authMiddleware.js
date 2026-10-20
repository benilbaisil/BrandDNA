import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

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
      process.env.JWT_SECRET || 'branddna_ai_super_secret_jwt_key_2024_xK9mP3qR7vL2nW8tY5uJ1cE6'
    );

    if (User.db && User.db.readyState === 1) {
      req.user = await User.findById(decoded.id).select('-password');
    }

    if (!req.user) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || 'customer',
      };
    }

    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed or expired');
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendResponse(res, 403, false, 'User role is not defined');
    }
    
    // Normalize role comparison
    const userRole = req.user.role;
    const allowed = roles.some((role) => {
      if (role === userRole) return true;
      // Allow admin everywhere
      if (userRole === 'admin') return true;
      // Map startup_owner to marketing_staff/customer if needed for backward compatibility
      if (userRole === 'startup_owner' && (role === 'marketing_staff' || role === 'customer')) return true;
      return false;
    });

    if (!allowed) {
      return sendResponse(
        res,
        403,
        false,
        `User role '${userRole}' is not authorized to access this route`
      );
    }
    next();
  };
};

export const optionalProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'branddna_ai_super_secret_jwt_key_2024_xK9mP3qR7vL2nW8tY5uJ1cE6'
    );
    if (User.db && User.db.readyState === 1) {
      req.user = await User.findById(decoded.id).select('-password');
    }
    if (!req.user) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || 'customer',
      };
    }
  } catch (error) {
    // Ignore invalid/expired token for optionalProtect
  }
  next();
};

