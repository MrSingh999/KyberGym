import { AttendanceService } from './attendance.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class AttendanceController {

  static async markAttendance(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const record = await AttendanceService.markAttendance(gymId, userId, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Attendance marked successfully', record);
  }

  static async getAttendanceList(req, res) {
    const gymId = req.gym._id;
    const result = await AttendanceService.getAttendanceList(gymId, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Attendance records retrieved', result.data, result.meta);
  }

  static async getAttendanceStats(req, res) {
    const gymId = req.gym._id;
    const stats = await AttendanceService.getAttendanceStats(gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Attendance stats retrieved', stats);
  }

  static async getMemberAttendance(req, res) {
    const gymId = req.gym._id;
    const { memberId } = req.params;
    const result = await AttendanceService.getMemberAttendance(gymId, memberId, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Member attendance retrieved', result.data, result.meta);
  }

  static async updateAttendance(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const record = await AttendanceService.updateAttendance(id, gymId, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Attendance updated successfully', record);
  }
}
