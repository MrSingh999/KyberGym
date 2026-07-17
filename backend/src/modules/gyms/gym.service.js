import mongoose from 'mongoose';
import createError from 'http-errors';
import { Gym } from './models/Gym.model.js';
import { User } from '../users/models/User.model.js';
import { ROLES } from '../../shared/constants.js';
import { hashData } from '../auth/auth.utils.js';

export class GymService {

  static async getMyGym(gymId) {
    const query = {};
    if (mongoose.Types.ObjectId.isValid(gymId)) {
      query._id = gymId;
    } else {
      query.publicId = gymId;
    }
    const gym = await Gym.findOne(query).lean();
    if (!gym || gym.isDeleted) throw createError.NotFound('Gym not found');
    return gym;
  }

  static async updateMyGym(gymId, data) {
    const allowedFields = ['name', 'timezone', 'currency', 'language'];
    const update = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        update[key] = data[key];
      }
    }
    const query = {};
    if (mongoose.Types.ObjectId.isValid(gymId)) {
      query._id = gymId;
    } else {
      query.publicId = gymId;
    }
    const gym = await Gym.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!gym || gym.isDeleted) throw createError.NotFound('Gym not found');
    return gym;
  }

  static async getBranding(gymId) {
    const query = {};
    if (mongoose.Types.ObjectId.isValid(gymId)) {
      query._id = gymId;
    } else {
      query.publicId = gymId;
    }
    const gym = await Gym.findOne(query).select('branding');
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

    const query = {};
    if (mongoose.Types.ObjectId.isValid(gymId)) {
      query._id = gymId;
    } else {
      query.publicId = gymId;
    }
    const gym = await Gym.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, runValidators: true }
    ).select('branding');

    if (!gym) throw createError.NotFound('Gym not found');
    return gym.branding;
  }

  static async createGymWithAdmin(data) {
    try {
      return await GymService._createGymWithAdminInner(data, true);
    } catch (error) {
      if (error.message && (error.message.includes('Transaction numbers') || error.message.includes('replica set'))) {
        console.log("Fallback: MongoDB replica set not active. Retrying gym creation without transaction.");
        return await GymService._createGymWithAdminInner(data, false);
      }
      throw error;
    }
  }

  static async _createGymWithAdminInner(data, useTransaction) {
    let session = null;
    if (useTransaction) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch (e) {
        useTransaction = false;
      }
    }

    try {
      const existingGym = await Gym.findOne({ subdomain: data.subdomain }).session(useTransaction ? session : null);
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

      await gym.save(useTransaction ? { session } : undefined);

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

      await user.save(useTransaction ? { session } : undefined);

      if (useTransaction && session) {
        await session.commitTransaction();
        session.endSession();
      }

      return { gym, user };
    } catch (error) {
      if (useTransaction && session) {
        try {
          await session.abortTransaction();
          session.endSession();
        } catch (e) {
          // ignore session abort errors during failure cleanup
        }
      }

      if (error.code === 11000) {
        throw createError.Conflict('Subdomain is already taken');
      }
      throw error;
    }
  }
}
