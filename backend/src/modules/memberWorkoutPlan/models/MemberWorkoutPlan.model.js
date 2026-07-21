import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const memberWorkoutPlanSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.MWP),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainerProfile', required: true },
    sourceWorkoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', default: null },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    goal: { type: String, trim: true },
    estimatedDuration: { type: Number, min: 1 },
    category: { type: String, trim: true },

    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);

memberWorkoutPlanSchema.index({ gymId: 1, memberId: 1 });
memberWorkoutPlanSchema.index({ gymId: 1, trainerId: 1 });
memberWorkoutPlanSchema.index({ gymId: 1, status: 1 });

export const MemberWorkoutPlan = mongoose.model('MemberWorkoutPlan', memberWorkoutPlanSchema);
