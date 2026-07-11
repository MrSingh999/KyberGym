import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema(
  {
    // Identity
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },

    // Domains
    subdomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    customDomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },

    // Ownership
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Subscription
    subscription: {
      status: { type: String, enum: ['trialing', 'active', 'past_due', 'canceled'], default: 'trialing' },
      trialEndsAt: { type: Date },
      planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }, // For future subscription module
    },

    // Feature Flags (Boolean toggles)
    features: {
      workouts: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      trainers: { type: Boolean, default: true },
      broadcasts: { type: Boolean, default: false },
      whatsappReminder: { type: Boolean, default: false },
      reports: { type: Boolean, default: true },
      customDomain: { type: Boolean, default: false },
    },

    // Branding & Localization
    branding: {
      primaryColor: { type: String, default: '#000000' },
      secondaryColor: { type: String, default: '#ffffff' },
    },
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },

    // Soft Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for fast tenant resolution and lookups
gymSchema.index({ slug: 1 });
gymSchema.index({ subdomain: 1 });
gymSchema.index({ customDomain: 1 });
gymSchema.index({ ownerId: 1 });

export const Gym = mongoose.model('Gym', gymSchema);
