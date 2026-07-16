import { MemberService } from './member.service.js';
import { WorkoutService } from '../workouts/workout.service.js';
import { MemberQrService } from '../memberQr/memberQr.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class MemberController {

  static async createMember(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const member = await MemberService.createMember(gymId, userId, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Member created successfully', member);
  }

  static async getMembers(req, res) {
    const gymId = req.gym._id;
    const result = await MemberService.getMembers(gymId, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Members retrieved successfully', result.data, result.meta);
  }

  static async getMemberById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const member = await MemberService.getMemberById(id, gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Member retrieved successfully', member);
  }

  static async updateMember(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const { id } = req.params;
    const member = await MemberService.updateMember(id, gymId, userId, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Member updated successfully', member);
  }

  static async deleteMember(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const { id } = req.params;
    const member = await MemberService.deleteMember(id, gymId, userId);
    return ApiSuccess.send(res, httpStatus.OK, 'Member deleted successfully', member);
  }

  /**
   * GET /members/me/workouts
   * Returns all workouts assigned to the currently authenticated member.
   * Includes workout days with embedded exercises.
   */
  static async getMyWorkouts(req, res) {
    const gymId = req.gym._id;
    const memberId = req.user.memberId ?? req.user._id;
    const workouts = await WorkoutService.getWorkoutsForMember(gymId, memberId);
    return ApiSuccess.send(res, httpStatus.OK, 'Member workouts retrieved', workouts);
  }

  /**
   * GET /members/me/qr
   * Returns the QR code for the currently authenticated member.
   */
  static async getMyQr(req, res) {
    const gymId = req.gym._id;
    const member = await MemberService.getMemberByUserId(gymId, req.user._id);
    let qr;
    try {
      qr = await MemberQrService.getQr(gymId, member._id);
    } catch {
      qr = await MemberQrService.generateQr(gymId, member._id);
    }
    return ApiSuccess.send(res, httpStatus.OK, 'QR code retrieved', qr);
  }
}
