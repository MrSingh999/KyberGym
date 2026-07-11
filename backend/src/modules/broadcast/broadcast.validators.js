import { z } from 'zod';

export const createBroadcastSchema = {
  body: z.object({
    title: z.string().min(2),
    channel: z.enum(['whatsapp', 'email', 'inApp']),
    messageTemplateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid template ID').optional(),
    message: z.string().optional(),
    recipientCriteria: z.object({
      target: z.enum(['all', 'active', 'expired', 'dueToday', 'dueIn3Days', 'dueIn7Days', 'selected']),
      selectedMemberIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
    }),
    scheduledAt: z.string().datetime().optional()
  }).refine(data => data.messageTemplateId || data.message, {
    message: "Either messageTemplateId or custom message must be provided"
  }),
};

export const updateBroadcastSchema = {
  body: z.object({
    title: z.string().min(2).optional(),
    messageTemplateId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid template ID').optional(),
    message: z.string().optional(),
    recipientCriteria: z.object({
      target: z.enum(['all', 'active', 'expired', 'dueToday', 'dueIn3Days', 'dueIn7Days', 'selected']),
      selectedMemberIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
    }).optional(),
    scheduledAt: z.string().datetime().optional()
  }),
};
