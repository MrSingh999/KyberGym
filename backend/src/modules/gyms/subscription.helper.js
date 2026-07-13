import { Gym } from './models/Gym.model.js';

export const checkSubscriptionStatus = async (gym) => {
  if (!gym || !gym.subscription) return gym;

  if (gym.subscription.expiresAt && new Date(gym.subscription.expiresAt) < new Date()) {
    if (gym.subscription.status !== 'expired') {
      gym.subscription.status = 'expired';
      await gym.save();
    }
  }

  return gym;
};

export const checkGymSubscription = async (gymId) => {
  const gym = await Gym.findById(gymId);
  if (!gym) return null;
  return checkSubscriptionStatus(gym);
};
