import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { DeliveryLog } from '../modules/deliveryLog/models/DeliveryLog.model.js';
import { setupAuth } from './helpers.js';

describe('DeliveryLog Routes', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  it('GET /api/v1/delivery-logs - list delivery logs', async () => {
    await DeliveryLog.create({ gymId: gym._id, broadcastId: '507f1f77bcf86cd799439001', memberId: '507f1f77bcf86cd799439002', channel: 'inApp', status: 'sent' });
    const res = await request(app)
      .get('/api/v1/delivery-logs')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/delivery-logs/:id - get log by id', async () => {
    const log = await DeliveryLog.create({ gymId: gym._id, broadcastId: '507f1f77bcf86cd799439001', memberId: '507f1f77bcf86cd799439002', channel: 'inApp', status: 'sent', sentAt: new Date() });
    const res = await request(app)
      .get(`/api/v1/delivery-logs/${log.publicId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym.publicId);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(log.publicId);
  });
});
