import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const gymSubscriptionPaymentSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.GPAY),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    subscriptionId: { type: String, required: true },

    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'bank_transfer'], required: true },
    paymentReference: { type: String },

    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'refunded'], default: 'completed' },

    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },
    notes: { type: String },

    refundedAt: { type: Date },
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },

    // paymentProvider stores the payment source. Currently only 'manual' is used.
    // 'razorpay' and 'stripe' are reserved for future online payment integration.
    paymentProvider: {
      type: String,
      enum: ['manual', 'razorpay', 'stripe'],
    },
    externalTransactionId: { type: String },

    gateway: { type: String },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },
  },
  { timestamps: true }
);

gymSubscriptionPaymentSchema.index({ gymId: 1, paymentDate: -1 });
gymSubscriptionPaymentSchema.index({ status: 1 });
gymSubscriptionPaymentSchema.index({ subscriptionId: 1 });

export const GymSubscriptionPayment = mongoose.model('GymSubscriptionPayment', gymSubscriptionPaymentSchema);
