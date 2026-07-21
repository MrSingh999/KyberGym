import mongoose from 'mongoose';
import { MemberWorkoutPlan } from './models/MemberWorkoutPlan.model.js';
import { MemberWorkoutPlanDay } from './models/MemberWorkoutPlanDay.model.js';
import { TRAINER_CONFIG } from '../trainer/trainer.constants.js';

export class MemberWorkoutPlanRepository {
  static async create(data) {
    return MemberWorkoutPlan.create(data);
  }

  static async findAll(gymId, { search, trainerId, memberId, status, sort, order, page, limit } = {}) {
    const match = { gymId };

    if (trainerId) match.trainerId = new mongoose.Types.ObjectId(trainerId);
    if (memberId) match.memberId = new mongoose.Types.ObjectId(memberId);
    if (status) match.status = status;
    if (search) {
      const esc = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      match.$or = [
        { title: new RegExp(esc, 'i') },
      ];
    }

    let sortStage = { updatedAt: -1 };
    if (sort === 'createdAt') sortStage = { createdAt: order === 'asc' ? 1 : -1 };
    else if (sort === 'updatedAt') sortStage = { updatedAt: order === 'asc' ? 1 : -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(TRAINER_CONFIG.MAX_PAGE_SIZE, Math.max(1, parseInt(limit, 10) || TRAINER_CONFIG.DEFAULT_PAGE_SIZE));
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'members',
          localField: 'memberId',
          foreignField: '_id',
          as: 'member',
        },
      },
      { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'trainerprofiles',
          localField: 'trainerId',
          foreignField: '_id',
          as: 'trainer',
        },
      },
      { $unwind: { path: '$trainer', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          memberName: '$member.fullName',
          trainerName: '$trainer.fullName',
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const countPipeline = [
      { $match: match },
      { $count: 'total' },
    ];

    const [data, countResult] = await Promise.all([
      MemberWorkoutPlan.aggregate(pipeline),
      MemberWorkoutPlan.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total ?? 0;
    return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = new mongoose.Types.ObjectId(id);
    } else {
      query.publicId = id;
    }
    return MemberWorkoutPlan.findOne(query).lean();
  }

  static async findByTrainer(gymId, trainerId, query = {}) {
    return this.findAll(gymId, { ...query, trainerId });
  }

  static async findByMember(gymId, memberId, query = {}) {
    return this.findAll(gymId, { ...query, memberId });
  }

  static async update(id, gymId, data) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = new mongoose.Types.ObjectId(id);
    } else {
      query.publicId = id;
    }
    return MemberWorkoutPlan.findOneAndUpdate(query, { $set: data }, { new: true, runValidators: true }).lean();
  }

  static async archive(id, gymId, userId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = new mongoose.Types.ObjectId(id);
    } else {
      query.publicId = id;
    }
    return MemberWorkoutPlan.findOneAndUpdate(
      query,
      { $set: { status: 'ARCHIVED', archivedBy: userId, archivedAt: new Date() } },
      { new: true }
    ).lean();
  }
}
