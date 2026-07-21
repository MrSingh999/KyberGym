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

const memberWorkoutPlanDaySchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.MWD),
    },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberWorkoutPlan', required: true },

    orderIndex: { type: Number, required: true, min: 0 },
    dayName:   { type: String, required: true, trim: true },
    title:     { type: String, trim: true },

    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

memberWorkoutPlanDaySchema.index({ planId: 1 });
memberWorkoutPlanDaySchema.index({ planId: 1, orderIndex: 1 }, { unique: true });

export const MemberWorkoutPlanDay = mongoose.model('MemberWorkoutPlanDay', memberWorkoutPlanDaySchema);
