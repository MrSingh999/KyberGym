import createError from 'http-errors';
import { TrainerRepository } from './trainer.repository.js';
import { Member } from '../member/models/Member.model.js';
import { User } from '../users/models/User.model.js';
import { ROLES } from '../../shared/constants.js';
import { hashData } from '../auth/auth.utils.js';

export class TrainerService {
  static async createTrainer(gymId, userId, data) {
    const { fullName, email, phone, password, specialization } = data;

    const existing = await TrainerRepository.findProfileByUserId(gymId, userId);
    if (existing) throw createError.Conflict('Trainer already exists');

    const user = await TrainerRepository.createUser({
      gymId,
      name: fullName,
      email,
      phone,
      password: await hashData(password),
      role: ROLES.TRAINER,
      status: 'active',
    });

    try {
      const profile = await TrainerRepository.createProfile({
        gymId,
        userId: user._id,
        fullName,
        email,
        phone,
        specialization,
        joiningDate: new Date(),
        createdBy: userId,
      });

      const { password: _, ...userSafe } = user.toObject();
      return { ...profile, user: userSafe };
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  }

  static async getTrainers(gymId, query) {
    const result = await TrainerRepository.findAllProfiles(gymId, query);

    const enriched = await Promise.all(
      result.data.map(async (t) => {
        const user = await User.findById(t.userId)
          .select('-password -passwordResetOTP -passwordResetExpires -emailVerificationOTP -emailVerificationExpires -tokenVersion')
          .lean();
        return { ...t, user };
      })
    );

    return { data: enriched, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  }

  static async getTrainerById(id, gymId) {
    const profile = await TrainerRepository.findProfileById(id, gymId);
    if (!profile) throw createError.NotFound('Trainer not found');

    const user = await User.findById(profile.userId)
      .select('-password -passwordResetOTP -passwordResetExpires -emailVerificationOTP -emailVerificationExpires -tokenVersion')
      .lean();

    return { ...profile, user };
  }

  static async updateTrainer(id, gymId, data) {
    const profile = await TrainerRepository.findProfileById(id, gymId);
    if (!profile) throw createError.NotFound('Trainer not found');

    const allowed = {};
    if (data.fullName !== undefined) allowed.fullName = data.fullName;
    if (data.email !== undefined) allowed.email = data.email;
    if (data.phone !== undefined) allowed.phone = data.phone;
    if (data.specialization !== undefined) allowed.specialization = data.specialization;
    if (data.status !== undefined) allowed.status = data.status;

    const updated = await TrainerRepository.updateProfile(id, gymId, allowed);

    if (data.fullName || data.email || data.phone) {
      const userUpdate = {};
      if (data.fullName) userUpdate.name = data.fullName;
      if (data.email) userUpdate.email = data.email;
      if (data.phone) userUpdate.phone = data.phone;
      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(profile.userId, { $set: userUpdate });
      }
    }

    return updated;
  }

  static async deactivateTrainer(id, gymId) {
    const profile = await TrainerRepository.findProfileById(id, gymId);
    if (!profile) throw createError.NotFound('Trainer not found');

    const updated = await TrainerRepository.updateProfile(id, gymId, { status: 'INACTIVE' });

    await User.findByIdAndUpdate(profile.userId, { $set: { status: 'inactive' } });

    return updated;
  }

  static async activateTrainer(id, gymId) {
    const profile = await TrainerRepository.findProfileById(id, gymId);
    if (!profile) throw createError.NotFound('Trainer not found');

    const updated = await TrainerRepository.updateProfile(id, gymId, { status: 'ACTIVE' });

    await User.findByIdAndUpdate(profile.userId, { $set: { status: 'active' } });

    return updated;
  }

  static async assignMembers(gymId, trainerId, userId, data) {
    const { memberIds } = data;

    const profile = await TrainerRepository.findProfileById(trainerId, gymId);
    if (!profile) throw createError.NotFound('Trainer not found');
    if (profile.status !== 'ACTIVE') throw createError.BadRequest('Trainer is not active');

    const objectIds = memberIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
    const publicIds = memberIds.filter((id) => /^[A-Z]{2,5}-[A-Z2-9]{8}$/.test(id));

    const members = await Member.find({
      gymId,
      status: 'active',
      isDeleted: { $ne: true },
      $or: [
        { _id: { $in: objectIds } },
        { publicId: { $in: publicIds } },
      ],
    }).select('_id publicId').lean();

    if (members.length !== memberIds.length) {
      throw createError.BadRequest('One or more members not found or not active');
    }

    const memberObjectIds = members.map((m) => m._id);

    const existing = await TrainerRepository.findActiveAssignments(gymId, profile._id, memberObjectIds);
    const assignedSet = new Set(existing.map((a) => a.memberId.toString()));

    const toCreate = [];
    let skipped = 0;

    for (const mId of memberObjectIds) {
      const mid = mId.toString();
      if (assignedSet.has(mid)) {
        skipped++;
      } else {
        toCreate.push({
          gymId,
          trainerId: profile._id,
          memberId: mId,
          assignedBy: userId,
          assignedAt: new Date(),
          status: 'ACTIVE',
        });
      }
    }

    let created = [];
    if (toCreate.length > 0) {
      created = await TrainerRepository.createAssignments(toCreate);
    }

    return { assigned: created.length, skipped, failed: 0 };
  }

  static async getTrainerMembers(gymId, trainerId, query) {
    const profile = await TrainerRepository.findProfileById(trainerId, gymId);
    if (!profile) throw createError.NotFound('Trainer not found');
    return TrainerRepository.findTrainerMembers(gymId, profile._id, query);
  }

  static async removeMemberAssignment(gymId, assignmentId, userId) {
    const assignment = await TrainerRepository.findAssignmentById(assignmentId, gymId);
    if (!assignment) throw createError.NotFound('Assignment not found');
    return TrainerRepository.removeAssignment(assignmentId, gymId, userId);
  }

  static async getMyProfile(gymId, userId) {
    const profile = await TrainerRepository.findProfileByUserId(gymId, userId);
    if (!profile) throw createError.NotFound('Trainer profile not found');
    return profile;
  }

  static async updateMyProfile(gymId, userId, data) {
    const profile = await TrainerRepository.findProfileByUserId(gymId, userId);
    if (!profile) throw createError.NotFound('Trainer profile not found');

    const allowed = {};
    if (data.phone !== undefined) allowed.phone = data.phone;

    if (Object.keys(allowed).length === 0) return profile;

    const updated = await TrainerRepository.updateProfile(profile._id, gymId, allowed);

    if (data.phone) {
      await User.findByIdAndUpdate(profile.userId, { $set: { phone: data.phone } });
    }

    return updated;
  }

  static async getMyMembers(gymId, userId, query) {
    const profile = await TrainerRepository.findProfileByUserId(gymId, userId);
    if (!profile) throw createError.NotFound('Trainer profile not found');
    return TrainerRepository.findTrainerMembers(gymId, profile._id, query);
  }
}
