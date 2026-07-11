import mongoose from 'mongoose';

const saasPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    monthlyPrice: { type: Number, required: true },
    yearlyPrice: { type: Number, required: true },
    
    // Limits
    maxMembers: { type: Number, required: true }, // -1 for unlimited
    maxStaff: { type: Number, required: true },
    maxBranches: { type: Number, default: 1 },
    
    trialDays: { type: Number, default: 14 },
    
    // Features toggles specific to this plan
    features: {
      workouts: { type: Boolean, default: false },
      attendance: { type: Boolean, default: false },
      trainers: { type: Boolean, default: false },
      broadcasts: { type: Boolean, default: false },
      whatsappReminder: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      customDomain: { type: Boolean, default: false },
      multiBranch: { type: Boolean, default: false },
    },
    
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

saasPlanSchema.index({ slug: 1 });
saasPlanSchema.index({ active: 1 });

export const SaasPlan = mongoose.model('SaasPlan', saasPlanSchema);
