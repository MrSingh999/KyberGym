import mongoose from 'mongoose';

const memberQrSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, unique: true },
    
    qrCodeData: { type: String, required: true }, 
    base64Image: { type: String }, 
    
    active: { type: Boolean, default: true },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

memberQrSchema.index({ gymId: 1 });

export const MemberQr = mongoose.model('MemberQr', memberQrSchema);
