import { MemberQrService } from './memberQr.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class MemberQrController {
  
  static async generateQr(req, res) {
    const gymId = req.gym._id;
    const { id: memberId } = req.params;
    const qr = await MemberQrService.generateQr(gymId, memberId);
    return ApiResponse.success(res, httpStatus.CREATED, 'QR Code generated', qr);
  }

  static async getQr(req, res) {
    const gymId = req.gym._id;
    const { id: memberId } = req.params;
    const qr = await MemberQrService.getQr(gymId, memberId);
    return ApiResponse.success(res, httpStatus.OK, 'QR Code retrieved', qr);
  }

  static async regenerateQr(req, res) {
    const gymId = req.gym._id;
    const { id: memberId } = req.params;
    const qr = await MemberQrService.generateQr(gymId, memberId);
    return ApiResponse.success(res, httpStatus.OK, 'QR Code regenerated', qr);
  }
}
