import mongoose from 'mongoose';
import { DeliveryLog } from './models/DeliveryLog.model.js';

export class DeliveryLogRepository {
  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      DeliveryLog.find(query)
        .populate('broadcastId', 'title')
        .populate('memberId', 'fullName phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DeliveryLog.countDocuments(query)
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return DeliveryLog.findOne(query)
      .populate('broadcastId', 'title channel')
      .populate('memberId', 'fullName phone email');
  }
}
