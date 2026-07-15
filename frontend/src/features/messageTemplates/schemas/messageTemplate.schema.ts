import { z } from "zod";

export const messageTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  type: z.enum(["paymentDue", "paymentReceived", "membershipExpired", "workoutAssigned", "custom"]),
  channel: z.enum(["whatsapp", "email", "inApp"]),
  subject: z.string().optional(),
  content: z.string().min(2, "Content is required").max(5000),
  variables: z.array(z.string()).optional().default([]),
});

export const updateMessageTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  subject: z.string().optional(),
  content: z.string().min(2, "Content is required").max(5000).optional(),
  variables: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export type CreateMessageTemplateData = z.infer<typeof messageTemplateSchema>;
export type UpdateMessageTemplateData = z.infer<typeof updateMessageTemplateSchema>;
