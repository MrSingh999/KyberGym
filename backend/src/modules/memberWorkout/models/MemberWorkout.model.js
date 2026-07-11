import mongoose from 'mongoose';

const memberWorkoutSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    workoutTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTemplate', required: true },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date }, 
    
    status: { type: String, enum: ['active', 'completed', 'paused', 'cancelled'], default: 'active' },
    
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  { timestamps: true }
);

memberWorkoutSchema.index({ gymId: 1, memberId: 1, status: 1 });

export const MemberWorkout = mongoose.model('MemberWorkout', memberWorkoutSchema);
