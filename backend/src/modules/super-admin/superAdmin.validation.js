import { z } from 'zod';

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const createGymSchema = {
  body: z.object({
    gymName: z.string().min(2, 'Gym name must be at least 2 characters'),
    subdomain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
    ownerName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    phone: z.string().optional(),
  }),
};

export const updateGymSchema = {
  body: z.object({
    name: z.string().min(2).optional(),
    timezone: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
};

export const updateFeaturesSchema = {
  body: z.object({
    memberPortal: z.boolean().optional(),
    staffPortal: z.boolean().optional(),
    attendance: z.boolean().optional(),
    workouts: z.boolean().optional(),
    dietPlans: z.boolean().optional(),
    qrEntry: z.boolean().optional(),
    whatsappBroadcast: z.boolean().optional(),
    payments: z.boolean().optional(),
    analytics: z.boolean().optional(),
    members: z.boolean().optional(),
    notifications: z.boolean().optional(),
    branding: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
};

export const getSubscriptionSchema = {
  params: z.object({
    id: z.string(),
  }),
};

export const updateSubscriptionSchema = {
  body: z.object({
    status: z.enum(['active', 'trial', 'expired', 'suspended']).optional(),
    expiresAt: z.string().datetime().optional().nullable(),
    trialEndsAt: z.string().datetime().optional().nullable(),
  }),
  params: z.object({
    id: z.string(),
  }),
};

export const renewSubscriptionSchema = {
  body: z.object({
    startDate: z.string().datetime(),
    expiresAt: z.string().datetime(),
    amountPaid: z.number().min(0, 'Amount paid must be at least 0'),
    duration: z.number().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
};

export const updateStatusSchema = {
  body: z.object({
    status: z.enum(['trial', 'active', 'expired', 'suspended']),
  }),
  params: z.object({
    id: z.string(),
  }),
};

export const manageTrialSchema = {
  body: z.object({
    action: z.enum(['start', 'extend', 'end']),
    trialEndsAt: z.string().datetime().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
};

export const gymIdParamSchema = {
  params: z.object({
    id: z.string(),
  }),
};

export const paginationSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(),
    isActive: z.string().optional(),
  }),
};
