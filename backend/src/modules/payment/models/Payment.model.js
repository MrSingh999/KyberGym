import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const paymentSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.PAY),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberSubscription' },
    
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'bankTransfer'], required: true },
    transactionId: { type: String },
    
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'pending', 'refunded', 'failed'], default: 'completed' },
    
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  { timestamps: true }
);

paymentSchema.index({ gymId: 1, paymentDate: -1 });
paymentSchema.index({ gymId: 1, memberId: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
