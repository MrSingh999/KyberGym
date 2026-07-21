import mongoose from 'mongoose';
import { TrainerProfile } from './models/TrainerProfile.model.js';
import { TrainerMemberAssignment } from './models/TrainerMemberAssignment.model.js';
import { User } from '../users/models/User.model.js';
import { ROLES } from '../../shared/constants.js';

export class TrainerRepository {
  static async createProfile(data) {
    return TrainerProfile.create(data);
  }

  static async createUser(data) {
    return User.create(data);
  }

  static async findAllProfiles(gymId, { search, status, sort, order, page, limit } = {}) {
    const match = { gymId: new mongoose.Types.ObjectId(gymId) };

    if (status) match.status = status;
    if (search) {
      const esc = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      match.$or = [
        { fullName: new RegExp(esc, 'i') },
        { email: new RegExp(esc, 'i') },
        { phone: new RegExp(esc, 'i') },
        { specialization: new RegExp(esc, 'i') },
      ];
    }

    let sortStage = { createdAt: -1 };
    if (sort === 'fullName') sortStage = { fullName: order === 'asc' ? 1 : -1 };
    else if (sort === 'joiningDate') sortStage = { joiningDate: order === 'asc' ? 1 : -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'trainermemberassignments',
          let: { trainerId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ['$trainerId', '$$trainerId'] },
              { $eq: ['$status', 'ACTIVE'] },
            ] } } },
            { $count: 'count' },
          ],
          as: 'assignmentCount',
        },
      },
      {
        $addFields: {
          memberCount: {
            $ifNull: [{ $arrayElemAt: ['$assignmentCount.count', 0] }, 0],
          },
        },
      },
      { $project: { assignmentCount: 0 } },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const countPipeline = [
      { $match: match },
      { $count: 'total' },
    ];

    const [data, countResult] = await Promise.all([
      TrainerProfile.aggregate(pipeline),
      TrainerProfile.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total ?? 0;

    return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  static async findProfileById(id, gymId) {
    const query = { gymId: new mongoose.Types.ObjectId(gymId) };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = new mongoose.Types.ObjectId(id);
    } else {
      query.publicId = id;
    }

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'trainermemberassignments',
          let: { trainerId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ['$trainerId', '$$trainerId'] },
              { $eq: ['$status', 'ACTIVE'] },
            ] } } },
            { $count: 'count' },
          ],
          as: 'assignmentCount',
        },
      },
      {
        $addFields: {
          memberCount: {
            $ifNull: [{ $arrayElemAt: ['$assignmentCount.count', 0] }, 0],
          },
        },
      },
      { $project: { assignmentCount: 0 } },
    ];

    const results = await TrainerProfile.aggregate(pipeline);
    return results[0] || null;
  }

  static async findProfileByUserId(gymId, userId) {
    const pipeline = [
      { $match: { gymId: new mongoose.Types.ObjectId(gymId), userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'trainermemberassignments',
          let: { trainerId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ['$trainerId', '$$trainerId'] },
              { $eq: ['$status', 'ACTIVE'] },
            ] } } },
            { $count: 'count' },
          ],
          as: 'assignmentCount',
        },
      },
      {
        $addFields: {
          memberCount: {
            $ifNull: [{ $arrayElemAt: ['$assignmentCount.count', 0] }, 0],
          },
        },
      },
      { $project: { assignmentCount: 0 } },
    ];

    const results = await TrainerProfile.aggregate(pipeline);
    return results[0] || null;
  }

  static async updateProfile(id, gymId, data) {
    const query = { gymId: new mongoose.Types.ObjectId(gymId) };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = new mongoose.Types.ObjectId(id);
    } else {
      query.publicId = id;
    }
    return TrainerProfile.findOneAndUpdate(query, { $set: data }, { new: true, runValidators: true }).lean();
  }

  static async createAssignments(assignments) {
    return TrainerMemberAssignment.insertMany(assignments, { ordered: false });
  }

  static async findActiveAssignments(gymId, trainerId, memberIds) {
    return TrainerMemberAssignment.find({
      gymId, trainerId, memberId: { $in: memberIds }, status: 'ACTIVE',
    }).select('memberId').lean();
  }

  static async findTrainerMembers(gymId, trainerId, { page, limit } = {}) {
    const filter = { gymId, trainerId, status: 'ACTIVE' };
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      TrainerMemberAssignment.find(filter)
        .populate('memberId', 'fullName email phone memberCode status')
        .sort({ assignedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      TrainerMemberAssignment.countDocuments(filter),
    ]);

    return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  static async findAssignmentById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return TrainerMemberAssignment.findOne(query).lean();
  }

  static async removeAssignment(id, gymId, removedBy) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return TrainerMemberAssignment.findOneAndUpdate(
      query,
      { status: 'INACTIVE', removedBy, removedAt: new Date() },
      { new: true }
    ).lean();
  }

  static async findMemberActiveAssignments(gymId, memberIds) {
    return TrainerMemberAssignment.find({
      gymId, memberId: { $in: memberIds }, status: 'ACTIVE',
    }).select('memberId trainerId').lean();
  }
}
