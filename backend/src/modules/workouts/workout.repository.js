import mongoose from 'mongoose';
import { Workout } from './models/Workout.model.js';

export class WorkoutRepository {
  static async create(data) {
    return Workout.create(data);
  }

  static async findAll(gymId, { isActive } = {}) {
    const filter = { gymId };
    if (isActive !== undefined) filter.isActive = isActive;
    return Workout.find(filter).sort({ createdAt: -1 });
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Workout.findOne(query);
  }

  static async update(id, gymId, data) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Workout.findOneAndUpdate(
      query,
      data,
      { new: true, runValidators: true }
    );
  }

  static async deactivate(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Workout.findOneAndUpdate(
      query,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Find workouts accessible to a specific member.
   * Returns ALL-type workouts + SELECTED workouts where memberId is included.
   */
  static async findForMember(gymId, memberId) {
    return Workout.find({
      gymId,
      isActive: true,
      $or: [
        { assignmentType: 'ALL' },
        { assignmentType: 'SELECTED', assignedMembers: memberId },
      ],
    }).sort({ createdAt: -1 });
  }
}
