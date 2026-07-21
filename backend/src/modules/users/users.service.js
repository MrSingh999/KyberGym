import createError from 'http-errors';
import mongoose from 'mongoose';
import { User } from './models/User.model.js';
import { ROLES } from '../../shared/constants.js';

export class UserService {

  static async listUsers(gymId, query) {
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
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(gymId, userId) {
    const query = { gymId, isDeleted: false };
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query._id = userId;
    } else {
      query.publicId = userId;
    }
    const user = await User.findOne(query)
      .select('-password -passwordResetOTP -passwordResetExpires -emailVerificationOTP -emailVerificationExpires -tokenVersion')
      .lean();
    if (!user) throw createError.NotFound('User not found');
    return user;
  }

  static async updateUser(gymId, userId, data) {
    const allowedFields = ['name', 'email', 'phone', 'role', 'status', 'avatar'];
    const update = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        update[key] = data[key];
      }
    }

    const query = { gymId, isDeleted: false };
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query._id = userId;
    } else {
      query.publicId = userId;
    }

    const currentUser = await User.findOne(query).select('role status').lean();
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
      query,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password -passwordResetOTP -passwordResetExpires -emailVerificationOTP -emailVerificationExpires -tokenVersion');

    if (!user) throw createError.NotFound('User not found');
    return user;
  }

  static async deleteUser(gymId, userId) {
    const query = { gymId, isDeleted: false };
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query._id = userId;
    } else {
      query.publicId = userId;
    }
    const user = await User.findOne(query);
    if (!user) throw createError.NotFound('User not found');

    if (user.role === ROLES.GYM_ADMIN) {
      throw createError.Forbidden('Cannot delete a gym admin. Transfer ownership or use super admin.');
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    return user;
  }
}
