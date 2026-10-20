import mongoose from 'mongoose';

const deliveryTrackingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      required: true,
    },
    statusText: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedByName: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const DeliveryTracking =
  mongoose.models.DeliveryTracking || mongoose.model('DeliveryTracking', deliveryTrackingSchema);
