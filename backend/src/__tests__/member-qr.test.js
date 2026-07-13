import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Member } from '../modules/member/models/Member.model.js';
import { setupAuth, createTestMember } from './helpers.js';

describe('MemberQr Routes', () => {
  let gym, token, userId, member;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
    member = await createTestMember(gym._id, userId);
  });

  it('POST /api/v1/members/:id/qr - generate QR', async () => {
    const res = await request(app)
      .post(`/api/v1/members/${member._id}/qr`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('qrCodeData');
  });

  it('GET /api/v1/members/:id/qr - get existing QR', async () => {
    await request(app)
      .post(`/api/v1/members/${member._id}/qr`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    const res = await request(app)
      .get(`/api/v1/members/${member._id}/qr`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('qrCodeData');
  });

  it('PATCH /api/v1/members/:id/qr/regenerate - regenerate QR', async () => {
    await request(app)
      .post(`/api/v1/members/${member._id}/qr`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    const res = await request(app)
      .patch(`/api/v1/members/${member._id}/qr/regenerate`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('qrCodeData');
  });
});
