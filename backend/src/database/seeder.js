import { logger } from '../config/logger.js';

/**
 * No startup seeders required for MVP.
 * Super Admin manually creates gyms via the super-admin portal.
 */
export const runSeeders = async () => {
  logger.info('Seeders: No startup seeders configured for MVP');
};
