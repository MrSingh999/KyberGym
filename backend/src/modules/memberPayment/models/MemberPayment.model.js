import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const memberPaymentSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.MPAY),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberSubscription' },

    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'bank_transfer'], required: true },
    transactionId: { type: String },

    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['paid', 'completed', 'pending', 'refunded', 'failed'], default: 'paid' },

    paymentFor: {
      planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
      planName: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
    },

    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

memberPaymentSchema.index({ gymId: 1, paymentDate: -1 });
memberPaymentSchema.index({ gymId: 1, memberId: 1 });

export const MemberPayment = mongoose.model('MemberPayment', memberPaymentSchema, 'memberpayments');
