import mongoose from 'mongoose';
import { generatePublicId } from '../../../shared/publicId.js';
import { ENTITY_PREFIXES } from '../../../shared/idPrefixes.js';

const attendanceSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
      default: () => generatePublicId(ENTITY_PREFIXES.ATT),
    },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },

    date: { type: Date, required: true },
    checkInTime: { type: Date, default: Date.now },
    checkOutTime: { type: Date },

    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present'
    },

    notes: { type: String },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

attendanceSchema.index({ gymId: 1, date: -1, status: 1 });
attendanceSchema.index({ gymId: 1, memberId: 1, date: -1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
