import { MemberRepository } from './member.repository.js';
import { User } from '../users/models/User.model.js';
import { ROLES } from '../../shared/constants.js';
import { hashData } from '../auth/auth.utils.js';
import { escapeRegex } from '../../shared/constants.js';
import createError from 'http-errors';

const DEFAULT_MEMBER_PASSWORD = 'Member@123';

export class MemberService {
  static async createMember(gymId, userId, data) {
    // Optional: Ensure email is unique within the gym if provided
    if (data.email) {
      const exists = await MemberRepository.checkExists(gymId, data.email);
      if (exists) {
        throw createError.Conflict('A member with this email already exists in this gym');
      }
      const userExists = await User.findOne({ gymId, email: data.email });
      if (userExists) {
        throw createError.Conflict('A user with this email already exists in this gym');
      }
    }

    // Convert empty strings to undefined for dates
    if (data.dateOfBirth === '') delete data.dateOfBirth;

    // Separate login credentials from member data
    const { password, ...memberData } = data;

    // Create the Member document
    const member = await MemberRepository.create({ 
      ...memberData, 
      gymId, 
      createdBy: userId 
    });

    // Create a linked User account for login if email is provided
    let user = null;
    if (data.email) {
      const userPassword = password || DEFAULT_MEMBER_PASSWORD;
      const hashedPassword = await hashData(userPassword);

      user = await User.create({
        gymId,
        role: ROLES.MEMBER,
        name: data.fullName,
        email: data.email,
        password: hashedPassword,
        memberId: member._id,
      });

      // Link the User back to the Member
      member.userId = user._id;
      await member.save();
    }

    return { member, user, defaultPassword: password ? undefined : DEFAULT_MEMBER_PASSWORD };
  }

  static async getMembers(gymId, query) {
    const { page = 1, limit = 10, search, status } = query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    return MemberRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getMemberById(id, gymId) {
    const member = await MemberRepository.findById(id, gymId);
    if (!member) {
      throw createError.NotFound('Member not found');
    }
    return member;
  }

  static async updateMember(id, gymId, userId, data) {
    // If email changed, check uniqueness
    if (data.email) {
      const existing = await MemberRepository.checkExists(gymId, data.email);
      const current = await this.getMemberById(id, gymId);
      if (existing && current.email !== data.email) {
        throw createError.Conflict('Email is already in use by another member');
      }
    }

    if (data.dateOfBirth === '') delete data.dateOfBirth;

    const member = await MemberRepository.update(id, gymId, {
      ...data,
      updatedBy: userId
    });

    if (!member) {
      throw createError.NotFound('Member not found');
    }
    return member;
  }

  static async deleteMember(id, gymId, userId) {
    // Soft delete
    const member = await MemberRepository.update(id, gymId, { 
      isDeleted: true, 
      deletedAt: new Date(),
      updatedBy: userId 
    });
    
    if (!member) {
      throw createError.NotFound('Member not found');
    }
    return member;
  }

  static async getMemberByUserId(gymId, userId) {
    const member = await MemberRepository.findByUserId(gymId, userId);
    if (!member) {
      throw createError.NotFound('Member profile not found');
    }
    return member;
  }
}
