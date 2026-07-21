import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const memberSubscriptionSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.SUB),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    membershipPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    
    status: { 
      type: String, 
      enum: ['active', 'expired', 'cancelled', 'paused'], 
      default: 'active' 
    },
    
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    lastPaymentDate: { type: Date },
  },
  { timestamps: true }
);

memberSubscriptionSchema.index({ gymId: 1, memberId: 1, status: 1 });
memberSubscriptionSchema.index({ gymId: 1, endDate: 1, status: 1 });

export const MemberSubscription = mongoose.model('MemberSubscription', memberSubscriptionSchema);
