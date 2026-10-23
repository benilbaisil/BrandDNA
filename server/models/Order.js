import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: { type: String, required: true },
  productImage: { type: String },
  size: { type: String, default: '', trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay'],
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'Placed', 'Confirmed', 'Packed', 'Shipped', 'Ready for Pickup', 'Assigned to Agent',
        'ACCEPTED', 'Picked Up', 'Out for Delivery', 'Delivered', 'Delivery Failed', 'Cancelled',
        'ORDER_PLACED', 'ORDER_CONFIRMED', 'PACKED', 'READY_FOR_PICKUP', 'ASSIGNED_TO_AGENT',
        'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERY_FAILED'
      ],
      default: 'Placed',
    },
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    outForDeliveryAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    deliveryFailureReason: {
      type: String,
      default: null,
    },
    deliveryFailureNote: {
      type: String,
      default: null,
    },
    deliveryOtp: {
      type: String,
      select: false,
      default: null,
    },
    deliveryOtpExpiresAt: {
      type: Date,
      default: null,
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    shipmentProvider: {
      type: String,
      default: null,
    },
    shipmentStatus: {
      type: String,
      default: null,
    },
    shipmentStatusText: {
      type: String,
      default: null,
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    shipmentCreatedAt: {
      type: Date,
      default: null,
    },
    shipmentLastSyncedAt: {
      type: Date,
      default: null,
    },
    shipmentEvents: [
      {
        status: { type: String },
        statusText: { type: String },
        description: { type: String },
        location: { type: String },
        timestamp: { type: Date },
        updatedBy: { type: String },
      },
    ],
    shipmentSyncStatus: {
      type: String,
      enum: ['NONE', 'SYNCED', 'PENDING', 'FAILED'],
      default: 'NONE',
    },
    shipmentSyncError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ deliveryAgent: 1, status: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
