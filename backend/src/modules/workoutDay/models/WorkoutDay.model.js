import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const exerciseSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    sets:     { type: Number, min: 1 },
    reps:     { type: Number, min: 1 },
    duration: { type: Number, min: 1 }, // seconds
    notes:    { type: String, trim: true },
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

    dayNumber: { type: Number, required: true, min: 1, max: 7 },
    dayName:   { type: String, required: true, trim: true },
    title:     { type: String, trim: true },

    // Exercises are embedded — no separate Exercise collection
    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

workoutDaySchema.index({ workoutId: 1 });
workoutDaySchema.index({ workoutId: 1, dayNumber: 1 }, { unique: true });

export const WorkoutDay = mongoose.model('WorkoutDay', workoutDaySchema);
