import { z } from 'zod';

const exerciseSchema = z.object({
  exerciseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid exercise ID').optional(),
  sets: z.number().int().positive().optional(),
  reps: z.string().optional(),
  duration: z.number().int().positive().optional(),
  restSeconds: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  displayOrder: z.number().int().min(0),
});

const workoutDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string().optional(),
  exercises: z.array(exerciseSchema).optional(),
});

export const createPersonalWorkoutSchema = {
  body: z.object({
    memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
    title: z.string().min(2),
    description: z.string().optional(),
    workoutDays: z.array(workoutDaySchema).optional(),
  }),
};

export const updatePersonalWorkoutSchema = {
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    workoutDays: z.array(workoutDaySchema).optional(),
    active: z.boolean().optional(),
  }),
};
