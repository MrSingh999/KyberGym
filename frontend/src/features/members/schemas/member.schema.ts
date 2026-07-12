import { z } from "zod";

export const createMemberStep1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").or(z.literal("")),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
});

export const createMemberStep2Schema = z.object({
  planId: z.string().min(1, "Please select a plan"),
  membershipStartDate: z.string().min(1, "Start date is required"),
  membershipEndDate: z.string().min(1, "End date is required"),
});

export const createMemberStep3Schema = z.object({
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
});

export const renewMembershipSchema = z.object({
  planId: z.string().min(1, "Please select a plan"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const suspendMemberSchema = z.object({
  reason: z.string().min(5, "Please provide a reason (at least 5 characters)"),
});

export type CreateMemberStep1Data = z.infer<typeof createMemberStep1Schema>;
export type CreateMemberStep2Data = z.infer<typeof createMemberStep2Schema>;
export type CreateMemberStep3Data = z.infer<typeof createMemberStep3Schema>;
export type RenewMembershipData = z.infer<typeof renewMembershipSchema>;
export type SuspendMemberData = z.infer<typeof suspendMemberSchema>;
