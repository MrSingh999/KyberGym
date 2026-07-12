import { DashboardService } from './dashboard.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class DashboardController {
  
  static async getOverviewStats(req, res) {
    const gymId = req.gym._id;
    const stats = await DashboardService.getOverviewStats(gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Dashboard overview retrieved', stats);
  }

  static async getDueTracking(req, res) {
    const gymId = req.gym._id;
    const tracking = await DashboardService.getDueTracking(gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Due tracking retrieved', tracking);
  }
}
