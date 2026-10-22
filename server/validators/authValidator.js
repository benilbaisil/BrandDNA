import { z } from 'zod';
import emailValidator from 'deep-email-validator';
import { isValidPhoneNumber } from 'libphonenumber-js';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Full name must be at most 60 characters')
    .regex(
      /^[a-zA-Z\s]+$/,
      'Full name can only contain letters and spaces'
    ),
  email: z.string().email('Please enter a valid email address').refine(async (email) => {
    try {
      const res = await emailValidator({
        email: email,
        validateRegex: true,
        validateMx: true,
        validateTypo: true,
        validateDisposable: true,
        validateSMTP: false, // Turn off SMTP checking to prevent blocking valid emails like Gmail
      });
      return res.valid;
    } catch (e) {
      return true; // Fallback to true if network error occurs during validation
    }
  }, 'Please enter a valid, active email address (domain must exist)'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          return isValidPhoneNumber(val, 'IN') || isValidPhoneNumber(val);
        } catch (e) {
          return false;
        }
      },
      'Please enter a valid phone number (e.g. 9876543210 or +91...)'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.string().optional().default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});
