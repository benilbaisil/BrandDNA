import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    categoryName: {
      type: String,
      default: 'General',
    },
    brand: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    targetStockLevel: {
      type: Number,
      default: 50,
    },
    leadTimeDays: {
      type: Number,
      default: 5,
    },
    images: [{
      type: String,
    }],
    sizes: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Discontinued'],
      default: 'Active',
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
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
        text: { type: String, default: '#0F172A' },
      },
      layoutStyle: { type: String, default: 'modern_hero' },
      cloudImageBase64: { type: String, default: '' },
      cloudImageUrl: { type: String, default: '' },
      imagePrompt: { type: String, default: '' },
      productImageUrl: { type: String, default: '' },
    },
    adPosterStatus: {
      type: String,
      enum: ['Not Generated', 'Generated', 'Saved'],
      default: 'Not Generated',
    },
    adPosterUrl: { type: String, default: '' },
    adPosterCreatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

