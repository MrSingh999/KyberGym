import { MembershipPlan } from './models/MembershipPlan.model.js';

export class MembershipPlanRepository {
  static async create(data) {
    return MembershipPlan.create(data);
  }

  static async findById(id, gymId) {
    return MembershipPlan.findOne({ _id: id, gymId });
  }

  static async findAll(gymId, filter = {}) {
    // Only fetch active plans by default, unless otherwise specified
    const query = { gymId, active: true, ...filter };
    return MembershipPlan.find(query).sort({ displayOrder: 1, price: 1 });
  }

  static async update(id, gymId, updateData) {
    return MembershipPlan.findOneAndUpdate({ _id: id, gymId }, updateData, { new: true });
  }
}
