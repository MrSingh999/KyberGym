import mongoose from 'mongoose';
import createError from 'http-errors';
import { Gym } from './models/Gym.model.js';
import { User } from '../users/models/User.model.js';
import { ROLES } from '../../shared/constants.js';
import { hashData } from '../auth/auth.utils.js';

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

  static async createGymWithAdmin(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingGym = await Gym.findOne({ subdomain: data.subdomain }).session(session);
      if (existingGym) {
        throw createError.Conflict('Subdomain is already taken');
      }

      const gym = new Gym({
        name: data.name,
        slug: data.subdomain,
        subdomain: data.subdomain,
        ownerId: new mongoose.Types.ObjectId(),
        features: data.features || {
          members: true,
          workouts: true,
          notifications: true,
          attendance: false,
          branding: false,
        },
      });

      await gym.save({ session });

      const hashedPassword = await hashData(data.password);
      const user = new User({
        _id: gym.ownerId,
        gymId: gym._id,
        role: ROLES.GYM_ADMIN,
        name: data.ownerName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
      });

      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { gym, user };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (error.code === 11000) {
        throw createError.Conflict('Subdomain is already taken');
      }
      throw error;
    }
  }
}
