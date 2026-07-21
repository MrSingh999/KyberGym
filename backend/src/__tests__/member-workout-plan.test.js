import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { MemberWorkoutPlan } from '../modules/memberWorkoutPlan/models/MemberWorkoutPlan.model.js';
import { MemberWorkoutPlanDay } from '../modules/memberWorkoutPlan/models/MemberWorkoutPlanDay.model.js';
import { setupAuth, createTestMember, createTestWorkout } from './helpers.js';

describe('MemberWorkoutPlan Module', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  // ── Create Trainer & Member ──────────────────────────────────
  let trainerId, memberId;

  beforeEach(async () => {
    const trainerRes = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ fullName: 'Test Trainer', email: `trainer${Date.now()}@test.com`, password: 'password123' });

    trainerId = trainerRes.body.data._id;

    const member = await createTestMember(gym._id, userId);
    memberId = member._id;

    await request(app)
      .post(`/api/v1/trainers/${trainerId}/assign-members`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberIds: [memberId.toString()] });
  });

  // ── Create Plan (Scratch) ────────────────────────────────────

  it('POST /member-workout-plans - create from scratch', async () => {
    const res = await request(app)
      .post('/api/v1/member-workout-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        memberId: memberId.toString(),
        trainerId,
        title: 'Custom Plan',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Custom Plan');
    expect(res.body.data.days).toEqual([]);
  });

  it('POST /member-workout-plans - reject unassigned trainer', async () => {
    const otherMember = await createTestMember(gym._id, userId);

    const res = await request(app)
      .post('/api/v1/member-workout-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        memberId: otherMember._id.toString(),
        trainerId,
        title: 'Unauthorized',
      });
    expect(res.status).toBe(403);
  });

  // ── Create Plan (From Template) ──────────────────────────────

  it('POST /member-workout-plans - create from template', async () => {
    const workout = await createTestWorkout(gym._id, userId);

    const res = await request(app)
      .post('/api/v1/member-workout-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        memberId: memberId.toString(),
        trainerId,
        sourceWorkoutId: workout._id.toString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.data.sourceWorkoutId).toBeTruthy();
    expect(res.body.data.title).toContain('(Personalized)');
  });

  // ── List Plans ───────────────────────────────────────────────

  it('GET /member-workout-plans - list plans', async () => {
    await request(app)
      .post('/api/v1/member-workout-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: memberId.toString(), trainerId, title: 'Plan 1' });

    const res = await request(app)
      .get('/api/v1/member-workout-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  // ── Nested Save ──────────────────────────────────────────────

  it('PUT /member-workout-plans/:id/nested - save nested', async () => {
    const createRes = await request(app)
      .post('/api/v1/member-workout-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: memberId.toString(), trainerId, title: 'Editable' });

    const planId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/v1/member-workout-plans/${planId}/nested`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        title: 'Updated Plan',
        days: [
          {
            dayName: 'Push Day',
            orderIndex: 0,
            exercises: [{ name: 'Bench Press', sets: 4, reps: 10 }],
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Plan');
    expect(res.body.data.days).toHaveLength(1);
  });

  // ── Archive Plan ─────────────────────────────────────────────

  it('POST /member-workout-plans/:id/archive - archive plan', async () => {
    const createRes = await request(app)
      .post('/api/v1/member-workout-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ memberId: memberId.toString(), trainerId, title: 'Archivable' });

    const res = await request(app)
      .post(`/api/v1/member-workout-plans/${createRes.body.data._id}/archive`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ARCHIVED');
  });

  // ── Cross-gym ────────────────────────────────────────────────

  it('POST /member-workout-plans - reject cross-gym member', async () => {
    const otherCtx = await setupAuth();
    const otherMember = await createTestMember(otherCtx.gym._id, otherCtx.user._id);

    const res = await request(app)
      .post('/api/v1/member-workout-plans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        memberId: otherMember._id.toString(),
        trainerId,
        title: 'Cross-gym',
      });
    expect(res.status).toBe(403);
  });

  // ── Pagination ──────────────────────────────────────────────

  it('GET /member-workout-plans - paginate', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/v1/member-workout-plans')
        .set('Authorization', `Bearer ${token}`)
        .set('x-tenant-id', gym._id.toString())
        .send({ memberId: memberId.toString(), trainerId, title: `Plan ${i}` });
    }

    const res = await request(app)
      .get('/api/v1/member-workout-plans?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(2);
  });
});
