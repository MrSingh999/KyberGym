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
    return Workout.findOne({ _id: id, gymId });
  }

  static async update(id, gymId, data) {
    return Workout.findOneAndUpdate(
      { _id: id, gymId },
      data,
      { new: true, runValidators: true }
    );
  }

  static async deactivate(id, gymId) {
    return Workout.findOneAndUpdate(
      { _id: id, gymId },
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
