import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const exerciseSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    sets:     { type: Number, min: 1 },
    reps:     { type: Number, min: 1 },
    duration: { type: Number, min: 1 },
    restTime: { type: Number, min: 1 },
    notes:    { type: String, trim: true },
    order:    { type: Number, default: 0 },
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', default: null },
    image:    { type: String, trim: true },
    videoUrl: { type: String, trim: true },
  },
  { _id: false }
);

const workoutDaySchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.WD),
    },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },

    orderIndex: { type: Number, required: true, min: 0 },
    dayName:   { type: String, required: true, trim: true },
    title:     { type: String, trim: true },

    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

workoutDaySchema.index({ workoutId: 1 });
workoutDaySchema.index({ workoutId: 1, orderIndex: 1 }, { unique: true });

export { exerciseSchema };
export const WorkoutDay = mongoose.model('WorkoutDay', workoutDaySchema);
