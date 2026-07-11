import mongoose from 'mongoose';

const customDomainSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true },
    domain: { type: String, required: true, unique: true }, 
    
    verificationToken: { type: String, required: true }, 
    verificationMethod: { type: String, enum: ['txt', 'cname'], default: 'txt' },
    
    status: { 
      type: String, 
      enum: ['pending', 'verified', 'active', 'failed'], 
      default: 'pending' 
    },
    
    verifiedAt: { type: Date }
  },
  { timestamps: true }
);

export const CustomDomain = mongoose.model('CustomDomain', customDomainSchema);
