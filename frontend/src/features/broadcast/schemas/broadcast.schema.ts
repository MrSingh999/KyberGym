import { z } from "zod";

export const createBroadcastSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  channel: z.enum(["whatsapp", "email", "inApp"]),
  messageTemplateId: z.string().optional(),
  message: z.string().optional(),
  recipientCriteria: z.object({
    target: z.enum(["all", "active", "expired", "dueToday", "dueIn3Days", "dueIn7Days", "selected"]),
    selectedMemberIds: z.array(z.string()).optional().default([]),
  }),
  scheduledAt: z.string().optional(),
}).refine((data) => data.messageTemplateId || data.message, {
  message: "Either a message template or custom message must be provided",
  path: ["message"],
});

export const updateBroadcastSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  messageTemplateId: z.string().optional(),
  message: z.string().optional(),
  recipientCriteria: z.object({
    target: z.enum(["all", "active", "expired", "dueToday", "dueIn3Days", "dueIn7Days", "selected"]),
    selectedMemberIds: z.array(z.string()).optional(),
  }).optional(),
  scheduledAt: z.string().optional(),
});

export type CreateBroadcastData = z.infer<typeof createBroadcastSchema>;
export type UpdateBroadcastData = z.infer<typeof updateBroadcastSchema>;
