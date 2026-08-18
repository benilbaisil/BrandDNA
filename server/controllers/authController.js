import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator.js';
import {
  registerUserService,
  loginUserService,
  googleAuthService,
  updateUserProfileService,
  forgotPasswordService,
  resetPasswordService,
} from '../services/authService.js';
import { sendResponse } from '../utils/apiResponse.js';

export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return sendResponse(res, 400, false, 'Google ID Token is required');
    }

    const { user, token } = await googleAuthService(idToken);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 200, true, 'Google authentication successful', {
      user,
      token,
    });
  } catch (error) {
    return sendResponse(res, 400, false, error.message || 'Google authentication failed');
  }
};

export const register = async (req, res, next) => {
  try {
    const parseResult = await registerSchema.safeParseAsync(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('. ');
      return sendResponse(res, 400, false, errorMsg, parseResult.error.errors);
    }

    const { user, token } = await registerUserService(parseResult.data);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 201, true, 'Account created successfully', {
      user,
      token,
    });
  } catch (error) {
    let message = error.message || 'Registration failed';
    if (error.code === 11000 || message.includes('E11000') || message.includes('already exists')) {
      message = 'An account with this email address already exists. Please sign in instead.';
    }
    return sendResponse(res, 400, false, message);
  }
};

export const login = async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('. ');
      return sendResponse(res, 400, false, errorMsg, parseResult.error.errors);
    }

    const { email, password } = parseResult.data;
    const { user, token } = await loginUserService(email, password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 200, true, 'Logged in successfully', {
      user,
      token,
    });
  } catch (error) {
    return sendResponse(res, 401, false, error.message || 'Login failed');
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const updatedUser = await updateUserProfileService(userId, req.body);
    return sendResponse(res, 200, true, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    return sendResponse(res, 400, false, error.message || 'Failed to update profile');
  }
};

export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return sendResponse(res, 200, true, 'Logged out successfully');
};

export const getMe = async (req, res) => {
  return sendResponse(res, 200, true, 'User profile retrieved', {
    user: req.user,
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('. ');
      return sendResponse(res, 400, false, errorMsg, parseResult.error.errors);
    }

    const result = await forgotPasswordService(parseResult.data.email);
    return sendResponse(res, 200, true, result.message, { resetToken: result.resetToken });
  } catch (error) {
    return sendResponse(res, 400, false, error.message || 'Failed to process forgot password');
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('. ');
      return sendResponse(res, 400, false, errorMsg, parseResult.error.errors);
    }

    const result = await resetPasswordService(req.params.resetToken, parseResult.data.password);
    return sendResponse(res, 200, true, result.message);
  } catch (error) {
    return sendResponse(res, 400, false, error.message || 'Failed to reset password');
  }
};
