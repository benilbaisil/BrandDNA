import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Report name is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    title: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: 'Business Services',
    },
    ownerName: {
      type: String,
      default: 'Startup Owner',
    },
    ownerEmail: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '/uploads/reports/sample.pdf',
    },
    summary: {
      type: String,
      default: '',
    },
    brandIdentity: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    productStrategy: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    personas: {
      type: Array,
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
