import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: [true, 'Return reason is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    inspectStatus: {
      type: String,
      enum: ['PendingInspection', 'Restocked', 'Damaged'],
      default: 'PendingInspection',
    },
    refundStatus: {
      type: String,
      enum: ['Pending', 'Processed', 'Denied'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export const Return = mongoose.models.Return || mongoose.model('Return', returnSchema);
