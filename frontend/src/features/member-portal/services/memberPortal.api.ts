import { apiClient } from '../../../lib/apiClient';
import type {
  MemberHomeData,
  MemberPortalApiResponse,
  UpdateMemberProfileDto,
  MemberWorkoutFilterParams,
  MemberAttendanceFilterParams,
} from '../types/memberPortal.types';

export const memberPortalApi = {
  /**
   * Fetch member portal home dashboard aggregated summary.
   */
  async getHome(): Promise<MemberPortalApiResponse<MemberHomeData>> {
    const response = await apiClient.get<MemberPortalApiResponse<MemberHomeData>>('/members/me/home');
    return response.data;
  },

  /**
   * Fetch current member profile details.
   */
  async getProfile(): Promise<MemberPortalApiResponse<Record<string, unknown>>> {
    const response = await apiClient.get<MemberPortalApiResponse<Record<string, unknown>>>('/members/me');
    return response.data;
  },

  /**
   * Update current member profile details.
   */
  async updateProfile(dto: UpdateMemberProfileDto): Promise<MemberPortalApiResponse<Record<string, unknown>>> {
    const response = await apiClient.patch<MemberPortalApiResponse<Record<string, unknown>>>('/members/me', dto);
    return response.data;
  },

  /**
   * Fetch member workouts history.
   */
  async getWorkouts(params?: MemberWorkoutFilterParams): Promise<MemberPortalApiResponse<unknown[]>> {
    const response = await apiClient.get<MemberPortalApiResponse<unknown[]>>('/members/me/workouts', { params });
    return response.data;
  },

  /**
   * Fetch member's workout assigned for today.
   */
  async getTodayWorkout(): Promise<MemberPortalApiResponse<Record<string, unknown> | null>> {
    const response = await apiClient.get<MemberPortalApiResponse<Record<string, unknown> | null>>('/members/me/today-workout');
    return response.data;
  },

  /**
   * Fetch member attendance logs.
   */
  async getAttendance(params?: MemberAttendanceFilterParams): Promise<MemberPortalApiResponse<unknown[]>> {
    const response = await apiClient.get<MemberPortalApiResponse<unknown[]>>('/members/me/attendance', { params });
    return response.data;
  },

  /**
   * Fetch member active subscription & plan details.
   */
  async getSubscription(): Promise<MemberPortalApiResponse<Record<string, unknown> | null>> {
    const response = await apiClient.get<MemberPortalApiResponse<Record<string, unknown> | null>>('/members/me/subscription');
    return response.data;
  },

  /**
   * Fetch member notifications.
   */
  async getNotifications(): Promise<MemberPortalApiResponse<unknown[]>> {
    const response = await apiClient.get<MemberPortalApiResponse<unknown[]>>('/notifications');
    return response.data;
  },
};
