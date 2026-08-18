import mongoose from 'mongoose';

const brandIdentitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    brandName: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      default: '',
    },
    nameSuggestions: [
      {
        name: { type: String, required: true },
        rationale: { type: String, required: true },
      },
    ],
    targetAudienceAnalysis: {
      demographics: { type: String, default: '' },
      psychographics: { type: String, default: '' },
      primaryPainPoints: { type: String, default: '' },
      channels: { type: String, default: '' },
    },
    strategicGoals: [
      {
        title: { type: String, required: true },
        timeframe: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    swotAnalysis: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }],
    },
    missionStatement: {
      type: String,
      default: '',
    },
    visionStatement: {
      type: String,
      default: '',
    },
    brandStory: {
      type: String,
      default: '',
    },
    brandPersonality: {
      type: String,
      default: '',
    },
    // Source Flags
    brandNameSource: { type: String, enum: ['ai', 'manual', ''], default: '' },
    taglineSource: { type: String, enum: ['ai', 'manual', ''], default: '' },
    missionSource: { type: String, enum: ['ai', 'manual', ''], default: '' },
    visionSource: { type: String, enum: ['ai', 'manual', ''], default: '' },
    brandStorySource: { type: String, enum: ['ai', 'manual', ''], default: '' },
    brandPersonalitySource: { type: String, enum: ['ai', 'manual', ''], default: '' },
    // Persisted Section Suggestions & AI Explanations
    brandNameSuggestions: [
      {
        name: { type: String },
        rationale: { type: String },
      },
    ],
    taglineSuggestions: [{ type: String }],
    missionSuggestions: [{ type: String }],
    visionSuggestions: [{ type: String }],
    brandStorySuggestions: [
      {
        title: { type: String },
        content: { type: String },
      },
    ],
    brandPersonalitySuggestions: [{ type: String }],
    brandPersonalityExplanation: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const BrandIdentity = mongoose.models.BrandIdentity || mongoose.model('BrandIdentity', brandIdentitySchema);
