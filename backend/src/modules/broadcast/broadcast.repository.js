import mongoose from 'mongoose';
import { Broadcast } from './models/Broadcast.model.js';

export class BroadcastRepository {
  static async create(data) {
    return Broadcast.create(data);
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Broadcast.findOne(query)
      .populate('messageTemplateId', 'name type content');
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [broadcasts, total] = await Promise.all([
      Broadcast.find(query)
        .populate('messageTemplateId', 'name type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Broadcast.countDocuments(query)
    ]);

    return {
      data: broadcasts,
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
    return Broadcast.findOneAndUpdate(query, updateData, { new: true });
  }

  static async delete(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Broadcast.findOneAndDelete(query);
  }

  // Used by the Cron job to find pending broadcasts
  static async findScheduledToRun(dateNow) {
    return Broadcast.find({
      status: 'scheduled',
      scheduledAt: { $lte: dateNow }
    });
  }
}
