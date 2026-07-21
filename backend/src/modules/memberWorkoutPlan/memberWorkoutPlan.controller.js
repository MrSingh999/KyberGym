import { MemberWorkoutPlanService } from './memberWorkoutPlan.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class MemberWorkoutPlanController {
  static async createPlan(req, res) {
    const result = await MemberWorkoutPlanService.createPlan(req.gym._id, req.user._id, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Workout plan created', result);
  }

  static async getPlans(req, res) {
    const result = await MemberWorkoutPlanService.getPlans(req.gym._id, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout plans retrieved', result.data, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    });
  }

  static async getPlansByTrainer(req, res) {
    const result = await MemberWorkoutPlanService.getPlansByTrainer(req.gym._id, req.params.trainerId, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout plans retrieved', result.data, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    });
  }

  static async getMyPlans(req, res) {
    const profile = await (await import('../trainer/trainer.repository.js')).TrainerRepository.findProfileByUserId(req.gym._id, req.user._id);
    if (!profile) return ApiSuccess.send(res, httpStatus.OK, 'Workout plans retrieved', [], { page: 1, limit: 20, total: 0, totalPages: 0 });
    const result = await MemberWorkoutPlanService.getPlansByTrainer(req.gym._id, profile._id, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout plans retrieved', result.data, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    });
  }

  static async getPlansByMember(req, res) {
    const result = await MemberWorkoutPlanService.getPlansByMember(req.gym._id, req.params.memberId, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout plans retrieved', result.data, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    });
  }

  static async getPlanById(req, res) {
    const plan = await MemberWorkoutPlanService.getPlanById(req.params.id, req.gym._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout plan retrieved', plan);
  }

  static async updatePlan(req, res) {
    const plan = await MemberWorkoutPlanService.updatePlan(req.params.id, req.gym._id, { ...req.body, updatedBy: req.user._id });
    return ApiSuccess.send(res, httpStatus.OK, 'Workout plan updated', plan);
  }

  static async archivePlan(req, res) {
    const plan = await MemberWorkoutPlanService.archivePlan(req.params.id, req.gym._id, req.user._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout plan archived', plan);
  }

  static async saveNested(req, res) {
    const result = await MemberWorkoutPlanService.saveNested(req.gym._id, req.params.id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout plan saved', result);
  }
}
