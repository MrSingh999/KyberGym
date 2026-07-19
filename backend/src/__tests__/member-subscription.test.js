import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Member } from '../modules/member/models/Member.model.js';
import { MembershipPlan } from '../modules/membershipPlan/models/MembershipPlan.model.js';
import { MemberSubscription } from '../modules/memberSubscription/models/MemberSubscription.model.js';
import { setupAuth } from './helpers.js';

describe('MemberSubscription Routes', () => {
  let gym, token, member, plan, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
    member = await Member.create({ gymId: gym._id, fullName: 'Test Member', createdBy: userId });
    plan = await MembershipPlan.create({ gymId: gym._id, name: 'Monthly', durationInDays: 30, price: 999 });
  });

  it('POST /api/v1/member-subscriptions - create subscription', async () => {
    const startDate = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .post('/api/v1/member-subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: member._id.toString(), membershipPlanId: plan._id.toString(), startDate });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('active');
  });

  it('POST - return 409 on duplicate active subscription', async () => {
    await MemberSubscription.create({ gymId: gym._id, memberId: member._id, membershipPlanId: plan._id, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000), amount: 999, finalAmount: 999, status: 'active', assignedBy: userId });
    const startDate = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .post('/api/v1/member-subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: member._id.toString(), membershipPlanId: plan._id.toString(), startDate });
    expect(res.status).toBe(409);
  });

  it('GET /api/v1/member-subscriptions - list', async () => {
    await MemberSubscription.create({ gymId: gym._id, memberId: member._id, membershipPlanId: plan._id, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000), amount: 999, finalAmount: 999, status: 'active', assignedBy: userId });
    const res = await request(app)
      .get('/api/v1/member-subscriptions')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/member-subscriptions/:id - get by id', async () => {
    const sub = await MemberSubscription.create({ gymId: gym._id, memberId: member._id, membershipPlanId: plan._id, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000), amount: 999, finalAmount: 999, status: 'active', assignedBy: userId });
    const res = await request(app)
      .get(`/api/v1/member-subscriptions/${sub._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('active');
  });

  it('PATCH /api/v1/member-subscriptions/:id/status - update status', async () => {
    const sub = await MemberSubscription.create({ gymId: gym._id, memberId: member._id, membershipPlanId: plan._id, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000), amount: 999, finalAmount: 999, status: 'active', assignedBy: userId });
    const res = await request(app)
      .patch(`/api/v1/member-subscriptions/${sub._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ status: 'paused' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('paused');
  });
});
