import { z } from 'zod';

export const gymPaymentPublicIdSchema = {
  params: z.object({
    id: z.string().regex(/^GPAY-[A-Z2-9]{8}$/, 'Invalid payment ID — expected GPAY-XXXXXXXX format'),
  }),
};

export const createGymPaymentSchema = {
  body: z.object({
    gymId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid gym ID'),
    subscriptionId: z.string().min(1, 'subscriptionId is required'),
    amount: z.number().positive('Amount must be positive'),
    paymentMethod: z.enum(['cash', 'upi', 'card', 'bank_transfer']),
    paymentReference: z.string().optional(),
    paymentDate: z.string().datetime().optional(),
    status: z.enum(['completed', 'refunded']).optional(),
    notes: z.string().optional(),
  }),
};

export const updateGymPaymentSchema = {
  body: z.object({
    gymId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid gym ID').optional(),
    subscriptionId: z.string().optional(),
    amount: z.number().positive('Amount must be positive').optional(),
    paymentMethod: z.enum(['cash', 'upi', 'card', 'bank_transfer']).optional(),
    paymentReference: z.string().optional(),
    paymentDate: z.string().datetime().optional(),
    notes: z.string().optional(),
  }).strict(),
};

export const refundGymPaymentSchema = {
  body: z.object({
    notes: z.string().optional(),
  }),
};

export const gymPaymentQuerySchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    gymId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid gym ID').optional(),
    subscriptionId: z.string().optional(),
    status: z.enum(['completed', 'refunded']).optional(),
    paymentMethod: z.enum(['cash', 'upi', 'card', 'bank_transfer']).optional(),
    search: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
};
