import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const deliveryLogSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.LOG),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    broadcastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Broadcast' }, 
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    
    channel: { type: String, enum: ['whatsapp', 'email', 'inApp'], required: true },
    
    status: { 
      type: String, 
      enum: ['queued', 'sent', 'delivered', 'read', 'failed'], 
      default: 'queued' 
    },
    
    providerMessageId: { type: String }, 
    errorMessage: { type: String },
    
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    retryCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

deliveryLogSchema.index({ gymId: 1, broadcastId: 1 });
deliveryLogSchema.index({ providerMessageId: 1 }, { sparse: true });

export const DeliveryLog = mongoose.model('DeliveryLog', deliveryLogSchema);
