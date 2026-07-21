import { z } from 'zod';

export const createPaymentSchema = {
  body: z.object({
    memberId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid member ID'),
    subscriptionId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid subscription ID').optional(),
    amount: z.number().positive('Amount must be positive'),
    discount: z.number().min(0).default(0).optional(),
    finalAmount: z.number().positive('Final amount must be positive').optional(),
    paymentMethod: z.enum(['cash', 'upi', 'card', 'bank_transfer']),
    transactionId: z.string().optional(),
    paymentDate: z.string().datetime().optional(),
    notes: z.string().optional()
  }),
};

