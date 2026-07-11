import mongoose from 'mongoose';

const deliveryLogSchema = new mongoose.Schema(
  {
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
