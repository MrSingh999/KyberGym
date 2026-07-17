import mongoose from 'mongoose';
import { Member } from './models/Member.model.js';

export class MemberRepository {
  static async create(data) {
    return Member.create(data);
  }

  static async findById(id, gymId) {
    const query = { gymId, isDeleted: false };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Member.findOne(query);
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, isDeleted: false, ...filter };
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      Member.find(query).sort({ joinDate: -1 }).skip(skip).limit(limit),
      Member.countDocuments(query)
    ]);

    return {
      data: members,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, gymId, updateData) {
    const query = { gymId, isDeleted: false };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Member.findOneAndUpdate(query, updateData, { new: true });
  }

  static async checkExists(gymId, email) {
    return Member.exists({ gymId, email, isDeleted: false });
  }

  static async findByUserId(gymId, userId) {
    return Member.findOne({ gymId, userId, isDeleted: false });
  }
}
