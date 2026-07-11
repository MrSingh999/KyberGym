import { z } from 'zod';

export const createMessageTemplateSchema = {
  body: z.object({
    name: z.string().min(2),
    type: z.enum(['paymentDue', 'paymentReceived', 'membershipExpired', 'workoutAssigned', 'custom']),
    channel: z.enum(['whatsapp', 'email', 'inApp']),
    subject: z.string().optional(),
    content: z.string().min(2),
    variables: z.array(z.string()).optional(),
  }),
};

export const updateMessageTemplateSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    subject: z.string().optional(),
    content: z.string().min(2).optional(),
    variables: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  }),
};
