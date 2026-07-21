import { GymSubscriptionRepository } from '../gymSubscription/gymSubscription.repository.js';

export const checkAndUpdateExpiry = async (gymId) => {
  const sub = await GymSubscriptionRepository.findOrCreate(gymId);
  if (!sub) return null;

  if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) {
    if (sub.status !== 'expired') {
      await GymSubscriptionRepository.updateByGymId(gymId, { status: 'expired' });
      sub.status = 'expired';
    }
  }

  return sub;
};
