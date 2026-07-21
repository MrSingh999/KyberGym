import { z } from 'zod';

// ─── Step 1: Select Member ────────────────────────────────────────────────────

export const collectStep1Schema = z.object({
  memberId: z.string().min(1, 'Please select a member'),
  memberName: z.string().min(1),
});

export type CollectStep1 = z.infer<typeof collectStep1Schema>;

// ─── Step 2: Membership Details ───────────────────────────────────────────────

export const collectStep2Schema = z.object({
  planId: z.string().min(1, 'Please select a plan'),
  planName: z.string().min(1),
  membershipStartDate: z.string().min(1, 'Start date is required'),
  membershipEndDate: z.string().min(1, 'End date is required'),
});

export type CollectStep2 = z.infer<typeof collectStep2Schema>;

// ─── Step 3: Payment Information ─────────────────────────────────────────────

export const collectStep3Schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0.01, 'Amount must be greater than 0'),
  discount: z
    .number({ invalid_type_error: 'Discount must be a number' })
    .min(0)
    .default(0),
  finalAmount: z.number().min(0),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'bank_transfer'], {
    required_error: 'Please select a payment method',
  }),
  transactionReference: z.string().optional(),
  paymentDate: z.string().min(1, 'Payment date is required'),
  notes: z.string().max(500).optional(),
});

export type CollectStep3 = z.infer<typeof collectStep3Schema>;

// ─── Full schema (for final submit) ──────────────────────────────────────────

export const collectPaymentSchema = collectStep1Schema
  .merge(collectStep2Schema)
  .merge(collectStep3Schema);

export type CollectPaymentData = z.infer<typeof collectPaymentSchema>;
