import { z } from 'zod';

export const createWorkoutTemplateSchema = {
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    goal: z.string().optional(),
    durationWeeks: z.number().int().positive(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }),
};

export const updateWorkoutTemplateSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    goal: z.string().optional(),
    durationWeeks: z.number().int().positive().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    active: z.boolean().optional(),
  }),
};
