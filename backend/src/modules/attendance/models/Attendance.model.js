import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
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
