import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const workoutAssignmentSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.WKA),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },

    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },

    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    removedAt: { type: Date },

    startDate: { type: Date },
    endDate: { type: Date },

    status: {
      type: String,
      enum: ['ACTIVE', 'REMOVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

workoutAssignmentSchema.index({ gymId: 1, memberId: 1 });
workoutAssignmentSchema.index({ gymId: 1, workoutId: 1 });
workoutAssignmentSchema.index({ gymId: 1, status: 1 });
workoutAssignmentSchema.index({ gymId: 1, memberId: 1, workoutId: 1, status: 1 });

export const WorkoutAssignment = mongoose.model('WorkoutAssignment', workoutAssignmentSchema);
