import { MessageTemplate } from './models/MessageTemplate.model.js';

export class MessageTemplateRepository {
  static async create(data) {
    return MessageTemplate.create(data);
  }

  static async findById(id, gymId) {
    return MessageTemplate.findOne({ _id: id, gymId });
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      MessageTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MessageTemplate.countDocuments(query)
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
    return MessageTemplate.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }

  static async delete(id, gymId) {
    return MessageTemplate.findOneAndDelete({ _id: id, gymId });
  }
}
