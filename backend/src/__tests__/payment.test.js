import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Member } from '../modules/member/models/Member.model.js';
import { Payment } from '../modules/payment/models/Payment.model.js';
import { setupAuth } from './helpers.js';

describe('Payment Routes', () => {
  let gym, token, member, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
    member = await Member.create({ gymId: gym._id, fullName: 'Test Member', createdBy: userId });
  });

  it('POST /api/v1/payments - record payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: member._id.toString(), amount: 999, paymentMethod: 'cash' });
    expect(res.status).toBe(201);
    expect(res.body.data.paymentMethod).toBe('cash');
  });

  it('POST - return 400 on invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: member._id.toString() });
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/payments - list payments', async () => {
    await Payment.create({ gymId: gym._id, memberId: member._id, amount: 500, paymentMethod: 'cash', status: 'completed', receivedBy: userId });
    await Payment.create({ gymId: gym._id, memberId: member._id, amount: 1500, paymentMethod: 'upi', status: 'completed', receivedBy: userId });
    const res = await request(app)
      .get('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/v1/payments/:id - get by id', async () => {
    const payment = await Payment.create({ gymId: gym._id, memberId: member._id, amount: 999, paymentMethod: 'card', status: 'completed', receivedBy: userId });
    const res = await request(app)
      .get(`/api/v1/payments/${payment._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe(999);
  });

  it('POST /api/v1/payments/:id/refund - refund payment', async () => {
    const payment = await Payment.create({ gymId: gym._id, memberId: member._id, amount: 999, paymentMethod: 'cash', status: 'completed', receivedBy: userId });
    const res = await request(app)
      .post(`/api/v1/payments/${payment._id}/refund`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ notes: 'Customer requested' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('refunded');
  });
});
