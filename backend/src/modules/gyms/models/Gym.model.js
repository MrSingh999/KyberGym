import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    coverImage: { type: String, default: '' },
    subdomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    features: {
      members:       { type: Boolean, default: true },
      workouts:      { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
      attendance:    { type: Boolean, default: false },
      branding:      { type: Boolean, default: false },
    },

    branding: {
      appName:       { type: String, trim: true },
      logo:          { type: String, default: '' },
      favicon:       { type: String, default: '' },
      primaryColor:  { type: String, default: '#000000' },
      secondaryColor:{ type: String, default: '#ffffff' },
      loginBanner:   { type: String, default: '' },
    },

    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },

    isActive:  { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

gymSchema.index({ ownerId: 1 });
gymSchema.index({ slug: 1 });

export const Gym = mongoose.model('Gym', gymSchema);
