import { AttendanceRepository } from './attendance.repository.js';
import { MemberRepository } from '../member/member.repository.js';
import { MemberSubscriptionRepository } from '../memberSubscription/memberSubscription.repository.js';
import createError from 'http-errors';

export class AttendanceService {
  static async markAttendance(gymId, userId, data) {
    const member = await MemberRepository.findById(data.memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');

    const resolvedMemberId = member._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await AttendanceRepository.findPaginated(
      gymId,
      { memberId: resolvedMemberId, date: { $gte: today, $lt: tomorrow } },
      1, 1
    );

    if (existing.data.length > 0) {
      throw createError.Conflict('Attendance already marked for this member today');
    }

    return AttendanceRepository.create({
      gymId,
      memberId: resolvedMemberId,
      date: new Date(),
      status: data.status,
      notes: data.notes,
      markedBy: userId
    });
  }

  static async getAttendanceList(gymId, query) {
    const { page = 1, limit = 10, search, status, period, date, sort, order } = query;
    const filter = {};
    const sortObj = {};

    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    } else if (period) {
      const now = new Date();
      let start;
      if (period === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'yesterday') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      } else if (period === 'week') {
        start = new Date(now);
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
      } else if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      if (start) {
        const end = new Date(start);
        if (period === 'yesterday') {
          end.setDate(end.getDate() + 1);
        } else if (period === 'week') {
          end.setDate(end.getDate() + 7);
        } else if (period === 'month') {
          end.setMonth(end.getMonth() + 1);
        } else {
          end.setDate(end.getDate() + 1);
        }
        filter.date = { $gte: start, $lt: end };
      }
    }

    if (sort) {
      sortObj[sort] = order === 'asc' ? 1 : -1;
    } else {
      sortObj.date = -1;
    }

    if (search) {
      filter.$or = [
        { 'memberId.fullName': { $regex: search, $options: 'i' } },
        { 'memberId.memberCode': { $regex: search, $options: 'i' } },
        { 'memberId.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const result = await AttendanceRepository.findPaginated(gymId, filter, Number(page), Number(limit), sortObj);
    return result;
  }

  static async getAttendanceStats(gymId) {
    return AttendanceRepository.stats(gymId);
  }

  static async getMemberAttendance(gymId, memberId, query) {
    const { page = 1, limit = 10 } = query;
    const member = await MemberRepository.findById(memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');
    return AttendanceRepository.findByMemberId(gymId, member._id, Number(page), Number(limit));
  }

  static async updateAttendance(id, gymId, data) {
    const updateData = {};
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.checkOutTime) updateData.checkOutTime = new Date(data.checkOutTime);

    const record = await AttendanceRepository.update(id, gymId, updateData);
    if (!record) throw createError.NotFound('Attendance record not found');
    return record;
  }
}
