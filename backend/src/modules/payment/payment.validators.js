import { z } from 'zod';

export const createPaymentSchema = {
  body: z.object({
    memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
    subscriptionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subscription ID').optional(),
    amount: z.number().positive('Amount must be positive'),
    paymentMethod: z.enum(['cash', 'upi', 'card', 'bankTransfer']),
    transactionId: z.string().optional(),
    paymentDate: z.string().datetime().optional(),
    notes: z.string().optional()
  }),
};

export const updatePaymentStatusSchema = {
  body: z.object({
    status: z.enum(['completed', 'pending', 'refunded', 'failed']),
    notes: z.string().optional()
  }),
};
