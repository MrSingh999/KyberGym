import { GymSubscription } from './models/GymSubscription.model.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';
import createError from 'http-errors';

export class SubscriptionController {
  
  static async getCurrentSubscription(req, res) {
    const subscription = await GymSubscription.findOne({ gymId: req.gym._id }).populate('planId');
    
    if (!subscription) {
      throw createError.NotFound('Subscription not found for this gym');
    }

    return ApiResponse.success(res, httpStatus.OK, 'Current subscription retrieved', subscription);
  }

}
