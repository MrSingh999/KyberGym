export type PlanStatus = "ACTIVE" | "ARCHIVED";

export interface PlanExercise {
  _id?: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  order: number;
  exerciseId?: string | null;
  image?: string;
  videoUrl?: string;
}

export interface PlanDay {
  _id?: string;
  planId: string;
  orderIndex: number;
  dayName: string;
  title?: string;
  exercises: PlanExercise[];
}

export interface MemberWorkoutPlan {
  _id: string;
  publicId: string;
  gymId: string;
  memberId: string;
  trainerId: string;
  sourceWorkoutId?: string;
  title: string;
  description?: string;
  goal?: string;
  estimatedDuration?: number;
  category?: string;
  status: PlanStatus;
  createdBy: string;
  updatedBy?: string;
  archivedBy?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberWorkoutPlanWithDays extends MemberWorkoutPlan {
  days: PlanDay[];
}

export interface PlanListItem {
  id: string;
  title: string;
  description?: string;
  goal?: string;
  category?: string;
  estimatedDuration?: number;
  status: PlanStatus;
  memberId: string;
  memberName?: string;
  trainerName?: string;
  daysCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanData {
  memberId: string;
  trainerId: string;
  sourceWorkoutId?: string | null;
  title?: string;
  description?: string;
  goal?: string;
  estimatedDuration?: number;
  category?: string;
}

export interface UpdatePlanData {
  title?: string;
  description?: string;
  goal?: string;
  estimatedDuration?: number;
  category?: string;
  status?: PlanStatus;
}

export interface PlanQueryParams {
  search?: string;
  trainerId?: string;
  memberId?: string;
  status?: PlanStatus;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export interface NestedSaveData {
  title: string;
  description?: string;
  goal?: string;
  estimatedDuration?: number;
  category?: string;
  status?: PlanStatus;
  days: Array<{
    _id?: string;
    dayName: string;
    title?: string;
    orderIndex: number;
    exercises: PlanExercise[];
  }>;
}
