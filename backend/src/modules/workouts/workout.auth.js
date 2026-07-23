import createError from 'http-errors';
import { ADMIN_ROLES } from './workout.constants.js';

/**
 * Assert that the user is authorized to modify the given workout.
 * - Admin roles (gym_admin, staff, super_admin): full access to any workout.
 * - Trainer: only own workouts.
 * - All others: forbidden.
 */
export function assertWorkoutOwnership(workout, user) {
  if (ADMIN_ROLES.includes(user.role)) return;
  if (user.role === 'trainer') {
    if (!workout.createdBy.equals(user._id)) {
      throw createError.Forbidden('You can only modify your own workouts');
    }
    return;
  }
  throw createError.Forbidden('Insufficient permissions');
}
