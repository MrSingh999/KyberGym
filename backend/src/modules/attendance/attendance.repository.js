import mongoose from 'mongoose';
import { Attendance } from './models/Attendance.model.js';

export class AttendanceRepository {
  static async create(data) {
    return Attendance.create(data);
  }

  static async findById(id, gymId) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Attendance.findOne(query)
      .populate('memberId', 'fullName memberCode profilePhoto phone status')
      .populate('markedBy', 'fullName');
  }

  static async findPaginated(gymId, filter = {}, page = 1, limit = 10, sort = { date: -1 }) {
    const skip = (page - 1) * limit;
    const { $or, ...matchFilter } = filter;
    const baseMatch = { gymId: new mongoose.Types.ObjectId(gymId), ...matchFilter };

    const pipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: 'members',
          localField: 'memberId',
          foreignField: '_id',
          as: 'member'
        }
      },
      { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } }
    ];

    if ($or) {
      const orConditions = $or.map(cond => {
        const mongoCond = {};
        for (const [key, val] of Object.entries(cond)) {
          const field = key.replace('memberId.', 'member.');
          mongoCond[field] = val;
        }
        return mongoCond;
      });
      pipeline.push({ $match: { $or: orConditions } });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];

    pipeline.push(
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    );

    const [records, countResult] = await Promise.all([
      Attendance.aggregate(pipeline),
      Attendance.aggregate(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return {
      data: records,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  static async update(id, gymId, updateData) {
    const query = { gymId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.publicId = id;
    }
    return Attendance.findOneAndUpdate(query, updateData, { new: true })
      .populate('memberId', 'fullName memberCode profilePhoto phone status')
      .populate('markedBy', 'fullName');
  }

  static async stats(gymId) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const buildStats = async (start, end, withMostActive = false) => {
      const match = { gymId: new mongoose.Types.ObjectId(gymId), date: { $gte: start, $lt: end } };

      const [aggregation] = await Attendance.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
            late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          }
        }
      ]);

      const stats = {
        total: aggregation?.total || 0,
        present: aggregation?.present || 0,
        absent: aggregation?.absent || 0,
        late: aggregation?.late || 0,
        percentage: aggregation?.total ? Math.round(((aggregation.present + aggregation.late) / aggregation.total) * 100) : 0,
      };

      if (withMostActive && stats.total > 0) {
        const mostActive = await Attendance.aggregate([
          { $match: match },
          { $group: { _id: '$memberId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'members',
              localField: '_id',
              foreignField: '_id',
              as: 'member'
            }
          },
          { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
          { $project: { memberName: { $ifNull: ['$member.fullName', 'Unknown'] }, count: 1 } }
        ]);
        stats.mostActive = mostActive;
      }

      return stats;
    };

    const [today, week, month] = await Promise.all([
      buildStats(startOfDay, endOfDay),
      buildStats(startOfWeek, endOfWeek),
      buildStats(startOfMonth, endOfMonth, true)
    ]);

    return { today, week, month };
  }

  static async findByMemberId(gymId, memberId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const pipeline = [
      { $match: { gymId: new mongoose.Types.ObjectId(gymId), memberId: new mongoose.Types.ObjectId(memberId) } },
      {
        $lookup: {
          from: 'members',
          localField: 'memberId',
          foreignField: '_id',
          as: 'member'
        }
      },
      { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const countPipeline = [
      { $match: { gymId: new mongoose.Types.ObjectId(gymId), memberId: new mongoose.Types.ObjectId(memberId) } },
      { $count: 'total' }
    ];

    const [records, countResult] = await Promise.all([
      Attendance.aggregate(pipeline),
      Attendance.aggregate(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return {
      data: records,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
}
