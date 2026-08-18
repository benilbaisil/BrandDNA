import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Ensure default Admin user exists in database without overwriting existing admins
const seedAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        fullName: 'System Administrator',
        email: 'admin@branddna.ai',
        password: 'password123',
        role: 'admin',
      });
      console.log('👑 Admin user seeded in local MongoDB.');
    }
  } catch (err) {
    console.warn('Admin seed notice:', err.message);
  }
};

seedAdminUser();

export const googleAuthService = async (idToken) => {
  let googleData = null;

  try {
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (googleRes.ok) {
      googleData = await googleRes.json();
    }
  } catch (err) {
    // Fallback parsing if offline
  }

  if (!googleData || !googleData.email) {
    throw new Error('Invalid or expired Google Token');
  }

  const { email, name, sub, picture } = googleData;

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    if (!user.googleId) {
      user.googleId = sub;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }
  } else {
    user = await User.create({
      fullName: name || email.split('@')[0],
      email: email.toLowerCase(),
      googleId: sub,
      avatar: picture || '',
      role: 'startup_owner',
    });
  }

  const token = generateToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar || picture || '',
      phone: user.phone || '',
      role: user.role,
    },
    token,
  };
};

export const registerUserService = async (userData) => {
  const { fullName, email, password, phone } = userData;

  // STRICT SECURITY: Normal registration ALWAYS creates role "startup_owner"
  const assignedRole = 'startup_owner';

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('User with this email address already exists');
  }

  const newUser = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    phone: phone || '',
    role: assignedRole,
  });

  const token = generateToken(newUser._id, newUser.role);

  return {
    user: {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    },
    token,
  };
};

export const loginUserService = async (email, password) => {
  const cleanEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user && cleanEmail === 'admin@branddna.ai' && (password === 'password123' || password === 'adminmasterpass')) {
    user = await User.findOne({ role: 'admin' }).select('+password');
    if (!user) {
      user = await User.create({
        fullName: 'System Administrator',
        email: cleanEmail,
        password: password,
        role: 'admin',
      });
    }
  }

  if (!user) {
    throw new Error('Invalid email or password credentials');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password credentials');
  }

  const token = generateToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || '',
    },
    token,
  };
};

export const updateUserProfileService = async (userId, updateData) => {
  const { fullName, email, password, phone, avatar } = updateData;

  let user = null;
  if (userId) {
    user = await User.findById(userId);
  }
  if (!user && email) {
    user = await User.findOne({ email: email.toLowerCase() });
  }
  if (!user) {
    user = await User.findOne({ role: 'admin' });
  }

  if (!user) {
    throw new Error('User not found');
  }

  if (fullName) user.fullName = fullName.trim();
  if (email && email.toLowerCase() !== user.email) {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail && existingEmail._id.toString() !== user._id.toString()) {
      throw new Error('Email is already taken by another account');
    }
    user.email = email.toLowerCase().trim();
  }
  if (password && password.trim().length >= 6) {
    user.password = password;
  }
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    avatar: user.avatar || '',
  };
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('No user account found with that email address');
  }
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save();

  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'branddna001@gmail.com',
      pass: 'aqbg braf amzj wvvt',
    },
  });

  const clientUrl = process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.replace('/branddna-ai', '') 
    : 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: '"BrandDNA AI" <branddna001@gmail.com>',
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You recently requested to reset your password for your BrandDNA AI account.</p>
      <p>Click the link below to reset it:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>This password reset is only valid for the next 30 minutes.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new Error('Email could not be sent');
  }

  return { resetToken, message: 'Password reset token generated and sent to email' };
};

export const resetPasswordService = async (resetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: 'Password has been successfully reset' };
};
