import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional future member login
    
    memberCode: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: { type: Date },
    address: { type: String },
    emergencyContact: {
      name: String,
      phone: String
    },
    
    profilePhoto: { type: String },
    joinDate: { type: Date, default: Date.now },
    
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'suspended', 'expired'], 
      default: 'active' 
    },
    notes: { type: String },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

// Compound unique index for memberCode within a gym
memberSchema.index({ gymId: 1, memberCode: 1 }, { unique: true });
// Search and filter indexes
memberSchema.index({ gymId: 1, fullName: 1 });
memberSchema.index({ gymId: 1, phone: 1 });
memberSchema.index({ gymId: 1, status: 1 });

export const Member = mongoose.model('Member', memberSchema);
