import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Member } from '../modules/member/models/Member.model.js';
import { MemberPayment } from '../modules/memberPayment/models/MemberPayment.model.js';
import { MembershipPlan } from '../modules/membershipPlan/models/MembershipPlan.model.js';
import { setupAuth } from './helpers.js';

describe('Member Payment Routes', () => {
  let gym, token, member, userId, plan;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
    member = await Member.create({ gymId: gym._id, fullName: 'Test Member', createdBy: userId });
    plan = await MembershipPlan.create({ gymId: gym._id, name: 'Monthly', durationInDays: 30, price: 999 });
  });

  it('POST /api/v1/member-payments - record payment', async () => {
    const res = await request(app)
      .post('/api/v1/member-payments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: member._id.toString(), amount: 999, discount: 0, finalAmount: 999, paymentMethod: 'cash' });
    expect(res.status).toBe(201);
    expect(res.body.data.paymentMethod).toBe('cash');
  });

  it('POST - return 400 on invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/member-payments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: member._id.toString() });
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/member-payments - list payments', async () => {
    await MemberPayment.create({ gymId: gym._id, memberId: member._id, amount: 500, finalAmount: 500, paymentMethod: 'cash', status: 'paid', receivedBy: userId });
    await MemberPayment.create({ gymId: gym._id, memberId: member._id, amount: 1500, finalAmount: 1500, paymentMethod: 'upi', status: 'paid', receivedBy: userId });
    const res = await request(app)
      .get('/api/v1/member-payments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/v1/member-payments/:id - get by id', async () => {
    const payment = await MemberPayment.create({ gymId: gym._id, memberId: member._id, amount: 999, finalAmount: 999, paymentMethod: 'card', status: 'paid', receivedBy: userId });
    const res = await request(app)
      .get(`/api/v1/member-payments/${payment._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(999);
  });

  it('POST /api/v1/member-payments/:id/refund - refund payment', async () => {
    const payment = await MemberPayment.create({ gymId: gym._id, memberId: member._id, amount: 999, finalAmount: 999, paymentMethod: 'cash', status: 'paid', receivedBy: userId });
    const res = await request(app)
      .post(`/api/v1/member-payments/${payment._id}/refund`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ notes: 'Customer requested' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('refunded');
  });
});
