import { z } from 'zod';

export const markAttendanceSchema = {
  body: z.object({
    memberId: z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid member ID'),
    status: z.enum(['present', 'absent', 'late']),
    notes: z.string().optional()
  }),
};

export const updateAttendanceSchema = {
  body: z.object({
    status: z.enum(['present', 'absent', 'late']).optional(),
    checkOutTime: z.string().datetime().optional(),
    notes: z.string().optional()
  }),
};
