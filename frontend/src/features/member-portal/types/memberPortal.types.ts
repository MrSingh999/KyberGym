export interface MembershipSummary {
  planName: string;
  status: string;
  expiryDate: string;
  daysRemaining: number;
}

export interface TodayWorkoutSummary {
  workoutId?: string;
  title: string;
  dayName?: string;
  exerciseCount: number;
  exercises?: Array<Record<string, unknown>>;
}

export interface AttendanceSummary {
  todayPresent: boolean;
  currentStreak: number;
  thisMonth: number;
}

export interface EntryQrSummary {
  enabled: boolean;
}

export interface MemberHomeData {
  version: number;
  membership: MembershipSummary | null;
  todayWorkout: TodayWorkoutSummary | null;
  entryQr: EntryQrSummary;
  attendance: AttendanceSummary;
  announcements: Array<Record<string, unknown>>;
  features: Record<string, boolean>;
}

export interface MemberPortalApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UpdateMemberProfileDto {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  email?: string;
}

export interface MemberWorkoutFilterParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export interface MemberAttendanceFilterParams {
  month?: number;
  year?: number;
  limit?: number;
  page?: number;
}
