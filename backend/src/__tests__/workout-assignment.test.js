import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Workout } from '../modules/workouts/models/Workout.model.js';
import { Member } from '../modules/member/models/Member.model.js';
import { WorkoutAssignment } from '../modules/workoutAssignment/models/WorkoutAssignment.model.js';
import { setupAuth, createTestMember, createTestWorkout } from './helpers.js';

describe('Workout Assignment Routes', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  // ── Assign Workout ───────────────────────────────────────

  it('POST /api/v1/workout-assignments - assign to single member', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member = await createTestMember(gym._id, userId);

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [member._id.toString()],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.assigned).toBe(1);
    expect(res.body.data.skipped).toBe(0);
    expect(res.body.data.failed).toBe(0);
  });

  it('POST /api/v1/workout-assignments - assign to multiple members', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member1 = await createTestMember(gym._id, userId);
    const member2 = await createTestMember(gym._id, userId);

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [member1._id.toString(), member2._id.toString()],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.assigned).toBe(2);
    expect(res.body.data.failed).toBe(0);
  });

  it('POST /api/v1/workout-assignments - assign to all members', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    await createTestMember(gym._id, userId);
    await createTestMember(gym._id, userId);
    await createTestMember(gym._id, userId);

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'ALL',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.assigned).toBe(3);
    expect(res.body.data.failed).toBe(0);
  });

  it('POST - skip duplicate ACTIVE assignments', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member = await createTestMember(gym._id, userId);

    await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [member._id.toString()],
      });

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [member._id.toString()],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.assigned).toBe(0);
    expect(res.body.data.skipped).toBe(1);
    expect(res.body.data.failed).toBe(0);
  });

  it('POST - reject non-ACTIVE workout', async () => {
    const workout = await createTestWorkout(gym._id, userId, { status: 'DRAFT' });
    const member = await createTestMember(gym._id, userId);

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [member._id.toString()],
      });
    expect(res.status).toBe(400);
  });

  it('POST - reject cross-gym member', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const otherGym = (await setupAuth()).gym;
    const otherMember = await createTestMember(otherGym._id, userId);

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [otherMember._id.toString()],
      });
    expect(res.status).toBe(400);
  });

  it('POST - 400 on empty SELECTED members', async () => {
    const workout = await createTestWorkout(gym._id, userId);

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [],
      });
    expect(res.status).toBe(400);
  });

  // ── Get Assignments ──────────────────────────────────────

  it('GET /api/v1/workout-assignments - list assignments with pagination', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member = await createTestMember(gym._id, userId);
    await WorkoutAssignment.create({
      gymId: gym._id, workoutId: workout._id, memberId: member._id, assignedBy: userId,
    });

    const res = await request(app)
      .get('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.data[0].workoutId.title).toBe(workout.title);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(50);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.totalPages).toBe(1);
  });

  it('GET /api/v1/workout-assignments - paginate with page/limit', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    for (let i = 0; i < 5; i++) {
      const m = await createTestMember(gym._id, userId);
      await WorkoutAssignment.create({ gymId: gym._id, workoutId: workout._id, memberId: m._id, assignedBy: userId });
    }

    const res = await request(app)
      .get('/api/v1/workout-assignments?page=1&limit=3')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(3);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(3);
    expect(res.body.data.total).toBe(5);
    expect(res.body.data.totalPages).toBe(2);
  });

  it('GET /api/v1/workout-assignments - filter by status', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member = await createTestMember(gym._id, userId);
    await WorkoutAssignment.create({ gymId: gym._id, workoutId: workout._id, memberId: member._id, assignedBy: userId, status: 'ACTIVE' });
    await WorkoutAssignment.create({ gymId: gym._id, workoutId: workout._id, memberId: member._id, assignedBy: userId, status: 'REMOVED' });

    const res = await request(app)
      .get('/api/v1/workout-assignments?status=ACTIVE')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.data[0].status).toBe('ACTIVE');
  });

  // ── Get Assignment By ID ─────────────────────────────────

  it('GET /api/v1/workout-assignments/:id - get assignment detail', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member = await createTestMember(gym._id, userId);
    const assignment = await WorkoutAssignment.create({
      gymId: gym._id, workoutId: workout._id, memberId: member._id, assignedBy: userId,
    });

    const res = await request(app)
      .get(`/api/v1/workout-assignments/${assignment._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.workoutId.title).toBe(workout.title);
    expect(res.body.data.memberId.fullName).toBe(member.fullName);
  });

  // ── Update Assignment ────────────────────────────────────

  it('PATCH /api/v1/workout-assignments/:id - update start/end date', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member = await createTestMember(gym._id, userId);
    const assignment = await WorkoutAssignment.create({
      gymId: gym._id, workoutId: workout._id, memberId: member._id, assignedBy: userId,
    });

    const res = await request(app)
      .patch(`/api/v1/workout-assignments/${assignment._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        startDate: '2026-08-01T00:00:00.000Z',
        endDate: '2026-09-01T00:00:00.000Z',
      });
    expect(res.status).toBe(200);
    expect(res.body.data.startDate).toBeTruthy();
  });

  // ── Remove Assignment ────────────────────────────────────

  it('DELETE /api/v1/workout-assignments/:id - soft remove with removedBy', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member = await createTestMember(gym._id, userId);
    const assignment = await WorkoutAssignment.create({
      gymId: gym._id, workoutId: workout._id, memberId: member._id, assignedBy: userId,
    });

    const res = await request(app)
      .delete(`/api/v1/workout-assignments/${assignment._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REMOVED');
    expect(res.body.data.removedBy).toBeTruthy();
    expect(res.body.data.removedAt).toBeTruthy();

    const found = await WorkoutAssignment.findById(assignment._id);
    expect(found.status).toBe('REMOVED');
    expect(found.removedBy.toString()).toBe(userId._id?.toString() || userId.toString());
  });

  // ── Member Assignments ───────────────────────────────────

  it('GET /api/v1/workout-assignments/member/:memberId - get member assignments', async () => {
    const workout = await createTestWorkout(gym._id, userId);
    const member = await createTestMember(gym._id, userId);
    await WorkoutAssignment.create({
      gymId: gym._id, workoutId: workout._id, memberId: member._id, assignedBy: userId,
    });

    const res = await request(app)
      .get(`/api/v1/workout-assignments/member/${member._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].workoutId.title).toBe(workout.title);
  });

  // ── Authorization ────────────────────────────────────────

  it('POST - reject unauthorized role (staff)', async () => {
    const { token: staffToken, gym: staffGym } = await setupAuth('staff');
    const workout = await createTestWorkout(staffGym._id, userId);
    const member = await createTestMember(staffGym._id, userId);

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${staffToken}`)
      .set('x-tenant-id', staffGym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [member._id.toString()],
      });
    expect(res.status).toBe(403);
  });

  // ── Cross-gym ────────────────────────────────────────────

  it('POST - reject cross-gym workout', async () => {
    const otherGym = (await setupAuth()).gym;
    const workout = await createTestWorkout(otherGym._id, userId);
    const member = await createTestMember(gym._id, userId);

    const res = await request(app)
      .post('/api/v1/workout-assignments')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        workoutId: workout._id.toString(),
        assignmentType: 'SELECTED',
        memberIds: [member._id.toString()],
      });
    expect(res.status).toBe(404);
  });
});
