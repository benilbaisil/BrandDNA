import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      default: 'BrandDNA Enterprise',
    },
    email: {
      type: String,
      trim: true,
      default: 'contact@branddna.com',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    address: {
      street: { type: String, default: '100 Business Tech Park' },
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      zipCode: { type: String, default: '560001' },
      country: { type: String, default: 'India' },
    },
    currency: {
      type: String,
      default: 'INR',
    },
    taxRatePercentage: {
      type: Number,
      default: 18,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
