import { PersonalWorkout } from './models/PersonalWorkout.model.js';

export class PersonalWorkoutRepository {
  static async create(data) {
    return PersonalWorkout.create(data);
  }

  static async findById(id, gymId) {
    return PersonalWorkout.findOne({ _id: id, gymId })
      .populate('memberId', 'fullName memberCode')
      .populate('workoutDays.exercises.exerciseId', 'name slug muscleGroup thumbnail');
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [workouts, total] = await Promise.all([
      PersonalWorkout.find(query)
        .populate('memberId', 'fullName memberCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PersonalWorkout.countDocuments(query)
    ]);

    return {
      data: workouts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, gymId, updateData) {
    return PersonalWorkout.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }

  static async delete(id, gymId) {
    return PersonalWorkout.findOneAndDelete({ _id: id, gymId });
  }
}
