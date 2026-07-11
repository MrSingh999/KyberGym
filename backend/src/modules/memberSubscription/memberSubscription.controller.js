import { MemberSubscriptionService } from './memberSubscription.service.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class MemberSubscriptionController {
  
  static async createSubscription(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    
    const sub = await MemberSubscriptionService.createSubscription(gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Subscription created successfully', sub);
  }

  static async getSubscriptions(req, res) {
    const gymId = req.gym._id;
    const result = await MemberSubscriptionService.getSubscriptions(gymId, req.query);
    
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  static async getSubscriptionById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const sub = await MemberSubscriptionService.getSubscriptionById(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Subscription retrieved successfully', sub);
  }

  static async updateStatus(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const { id } = req.params;
    
    const sub = await MemberSubscriptionService.updateStatus(id, gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Subscription status updated', sub);
  }
}
