import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Member } from '../modules/member/models/Member.model.js';
import { setupAuth } from './helpers.js';

describe('Member Routes', () => {
  let gym, token;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
  });

  it('POST /api/v1/members - create member', async () => {
    const res = await request(app)
      .post('/api/v1/members')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'John Doe', email: 'john@test.com', phone: '1234567890' });
    expect(res.status).toBe(201);
    expect(res.body.data.publicId).toBeDefined();
  });

  it('POST /api/v1/members - return 409 on duplicate email', async () => {
    await Member.create({ gymId: gym._id, fullName: 'A', email: 'dup@test.com', createdBy: gym.ownerId });
    const res = await request(app)
      .post('/api/v1/members')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'Bob', email: 'dup@test.com' });
    expect(res.status).toBe(409);
  });

  it('GET /api/v1/members - list members', async () => {
    await Member.create({ gymId: gym._id, fullName: 'Alice', createdBy: gym.ownerId });
    await Member.create({ gymId: gym._id, fullName: 'Bob', createdBy: gym.ownerId });
    const res = await request(app)
      .get('/api/v1/members')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('GET /api/v1/members - search by name', async () => {
    await Member.create({ gymId: gym._id, fullName: 'Alice Wonder', createdBy: gym.ownerId });
    await Member.create({ gymId: gym._id, fullName: 'Bob Smith', createdBy: gym.ownerId });
    const res = await request(app)
      .get('/api/v1/members?search=Alice')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].fullName).toBe('Alice Wonder');
  });

  it('GET /api/v1/members/:id - get by id', async () => {
    const member = await Member.create({ gymId: gym._id, fullName: 'Charlie', createdBy: gym.ownerId });
    const res = await request(app)
      .get(`/api/v1/members/${member._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Charlie');
  });

  it('GET /api/v1/members/:id - return 404 for wrong gym', async () => {
    const member = await Member.create({ gymId: gym._id, fullName: 'Charlie', createdBy: gym.ownerId });
    const res = await request(app)
      .get(`/api/v1/members/${member._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', '507f1f77bcf86cd799439999');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/v1/members/:id - update member', async () => {
    const member = await Member.create({ gymId: gym._id, fullName: 'Old Name', createdBy: gym.ownerId });
    const res = await request(app)
      .patch(`/api/v1/members/${member._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'New Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('New Name');
  });

  it('DELETE /api/v1/members/:id - soft delete', async () => {
    const member = await Member.create({ gymId: gym._id, fullName: 'To Delete', createdBy: gym.ownerId });
    const res = await request(app)
      .delete(`/api/v1/members/${member._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    const deleted = await Member.findById(member._id);
    expect(deleted.isDeleted).toBe(true);
  });
});
