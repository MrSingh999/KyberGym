import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    
    type: { 
      type: String, 
      enum: ['paymentDue', 'paymentReceived', 'membershipExpired', 'workoutAssigned', 'broadcast', 'system'] 
    },
    
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed }, 
    
    read: { type: Boolean, default: false },
    readAt: { type: Date }
  },
  { timestamps: true }
);

notificationSchema.index({ gymId: 1, userId: 1, read: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
