import { MemberSubscription } from './models/MemberSubscription.model.js';

export class MemberSubscriptionRepository {
  static async create(data) {
    return MemberSubscription.create(data);
  }

  static async findById(id, gymId) {
    return MemberSubscription.findOne({ _id: id, gymId })
      .populate('memberId', 'fullName memberCode')
      .populate('membershipPlanId', 'name durationInDays');
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, ...filter };
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      MemberSubscription.find(query)
        .populate('memberId', 'fullName memberCode')
        .populate('membershipPlanId', 'name durationInDays')
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
    return MemberSubscription.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }

  static async findActiveForMember(memberId, gymId) {
    return MemberSubscription.findOne({ memberId, gymId, status: 'active' });
  }
}
