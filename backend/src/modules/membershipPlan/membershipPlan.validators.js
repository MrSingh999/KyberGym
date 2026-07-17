import { z } from 'zod';

export const createPlanSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    durationInDays: z.number().int().positive('Duration must be positive'),
    price: z.number().min(0, 'Price cannot be negative'),
    joiningFee: z.number().min(0).optional(),
    isDefault: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    features: z.array(
      z.object({
        id: z.string().optional(),
        label: z.string(),
        included: z.boolean(),
      })
    ).optional(),
    color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Invalid hex color').optional(),
    displayOrder: z.number().int().optional(),
  }),
};

export const updatePlanSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    durationInDays: z.number().int().positive().optional(),
    price: z.number().min(0).optional(),
    joiningFee: z.number().min(0).optional(),
    isDefault: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    features: z.array(
      z.object({
        id: z.string().optional(),
        label: z.string(),
        included: z.boolean(),
      })
    ).optional(),
    color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i).optional(),
    displayOrder: z.number().int().optional(),
    active: z.boolean().optional(),
  }),
};
