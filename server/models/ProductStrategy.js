import mongoose from 'mongoose';

const productStrategySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Selected / Active Product Strategy State
    productName: { type: String, default: '' },
    productTagline: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    detailedDescription: { type: String, default: '' },
    targetAudience: { type: String, default: '' },

    // USPs
    usps: [
      {
        title: { type: String },
        description: { type: String },
        impact: { type: String, default: 'High' }, // e.g. "Game Changer", "High", "Strategic"
        category: { type: String, default: 'Differentiation' }, // e.g. "Technology", "Usability", "Cost"
      },
    ],

    // Product Positioning
    positioningStatement: { type: String, default: '' },
    targetSegment: { type: String, default: '' },
    keyBenefit: { type: String, default: '' },
    competitiveMoat: { type: String, default: '' },
    perceptualAngle: { type: String, default: '' },
    valuePillars: [{ type: String }],

    // Saved AI Suggestions for each step of the prompt chain
    productNameSuggestions: [
      {
        name: { type: String },
        tagline: { type: String },
        rationale: { type: String },
        brandAlignmentScore: { type: Number, default: 95 },
      },
    ],
    descriptionSuggestions: [
      {
        shortPitch: { type: String },
        fullDescription: { type: String },
        keyFeatures: [{ type: String }],
        valueNarrative: { type: String },
      },
    ],
    uspSuggestions: [
      {
        title: { type: String },
        description: { type: String },
        category: { type: String },
        impact: { type: String },
      },
    ],
    positioningSuggestions: [
      {
        statement: { type: String },
        targetSegment: { type: String },
        keyBenefit: { type: String },
        competitiveMoat: { type: String },
        perceptualAngle: { type: String },
        valuePillars: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ProductStrategy =
  mongoose.models.ProductStrategy || mongoose.model('ProductStrategy', productStrategySchema);
