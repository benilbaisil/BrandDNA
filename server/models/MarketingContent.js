import mongoose from 'mongoose';

const marketingContentSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ['ProductName', 'ProductDescription', 'USP', 'Tagline', 'CustomerPersona', 'MarketingIdea', 'CampaignCopy', 'SocialMediaPost', 'AdCopy', 'PromotionSuggestion'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    contentData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Published'],
      default: 'Draft',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const MarketingContent = mongoose.models.MarketingContent || mongoose.model('MarketingContent', marketingContentSchema);
