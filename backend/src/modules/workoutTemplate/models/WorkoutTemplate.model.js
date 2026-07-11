import mongoose from 'mongoose';

const workoutTemplateSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true },
    description: { type: String },
    goal: { type: String }, 
    
    durationWeeks: { type: Number, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

workoutTemplateSchema.index({ gymId: 1, active: 1 });

export const WorkoutTemplate = mongoose.model('WorkoutTemplate', workoutTemplateSchema);
