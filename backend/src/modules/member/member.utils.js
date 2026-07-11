import { nanoid } from 'nanoid';
import { Gym } from '../gyms/models/Gym.model.js';

export const generateMemberCode = async (gymId) => {
  // E.g. fetch Gym to use name prefix. Fallback to 'GYM'
  const gym = await Gym.findById(gymId);
  const prefix = gym && gym.name ? gym.name.substring(0, 4).toUpperCase() : 'GYM';
  
  // Create a 5 character alphanumeric nanoid
  const uniqueId = nanoid(5).toUpperCase();
  
  return `${prefix}-${uniqueId}`;
};
