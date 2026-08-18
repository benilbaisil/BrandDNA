import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['USER_REGISTER', 'STARTUP_CREATE', 'BRAND_GENERATE', 'MARKETING_GENERATE', 'REPORT_DOWNLOAD'],
      default: 'BRAND_GENERATE',
    },
  },
  {
    timestamps: true,
  }
);

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
