import mongoose from 'mongoose';

const workoutDaySchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    workoutTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTemplate', required: true },
    
    dayNumber: { type: Number, required: true }, 
    title: { type: String, required: true }, 
    
    exercises: [{
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
      sets: { type: Number },
      reps: { type: String }, 
      duration: { type: Number }, 
      restSeconds: { type: Number, default: 60 },
      notes: { type: String },
      displayOrder: { type: Number, required: true }
    }]
  },
  { timestamps: true }
);

workoutDaySchema.index({ gymId: 1, workoutTemplateId: 1, dayNumber: 1 }, { unique: true });

export const WorkoutDay = mongoose.model('WorkoutDay', workoutDaySchema);
