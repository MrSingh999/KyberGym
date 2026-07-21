import { z } from 'zod';

const objectId = z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid ID');

const exerciseSchema = z.object({
  name:     z.string().trim().min(1).max(100),
  sets:     z.number().int().positive().optional(),
  reps:     z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  restTime: z.number().positive().optional(),
  notes:    z.string().trim().max(300).optional(),
  order:    z.number().int().min(0).optional(),
  exerciseId: z.string().optional().nullable(),
  image:    z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

// ── Workout Schemas ───────────────────────────────────────────────

export const createWorkoutSchema = {
  body: z.object({
    title:          z.string().trim().min(2).max(100),
    description:    z.string().trim().max(500).optional(),
    goal:           z.string().trim().max(100).optional(),
    estimatedDuration: z.number().int().positive().optional(),
    category:       z.string().trim().max(50).optional(),
    status:         z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional().default('ACTIVE'),
    days: z.array(z.object({
      _id:       z.string().optional(),
      dayName:   z.string().trim().min(1).max(50),
      title:     z.string().trim().max(100).optional(),
      orderIndex: z.number().int().min(0),
      exercises: z.array(exerciseSchema).optional().default([]),
    })).optional().default([]),
  }),
};

export const updateWorkoutSchema = {
  body: z.object({
    title:           z.string().trim().min(2).max(100).optional(),
    description:     z.string().trim().max(500).optional(),
    goal:            z.string().trim().max(100).optional(),
    estimatedDuration: z.number().int().positive().optional(),
    category:        z.string().trim().max(50).optional(),
    status:          z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
    isDeleted:       z.boolean().optional(),
  }),
};

// ── Workout Day Schemas ───────────────────────────────────────────

export const createWorkoutDaySchema = {
  body: z.object({
    orderIndex: z.number().int().min(0),
    dayName:   z.string().trim().min(1).max(50),
    title:     z.string().trim().max(100).optional(),
    exercises: z.array(exerciseSchema).optional().default([]),
  }),
};

export const updateWorkoutDaySchema = {
  body: z.object({
    orderIndex: z.number().int().min(0).optional(),
    dayName:   z.string().trim().min(1).max(50).optional(),
    title:     z.string().trim().max(100).optional(),
    exercises: z.array(exerciseSchema).optional(),
  }),
};

// ── Nested Save Schema ────────────────────────────────────────────

export const nestedSaveSchema = {
  body: z.object({
    title:          z.string().trim().min(2).max(100),
    description:    z.string().trim().max(500).optional(),
    goal:           z.string().trim().max(100).optional(),
    estimatedDuration: z.number().int().positive().optional(),
    category:       z.string().trim().max(50).optional(),
    status:         z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
    days: z.array(z.object({
      _id:       z.string().optional(),
      dayName:   z.string().trim().min(1).max(50),
      title:     z.string().trim().max(100).optional(),
      orderIndex: z.number().int().min(0),
      exercises: z.array(exerciseSchema).optional().default([]),
    })).optional().default([]),
  }),
};
