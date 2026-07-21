import mongoose from 'mongoose';
import { Workout } from './models/Workout.model.js';

export class WorkoutRepository {
  static async create(data) {
    return Workout.create(data);
  }

  static async findAll(gymId, { status, search, sort, order, isDeleted } = {}) {
    const filter = { gymId };

    if (isDeleted !== undefined) {
      filter.isDeleted = isDeleted;
    } else {
      filter.isDeleted = false;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: regex },
        { goal: regex },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'title') {
      sortObj = { title: order === 'asc' ? 1 : -1 };
    } else if (sort === 'createdAt') {
      sortObj = { createdAt: order === 'asc' ? 1 : -1 };
    } else if (sort === 'updatedAt') {
      sortObj = { updatedAt: order === 'asc' ? 1 : -1 };
    }

    return Workout.find(filter).sort(sortObj);
  }

  static async findById(id, gymId) {
    const query = { gymId, isDeleted: false };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Workout.findOne(query);
  }

  static async findByIdIncludingDeleted(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Workout.findOne(query);
  }

  static async update(id, gymId, data) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Workout.findOneAndUpdate(
      query,
      data,
      { new: true, runValidators: true }
    );
  }

  static async softDelete(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Workout.findOneAndUpdate(
      query,
      { isDeleted: true },
      { new: true }
    );
  }

  static async findByOriginalName(gymId, name) {
    return Workout.find({
      gymId,
      title: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
      isDeleted: false,
    });
  }

  static async findForMember(gymId, memberId) {
    return Workout.find({
      gymId,
      isDeleted: false,
      status: 'ACTIVE',
      $or: [
        { assignmentType: 'ALL' },
        { assignmentType: 'SELECTED', assignedMembers: memberId },
      ],
    }).sort({ createdAt: -1 });
  }
}
