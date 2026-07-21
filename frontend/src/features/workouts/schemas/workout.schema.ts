import { z } from "zod";

export const exerciseSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Exercise name is required").max(100),
  sets: z.coerce.number().int("Must be a whole number").min(0).optional(),
  reps: z.coerce.number().int("Must be a whole number").min(0).optional(),
  duration: z.coerce.number().min(0).optional(),
  restTime: z.coerce.number().min(0).optional(),
  notes: z.string().max(300).optional(),
  order: z.coerce.number().int().min(0).optional(),
  exerciseId: z.string().optional().nullable(),
  image: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const workoutDaySchema = z.object({
  _id: z.string().optional(),
  orderIndex: z.coerce.number().int("Must be a whole number").min(0, "Min 0"),
  dayName: z.string().min(1, "Day name is required").max(50),
  title: z.string().max(100).optional(),
  exercises: z.array(exerciseSchema),
});

export const createWorkoutSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  goal: z.string().max(100).optional(),
  estimatedDuration: z.coerce.number().int().positive().optional(),
  category: z.string().max(50).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  days: z.array(workoutDaySchema).optional().default([]),
});

export const updateWorkoutSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  goal: z.string().max(100).optional(),
  estimatedDuration: z.coerce.number().int().positive().optional(),
  category: z.string().max(50).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

export type CreateWorkoutData = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutData = z.infer<typeof updateWorkoutSchema>;
export type WorkoutDayFormData = z.infer<typeof workoutDaySchema>;
export type ExerciseFormData = z.infer<typeof exerciseSchema>;
