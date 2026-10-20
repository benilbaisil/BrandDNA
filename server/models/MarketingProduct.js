import mongoose from 'mongoose';

const productNameSuggestionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    reasoning: { type: String, default: '' },
    fitWithBrand: { type: String, default: '' },
  },
  { _id: false }
);

const marketingProductSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    productIdea: {
      type: String,
      required: [true, 'Product idea is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    characteristics: {
      type: String,
      default: '',
    },
    estimatedCost: {
      type: String,
      default: '',
    },
    intendedMarket: {
      type: String,
      default: '',
    },
    productObjective: {
      type: String,
      default: '',
    },
    // Product Identity & Description
    description: {
      shortDescription: { type: String, default: '' },
      detailedDescription: { type: String, default: '' },
      keyFeatures: [{ type: String }],
      benefits: [{ type: String }],
    },
    tagline: {
      type: String,
      default: '',
    },
    USP: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    usps: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
      }
    ],
    // Product Strategy
    pricingSuggestion: {
      suggestedPriceRange: { type: String, default: '' },
      priceINR: { type: String, default: '' },
      priceUSD: { type: String, default: '' },
      pricingStrategy: { type: String, default: '' },
      reasoning: { type: String, default: '' },
      disclaimer: { type: String, default: '' },
    },
    positioning: {
      marketPositioning: { type: String, default: '' },
      targetMarket: { type: String, default: '' },
      customerNeed: { type: String, default: '' },
      competitiveAdvantage: { type: String, default: '' },
      differentiation: { type: String, default: '' },
      positioningStatement: { type: String, default: '' },
    },
    targetCustomer: {
      type: String,
      default: '',
    },
    customerPersona: {
      name: { type: String, default: '' },
      ageRange: { type: String, default: '' },
      occupation: { type: String, default: '' },
      location: { type: String, default: '' },
      incomeLevel: { type: String, default: '' },
      interests: [{ type: String }],
      lifestyle: { type: String, default: '' },
      needs: [{ type: String }],
      painPoints: [{ type: String }],
      buyingBehavior: { type: String, default: '' },
      purchaseMotivation: { type: String, default: '' },
      preferredChannels: [{ type: String }],
      objections: [{ type: String }],
    },
    packaging: {
      type: { type: String, default: '' },
      material: { type: String, default: '' },
      designConcept: { type: String, default: '' },
      labelInfo: { type: String, default: '' },
      sustainability: { type: String, default: '' },
      unboxingConcept: { type: String, default: '' },
    },
    // Marketing Strategies
    marketingIdeas: {
      objective: { type: String, default: '' },
      awarenessStrategy: { type: String, default: '' },
      acquisitionStrategy: { type: String, default: '' },
      launchStrategy: { type: String, default: '' },
      onlineMarketing: [{ type: String }],
      offlineMarketing: [{ type: String }],
      influencerIdeas: [{ type: String }],
      contentIdeas: [{ type: String }],
      promotionalIdeas: [{ type: String }],
    },
    campaigns: [
      {
        name: { type: String, default: '' },
        objective: { type: String, default: '' },
        targetAudience: { type: String, default: '' },
        concept: { type: String, default: '' },
        promotionalMessage: { type: String, default: '' },
        offerIdea: { type: String, default: '' },
        channels: [{ type: String }],
        duration: { type: String, default: '' },
        callToAction: { type: String, default: '' },
      },
    ],
    socialMediaContent: [
      {
        platform: { type: String, default: '' },
        headline: { type: String, default: '' },
        caption: { type: String, default: '' },
        hashtags: [{ type: String }],
        callToAction: { type: String, default: '' },
        visualIdea: { type: String, default: '' },
      },
    ],
    advertisementCopy: [
      {
        headline: { type: String, default: '' },
        primaryText: { type: String, default: '' },
        shortCopy: { type: String, default: '' },
        callToAction: { type: String, default: '' },
        targetAudience: { type: String, default: '' },
        creativeConcept: { type: String, default: '' },
      },
    ],
    seoKeywords: [{ type: String }],
    productNamesSuggestions: [productNameSuggestionSchema],
    uspSuggestions: [{ type: String }],
    // AI Ad Poster Fields
    adPosterData: {
      headline: { type: String, default: '' },
      subheadline: { type: String, default: '' },
      primaryUSP: { type: String, default: '' },
      positioningMessage: { type: String, default: '' },
      pricingText: { type: String, default: '' },
      ctaText: { type: String, default: 'Shop Now' },
      categoryText: { type: String, default: '' },
      brandNameText: { type: String, default: '' },
      themeColors: {
        primary: { type: String, default: '#0F172A' },
        accent: { type: String, default: '#4F46E5' },
        bg: { type: String, default: '#F8FAFC' },
        text: { type: String, default: '#0F172A' }
      },
      layoutStyle: { type: String, default: 'modern_hero' },
      visualConcept: { type: String, default: '' },
      imagePrompt: { type: String, default: '' }
    },
    adPosterPrompt: { type: String, default: '' },
    adPosterStatus: {
      type: String,
      enum: ['Not Generated', 'Generated', 'Saved'],
      default: 'Not Generated',
    },
    adPosterUrl: { type: String, default: '' },
    adPosterCreatedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Archived'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

marketingProductSchema.index({ brand: 1, createdBy: 1 });

export const MarketingProduct =
  mongoose.models.MarketingProduct || mongoose.model('MarketingProduct', marketingProductSchema);
