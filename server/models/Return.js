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
    productName: {
      type: String,
      default: '',
    },
    productImage: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      required: [true, 'Return reason is required'],
    },
    description: {
      type: String,
      default: '',
    },
    evidenceImage: {
      type: String,
      default: '',
    },
    assignedDeliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    receivedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'RETURN_REQUESTED',
        'UNDER_REVIEW',
        'APPROVED',
        'PICKUP_ASSIGNED',
        'OUT_FOR_PICKUP',
        'PICKED_UP',
        'RETURN_RECEIVED',
        'INSPECTED',
        'REJECTED',
        'Pending',
        'Approved',
        'Rejected',
      ],
      default: 'RETURN_REQUESTED',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    inspectStatus: {
      type: String,
      enum: [
        'PendingInspection',
        'Resellable',
        'Damaged',
        'Inspection Required',
        'Restocked',
        'Pending',
      ],
      default: 'PendingInspection',
    },
    inspectionNotes: {
      type: String,
      default: '',
    },
    inspectedAt: {
      type: Date,
      default: null,
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isStockAdjusted: {
      type: Boolean,
      default: false,
    },
    refundStatus: {
      type: String,
      enum: ['Pending', 'Processed', 'Denied', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    refundDetails: {
      razorpayRefundId: { type: String, default: null },
      amount: { type: Number, default: 0 },
      status: { type: String, default: null },
      refundedAt: { type: Date, default: null },
      error: { type: String, default: null },
      notes: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    returnDeadline: {
      type: Date,
      default: null,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

returnSchema.index({ assignedDeliveryAgent: 1, status: 1 });
returnSchema.index({ customer: 1, createdAt: -1 });
returnSchema.index({ order: 1 });

export const Return = mongoose.models.Return || mongoose.model('Return', returnSchema);

