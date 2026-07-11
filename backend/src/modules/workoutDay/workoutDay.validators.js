import { z } from 'zod';

const exerciseSchema = z.object({
  exerciseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid exercise ID'),
  sets: z.number().int().positive().optional(),
  reps: z.string().optional(),
  duration: z.number().int().positive().optional(),
  restSeconds: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  displayOrder: z.number().int().min(0),
});

export const createWorkoutDaySchema = {
  body: z.object({
    workoutTemplateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid template ID'),
    dayNumber: z.number().int().positive(),
    title: z.string().min(2),
    exercises: z.array(exerciseSchema).optional(),
  }),
};

export const updateWorkoutDaySchema = {
  body: z.object({
    dayNumber: z.number().int().positive().optional(),
    title: z.string().min(2).optional(),
    exercises: z.array(exerciseSchema).optional(),
  }),
};
