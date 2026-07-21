import { GymSubscriptionPaymentService } from './gymSubscriptionPayment.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class GymSubscriptionPaymentController {

  static async createPayment(req, res) {
    const superAdminId = req.superAdmin._id;
    const payment = await GymSubscriptionPaymentService.createPayment(superAdminId, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Gym subscription payment recorded successfully', payment);
  }

  static async getPayments(req, res) {
    const result = await GymSubscriptionPaymentService.getPayments(req.query);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym subscription payments retrieved successfully', result.data, result.meta);
  }

  static async getPaymentById(req, res) {
    const { id } = req.params;
    const payment = await GymSubscriptionPaymentService.getPaymentById(id);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym subscription payment retrieved successfully', payment);
  }

  static async updatePayment(req, res) {
    const { id } = req.params;
    const payment = await GymSubscriptionPaymentService.updatePayment(id, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym subscription payment updated successfully', payment);
  }

  static async refundPayment(req, res) {
    const superAdminId = req.superAdmin._id;
    const { id } = req.params;
    const payment = await GymSubscriptionPaymentService.refundPayment(id, superAdminId, req.body);
    return ApiSuccess.send(res, httpStatus.OK, 'Gym subscription payment refunded successfully', payment);
  }

  static async deletePayment(req, res) {
    const { id } = req.params;
    const result = await GymSubscriptionPaymentService.deletePayment(id);
    return ApiSuccess.send(res, httpStatus.OK, result.message);
  }
}
