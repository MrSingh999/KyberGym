import { MembershipPlanRepository } from './membershipPlan.repository.js';
import createError from 'http-errors';

export class MembershipPlanService {
  static async createPlan(gymId, data) {
    if (data.isDefault) {
      await MembershipPlanRepository.clearDefault(gymId);
    }
    return MembershipPlanRepository.create({ ...data, gymId });
  }

  static async getPlans(gymId, filter) {
    return MembershipPlanRepository.findAll(gymId, filter);
  }

  static async getPlanById(id, gymId) {
    const plan = await MembershipPlanRepository.findById(id, gymId);
    if (!plan) {
      throw createError.NotFound('Membership plan not found');
    }
    return plan;
  }

  static async updatePlan(id, gymId, data) {
    if (data.isDefault) {
      await MembershipPlanRepository.clearDefault(gymId);
    }
    const plan = await MembershipPlanRepository.update(id, gymId, data);
    if (!plan) {
      throw createError.NotFound('Membership plan not found');
    }
    return plan;
  }

  static async archivePlan(id, gymId) {
    // We soft-delete (archive) by setting active to false
    const plan = await MembershipPlanRepository.update(id, gymId, { active: false });
    if (!plan) {
      throw createError.NotFound('Membership plan not found');
    }
    return plan;
  }
}
