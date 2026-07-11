import { Exercise } from './models/Exercise.model.js';

export class ExerciseRepository {
  static async create(data) {
    return Exercise.create(data);
  }

  static async findById(id, gymId) {
    return Exercise.findOne({ _id: id, gymId });
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [exercises, total] = await Promise.all([
      Exercise.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Exercise.countDocuments(query)
    ]);

    return {
      data: exercises,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, gymId, updateData) {
    return Exercise.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }

  static async delete(id, gymId) {
    return Exercise.findOneAndDelete({ _id: id, gymId });
  }
}
