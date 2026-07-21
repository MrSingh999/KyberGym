import { z } from 'zod';

const objectId = z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid ID');

export const assignWorkoutSchema = {
  body: z.object({
    workoutId: objectId,
    assignmentType: z.enum(['ALL', 'SELECTED']),
    memberIds: z.array(objectId).optional().default([]),
    startDate: z.string().optional().nullable().transform((val) => val ? new Date(val).toISOString() : undefined),
    endDate: z.string().optional().nullable().transform((val) => val ? new Date(val).toISOString() : undefined),
  }).superRefine((data, ctx) => {
    if (data.assignmentType === 'SELECTED' && (!data.memberIds || data.memberIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'memberIds must not be empty when assignmentType is SELECTED',
        path: ['memberIds'],
      });
    }
  }),
};

export const updateAssignmentSchema = {
  body: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['ACTIVE', 'REMOVED']).optional(),
  }),
};

export const assignmentQuerySchema = {
  query: z.object({
    memberId: objectId.optional(),
    workoutId: objectId.optional(),
    status: z.enum(['ACTIVE', 'REMOVED']).optional(),
    search: z.string().optional(),
    sort: z.enum(['assignedAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
  }),
};
