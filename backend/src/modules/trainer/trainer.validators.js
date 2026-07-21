import { z } from 'zod';
import { TRAINER_CONFIG } from './trainer.constants.js';

const objectId = z.string().regex(/^([A-Z]{2,5}-[A-Z2-9]{8}|[0-9a-fA-F]{24})$/, 'Invalid ID');

export const createTrainerSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    specialization: z.string().max(100).optional(),
  }),
};

export const updateTrainerSchema = {
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    specialization: z.string().max(100).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

export const assignMembersSchema = {
  body: z.object({
    memberIds: z
      .array(objectId)
      .min(1, 'At least one member must be selected')
      .max(TRAINER_CONFIG.MAX_MEMBER_ASSIGNMENTS_PER_REQUEST, `Maximum ${TRAINER_CONFIG.MAX_MEMBER_ASSIGNMENTS_PER_REQUEST} members per request`),
  }),
};

export const updateMyProfileSchema = {
  body: z.object({
    phone: z.string().optional(),
  }),
};

export const trainerQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sort: z.enum(['fullName', 'joiningDate', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};

export const trainerMembersQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};
