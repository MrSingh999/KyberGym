import { z } from 'zod';

export const createSubscriptionSchema = {
  body: z.object({
    memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
    membershipPlanId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid plan ID'),
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
