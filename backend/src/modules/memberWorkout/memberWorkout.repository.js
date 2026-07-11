import { MemberWorkout } from './models/MemberWorkout.model.js';

export class MemberWorkoutRepository {
  static async create(data) {
    return MemberWorkout.create(data);
  }

  static async findById(id, gymId) {
    return MemberWorkout.findOne({ _id: id, gymId })
      .populate('memberId', 'fullName memberCode')
      .populate('workoutTemplateId', 'name durationWeeks goal');
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [workouts, total] = await Promise.all([
      MemberWorkout.find(query)
        .populate('memberId', 'fullName memberCode')
        .populate('workoutTemplateId', 'name durationWeeks goal')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit),
      MemberWorkout.countDocuments(query)
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
    return MemberWorkout.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }

  static async findActiveForMember(memberId, gymId) {
    return MemberWorkout.findOne({ memberId, gymId, status: 'active' });
  }
}
