export type AssignmentStatus = "ACTIVE" | "REMOVED";
export type AssignmentType = "ALL" | "SELECTED";
export type AssignmentSortField = "assignedAt";

export interface WorkoutAssignment {
  _id: string;
  gymId: string;
  workoutId: WorkoutAssignmentRef;
  memberId: MemberAssignmentRef;
  status: AssignmentStatus;
  assignedBy: string;
  assignedAt: string;
  startDate?: string;
  endDate?: string;
  removedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutAssignmentRef {
  _id: string;
  title: string;
}

export interface MemberAssignmentRef {
  _id: string;
  fullName: string;
  email?: string;
}

export interface WorkoutAssignmentListItem {
  id: string;
  workoutTitle: string;
  workoutId: string;
  memberName: string;
  memberId: string;
  status: AssignmentStatus;
  assignedAt: string;
  startDate?: string;
  endDate?: string;
}

export interface AssignWorkoutData {
  workoutId: string;
  assignmentType: AssignmentType;
  memberIds?: string[];
  startDate?: string;
  endDate?: string;
}

export interface UpdateAssignmentData {
  startDate?: string;
  endDate?: string;
  status?: AssignmentStatus;
}

export interface AssignmentFilters {
  status?: AssignmentStatus;
  workoutId?: string;
  memberId?: string;
  search?: string;
}

export interface PaginatedAssignments {
  data: WorkoutAssignmentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
