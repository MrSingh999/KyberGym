import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authConfig } from '../../config/env.js';
import { SuperAdmin } from './superAdmin.model.js';
import { compareData, hashData } from '../auth/auth.utils.js';
import { Gym } from '../gyms/models/Gym.model.js';
import { GymService } from '../gyms/gym.service.js';
import { Member } from '../member/models/Member.model.js';
import { MemberSubscription } from '../memberSubscription/models/MemberSubscription.model.js';
import { logger } from '../../config/logger.js';

export class SuperAdminService {

  static async login(email, password) {
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      throw createError.Unauthorized('Invalid email or password');
    }

    if (!superAdmin.isActive) {
      throw createError.Forbidden('Super Admin account is inactive');
    }

    const isMatch = await compareData(password, superAdmin.password);
    if (!isMatch) {
      throw createError.Unauthorized('Invalid email or password');
    }

    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    const token = jwt.sign(
      { id: superAdmin._id },
      authConfig.superAdminJwtSecret,
      { expiresIn: '1d' }
    );

    return { superAdmin, token };
  }

  static async getDashboard() {
    const [totalGyms, activeGyms, suspendedGyms, trialGyms, totalMembers, activeSubscriptions, expiredSubscriptions] = await Promise.all([
      Gym.countDocuments({ isDeleted: false }),
      Gym.countDocuments({ isDeleted: false, isActive: true }),
      Gym.countDocuments({ isDeleted: false, isActive: false }),
      Gym.countDocuments({ isDeleted: false, 'subscription.status': 'trial' }),
      Member.countDocuments({ isDeleted: false }),
      MemberSubscription.countDocuments({ status: 'active' }),
      MemberSubscription.countDocuments({ status: 'expired' }),
    ]);

    return {
      totalGyms,
      activeGyms,
      suspendedGyms,
      trialGyms,
      totalMembers,
      activeSubscriptions,
      expiredSubscriptions,
    };
  }

  static async getGyms(query) {
    const { page = 1, limit = 10, search, status, isActive } = query;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status) {
      filter['subscription.status'] = status;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const [gyms, total] = await Promise.all([
      Gym.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Gym.countDocuments(filter),
    ]);

    return {
      gyms,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getGymById(id) {
    const gym = await Gym.findById(id).lean();
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }
    return gym;
  }

  static async createGym(data) {
    const tempPassword = crypto.randomBytes(6).toString('hex') + 'A1!';

    const { gym, user } = await GymService.createGymWithAdmin({
      name: data.gymName,
      subdomain: data.subdomain,
      ownerName: data.ownerName,
      email: data.email,
      password: tempPassword,
      phone: data.phone,
    });

    logger.info(`Super Admin created Gym: ${gym._id}, Admin: ${user._id}`);

    return {
      gym,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      temporaryPassword: tempPassword,
    };
  }

  static async updateGym(id, data) {
    const gym = await Gym.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    return gym;
  }

  static async deleteGym(id) {
    const gym = await Gym.findById(id);
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    gym.isDeleted = true;
    gym.deletedAt = new Date();
    await gym.save();

    return gym;
  }

  static async suspendGym(id) {
    const gym = await Gym.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    return gym;
  }

  static async activateGym(id) {
    const gym = await Gym.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true }
    );

    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    return gym;
  }

  static async updateFeatures(id, features) {
    const update = {};
    for (const [key, value] of Object.entries(features)) {
      update[`features.${key}`] = value;
    }

    const gym = await Gym.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    return gym;
  }

  static async getSubscription(id) {
    const gym = await Gym.findById(id).select('subscription').lean();
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }
    return gym.subscription;
  }

  static async updateSubscription(id, data) {
    const update = {};
    if (data.status !== undefined) update['subscription.status'] = data.status;
    if (data.expiresAt !== undefined) update['subscription.expiresAt'] = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.trialEndsAt !== undefined) update['subscription.trialEndsAt'] = data.trialEndsAt ? new Date(data.trialEndsAt) : null;

    const gym = await Gym.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    return gym;
  }

  static async renewSubscription(id, data) {
    const gym = await Gym.findById(id);
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    let expiresAt;

    if (data.customDate) {
      expiresAt = new Date(data.customDate);
    } else {
      const days = parseInt(data.duration, 10) || 30;
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    gym.subscription.expiresAt = expiresAt;
    gym.subscription.status = 'active';
    await gym.save();

    return gym;
  }

  static async updateSubscriptionStatus(id, status) {
    const gym = await Gym.findByIdAndUpdate(
      id,
      { $set: { 'subscription.status': status } },
      { new: true, runValidators: true }
    );

    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    return gym;
  }

  static async manageTrial(id, data) {
    const gym = await Gym.findById(id);
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    if (data.action === 'start' || data.action === 'extend') {
      gym.subscription.trialEndsAt = data.trialEndsAt ? new Date(data.trialEndsAt) : null;
      gym.subscription.status = 'trial';
    } else if (data.action === 'end') {
      gym.subscription.trialEndsAt = null;
      gym.subscription.status = 'expired';
    }

    await gym.save();
    return gym;
  }
}
