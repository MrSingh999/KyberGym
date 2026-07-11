import { BrandingService } from './branding.service.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class BrandingController {
  
  static async getBranding(req, res) {
    const gymId = req.gym._id;
    const branding = await BrandingService.getBranding(gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Branding settings retrieved', branding);
  }

  static async updateBranding(req, res) {
    const gymId = req.gym._id;
    const branding = await BrandingService.updateBranding(gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Branding settings updated', branding);
  }
}
