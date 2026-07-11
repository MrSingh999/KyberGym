import { z } from 'zod';

export const updateBrandingSchema = {
  body: z.object({
    logoUrl: z.string().url().optional(),
    faviconUrl: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    supportEmail: z.string().email().optional(),
    timezone: z.string().optional(),
    currency: z.string().min(2).max(5).optional(),
    language: z.string().length(2).optional(),
    dateFormat: z.string().optional(),
  }),
};
