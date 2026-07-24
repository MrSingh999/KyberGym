import mongoose from 'mongoose';
import { MemberSubscription } from './models/MemberSubscription.model.js';

export class MemberSubscriptionRepository {
  static async create(data) {
    return MemberSubscription.create(data);
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return MemberSubscription.findOne(query)
      .populate('memberId', 'fullName publicId')
      .populate('membershipPlanId', 'name durationInDays publicId');
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      MemberSubscription.find(query)
        .populate('memberId', 'fullName publicId')
        .populate('membershipPlanId', 'name durationInDays publicId')
        .sort({ endDate: -1 })
        .skip(skip)
        .limit(limit),
      MemberSubscription.countDocuments(query)
    ]);

    return {
      data: subscriptions,
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
    return MemberSubscription.findOneAndUpdate(query, updateData, { new: true });
  }

  static async findActiveForMember(memberId, gymId, options = {}) {
    let query = MemberSubscription.findOne({ memberId, gymId, status: 'active' });
    if (options.populatePlan) {
      query = query.populate('membershipPlanId', 'name durationInDays price');
    }
    return query;
  }
}
