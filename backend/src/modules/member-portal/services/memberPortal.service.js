import { MemberService } from '../../member/member.service.js';
import { MemberSubscriptionService } from '../../memberSubscription/memberSubscription.service.js';
import { WorkoutService } from '../../workouts/workout.service.js';
import { AttendanceService } from '../../attendance/attendance.service.js';
import { NotificationService } from '../../notification/notification.service.js';

export class MemberPortalService {
  /**
   * Aggregates real data for Member Portal Home.
   * Pure orchestrator using Promise.allSettled with graceful degradation.
   *
   * @param {string|Object} gymId
   * @param {string|Object} userId
   * @param {Object} gymFeatures
   */
  static async getHomeData(gymId, userId, gymFeatures = {}) {
    // 1. Resolve Member identity (critical requirement)
    const member = await MemberService.getMemberByUserId(gymId, userId);

    const today = new Date();

    // 2. Concurrently execute independent domain service calls
    const [subResult, workoutResult, attendanceResult, announcementsResult] = await Promise.allSettled([
      MemberSubscriptionService.getActiveSubscriptionSummary(gymId, member._id),
      WorkoutService.getWorkoutForMemberByDate(gymId, member._id, today),
      AttendanceService.getMemberAttendanceSummary(gymId, member._id),
      NotificationService.getNotificationsForMember(gymId, userId, { limit: 5 }),
    ]);

    const membership = subResult.status === 'fulfilled' ? subResult.value : null;
    const todayWorkout = workoutResult.status === 'fulfilled' ? workoutResult.value : null;
    const attendance = attendanceResult.status === 'fulfilled'
      ? attendanceResult.value
      : { todayPresent: false, currentStreak: 0, thisMonth: 0 };
    const announcements = announcementsResult.status === 'fulfilled' ? announcementsResult.value : [];

    // 3. Map into response payload via helper
    return this._mapHomeDataResponse({
      membership,
      todayWorkout,
      attendance,
      announcements,
      gymFeatures,
    });
  }

  /**
   * Internal response-mapping helper to guarantee exact contract normalization.
   */
  static _mapHomeDataResponse({ membership, todayWorkout, attendance, announcements, gymFeatures }) {
    const normalizedFeatures = {
      attendance: Boolean(gymFeatures.attendance ?? true),
      workouts: Boolean(gymFeatures.workouts ?? true),
      announcements: Boolean(gymFeatures.announcements ?? gymFeatures.broadcasts ?? true),
      qrEntry: Boolean(gymFeatures.qrEntry ?? true),
    };

    return {
      version: 1,
      membership,
      todayWorkout,
      entryQr: {
        enabled: normalizedFeatures.qrEntry,
      },
      attendance,
      announcements,
      features: normalizedFeatures,
    };
  }
}
