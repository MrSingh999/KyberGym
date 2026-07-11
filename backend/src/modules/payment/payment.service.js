import { PaymentRepository } from './payment.repository.js';
import { MemberSubscriptionRepository } from '../memberSubscription/memberSubscription.repository.js';
import { MemberRepository } from '../member/member.repository.js';
import createError from 'http-errors';

export class PaymentService {
  static async recordPayment(gymId, userId, data) {
    // Verify member exists
    const member = await MemberRepository.findById(data.memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');

    // If a subscription ID is provided, verify it exists and belongs to the gym
    if (data.subscriptionId) {
      const sub = await MemberSubscriptionRepository.findById(data.subscriptionId, gymId);
      if (!sub) throw createError.NotFound('Subscription not found');
    }

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

    return PaymentRepository.create({
      gymId,
      receivedBy: userId,
      ...data,
      paymentDate
    });
  }

  static async getPayments(gymId, query) {
    const { page = 1, limit = 10, status, paymentMethod, memberId } = query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (memberId) filter.memberId = memberId;

    return PaymentRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getPaymentById(id, gymId) {
    const payment = await PaymentRepository.findById(id, gymId);
    if (!payment) throw createError.NotFound('Payment not found');
    return payment;
  }

  static async refundPayment(id, gymId, userId, data) {
    const payment = await PaymentRepository.update(id, gymId, {
      status: 'refunded',
      notes: data.notes ? `Refunded: ${data.notes}` : 'Refunded',
      // We don't overwrite receivedBy, we might want a 'refundedBy' in the future, 
      // but for now keeping it simple.
    });

    if (!payment) throw createError.NotFound('Payment not found');
    return payment;
  }
}
