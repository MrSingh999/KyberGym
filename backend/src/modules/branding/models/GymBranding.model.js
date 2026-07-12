import mongoose from 'mongoose';

const gymBrandingSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true },
    
    logoUrl: { type: String }, 
    faviconUrl: { type: String },
    primaryColor: { type: String, default: '#4F46E5' }, 
    secondaryColor: { type: String, default: '#10B981' }, 
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    
    supportEmail: { type: String },
    timezone: { type: String, default: 'UTC' }, 
    currency: { type: String, default: 'INR' }, 
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'dd/MM/yyyy' }
  },
  { timestamps: true }
);

export const GymBranding = mongoose.model('GymBranding', gymBrandingSchema);
