import { Member } from './models/Member.model.js';

export class MemberRepository {
  static async create(data) {
    return Member.create(data);
  }

  static async findById(id, gymId) {
    return Member.findOne({ _id: id, gymId, isDeleted: false });
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
    return Member.findOneAndUpdate({ _id: id, gymId, isDeleted: false }, updateData, { new: true });
  }

  static async checkExists(gymId, email) {
    return Member.exists({ gymId, email, isDeleted: false });
  }
}
