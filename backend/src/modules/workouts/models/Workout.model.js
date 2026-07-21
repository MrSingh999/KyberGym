import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const workoutSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.WRK),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    goal: { type: String, trim: true },
    estimatedDuration: { type: Number, min: 1 },
    category: { type: String, trim: true },

    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },

    isDeleted: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

workoutSchema.index({ gymId: 1, isDeleted: 1 });
workoutSchema.index({ gymId: 1, status: 1 });

export const Workout = mongoose.model('Workout', workoutSchema);
