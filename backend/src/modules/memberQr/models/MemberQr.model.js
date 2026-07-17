import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const memberQrSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.QR),
    },
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
