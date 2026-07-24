export interface ExerciseItem {
  _id?: string;
  name: string;
  sets?: number;
  reps?: string | number;
  duration?: number;
  restTime?: number | string;
  notes?: string;
}

export interface WorkoutDayItem {
  _id?: string;
  title?: string;
  dayName?: string;
  orderIndex?: number;
  exercises?: ExerciseItem[];
}

export interface MemberWorkoutItem {
  _id: string;
  publicId?: string;
  name: string;
  goal?: string;
  category?: string;
  estimatedDuration?: number;
  assignedTrainer?: string | { name?: string; fullName?: string };
  assignedBy?: string;
  days?: WorkoutDayItem[];
}

export interface WorkoutMetadataItem {
  label: string;
  value: string;
}
