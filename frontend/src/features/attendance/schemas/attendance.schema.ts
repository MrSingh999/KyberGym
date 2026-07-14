import { z } from "zod";

export const markAttendanceSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  status: z.enum(["present", "absent", "late"], {
    required_error: "Attendance status is required",
  }),
  notes: z.string().optional(),
});

export type MarkAttendanceData = z.infer<typeof markAttendanceSchema>;

export const updateAttendanceSchema = z.object({
  status: z.enum(["present", "absent", "late"]).optional(),
  checkOutTime: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateAttendanceData = z.infer<typeof updateAttendanceSchema>;
