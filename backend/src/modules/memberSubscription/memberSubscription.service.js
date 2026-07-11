import { MemberSubscriptionRepository } from './memberSubscription.repository.js';
import { MembershipPlanRepository } from '../membershipPlan/membershipPlan.repository.js';
import { MemberRepository } from '../member/member.repository.js';
import createError from 'http-errors';
import { addDays } from 'date-fns';

export class MemberSubscriptionService {
  static async createSubscription(gymId, userId, data) {
    // 1. Verify Member exists
    const member = await MemberRepository.findById(data.memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');

    // 2. Verify Plan exists
    const plan = await MembershipPlanRepository.findById(data.membershipPlanId, gymId);
    if (!plan) throw createError.NotFound('Membership plan not found');
    if (!plan.active) throw createError.BadRequest('Cannot subscribe to an archived plan');

    // 3. Prevent duplicate active subscriptions
    const existingActive = await MemberSubscriptionRepository.findActiveForMember(data.memberId, gymId);
    if (existingActive) {
      throw createError.Conflict('Member already has an active subscription. Please upgrade or cancel it first.');
    }

    // 4. Calculate End Date and Final Amount
    const startDate = new Date(data.startDate);
    const endDate = addDays(startDate, plan.durationInDays);
    const finalAmount = plan.price - (data.discount || 0);

    if (finalAmount < 0) {
      throw createError.BadRequest('Discount cannot exceed plan price');
    }

    // 5. Create Subscription
    return MemberSubscriptionRepository.create({
      gymId,
      memberId: data.memberId,
      membershipPlanId: data.membershipPlanId,
      startDate,
      endDate,
      amount: plan.price,
      discount: data.discount,
      finalAmount,
      status: 'active',
      assignedBy: userId,
      notes: data.notes
    });
  }

  static async getSubscriptions(gymId, query) {
    const { page = 1, limit = 10, status, memberId } = query;
    const filter = {};

    if (status) filter.status = status;
    if (memberId) filter.memberId = memberId;

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
}
