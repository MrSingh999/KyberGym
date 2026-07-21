import { MemberPaymentService } from './memberPayment.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class MemberPaymentController {
  
  static async recordPayment(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    
    const payment = await MemberPaymentService.recordPayment(gymId, userId, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Payment recorded successfully', payment);
  }

  static async getPayments(req, res) {
    const gymId = req.gym._id;
    const result = await MemberPaymentService.getPayments(gymId, req.query);
    
    return ApiSuccess.send(res, httpStatus.OK, 'Payments retrieved successfully', result.data, result.meta);
  }

  static async getPaymentById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const payment = await MemberPaymentService.getPaymentById(id, gymId);
    return ApiSuccess.send(res, httpStatus.OK, 'Payment retrieved successfully', payment);
  }

  static async refundPayment(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const { id } = req.params;
    
    const payment = await MemberPaymentService.refundPayment(id, gymId, userId, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Payment refunded successfully', payment);
  }
}
