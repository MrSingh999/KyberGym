export type WorkoutStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface Exercise {
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

export interface WorkoutDay {
  _id?: string;
  workoutId: string;
  orderIndex: number;
  dayName: string;
  title?: string;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Workout {
  _id: string;
  gymId: string;
  title: string;
  description?: string;
  goal?: string;
  estimatedDuration?: number;
  category?: string;
  status: WorkoutStatus;
  isDeleted: boolean;
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
  goal?: string;
  category?: string;
  estimatedDuration?: number;
  status: WorkoutStatus;
  daysCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutFilters {
  status?: WorkoutStatus;
}

export type WorkoutSortField = "title" | "createdAt" | "updatedAt";
export type SortDir = "asc" | "desc";
