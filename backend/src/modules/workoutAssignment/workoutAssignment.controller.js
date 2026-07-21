import { WorkoutAssignmentService } from './workoutAssignment.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class WorkoutAssignmentController {
  static async assignWorkout(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const result = await WorkoutAssignmentService.assignWorkout(gymId, userId, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Workout assigned', result);
  }

  static async getAssignments(req, res) {
    const gymId = req.gym._id;
    const assignments = await WorkoutAssignmentService.getAssignments(gymId, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Assignments retrieved', assignments);
  }

  static async getAssignmentById(req, res) {
    const gymId = req.gym._id;
    const assignment = await WorkoutAssignmentService.getAssignmentById(req.params.id, gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Assignment retrieved', assignment);
  }

  static async updateAssignment(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const assignment = await WorkoutAssignmentService.updateAssignment(req.params.id, gymId, userId, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Assignment updated', assignment);
  }

  static async removeAssignment(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const assignment = await WorkoutAssignmentService.removeAssignment(req.params.id, gymId, userId);
    return ApiSuccess.send(res, httpStatus.OK, 'Assignment removed', assignment);
  }

  static async getMemberAssignments(req, res) {
    const gymId = req.gym._id;
    const memberId = req.params.memberId;
    const assignments = await WorkoutAssignmentService.getMemberAssignments(gymId, memberId);
    return ApiSuccess.send(res, httpStatus.OK, 'Member assignments retrieved', assignments);
  }
}
