import { z } from 'zod';

export const createCustomDomainSchema = {
  body: z.object({
    domain: z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
  }),
};
