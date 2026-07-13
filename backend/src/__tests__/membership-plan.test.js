import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { MembershipPlan } from '../modules/membershipPlan/models/MembershipPlan.model.js';
import { setupAuth } from './helpers.js';

describe('MembershipPlan Routes', () => {
  let gym, token;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
  });

  it('POST /api/v1/membership-plans - create plan', async () => {
    const res = await request(app)
      .post('/api/v1/membership-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ name: 'Monthly', durationInDays: 30, price: 999 });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Monthly');
  });

  it('POST - return 400 on invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/membership-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/membership-plans - list plans', async () => {
    await MembershipPlan.create({ gymId: gym._id, name: 'Basic', durationInDays: 30, price: 499 });
    await MembershipPlan.create({ gymId: gym._id, name: 'Premium', durationInDays: 60, price: 999 });
    const res = await request(app)
      .get('/api/v1/membership-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/v1/membership-plans/:id - get by id', async () => {
    const plan = await MembershipPlan.create({ gymId: gym._id, name: 'Gold', durationInDays: 90, price: 1999 });
    const res = await request(app)
      .get(`/api/v1/membership-plans/${plan._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Gold');
  });

  it('PATCH /api/v1/membership-plans/:id - update plan', async () => {
    const plan = await MembershipPlan.create({ gymId: gym._id, name: 'Old', durationInDays: 30, price: 499 });
    const res = await request(app)
      .patch(`/api/v1/membership-plans/${plan._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ name: 'New', price: 699 });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New');
    expect(res.body.data.price).toBe(699);
  });

  it('DELETE /api/v1/membership-plans/:id - archive plan', async () => {
    const plan = await MembershipPlan.create({ gymId: gym._id, name: 'To Archive', durationInDays: 30, price: 299 });
    const res = await request(app)
      .delete(`/api/v1/membership-plans/${plan._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.active).toBe(false);
  });
});
