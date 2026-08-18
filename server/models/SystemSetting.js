import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'platform_settings',
    },
    appName: {
      type: String,
      default: 'BrandDNA AI',
    },
    contactEmail: {
      type: String,
      default: 'admin@branddna.ai',
    },
    aiProvider: {
      type: String,
      default: 'OpenAI GPT-4o Enterprise',
    },
    dailyLimit: {
      type: String,
      default: '10,000 requests',
    },
    jwtExpiration: {
      type: String,
      default: '7 days',
    },
    smtpHost: {
      type: String,
      default: 'smtp.sendgrid.net',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting =
  mongoose.models.SystemSetting ||
  mongoose.model('SystemSetting', systemSettingSchema);
