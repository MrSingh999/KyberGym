import { z } from 'zod';

export const assignWorkoutSchema = {
  body: z.object({
    memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
    workoutTemplateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid template ID'),
    startDate: z.string().datetime(),
    notes: z.string().optional()
  }),
};

export const updateWorkoutStatusSchema = {
  body: z.object({
    status: z.enum(['active', 'completed', 'paused', 'cancelled']),
    notes: z.string().optional()
  }),
};
