import { BroadcastService } from './broadcast.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class BroadcastController {
  
  static async createBroadcast(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const broadcast = await BroadcastService.createBroadcast(gymId, userId, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Broadcast created successfully', broadcast);
  }

  static async getBroadcasts(req, res) {
    const gymId = req.gym._id;
    const result = await BroadcastService.getBroadcasts(gymId, req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Broadcasts retrieved successfully', result.data, result.meta);
  }

  static async getBroadcastById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const broadcast = await BroadcastService.getBroadcastById(id, gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Broadcast retrieved successfully', broadcast);
  }

  static async updateBroadcast(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const broadcast = await BroadcastService.updateBroadcast(id, gymId, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Broadcast updated successfully', broadcast);
  }

  static async deleteBroadcast(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const broadcast = await BroadcastService.deleteBroadcast(id, gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Broadcast deleted successfully', broadcast);
  }

  static async sendBroadcast(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const broadcast = await BroadcastService.sendBroadcast(id, gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Broadcast queued for sending', broadcast);
  }
}
