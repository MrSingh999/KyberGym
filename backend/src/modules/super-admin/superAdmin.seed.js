import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { SuperAdmin } from './superAdmin.model.js';
import { hashData } from '../auth/auth.utils.js';

export const seedSuperAdmin = async () => {
  if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD || !env.SUPER_ADMIN_NAME) {
    logger.info('Super Admin seed: SKIPPED — SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, and SUPER_ADMIN_NAME must be set');
    return;
  }

  const existing = await SuperAdmin.findOne({ email: env.SUPER_ADMIN_EMAIL });
  if (existing) {
    logger.info('Super Admin seed: SKIPPED — super admin already exists');
    return;
  }

  const hashedPassword = await hashData(env.SUPER_ADMIN_PASSWORD);

  await SuperAdmin.create({
    fullName: env.SUPER_ADMIN_NAME,
    email: env.SUPER_ADMIN_EMAIL,
    password: hashedPassword,
    isActive: true,
  });

  logger.info(`Super Admin seed: Created super admin — ${env.SUPER_ADMIN_EMAIL}`);
};
