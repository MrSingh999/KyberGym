import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { authConfig } from '../../config/env.js';
import { SuperAdmin } from './superAdmin.model.js';
import { compareData, hashData } from '../auth/auth.utils.js';
import { Gym } from '../gyms/models/Gym.model.js';
import { GymService } from '../gyms/gym.service.js';
import { GymSubscriptionRepository } from '../gymSubscription/gymSubscription.repository.js';
import { GymSubscriptionPaymentRepository } from '../gymSubscriptionPayment/gymSubscriptionPayment.repository.js';
import { User } from '../users/models/User.model.js';
import { ROLES } from '../../shared/constants.js';
import { Member } from '../member/models/Member.model.js';
import { MemberSubscription } from '../memberSubscription/models/MemberSubscription.model.js';
import { logger } from '../../config/logger.js';

const VALID_TRANSITIONS = {
  trial: ['active', 'suspended'],
  active: ['expired', 'suspended'],
  expired: ['suspended'],
  suspended: ['active', 'expired'],
};

function validateTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return;
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw createError.BadRequest(
      `Invalid subscription status transition: ${currentStatus} → ${newStatus}. ` +
      `Allowed transitions from ${currentStatus}: ${(allowed || []).join(', ')}`
    );
  }
}

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
      GymSubscriptionRepository.countByStatus('trial'),
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

    let gymFilter = { isDeleted: false };

    if (status) {
      if (status === 'deleted') {
        gymFilter.isDeleted = true;
      } else {
        const gymIds = await GymSubscriptionRepository.findGymIdsByStatus(status);
        gymFilter._id = { $in: gymIds };
      }
    }

    if (search) {
      gymFilter.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      gymFilter.isActive = isActive === 'true';
    }

    const [gyms, total] = await Promise.all([
      Gym.find(gymFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Gym.countDocuments(gymFilter),
    ]);

    const gymIds = gyms.map(g => g._id);
    const subscriptions = await GymSubscriptionRepository.findByGymIds(gymIds);
    const subMap = {};
    for (const sub of subscriptions) {
      subMap[sub.gymId.toString()] = sub;
    }

    const gymsWithSubscription = gyms.map(g => ({
      ...g,
      subscription: subMap[g._id.toString()] || null,
    }));

    return {
      gyms: gymsWithSubscription,
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
    const subscription = await GymSubscriptionRepository.findOrCreate(id);
    return { ...gym, subscription };
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

    let originalSubdomain = gym.subdomain || '';
    if (originalSubdomain.includes('-deleted-')) {
      originalSubdomain = originalSubdomain.split('-deleted-')[0];
    }

    const conflictingGym = await Gym.findOne({
      subdomain: originalSubdomain,
      isDeleted: false,
    });
    if (conflictingGym) {
      throw createError.Conflict('Original subdomain is already taken by another active gym');
    }

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

    await Promise.all([
      Gym.findByIdAndDelete(id),
      GymSubscriptionRepository.deleteByGymId(id),
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
    const subscription = await GymSubscriptionRepository.findOrCreate(id);
    return subscription;
  }

  static async updateSubscription(id, data) {
    id = await resolveGymId(id);
    const updateData = {};
    if (data.status !== undefined) {
      const current = await GymSubscriptionRepository.findByGymId(id);
      if (current) validateTransition(current.status, data.status);
      updateData.status = data.status;
    }
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.trialEndsAt !== undefined) updateData.trialEndsAt = data.trialEndsAt ? new Date(data.trialEndsAt) : null;

    const subscription = await GymSubscriptionRepository.upsert(id, updateData);
    if (!subscription) throw createError.NotFound('Gym subscription not found');

    return subscription;
  }

  static async renewSubscription(id, data, performedBy = null) {
    id = await resolveGymId(id);
    const gym = await Gym.findById(id);
    if (!gym || gym.isDeleted) {
      throw createError.NotFound('Gym not found');
    }

    const startDate = new Date(data.startDate);
    const expiresAt = new Date(data.expiresAt);
    const amountPaid = Number(data.amountPaid) || 0;
    const duration = Number(data.duration) || 0;

    const subscription = await GymSubscriptionRepository.upsert(id, {
      startDate,
      expiresAt,
      status: 'active',
    });

    const notes = data.notes || `Renewal: ${duration} days`;

    await GymSubscriptionPaymentRepository.create({
      gymId: id,
      subscriptionId: `GSUB-${subscription.publicId.split('-')[1] || id}`,
      amount: amountPaid,
      paymentMethod: data.paymentMethod || 'cash',
      paymentReference: data.paymentReference,
      paymentDate: new Date(),
      status: 'completed',
      paymentProvider: 'manual',
      receivedBy: performedBy,
      notes,
    });

    return subscription;
  }

  static async updateSubscriptionStatus(id, status) {
    id = await resolveGymId(id);
    const current = await GymSubscriptionRepository.findByGymId(id);
    if (current) validateTransition(current.status, status);
    const subscription = await GymSubscriptionRepository.updateByGymId(id, { status });
    if (!subscription) throw createError.NotFound('Gym not found');
    return subscription;
  }

  static async manageTrial(id, data) {
    id = await resolveGymId(id);
    const current = await GymSubscriptionRepository.findByGymId(id);
    const updateData = {};

    if (data.action === 'start' || data.action === 'extend') {
      validateTransition(current?.status || 'trial', 'trial');
      updateData.trialEndsAt = data.trialEndsAt ? new Date(data.trialEndsAt) : null;
      updateData.status = 'trial';
    } else if (data.action === 'end') {
      if (current && current.status !== 'trial') {
        throw createError.BadRequest('Can only end trial when status is trial');
      }
      updateData.trialEndsAt = null;
      updateData.status = 'expired';
    }

    const subscription = await GymSubscriptionRepository.upsert(id, updateData);
    return subscription;
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

    const currentUser = await User.findOne({ _id: userId, gymId, isDeleted: false })
      .select('role status').lean();
    if (!currentUser) throw createError.NotFound('User not found');

    const willLeaveAdmin = (
      currentUser.role === ROLES.GYM_ADMIN &&
      currentUser.status === 'active' &&
      (update.status === 'inactive' || (update.role && update.role !== ROLES.GYM_ADMIN))
    );

    if (willLeaveAdmin) {
      const activeAdminCount = await User.countDocuments({
        gymId,
        role: ROLES.GYM_ADMIN,
        status: 'active',
        isDeleted: false,
        _id: { $ne: currentUser._id },
      });
      if (activeAdminCount === 0) {
        throw createError.BadRequest(
          'Cannot deactivate or change role of the last active gym administrator. The gym must have at least one active admin.'
        );
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
