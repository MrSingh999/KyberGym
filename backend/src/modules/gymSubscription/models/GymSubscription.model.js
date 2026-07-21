import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const gymSubscriptionSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.GSUB),
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
      unique: true,
      index: true,
    },
    plan: { type: String, default: null },
    // planId and planName are reserved for future SubscriptionPlan integration.
    // They are intentionally unused in the current manual-renewal MVP.
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', default: null },
    planName: { type: String, default: null },
    status: {
      type: String,
      enum: ['active', 'trial', 'expired', 'suspended'],
      default: 'trial',
    },
    startDate: { type: Date },
    expiresAt: { type: Date },
    trialEndsAt: { type: Date },
  },
  { timestamps: true }
);

gymSubscriptionSchema.index({ status: 1 });

export const GymSubscription = mongoose.model('GymSubscription', gymSubscriptionSchema);
