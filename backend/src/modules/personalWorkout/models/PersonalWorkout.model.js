import mongoose from 'mongoose';

const personalWorkoutSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    
    title: { type: String, required: true },
    description: { type: String },
    
    workoutDays: [{
      dayNumber: { type: Number },
      title: { type: String },
      exercises: [{
        exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
        sets: { type: Number },
        reps: { type: String },
        duration: { type: Number },
        restSeconds: { type: Number },
        notes: { type: String },
        displayOrder: { type: Number }
      }]
    }],
    
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

personalWorkoutSchema.index({ gymId: 1, memberId: 1, active: 1 });

export const PersonalWorkout = mongoose.model('PersonalWorkout', personalWorkoutSchema);
