export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  notes?: string;
  image?: string;
  videoUrl?: string;
}

export interface WorkoutDay {
  id?: string;
  workoutId: string;
  dayNumber: number;
  dayName: string;
  title?: string;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Workout {
  id: string;
  gymId: string;
  title: string;
  description?: string;
  assignmentType: "ALL" | "SELECTED";
  assignedMembers: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutWithDays extends Workout {
  days: WorkoutDay[];
}

export interface WorkoutListItem {
  id: string;
  title: string;
  description?: string;
  assignmentType: "ALL" | "SELECTED";
  assignedMemberCount: number;
  daysCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutFilters {
  isActive?: boolean;
  assignmentType?: "ALL" | "SELECTED";
}

export type WorkoutSortField = "title" | "createdAt" | "updatedAt";
export type SortDir = "asc" | "desc";
