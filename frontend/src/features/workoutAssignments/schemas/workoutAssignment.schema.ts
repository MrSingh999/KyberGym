import { z } from "zod";

export const assignWorkoutSchema = z.object({
  workoutId: z.string().min(1, "Workout is required"),
  assignmentType: z.enum(["ALL", "SELECTED"]),
  memberIds: z.array(z.string()).optional().default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(
  (data) => data.assignmentType !== "SELECTED" || (data.memberIds && data.memberIds.length > 0),
  { message: "Select at least one member", path: ["memberIds"] },
);

export const updateAssignmentSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["ACTIVE", "REMOVED"]).optional(),
});

export type AssignWorkoutData = z.infer<typeof assignWorkoutSchema>;
export type UpdateAssignmentData = z.infer<typeof updateAssignmentSchema>;
