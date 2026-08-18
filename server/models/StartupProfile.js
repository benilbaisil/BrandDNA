import mongoose from 'mongoose';

const startupProfileSchema = new mongoose.Schema(
  {
    // ── New minimal raw-input fields ──────────────────────────────────────────

    businessType: {
      type: String,
      enum: ['Startup', 'Small Business', 'Existing Business', 'Individual / Entrepreneur'],
      default: '',
    },

    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },

    otherIndustry: {
      type: String,
      default: '',
      trim: true,
    },

    businessStage: {
      type: String,
      enum: ['Idea', 'Pre-launch', 'Launched', 'Growth', ''],
      default: '',
    },

    country: {
      type: String,
      default: '',
      trim: true,
    },

    region: {
      type: String,
      default: '',
      trim: true,
    },

    businessDescription: {
      type: String,
      default: '',
    },

    problemStatement: {
      type: String,
      default: '',
    },

    // Array of selected goal strings e.g. ['Launch a new business', 'Build brand awareness']
    businessGoals: {
      type: [String],
      default: [],
    },

    otherGoal: {
      type: String,
      default: '',
    },

    website: {
      type: String,
      default: '',
    },

    socialMediaLinks: {
      instagram: { type: String, default: '' },
      facebook:  { type: String, default: '' },
      linkedin:  { type: String, default: '' },
      youtube:   { type: String, default: '' },
      other:     { type: String, default: '' },
    },

    // ── Legacy fields kept optional for backward compat ───────────────────────

    companyName: {
      type: String,
      default: '',
      trim: true,
    },

    companyDescription: {
      type: String,
      default: '',
    },

    targetAudience: {
      type: String,
      default: '',
    },

    productsServices: {
      type: String,
      default: '',
    },

    // ── Ownership ─────────────────────────────────────────────────────────────

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StartupProfile =
  mongoose.models.StartupProfile ||
  mongoose.model('StartupProfile', startupProfileSchema);
