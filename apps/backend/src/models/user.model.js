const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    passwordHash: {
      type: String
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'clinic', 'admin'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected', 'suspended'],
      required: true,
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ firebaseUid: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
