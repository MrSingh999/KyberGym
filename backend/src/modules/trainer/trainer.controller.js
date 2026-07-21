import { TrainerService } from './trainer.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class TrainerController {
  static async createTrainer(req, res) {
    const result = await TrainerService.createTrainer(req.gym._id, req.user._id, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Trainer created', result);
  }

  static async getTrainers(req, res) {
    const result = await TrainerService.getTrainers(req.gym._id, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Trainers retrieved', result.data, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    });
  }

  static async getTrainerById(req, res) {
    const trainer = await TrainerService.getTrainerById(req.params.id, req.gym._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Trainer retrieved', trainer);
  }

  static async updateTrainer(req, res) {
    const trainer = await TrainerService.updateTrainer(req.params.id, req.gym._id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Trainer updated', trainer);
  }

  static async deactivateTrainer(req, res) {
    const trainer = await TrainerService.deactivateTrainer(req.params.id, req.gym._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Trainer deactivated', trainer);
  }

  static async activateTrainer(req, res) {
    const trainer = await TrainerService.activateTrainer(req.params.id, req.gym._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Trainer activated', trainer);
  }

  static async assignMembers(req, res) {
    const result = await TrainerService.assignMembers(req.gym._id, req.params.id, req.user._id, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Members assigned', result);
  }

  static async getTrainerMembers(req, res) {
    const result = await TrainerService.getTrainerMembers(req.gym._id, req.params.id, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Trainer members retrieved', result.data, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    });
  }

  static async removeMemberAssignment(req, res) {
    const assignment = await TrainerService.removeMemberAssignment(req.gym._id, req.params.assignmentId, req.user._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Assignment removed', assignment);
  }

  static async getMyProfile(req, res) {
    const profile = await TrainerService.getMyProfile(req.gym._id, req.user._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Profile retrieved', profile);
  }

  static async updateMyProfile(req, res) {
    const profile = await TrainerService.updateMyProfile(req.gym._id, req.user._id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Profile updated', profile);
  }

  static async getMyMembers(req, res) {
    const result = await TrainerService.getMyMembers(req.gym._id, req.user._id, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Members retrieved', result.data, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    });
  }
}
