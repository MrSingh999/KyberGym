import mongoose from 'mongoose';
import { MemberSubscriptionRepository } from './memberSubscription.repository.js';
import { MembershipPlanRepository } from '../membershipPlan/membershipPlan.repository.js';
import { MemberRepository } from '../member/member.repository.js';
import { PaymentRepository } from '../payment/payment.repository.js';
import createError from 'http-errors';
import { addDays } from 'date-fns';

export class MemberSubscriptionService {
  static async createSubscription(gymId, userId, data) {
    // 1. Verify Member exists and resolve publicId to internal _id
    const member = await MemberRepository.findById(data.memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');
    const resolvedMemberId = member._id;

    // 2. Verify Plan exists and resolve publicId to internal _id
    const plan = await MembershipPlanRepository.findById(data.membershipPlanId, gymId);
    if (!plan) throw createError.NotFound('Membership plan not found');
    if (!plan.active) throw createError.BadRequest('Cannot subscribe to an archived plan');
    const resolvedPlanId = plan._id;

    // 3. Prevent duplicate active subscriptions
    const existingActive = await MemberSubscriptionRepository.findActiveForMember(resolvedMemberId, gymId);
    if (existingActive) {
      throw createError.Conflict('Member already has an active subscription. Please upgrade or cancel it first.');
    }

    // 4. Validate and Calculate Dates
    const startDate = new Date(data.startDate);
    // Only allow dates up to 1 minute in the past (to accommodate clock skew)
    if (startDate.getTime() < Date.now() - 60000) {
      throw createError.BadRequest('Start date cannot be in the past');
    }
    const endDate = addDays(startDate, plan.durationInDays);
    const finalAmount = plan.price - (data.discount || 0);

    if (finalAmount < 0) {
      throw createError.BadRequest('Discount cannot exceed plan price');
    }

    // 5. Create Subscription
    const subscription = await MemberSubscriptionRepository.create({
      gymId,
      memberId: resolvedMemberId,
      membershipPlanId: resolvedPlanId,
      startDate,
      endDate,
      amount: plan.price,
      discount: data.discount,
      finalAmount,
      status: 'active',
      assignedBy: userId,
      notes: data.notes
    });

    // 6. Auto-create Payment if paymentMethod is provided
    if (data.paymentMethod) {
      const pmNormalized = data.paymentMethod === 'bank_transfer' ? 'bankTransfer' : data.paymentMethod;
      try {
        await PaymentRepository.create({
          gymId,
          memberId: resolvedMemberId,
          subscriptionId: subscription._id,
          amount: finalAmount,
          paymentMethod: pmNormalized,
          paymentDate: new Date(),
          status: 'completed',
          receivedBy: userId,
          notes: data.notes
        });
      } catch (err) {
        console.error('Failed to auto-create payment for subscription:', err.message);
      }
    }

    return subscription;
  }

  static async getSubscriptions(gymId, query) {
    const { page = 1, limit = 10, status, memberId } = query;
    const filter = {};

    if (status) filter.status = status;
    if (memberId) {
      const member = await MemberRepository.findById(memberId, gymId);
      if (!member) throw createError.NotFound('Member not found');
      filter.memberId = member._id;
    }

    return MemberSubscriptionRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getSubscriptionById(id, gymId) {
    const sub = await MemberSubscriptionRepository.findById(id, gymId);
    if (!sub) throw createError.NotFound('Subscription not found');
    return sub;
  }

  static async updateStatus(id, gymId, userId, data) {
    const sub = await MemberSubscriptionRepository.update(id, gymId, {
      status: data.status,
      notes: data.notes,
      assignedBy: userId
    });
    
    if (!sub) throw createError.NotFound('Subscription not found');
    return sub;
  }

  static async updateSubscription(id, gymId, userId, data) {
    const sub = await MemberSubscriptionRepository.findById(id, gymId);
    if (!sub) throw createError.NotFound('Subscription not found');

    const updateData = { ...data, assignedBy: userId };

    // If dates changed, recalculate finalAmount based on the plan
    if (data.startDate || data.endDate || data.membershipPlanId || data.discount !== undefined) {
      const planId = data.membershipPlanId || sub.membershipPlanId;
      const plan = await MembershipPlanRepository.findById(planId, gymId);
      if (!plan) throw createError.NotFound('Membership plan not found');

      if (data.membershipPlanId) {
        updateData.membershipPlanId = plan._id;
      }

      updateData.startDate = data.startDate ? new Date(data.startDate) : sub.startDate;
      updateData.endDate = data.endDate ? new Date(data.endDate) : sub.endDate;
      updateData.amount = plan.price;
      updateData.finalAmount = plan.price - (data.discount ?? sub.discount ?? 0);
      if (updateData.finalAmount < 0) {
        throw createError.BadRequest('Discount cannot exceed plan price');
      }
    }

    // Convert ISO strings to dates if provided
    if (typeof updateData.startDate === 'string') updateData.startDate = new Date(updateData.startDate);
    if (typeof updateData.endDate === 'string') updateData.endDate = new Date(updateData.endDate);

    const updated = await MemberSubscriptionRepository.update(id, gymId, updateData);
    if (!updated) throw createError.NotFound('Subscription not found');
    return updated;
  }
}
