import { MembershipPlanService } from './membershipPlan.service.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class MembershipPlanController {
  
  static async createPlan(req, res) {
    const gymId = req.gym._id;
    const plan = await MembershipPlanService.createPlan(gymId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Membership plan created', plan);
  }

  static async getPlans(req, res) {
    const gymId = req.gym._id;
    const { includeArchived } = req.query;
    
    const filter = includeArchived === 'true' ? { active: { $in: [true, false] } } : {};
    
    const plans = await MembershipPlanService.getPlans(gymId, filter);
    return ApiResponse.success(res, httpStatus.OK, 'Membership plans retrieved', plans);
  }

  static async getPlanById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const plan = await MembershipPlanService.getPlanById(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Membership plan retrieved', plan);
  }

  static async updatePlan(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const plan = await MembershipPlanService.updatePlan(id, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Membership plan updated', plan);
  }

  static async deletePlan(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const plan = await MembershipPlanService.archivePlan(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Membership plan archived', plan);
  }
}
