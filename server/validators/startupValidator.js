import { z } from 'zod';

const optionalUrl = z.string().optional().or(z.literal(''));
const optionalStr = z.string().optional().or(z.literal(''));

export const startupProfileSchema = z.object({
  // ── New required fields ──────────────────────────────────────────────────
  businessType: z
    .enum(['Startup', 'Small Business', 'Existing Business', 'Individual / Entrepreneur'])
    .optional()
    .or(z.literal('')),

  industry: z.string().min(1, 'Industry is required'),

  otherIndustry: optionalStr,

  businessStage: z
    .enum(['Idea', 'Pre-launch', 'Launched', 'Growth', ''])
    .optional()
    .or(z.literal('')),

  country: optionalStr,
  region:  optionalStr,

  businessDescription: z.string().min(10, 'Business description must be at least 10 characters').optional().or(z.literal('')),
  problemStatement:    z.string().min(5, 'Problem statement is required').optional().or(z.literal('')),

  // businessGoals as array of strings
  businessGoals: z.array(z.string()).optional().default([]),

  otherGoal: optionalStr,

  website: optionalUrl,

  socialMediaLinks: z
    .object({
      instagram: optionalUrl,
      facebook:  optionalUrl,
      linkedin:  optionalUrl,
      youtube:   optionalUrl,
      other:     optionalUrl,
    })
    .optional(),

  // ── Legacy fields — kept optional for backward compat ────────────────────
  companyName:        optionalStr,
  companyDescription: optionalStr,
  targetAudience:     optionalStr,
  productsServices:   optionalStr,
});
