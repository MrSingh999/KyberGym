import mongoose from 'mongoose';

const gymSubscriptionSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SaasPlan', required: true },
    
    status: { 
      type: String, 
      enum: ['trial', 'active', 'expired', 'cancelled', 'suspended'], 
      default: 'trial' 
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Null if lifetime/infinite
    
    trialEndsAt: { type: Date },
    cancelledAt: { type: Date },
    renewsAt: { type: Date }, // When to charge the card next
  },
  { timestamps: true }
);

gymSubscriptionSchema.index({ gymId: 1 });
gymSubscriptionSchema.index({ status: 1, endDate: 1 });

export const GymSubscription = mongoose.model('GymSubscription', gymSubscriptionSchema);
