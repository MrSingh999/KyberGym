import { z } from 'zod';
import { TRAINER_CONFIG } from '../trainer/trainer.constants.js';

const objectId = z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid ID');

const exerciseSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1).max(100),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  restTime: z.number().positive().optional(),
  notes: z.string().trim().max(300).optional(),
  order: z.number().int().min(0).optional(),
  exerciseId: z.string().optional().nullable(),
  image: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

export const createPlanSchema = {
  body: z.object({
    memberId: objectId,
    trainerId: objectId,
    sourceWorkoutId: objectId.nullable().optional(),
    title: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    goal: z.string().trim().max(100).optional(),
    estimatedDuration: z.number().int().positive().optional(),
    category: z.string().trim().max(50).optional(),
  }),
};

export const updatePlanSchema = {
  body: z.object({
    title: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    goal: z.string().trim().max(100).optional(),
    estimatedDuration: z.number().int().positive().optional(),
    category: z.string().trim().max(50).optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  }),
};

export const planQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    trainerId: objectId.optional(),
    memberId: objectId.optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
    sort: z.enum(['createdAt', 'updatedAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(TRAINER_CONFIG.MAX_PAGE_SIZE).optional(),
  }),
};

export const nestedSaveSchema = {
  body: z.object({
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    goal: z.string().trim().max(100).optional(),
    estimatedDuration: z.number().int().positive().optional(),
    category: z.string().trim().max(50).optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
    days: z.array(z.object({
      _id: z.string().optional(),
      dayName: z.string().trim().min(1).max(50),
      title: z.string().trim().max(100).optional(),
      orderIndex: z.number().int().min(0),
      exercises: z.array(exerciseSchema).optional().default([]),
    })).optional().default([]),
  }),
};
