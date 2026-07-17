import mongoose from 'mongoose';
import { MessageTemplate } from './models/MessageTemplate.model.js';

export class MessageTemplateRepository {
  static async create(data) {
    return MessageTemplate.create(data);
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return MessageTemplate.findOne(query);
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
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return MessageTemplate.findOneAndUpdate(query, updateData, { new: true });
  }

  static async delete(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return MessageTemplate.findOneAndDelete(query);
  }
}
