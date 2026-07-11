import { SaasPlan } from './models/SaasPlan.model.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';
import createError from 'http-errors';

export class SaasPlanController {
  
  static async createPlan(req, res) {
    const plan = await SaasPlan.create(req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'SaaS Plan created', plan);
  }

  static async getPlans(req, res) {
    const plans = await SaasPlan.find({ active: true }).sort({ monthlyPrice: 1 });
    return ApiResponse.success(res, httpStatus.OK, 'SaaS Plans retrieved', plans);
  }

  static async updatePlan(req, res) {
    const { id } = req.params;
    const plan = await SaasPlan.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!plan) {
      throw createError.NotFound('SaaS Plan not found');
    }
    
    return ApiResponse.success(res, httpStatus.OK, 'SaaS Plan updated', plan);
  }

  static async deletePlan(req, res) {
    const { id } = req.params;
    const plan = await SaasPlan.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!plan) {
      throw createError.NotFound('SaaS Plan not found');
    }

    return ApiResponse.success(res, httpStatus.OK, 'SaaS Plan deactivated', plan);
  }
}
