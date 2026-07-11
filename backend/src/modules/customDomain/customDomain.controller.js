import { CustomDomainService } from './customDomain.service.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class CustomDomainController {
  
  static async requestDomain(req, res) {
    const gymId = req.gym._id;
    const domain = await CustomDomainService.requestDomain(gymId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Domain requested successfully', domain);
  }

  static async getDomain(req, res) {
    const gymId = req.gym._id;
    const domain = await CustomDomainService.getDomain(gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Domain retrieved successfully', domain);
  }

  static async deleteDomain(req, res) {
    const gymId = req.gym._id;
    const domain = await CustomDomainService.deleteDomain(gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Domain configuration deleted', domain);
  }

  static async verifyDomain(req, res) {
    const gymId = req.gym._id;
    const domain = await CustomDomainService.verifyDomain(gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Domain verified successfully', domain);
  }
}
