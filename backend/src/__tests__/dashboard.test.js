import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Member } from '../modules/member/models/Member.model.js';
import { MemberSubscription } from '../modules/memberSubscription/models/MemberSubscription.model.js';
import { setupAuth } from './helpers.js';

describe('Dashboard Routes', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  it('GET /api/v1/dashboard/overview - returns stats', async () => {
    await Member.create({ gymId: gym._id, fullName: 'A', status: 'active', createdBy: userId });
    await Member.create({ gymId: gym._id, fullName: 'B', status: 'inactive', createdBy: userId });
    const res = await request(app)
      .get('/api/v1/dashboard/overview')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.totalMembers).toBe(2);
    expect(res.body.data.activeMembers).toBe(1);
    expect(res.body.data.inactiveMembers).toBe(1);
  });

  it('GET /api/v1/dashboard/due-tracking - returns due tracking', async () => {
    await MemberSubscription.create({ gymId: gym._id, memberId: '507f1f77bcf86cd799439001', membershipPlanId: '507f1f77bcf86cd799439002', startDate: new Date(), endDate: new Date(Date.now() + 86400000), amount: 999, finalAmount: 999, status: 'active', assignedBy: userId });
    const res = await request(app)
      .get('/api/v1/dashboard/due-tracking')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('dueToday');
    expect(res.body.data).toHaveProperty('dueIn3Days');
    expect(res.body.data).toHaveProperty('dueIn7Days');
  });
});
