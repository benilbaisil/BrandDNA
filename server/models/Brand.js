import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    hex: { type: String, default: '' },
    usage: { type: String, default: '' },
  },
  { _id: false }
);

const nameSuggestionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const taglineSuggestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const brandSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    brandName: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      default: '',
    },
    businessDescription: {
      type: String,
      default: '',
    },
    targetMarket: {
      type: String,
      default: '',
    },
    businessGoals: {
      type: String,
      default: '',
    },
    preferredStyleTone: {
      type: String,
      default: '',
    },
    brandIdea: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      default: '',
    },
    mission: {
      type: String,
      default: '',
    },
    vision: {
      type: String,
      default: '',
    },
    brandStory: {
      type: String,
      default: '',
    },
    brandPersonality: {
      type: [String],
      default: [],
    },
    brandTone: {
      type: [String],
      default: [],
    },
    colorPalette: {
      type: [colorSchema],
      default: [],
    },
    logoConcept: {
      type: String,
      default: '',
    },
    brandPositioning: {
      type: String,
      default: '',
    },
    brandUSP: {
      type: String,
      default: '',
    },
    nameSuggestions: {
      type: [nameSuggestionSchema],
      default: [],
    },
    taglineSuggestions: {
      type: [taglineSuggestionSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Archived'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

brandSchema.index({ createdBy: 1, brandName: 1 });

export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
