import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Active', 'Completed', 'Cancelled'],
      default: 'Draft',
    },
    approvalStatus: {
      type: String,
      enum: ['PendingApproval', 'Approved', 'Rejected'],
      default: 'PendingApproval',
    },
    startDate: Date,
    endDate: Date,
    budget: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
