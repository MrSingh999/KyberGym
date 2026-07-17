import mongoose from 'mongoose';
import { ROLES } from '../../../shared/constants.js';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const userSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.USR),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    role: { 
      type: String, 
      enum: Object.values(ROLES), 
      default: ROLES.MEMBER,
      required: true 
    },
    
    // Identity
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    
    // Verification & Status
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    lastLogin: { type: Date },

    // Authentication Security
    tokenVersion: { type: Number, default: 0 },
    passwordChangedAt: { type: Date },
    
    // OTPs (Stored as bcrypt hashes)
    passwordResetOTP: { type: String },
    passwordResetExpires: { type: Date },
    
    emailVerificationOTP: { type: String },
    emailVerificationExpires: { type: Date },

    // Soft Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for tenant-aware queries and uniqueness
userSchema.index({ gymId: 1, email: 1 }, { unique: true }); // A user can only exist once per gym
userSchema.index({ gymId: 1, role: 1 });
userSchema.index({ gymId: 1, status: 1 });

export const User = mongoose.model('User', userSchema);
