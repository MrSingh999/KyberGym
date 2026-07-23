import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const trainerMemberSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.ASN),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainerProfile', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },

    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },

    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    removedAt: { type: Date },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

trainerMemberSchema.index({ gymId: 1, trainerId: 1, memberId: 1, status: 1 });
trainerMemberSchema.index({ gymId: 1, trainerId: 1, status: 1 });
trainerMemberSchema.index({ gymId: 1, memberId: 1, status: 1 });

export const TrainerMemberAssignment = mongoose.model('TrainerMemberAssignment', trainerMemberSchema);
