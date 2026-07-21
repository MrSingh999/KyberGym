import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { TrainerProfile } from '../modules/trainer/models/TrainerProfile.model.js';
import { TrainerMemberAssignment } from '../modules/trainer/models/TrainerMemberAssignment.model.js';
import { User } from '../modules/users/models/User.model.js';
import { setupAuth, createTestMember } from './helpers.js';

describe('Trainer Module', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  // ── Create Trainer ───────────────────────────────────────

  it('POST /api/v1/trainers - create trainer', async () => {
    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        fullName: 'Test Trainer',
        email: 'trainer@test.com',
        password: 'password123',
        phone: '1234567890',
        specialization: 'Strength Training',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.fullName).toBe('Test Trainer');
    expect(res.body.data.user.role).toBe('trainer');
  });

  it('POST /api/v1/trainers - reject duplicate email', async () => {
    await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T1', email: 'dup@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T2', email: 'dup@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  // ── List Trainers ────────────────────────────────────────

  it('GET /api/v1/trainers - list trainers', async () => {
    await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T1', email: 't1@test.com', password: 'password123' });

    const res = await request(app)
      .get('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/trainers - paginate', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/v1/trainers')
        .set('Authorization', `Bearer ${token}`)
        .set('x-tenant-id', gym._id.toString())
        .send({ fullName: `T${i}`, email: `t${i}@test.com`, password: 'password123' });
    }

    const res = await request(app)
      .get('/api/v1/trainers?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(2);
  });

  // ── Update Trainer ───────────────────────────────────────

  it('PATCH /api/v1/trainers/:id - update trainer', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'Original', email: 'orig@test.com', password: 'password123' });

    const res = await request(app)
      .patch(`/api/v1/trainers/${create.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Updated');
  });

  // ── Deactivate / Activate Trainer ────────────────────────

  it('POST /api/v1/trainers/:id/deactivate - deactivate trainer', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'deact@test.com', password: 'password123' });

    const res = await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INACTIVE');

    const user = await User.findById(create.body.data.userId);
    expect(user.status).toBe('inactive');
  });

  it('POST /api/v1/trainers/:id/activate - reactivate trainer', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'react@test.com', password: 'password123' });

    await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());

    const res = await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/activate`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  // ── Assign Members ───────────────────────────────────────

  it('POST /api/v1/trainers/:id/assign-members - assign members', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'assign@test.com', password: 'password123' });

    const member = await createTestMember(gym._id, userId);

    const res = await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/assign-members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberIds: [member._id.toString()] });
    expect(res.status).toBe(201);
    expect(res.body.data.assigned).toBe(1);
  });

  it('POST /api/v1/trainers/:id/assign-members - skip duplicate', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'dup2@test.com', password: 'password123' });

    const member = await createTestMember(gym._id, userId);

    await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/assign-members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberIds: [member._id.toString()] });

    const res = await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/assign-members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberIds: [member._id.toString()] });
    expect(res.status).toBe(201);
    expect(res.body.data.assigned).toBe(0);
    expect(res.body.data.skipped).toBe(1);
  });

  it('POST /api/v1/trainers/:id/assign-members - reject inactive trainer', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'inact@test.com', password: 'password123' });

    await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/deactivate`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());

    const member = await createTestMember(gym._id, userId);

    const res = await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/assign-members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberIds: [member._id.toString()] });
    expect(res.status).toBe(400);
  });

  // ── Get Trainer Members ──────────────────────────────────

  it('GET /api/v1/trainers/:id/members - list assigned members', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'tm@test.com', password: 'password123' });

    const member = await createTestMember(gym._id, userId);

    await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/assign-members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberIds: [member._id.toString()] });

    const res = await request(app)
      .get(`/api/v1/trainers/${create.body.data._id}/members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // ── Remove Member Assignment ─────────────────────────────

  it('DELETE /api/v1/trainers/:id/members/:assignmentId - remove assignment', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'rm@test.com', password: 'password123' });

    const member = await createTestMember(gym._id, userId);

    const assignRes = await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/assign-members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberIds: [member._id.toString()] });

    const assignmentId = assignRes.body.data.assigned > 0
      ? (await TrainerMemberAssignment.findOne({ gymId: gym._id, trainerId: create.body.data._id }))._id
      : null;

    if (assignmentId) {
      const res = await request(app)
        .delete(`/api/v1/trainers/${create.body.data._id}/members/${assignmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-tenant-id', gym._id.toString());
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('INACTIVE');
    }
  });

  // ── Cross-gym ────────────────────────────────────────────

  it('POST /api/v1/trainers - reject cross-gym member', async () => {
    const otherCtx = await setupAuth();
    const member = await createTestMember(otherCtx.gym._id, userId);

    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'cg@test.com', password: 'password123' });

    const res = await request(app)
      .post(`/api/v1/trainers/${create.body.data._id}/assign-members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberIds: [member._id.toString()] });
    expect(res.status).toBe(400);
  });

  // ── Authorization ────────────────────────────────────────

  it('POST - reject staff role', async () => {
    const { token: staffToken } = await setupAuth('staff');

    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${staffToken}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'T', email: 'staff@test.com', password: 'password123' });
    expect(res.status).toBe(403);
  });

  // ── Trainer self-service ─────────────────────────────────

  it('GET /api/v1/trainers/me/profile - trainer can view own profile', async () => {
    const create = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'Self', email: 'self@test.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ email: 'self@test.com', password: 'password123' });

    const trainerToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/v1/trainers/me/profile')
      .set('Authorization', `Bearer ${trainerToken}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Self');
  });
});
