import { WorkoutTemplate } from './models/WorkoutTemplate.model.js';

export class WorkoutTemplateRepository {
  static async create(data) {
    return WorkoutTemplate.create(data);
  }

  static async findById(id, gymId) {
    return WorkoutTemplate.findOne({ _id: id, gymId });
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      WorkoutTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      WorkoutTemplate.countDocuments(query)
    ]);

    return {
      data: templates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, gymId, updateData) {
    return WorkoutTemplate.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }

  static async delete(id, gymId) {
    return WorkoutTemplate.findOneAndDelete({ _id: id, gymId });
  }
}
