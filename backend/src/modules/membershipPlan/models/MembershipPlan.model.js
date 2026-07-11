import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    durationInDays: { type: Number, required: true },
    price: { type: Number, required: true },
    
    color: { type: String, default: '#3B82F6' },
    displayOrder: { type: Number, default: 0 },
    
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

membershipPlanSchema.index({ gymId: 1, active: 1, displayOrder: 1 });

export const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
