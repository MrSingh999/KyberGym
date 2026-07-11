import { SaasPlan } from '../modules/saasPlan/models/SaasPlan.model.js';
import { logger } from '../config/logger.js';

export const seedDefaultSaasPlan = async () => {
  try {
    const existingPlan = await SaasPlan.findOne({ slug: 'starter-trial' });
    if (!existingPlan) {
      await SaasPlan.create({
        name: 'Starter Trial',
        slug: 'starter-trial',
        monthlyPrice: 0,
        yearlyPrice: 0,
        maxMembers: 100,
        maxStaff: 5,
        maxBranches: 1,
        trialDays: 14,
        features: {
          workouts: true,
          attendance: true,
          trainers: true,
          broadcasts: false,
          whatsappReminder: false,
          reports: true,
          customDomain: false,
          multiBranch: false,
        },
        active: true
      });
      logger.info('Seeded default Starter Trial SaaS plan');
    }
  } catch (error) {
    logger.error('Failed to seed default SaaS plan:', error);
  }
};
