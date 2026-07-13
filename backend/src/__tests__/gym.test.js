import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { setupAuth } from './helpers.js';

describe('Gym Routes', () => {
  let gym, token;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
  });

  it('GET /api/v1/gyms/:gymId/branding - get gym branding', async () => {
    const res = await request(app)
      .get(`/api/v1/gyms/${gym._id}/branding`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('primaryColor');
  });

  it('GET /api/v1/gyms/:gymId/branding - return 404 for unknown gym', async () => {
    const res = await request(app)
      .get('/api/v1/gyms/507f1f77bcf86cd799439999/branding')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(404);
  });
});
