import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String },
    
    muscleGroup: { 
      type: String, 
      enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'cardio', 'fullBody', 'custom'],
      required: true
    },
    equipment: { type: String, default: 'Bodyweight' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    
    instructions: [{ type: String }],
    thumbnail: { type: String }, 
    videoUrl: { type: String },  
    
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

exerciseSchema.index({ gymId: 1, slug: 1 }, { unique: true });
exerciseSchema.index({ gymId: 1, muscleGroup: 1 });
exerciseSchema.index({ gymId: 1, active: 1 });

export const Exercise = mongoose.model('Exercise', exerciseSchema);
