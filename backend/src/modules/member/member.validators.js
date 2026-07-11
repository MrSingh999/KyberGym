import { z } from 'zod';

export const createMemberSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dateOfBirth: z.string().datetime().optional().or(z.literal('')), // Accept ISO string
    address: z.string().optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
    }).optional(),
    notes: z.string().optional(),
  }),
};

export const updateMemberSchema = {
  body: z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dateOfBirth: z.string().datetime().optional().or(z.literal('')),
    address: z.string().optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
    }).optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'expired']).optional(),
    notes: z.string().optional(),
  }),
};
