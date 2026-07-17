import { z } from 'zod';

export const createSubscriptionSchema = {
  body: z.object({
    memberId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid member ID'),
    membershipPlanId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid plan ID'),
    startDate: z.string().datetime(),
    discount: z.number().min(0).default(0),
    notes: z.string().optional()
  }),
};

export const updateSubscriptionStatusSchema = {
  body: z.object({
    status: z.enum(['active', 'expired', 'cancelled', 'paused']),
    notes: z.string().optional()
  }),
};

export const updateSubscriptionSchema = {
  body: z.object({
    membershipPlanId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid plan ID').optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    discount: z.number().min(0).optional(),
    notes: z.string().optional(),
  }),
};
