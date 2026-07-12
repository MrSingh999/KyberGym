import { z } from 'zod';

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

export const createPlanStep1Schema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(80, 'Plan name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: z.string().optional(),
});

export type CreatePlanStep1 = z.infer<typeof createPlanStep1Schema>;

// ─── Step 2: Pricing ─────────────────────────────────────────────────────────

export const createPlanStep2Schema = z.object({
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative'),
  joiningFee: z
    .number({ invalid_type_error: 'Joining fee must be a number' })
    .min(0)
    .optional(),
  isDefault: z.boolean().default(false),
  isPopular: z.boolean().default(false),
});

export type CreatePlanStep2 = z.infer<typeof createPlanStep2Schema>;

// ─── Step 3: Duration ────────────────────────────────────────────────────────

export const createPlanStep3Schema = z.object({
  duration: z
    .number({ invalid_type_error: 'Duration must be a number' })
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1'),
  durationType: z.enum(['days', 'weeks', 'months', 'years'], {
    required_error: 'Please select a duration type',
  }),
});

export type CreatePlanStep3 = z.infer<typeof createPlanStep3Schema>;

// ─── Step 4: Features ────────────────────────────────────────────────────────

export const planFeatureSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Feature label is required').max(100),
  included: z.boolean(),
});

export const createPlanStep4Schema = z.object({
  features: z.array(planFeatureSchema),
});

export type CreatePlanStep4 = z.infer<typeof createPlanStep4Schema>;

// ─── Full Schema ─────────────────────────────────────────────────────────────

export const createPlanSchema = createPlanStep1Schema
  .merge(createPlanStep2Schema)
  .merge(createPlanStep3Schema)
  .merge(createPlanStep4Schema);

export type CreatePlanData = z.infer<typeof createPlanSchema>;

// ─── Edit (same shape as create) ─────────────────────────────────────────────

export const editPlanSchema = createPlanSchema;
export type EditPlanData = CreatePlanData;
