import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Assignment Logic
    assignmentType: {
      type: String,
      enum: ['ALL', 'SELECTED'],
      required: true,
      default: 'ALL',
    },

    // Only populated when assignmentType === 'SELECTED'
    assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],

    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Enforce: if ALL, assignedMembers must be empty
workoutSchema.pre('save', function (next) {
  if (this.assignmentType === 'ALL') {
    this.assignedMembers = [];
  }
  next();
});

workoutSchema.index({ gymId: 1 });
workoutSchema.index({ gymId: 1, isActive: 1 });
workoutSchema.index({ assignedMembers: 1 });

export const Workout = mongoose.model('Workout', workoutSchema);
