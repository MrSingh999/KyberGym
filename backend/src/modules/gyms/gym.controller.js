import { GymService } from './gym.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class GymController {

  static async getBranding(req, res) {
    const gymId = req.params.gymId;
    const branding = await GymService.getBranding(gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Branding settings retrieved', branding);
  }

  static async updateBranding(req, res) {
    const gymId = req.params.gymId;
    const branding = await GymService.updateBranding(gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Branding settings updated', branding);
  }
}
