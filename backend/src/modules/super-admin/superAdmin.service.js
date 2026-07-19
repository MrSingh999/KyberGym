import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { authConfig } from '../../config/env.js';
import { SuperAdmin } from './superAdmin.model.js';
import { compareData, hashData } from '../auth/auth.utils.js';
import { Gym } from '../gyms/models/Gym.model.js';
import { GymService } from '../gyms/gym.service.js';
import { User } from '../users/models/User.model.js';
import { Member } from '../member/models/Member.model.js';
import { MemberSubscription } from '../memberSubscription/models/MemberSubscription.model.js';
import { logger } from '../../config/logger.js';

const resolveGymId = async (id) => {
  if (!id) return id;
  if (mongoose.Types.ObjectId.isValid(id)) return id;
  const gym = await Gym.findOne({ publicId: id }).select('_id').lean();
  return gym ? gym._id : id;
};

const resolveUserId = async (id) => {
  if (!id) return id;
  if (mongoose.Types.ObjectId.isValid(id)) return id;
  const user = await User.findOne({ publicId: id }).select('_id').lean();
  return user ? user._id : id;
};

export class SuperAdminService {

  static async getProfile(superAdminId) {
    const superAdmin = await SuperAdmin.findById(superAdminId);
    if (!superAdmin) {
      throw createError.NotFound('Super Admin not found');
    }
    return superAdmin;
  }

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

    const filter = {};
    if (status === 'deleted') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = false;
      if (status) {
        filter['subscription.status'] = status;
      }
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
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
    id = await resolveGymId(id);
    const gym = await Gym.findById(id).populate('ownerId', 'name email phone publicId').lean();
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }
    return gym;
  }

  static async createGym(data) {
    const password = data.password || 'Admin@123';

    const { gym, user } = await GymService.createGymWithAdmin({
      name: data.gymName,
      subdomain: data.subdomain,
      ownerName: data.ownerName,
      email: data.email,
      password: password,
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
      temporaryPassword: password,
    };
  }

  static async updateGym(id, data) {
    id = await resolveGymId(id);
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
    id = await resolveGymId(id);
    const gym = await Gym.findById(id);
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    const timestamp = Date.now();
    gym.isDeleted = true;
    gym.deletedAt = new Date(timestamp);
    
    // Release subdomain and slug so they can be reused
    if (gym.subdomain) {
      gym.subdomain = `${gym.subdomain}-deleted-${timestamp}`;
    }
    if (gym.slug) {
      gym.slug = `${gym.slug}-deleted-${timestamp}`;
    }

    await gym.save();

    return gym;
  }

  static async restoreGym(id) {
    id = await resolveGymId(id);
    const gym = await Gym.findById(id);
    if (!gym) {
      throw createError.NotFound('Gym not found');
    }
    if (gym.isDeleted) { // wait, wait! original had: if (!gym.isDeleted)
      // wait, let's keep original condition intact
    }
    // Let's just resolve the id at start
    return SuperAdminService._restoreGymInner(id);
  }

  static async _restoreGymInner(id) {
    const gym = await Gym.findById(id);
    if (!gym) {
      throw createError.NotFound('Gym not found');
    }
    if (!gym.isDeleted) {
      throw createError.BadRequest('Gym is not deleted');
    }

    // Strip the deleted suffix to find the original subdomain
    let originalSubdomain = gym.subdomain || '';
    if (originalSubdomain.includes('-deleted-')) {
      originalSubdomain = originalSubdomain.split('-deleted-')[0];
    }

    // Check if another active gym is using this subdomain
    const conflictingGym = await Gym.findOne({
      subdomain: originalSubdomain,
      isDeleted: false,
    });
    if (conflictingGym) {
      throw createError.Conflict('Original subdomain is already taken by another active gym');
    }

    // Restore the gym
    gym.isDeleted = false;
    gym.deletedAt = null;
    gym.subdomain = originalSubdomain;
    gym.slug = originalSubdomain;

    await gym.save();

    return gym;
  }

  static async permanentDeleteGym(id) {
    id = await resolveGymId(id);
    const gym = await Gym.findById(id);
    if (!gym) {
      throw createError.NotFound('Gym not found');
    }

    // Cascading delete
    await Promise.all([
      Gym.findByIdAndDelete(id),
      User.deleteMany({ gymId: id }),
      Member.deleteMany({ gymId: id }),
      MemberSubscription.deleteMany({ gymId: id }),
    ]);

    logger.info(`Super Admin permanently deleted Gym: ${gym._id} (${gym.name})`);

    return gym;
  }

  static async suspendGym(id) {
    id = await resolveGymId(id);
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
    id = await resolveGymId(id);
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
    id = await resolveGymId(id);
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
    id = await resolveGymId(id);
    const gym = await Gym.findById(id).select('subscription').lean();
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }
    return gym.subscription;
  }

  static async updateSubscription(id, data) {
    id = await resolveGymId(id);
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
    id = await resolveGymId(id);
    const gym = await Gym.findById(id);
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    const startDate = new Date(data.startDate);
    const expiresAt = new Date(data.expiresAt);
    const amountPaid = Number(data.amountPaid) || 0;
    const duration = Number(data.duration) || 0;

    gym.subscription.startDate = startDate;
    gym.subscription.expiresAt = expiresAt;
    gym.subscription.status = 'active';

    if (!gym.subscriptionHistory) {
      gym.subscriptionHistory = [];
    }

    gym.subscriptionHistory.push({
      startDate,
      expiresAt,
      amountPaid,
      duration,
      paymentDate: new Date(),
      renewedAt: new Date(),
    });

    await gym.save();

    return gym;
  }

  static async updateSubscriptionStatus(id, status) {
    id = await resolveGymId(id);
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
    id = await resolveGymId(id);
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

  // ── User Management per Gym ──────────────────────────────────────────────

  static async getGymUsers(gymId, query) {
    gymId = await resolveGymId(gymId);
    await SuperAdminService._ensureGymExists(gymId);

    const { page = 1, limit = 20, search, role, status } = query;
    const skip = (page - 1) * limit;

    const filter = { gymId, isDeleted: false };
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -passwordResetOTP -passwordResetExpires -emailVerificationOTP -emailVerificationExpires -tokenVersion')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getGymUserById(gymId, userId) {
    gymId = await resolveGymId(gymId);
    userId = await resolveUserId(userId);
    await SuperAdminService._ensureGymExists(gymId);

    const user = await User.findOne({ _id: userId, gymId, isDeleted: false })
      .select('-password -passwordResetOTP -passwordResetExpires -emailVerificationOTP -emailVerificationExpires -tokenVersion')
      .lean();
    if (!user) throw createError.NotFound('User not found');
    return user;
  }

  static async updateGymUser(gymId, userId, data) {
    gymId = await resolveGymId(gymId);
    userId = await resolveUserId(userId);
    await SuperAdminService._ensureGymExists(gymId);

    const allowedFields = ['name', 'email', 'phone', 'role', 'status', 'avatar'];
    const update = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        update[key] = data[key];
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, gymId, isDeleted: false },
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password -passwordResetOTP -passwordResetExpires -emailVerificationOTP -emailVerificationExpires -tokenVersion');

    if (!user) throw createError.NotFound('User not found');
    return user;
  }

  static async deleteGymUser(gymId, userId) {
    gymId = await resolveGymId(gymId);
    userId = await resolveUserId(userId);
    await SuperAdminService._ensureGymExists(gymId);

    const user = await User.findOne({ _id: userId, gymId, isDeleted: false });
    if (!user) throw createError.NotFound('User not found');

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    return user;
  }

  static async _ensureGymExists(gymId) {
    gymId = await resolveGymId(gymId);
    const gym = await Gym.findById(gymId).lean();
    if (!gym || gym.isDeleted) throw createError.NotFound('Gym not found');
  }
}
