import mongoose from 'mongoose';

const marketingProjectSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    productIdea: {
      type: String,
      required: true,
    },
    productCategory: { type: String, default: '' },
    intendedMarket: { type: String, default: '' },
    productCost: { type: String, default: '' },
    specialFeatures: { type: String, default: '' },
    businessObjective: { type: String, default: '' },
    geographicMarket: { type: String, default: '' },

    // Selected Active Items
    selectedProductName: { type: String, default: '' },
    selectedTagline: { type: String, default: '' },
    selectedUSP: { type: String, default: '' },

    // Generated & Saved AI Modules
    brandIdentity: { type: mongoose.Schema.Types.Mixed, default: null },
    productStrategy: { type: mongoose.Schema.Types.Mixed, default: null },
    productDescription: { type: mongoose.Schema.Types.Mixed, default: null },
    customerPersona: { type: mongoose.Schema.Types.Mixed, default: null },
    marketingIdeas: { type: mongoose.Schema.Types.Mixed, default: null },
    campaigns: { type: mongoose.Schema.Types.Mixed, default: null },
    socialMediaContent: { type: mongoose.Schema.Types.Mixed, default: null },
    advertisementCopy: { type: mongoose.Schema.Types.Mixed, default: null },

    status: {
      type: String,
      enum: ['Draft', 'In Progress', 'Completed'],
      default: 'In Progress',
    },
  },
  {
    timestamps: true,
  }
);

export const MarketingProject = mongoose.model('MarketingProject', marketingProjectSchema);
