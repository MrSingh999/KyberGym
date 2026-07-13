import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Broadcast } from '../modules/broadcast/models/Broadcast.model.js';
import { setupAuth } from './helpers.js';

describe('Broadcast Routes', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  it('POST /api/v1/broadcasts - create broadcast', async () => {
    const res = await request(app)
      .post('/api/v1/broadcasts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'Gym Closed', channel: 'inApp', recipientCriteria: { target: 'all' }, message: 'Gym closed tomorrow' });
    expect(res.status).toBe(201);
    expect(res.body.data.recipientCriteria.target).toBe('all');
  });

  it('POST - return 400 with invalid target', async () => {
    const res = await request(app)
      .post('/api/v1/broadcasts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'Test', channel: 'inApp', recipientCriteria: { target: 'nonexistent' }, message: 'Test' });
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/broadcasts - list broadcasts', async () => {
    await Broadcast.create({ gymId: gym._id, title: 'A', channel: 'inApp', message: 'A', recipientCriteria: { target: 'all' }, createdBy: userId });
    await Broadcast.create({ gymId: gym._id, title: 'B', channel: 'inApp', message: 'B', recipientCriteria: { target: 'all' }, createdBy: userId });
    const res = await request(app)
      .get('/api/v1/broadcasts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});
