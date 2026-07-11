import mongoose from 'mongoose';

const messageTemplateSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true },
    
    type: { 
      type: String, 
      enum: ['paymentDue', 'paymentReceived', 'membershipExpired', 'workoutAssigned', 'custom'],
      required: true
    },
    channel: { type: String, enum: ['whatsapp', 'email', 'inApp'], required: true },
    
    subject: { type: String }, 
    content: { type: String, required: true }, 
    variables: [{ type: String }], 
    
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

messageTemplateSchema.index({ gymId: 1, type: 1, channel: 1 });

export const MessageTemplate = mongoose.model('MessageTemplate', messageTemplateSchema);
