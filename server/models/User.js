import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function() { return !this.googleId; },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'inventory_staff', 'marketing_staff', 'customer', 'startup_owner', 'delivery_agent', 'DELIVERY_AGENT'],
      default: 'customer',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    vehicleType: {
      type: String,
      default: '',
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Unavailable'],
      default: 'Available',
    },
    status: {
      type: String,
      enum: ['Active', 'Disabled'],
      default: 'Active',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password prior to saving if password is provided and modified
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
