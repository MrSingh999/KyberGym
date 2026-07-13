import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Notification } from '../modules/notification/models/Notification.model.js';
import { setupAuth } from './helpers.js';

describe('Notification Routes', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  it('GET /api/v1/notifications - list user notifications', async () => {
    await Notification.create({ gymId: gym._id, userId, title: 'Test', message: 'Hello', type: 'system' });
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/v1/notifications/read-all - mark all read', async () => {
    await Notification.create({ gymId: gym._id, userId, title: 'A', message: 'Msg A', type: 'system', read: false });
    await Notification.create({ gymId: gym._id, userId, title: 'B', message: 'Msg B', type: 'system', read: false });
    const res = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
  });

  it('PATCH /api/v1/notifications/:id/read - mark one read', async () => {
    const notif = await Notification.create({ gymId: gym._id, userId, title: 'Test', message: 'Msg', type: 'system', read: false });
    const res = await request(app)
      .patch(`/api/v1/notifications/${notif._id}/read`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    const updated = await Notification.findById(notif._id);
    expect(updated.read).toBe(true);
  });
});
