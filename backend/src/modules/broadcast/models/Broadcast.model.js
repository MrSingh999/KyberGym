import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    title: { type: String, required: true },
    channel: { type: String, enum: ['whatsapp', 'email', 'inApp'], required: true },
    
    messageTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessageTemplate' }, 
    message: { type: String }, 
    
    recipientCriteria: {
      target: { 
        type: String, 
        enum: ['all', 'active', 'expired', 'dueToday', 'dueIn3Days', 'dueIn7Days', 'selected'] 
      },
      selectedMemberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }]
    },
    
    status: { 
      type: String, 
      enum: ['draft', 'scheduled', 'processing', 'completed', 'cancelled', 'failed'], 
      default: 'draft' 
    },
    
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

broadcastSchema.index({ gymId: 1, status: 1, scheduledAt: 1 });

export const Broadcast = mongoose.model('Broadcast', broadcastSchema);
