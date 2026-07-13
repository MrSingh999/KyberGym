import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const exerciseSchema = z.object({
  name:     z.string().trim().min(1).max(100),
  sets:     z.number().int().positive().optional(),
  reps:     z.number().int().positive().optional(),
  duration: z.number().positive().optional(), // seconds
  notes:    z.string().trim().max(300).optional(),
  image:    z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

// ── Workout Schemas ───────────────────────────────────────────────

export const createWorkoutSchema = {
  body: z.object({
    title:          z.string().trim().min(2).max(100),
    description:    z.string().trim().max(500).optional(),
    assignmentType: z.enum(['ALL', 'SELECTED']),
    assignedMembers: z.array(objectId).optional().default([]),
    isActive:       z.boolean().optional().default(true),
  }).superRefine((data, ctx) => {
    if (data.assignmentType === 'SELECTED' && (!data.assignedMembers || data.assignedMembers.length === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'assignedMembers must not be empty when assignmentType is SELECTED', path: ['assignedMembers'] });
    }
  }),
};

export const updateWorkoutSchema = {
  body: z.object({
    title:           z.string().trim().min(2).max(100).optional(),
    description:     z.string().trim().max(500).optional(),
    assignmentType:  z.enum(['ALL', 'SELECTED']).optional(),
    assignedMembers: z.array(objectId).optional(),
    isActive:        z.boolean().optional(),
  }),
};

// ── Workout Day Schemas ───────────────────────────────────────────

export const createWorkoutDaySchema = {
  body: z.object({
    dayNumber: z.number().int().min(1).max(7),
    dayName:   z.string().trim().min(2).max(50),
    title:     z.string().trim().max(100).optional(),
    exercises: z.array(exerciseSchema).optional().default([]),
  }),
};

export const updateWorkoutDaySchema = {
  body: z.object({
    dayNumber: z.number().int().min(1).max(7).optional(),
    dayName:   z.string().trim().min(2).max(50).optional(),
    title:     z.string().trim().max(100).optional(),
    exercises: z.array(exerciseSchema).optional(),
  }),
};
