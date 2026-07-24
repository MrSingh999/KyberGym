import { MemberPortalService } from '../services/memberPortal.service.js';
import { MemberService } from '../../member/member.service.js';
import { WorkoutService } from '../../workouts/workout.service.js';
import { AttendanceService } from '../../attendance/attendance.service.js';
import { MemberSubscriptionService } from '../../memberSubscription/memberSubscription.service.js';
import { ApiSuccess } from '../../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class MemberPortalController {
  static async getHome(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const gymFeatures = req.gym.features || {};

    const data = await MemberPortalService.getHomeData(gymId, userId, gymFeatures);
    return ApiSuccess.send(res, httpStatus.OK, 'Member home data retrieved', data);
  }

  static async getProfile(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const member = await MemberService.getMemberByUserId(gymId, userId);
    return ApiSuccess.send(res, httpStatus.OK, 'Member profile retrieved', member);
  }

  static async getTodayWorkout(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const member = await MemberService.getMemberByUserId(gymId, userId);
    const workout = await WorkoutService.getWorkoutForMemberByDate(gymId, member._id, new Date());
    return ApiSuccess.send(res, httpStatus.OK, 'Today workout retrieved', workout);
  }

  static async getAttendance(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const member = await MemberService.getMemberByUserId(gymId, userId);
    const attendance = await AttendanceService.getMemberAttendanceSummary(gymId, member._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Attendance retrieved', attendance);
  }

  static async getSubscription(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const member = await MemberService.getMemberByUserId(gymId, userId);
    const subscription = await MemberSubscriptionService.getActiveSubscriptionSummary(gymId, member._id);
    return ApiSuccess.send(res, httpStatus.OK, 'Subscription retrieved', subscription);
  }
}
