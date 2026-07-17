import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const membershipPlanSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.PLAN),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    durationInDays: { type: Number, required: true },
    price: { type: Number, required: true },
    joiningFee: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    features: [
      {
        id: { type: String },
        label: { type: String, required: true },
        included: { type: Boolean, default: false },
      },
    ],
    
    color: { type: String, default: '#3B82F6' },
    displayOrder: { type: Number, default: 0 },
    
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

membershipPlanSchema.index({ gymId: 1, active: 1, displayOrder: 1 });

export const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
