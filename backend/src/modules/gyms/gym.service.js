import createError from 'http-errors';
import { Gym } from './models/Gym.model.js';

export class GymService {

  static async getBranding(gymId) {
    const gym = await Gym.findById(gymId).select('branding');
    if (!gym) throw createError.NotFound('Gym not found');
    return gym.branding || {};
  }

  static async updateBranding(gymId, data) {
    const allowedFields = ['appName', 'logo', 'favicon', 'primaryColor', 'secondaryColor', 'loginBanner'];

    const update = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        update[`branding.${key}`] = data[key];
      }
    }

    const gym = await Gym.findByIdAndUpdate(
      gymId,
      { $set: update },
      { new: true, runValidators: true }
    ).select('branding');

    if (!gym) throw createError.NotFound('Gym not found');
    return gym.branding;
  }
}
