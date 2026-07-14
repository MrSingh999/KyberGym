import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required").max(100, "Name too long"),
  sets: z.coerce.number().int("Must be a whole number").min(0).optional(),
  reps: z.coerce.number().int("Must be a whole number").min(0).optional(),
  duration: z.coerce.number().min(0).optional(),
  notes: z.string().max(300).optional(),
  image: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const workoutDaySchema = z.object({
  dayNumber: z.coerce.number().int("Must be a whole number").min(1, "Min day 1").max(7, "Max day 7"),
  dayName: z.string().min(2, "Day name is required").max(50, "Name too long"),
  title: z.string().max(100).optional(),
  exercises: z.array(exerciseSchema),
});

export const createWorkoutSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title too long"),
  description: z.string().max(500).optional(),
  assignmentType: z.enum(["ALL", "SELECTED"]),
  assignedMembers: z.array(z.string()).default([]),
});

export const updateWorkoutSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  assignmentType: z.enum(["ALL", "SELECTED"]).optional(),
  assignedMembers: z.array(z.string()).optional(),
});

export type CreateWorkoutData = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutData = z.infer<typeof updateWorkoutSchema>;
export type WorkoutDayFormData = z.infer<typeof workoutDaySchema>;
export type ExerciseFormData = z.infer<typeof exerciseSchema>;
