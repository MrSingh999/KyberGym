import mongoose from 'mongoose';
import { WorkoutAssignment } from './models/WorkoutAssignment.model.js';

export class WorkoutAssignmentRepository {
  static async create(data) {
    return WorkoutAssignment.create(data);
  }

  static async bulkCreate(assignments) {
    return WorkoutAssignment.insertMany(assignments, { ordered: false });
  }

  static async findAll(gymId, { memberId, workoutId, status, search, sort, order, page, limit } = {}) {
    const filter = { gymId };

    if (memberId) filter.memberId = memberId;
    if (workoutId) filter.workoutId = workoutId;
    if (status) filter.status = status;

    if (search) {
      const esc = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const members = await mongoose.model('Member').find({
        gymId,
        $or: [
          { fullName: new RegExp(esc, 'i') },
          ...(isNaN(search) ? [] : [{ memberCode: search }]),
        ],
      }).select('_id');
      const memberIds = members.map(m => m._id);

      const workouts = await mongoose.model('Workout').find({
        gymId,
        title: new RegExp(esc, 'i'),
      }).select('_id');
      const workoutIds = workouts.map(w => w._id);

      filter.$or = [
        { memberId: { $in: memberIds } },
        { workoutId: { $in: workoutIds } },
      ];
    }

    let sortObj = { assignedAt: -1 };
    if (sort === 'assignedAt') {
      sortObj = { assignedAt: order === 'asc' ? 1 : -1 };
    }

    let query = WorkoutAssignment.find(filter)
      .populate('memberId', 'fullName email phone')
      .populate('workoutId', 'title goal category')
      .sort(sortObj);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      query.clone().skip(skip).limit(limitNum),
      WorkoutAssignment.countDocuments(filter),
    ]);

    return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return WorkoutAssignment.findOne(query)
      .populate('memberId', 'fullName email phone')
      .populate('workoutId', 'title goal category');
  }

  static async findActiveByWorkoutAndMembers(gymId, workoutId, memberIds) {
    return WorkoutAssignment.find({
      gymId,
      workoutId,
      memberId: { $in: memberIds },
      status: 'ACTIVE',
    }).select('memberId');
  }

  static async findActiveAssignment(gymId, memberId, workoutId) {
    return WorkoutAssignment.findOne({
      gymId,
      memberId,
      workoutId,
      status: 'ACTIVE',
    });
  }

  static async findActiveByMember(gymId, memberId) {
    return WorkoutAssignment.find({ gymId, memberId, status: 'ACTIVE' })
      .populate('workoutId', 'title goal category')
      .sort({ assignedAt: -1 });
  }

  static async update(id, gymId, data) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return WorkoutAssignment.findOneAndUpdate(query, data, { new: true, runValidators: true })
      .populate('memberId', 'fullName email phone')
      .populate('workoutId', 'title goal category');
  }

  static async softRemove(id, gymId, removedBy) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return WorkoutAssignment.findOneAndUpdate(
      query,
      { status: 'REMOVED', removedBy, removedAt: new Date() },
      { new: true }
    ).populate('memberId', 'fullName email phone')
     .populate('workoutId', 'title goal category');
  }
}
