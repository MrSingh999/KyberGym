import mongoose from 'mongoose';
import { MembershipPlan } from './models/MembershipPlan.model.js';

export class MembershipPlanRepository {
  static async create(data) {
    return MembershipPlan.create(data);
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return MembershipPlan.findOne(query);
  }

  static async findAll(gymId, filter = {}) {
    // Only fetch active plans by default, unless otherwise specified
    const query = { gymId, active: true, ...filter };
    return MembershipPlan.find(query).sort({ displayOrder: 1, price: 1 });
  }

  static async update(id, gymId, updateData) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return MembershipPlan.findOneAndUpdate(query, updateData, { new: true });
  }

  static async clearDefault(gymId) {
    return MembershipPlan.updateMany({ gymId }, { isDefault: false });
  }
}
