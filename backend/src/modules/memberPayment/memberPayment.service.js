import mongoose from 'mongoose';
import { MemberPaymentRepository } from './memberPayment.repository.js';
import { MemberSubscriptionRepository } from '../memberSubscription/memberSubscription.repository.js';
import { MemberRepository } from '../member/member.repository.js';
import { MembershipPlan } from '../membershipPlan/models/MembershipPlan.model.js';
import createError from 'http-errors';

export class MemberPaymentService {
  static async recordPayment(gymId, userId, data) {
    const member = await MemberRepository.findById(data.memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');
    const resolvedMemberId = member._id;

    let resolvedSubscriptionId = undefined;
    let paymentFor = undefined;
    if (data.subscriptionId) {
      const sub = await MemberSubscriptionRepository.findById(data.subscriptionId, gymId);
      if (!sub) throw createError.NotFound('Subscription not found');
      resolvedSubscriptionId = sub._id;

      if (sub.membershipPlanId) {
        const plan = await MembershipPlan.findById(sub.membershipPlanId).select('name');
        paymentFor = {
          planId: sub.membershipPlanId,
          planName: plan?.name || 'Unknown Plan',
          startDate: sub.startDate,
          endDate: sub.endDate,
        };
      }
    }

    const discount = data.discount || 0;
    const finalAmount = data.finalAmount ?? (data.amount - discount);
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

    return MemberPaymentRepository.create({
      memberId: resolvedMemberId,
      subscriptionId: resolvedSubscriptionId,
      gymId,
      amount: data.amount,
      discount,
      finalAmount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      paymentDate,
      paymentFor,
      receivedBy: userId,
      notes: data.notes,
    });
  }

  static async getPayments(gymId, query) {
    const { page = 1, limit = 10, status, paymentMethod, memberId } = query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (memberId) {
      const member = await MemberRepository.findById(memberId, gymId);
      if (!member) throw createError.NotFound('Member not found');
      filter.memberId = member._id;
    }

    return MemberPaymentRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getPaymentById(id, gymId) {
    const payment = await MemberPaymentRepository.findById(id, gymId);
    if (!payment) throw createError.NotFound('Payment not found');
    return payment;
  }

  static async refundPayment(id, gymId, userId, data) {
    const payment = await MemberPaymentRepository.update(id, gymId, {
      status: 'refunded',
      notes: data.notes ? `Refunded: ${data.notes}` : 'Refunded',
      // We don't overwrite receivedBy, we might want a 'refundedBy' in the future, 
      // but for now keeping it simple.
    });

    if (!payment) throw createError.NotFound('Payment not found');
    return payment;
  }
}
