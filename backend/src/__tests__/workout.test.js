import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Workout } from '../modules/workouts/models/Workout.model.js';
import { WorkoutDay } from '../modules/workoutDay/models/WorkoutDay.model.js';
import { setupAuth, createTestGym, createTestUser, createAuthToken } from './helpers.js';

describe('Workout Routes', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  // ── Create ─────────────────────────────────────────────────

  it('POST /api/v1/workouts - create workout with defaults', async () => {
    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'Full Body' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Full Body');
    expect(res.body.data.status).toBe('ACTIVE');
    expect(res.body.data.isDeleted).toBe(false);
  });

  it('POST /api/v1/workouts - create workout with all fields', async () => {
    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        title: 'Strength Program',
        description: 'A 4-day strength split',
        goal: 'Strength',
        estimatedDuration: 60,
        category: 'Upper Body',
        status: 'DRAFT',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Strength Program');
    expect(res.body.data.goal).toBe('Strength');
    expect(res.body.data.estimatedDuration).toBe(60);
    expect(res.body.data.category).toBe('Upper Body');
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('POST - return 400 on invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({});
    expect(res.status).toBe(400);
  });

  // ── List ───────────────────────────────────────────────────

  it('GET /api/v1/workouts - list workouts', async () => {
    await Workout.create({ gymId: gym._id, title: 'Push', createdBy: userId });
    await Workout.create({ gymId: gym._id, title: 'Pull', createdBy: userId });
    const res = await request(app)
      .get('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/v1/workouts - filter by status', async () => {
    await Workout.create({ gymId: gym._id, title: 'Active One', status: 'ACTIVE', createdBy: userId });
    await Workout.create({ gymId: gym._id, title: 'Draft One', status: 'DRAFT', createdBy: userId });
    await Workout.create({ gymId: gym._id, title: 'Archived One', status: 'ARCHIVED', createdBy: userId });

    const res = await request(app)
      .get('/api/v1/workouts?status=ACTIVE')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Active One');
  });

  it('GET /api/v1/workouts - search by name', async () => {
    await Workout.create({ gymId: gym._id, title: 'Chest Day', createdBy: userId });
    await Workout.create({ gymId: gym._id, title: 'Leg Day', createdBy: userId });

    const res = await request(app)
      .get('/api/v1/workouts?search=chest')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Chest Day');
  });

  it('GET /api/v1/workouts - search by goal', async () => {
    await Workout.create({ gymId: gym._id, title: 'Weight Loss Program', goal: 'Weight Loss', createdBy: userId });
    await Workout.create({ gymId: gym._id, title: 'Mass Builder', goal: 'Muscle Gain', createdBy: userId });

    const res = await request(app)
      .get('/api/v1/workouts?search=weight')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('GET /api/v1/workouts - sort by title asc', async () => {
    await Workout.create({ gymId: gym._id, title: 'B Program', createdBy: userId });
    await Workout.create({ gymId: gym._id, title: 'A Program', createdBy: userId });

    const res = await request(app)
      .get('/api/v1/workouts?sort=title&order=asc')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('A Program');
    expect(res.body.data[1].title).toBe('B Program');
  });

  it('GET /api/v1/workouts - exclude isDeleted workouts', async () => {
    await Workout.create({ gymId: gym._id, title: 'Visible', createdBy: userId });
    await Workout.create({ gymId: gym._id, title: 'Deleted', isDeleted: true, createdBy: userId });

    const res = await request(app)
      .get('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Visible');
  });

  // ── Get by ID ──────────────────────────────────────────────

  it('GET /api/v1/workouts/:id - get workout with days', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Leg Day', createdBy: userId });
    await WorkoutDay.create({
      workoutId: workout._id,
      orderIndex: 0,
      dayName: 'Monday',
      exercises: [{ name: 'Squat', sets: 3, reps: 10, order: 0 }],
    });
    const res = await request(app)
      .get(`/api/v1/workouts/${workout._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.days).toHaveLength(1);
    expect(res.body.data.days[0].exercises[0].name).toBe('Squat');
  });

  // ── Update ─────────────────────────────────────────────────

  it('PATCH /api/v1/workouts/:id - update workout', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Old Title', createdBy: userId });
    const res = await request(app)
      .patch(`/api/v1/workouts/${workout._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'New Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New Title');
  });

  it('PATCH /api/v1/workouts/:id - update status', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Status Test', createdBy: userId });
    const res = await request(app)
      .patch(`/api/v1/workouts/${workout._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ status: 'ARCHIVED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ARCHIVED');
  });

  // ── Soft Delete ────────────────────────────────────────────

  it('DELETE /api/v1/workouts/:id - soft delete workout', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'To Delete', createdBy: userId });
    const res = await request(app)
      .delete(`/api/v1/workouts/${workout._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    const found = await Workout.findById(workout._id);
    expect(found.isDeleted).toBe(true);
    expect(found.status).toBe('ACTIVE'); // status unchanged
  });

  // ── Duplicate ──────────────────────────────────────────────

  it('POST /api/v1/workouts/:id/duplicate - duplicate workout', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Original', createdBy: userId });
    await WorkoutDay.create({
      workoutId: workout._id,
      orderIndex: 0,
      dayName: 'Day 1',
      exercises: [{ name: 'Bench', sets: 3, reps: 10, order: 0 }],
    });

    const res = await request(app)
      .post(`/api/v1/workouts/${workout._id}/duplicate`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Original (Copy)');
    expect(res.body.data.status).toBe('ACTIVE');
    expect(res.body.data.days).toHaveLength(1);
    expect(res.body.data.days[0].exercises[0].name).toBe('Bench');
  });

  it('POST /api/v1/workouts/:id/duplicate - increments copy counter', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'OG', createdBy: userId });

    const res1 = await request(app)
      .post(`/api/v1/workouts/${workout._id}/duplicate`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res1.body.data.title).toBe('OG (Copy)');

    const res2 = await request(app)
      .post(`/api/v1/workouts/${workout._id}/duplicate`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res2.body.data.title).toBe('OG (Copy 2)');
  });

  // ── Archive ────────────────────────────────────────────────

  it('PATCH /api/v1/workouts/:id/archive - archive workout', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Archive Me', createdBy: userId });
    const res = await request(app)
      .patch(`/api/v1/workouts/${workout._id}/archive`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ARCHIVED');
  });

  // ── Nested Save ────────────────────────────────────────────

  it('PUT /api/v1/workouts/:id/nested - nested save with days', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Nested Save', createdBy: userId });

    const res = await request(app)
      .put(`/api/v1/workouts/${workout._id}/nested`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        title: 'Updated Nested',
        description: 'Updated description',
        goal: 'Weight Loss',
        estimatedDuration: 45,
        days: [
          { dayName: 'Push', orderIndex: 0, exercises: [{ name: 'Bench Press', sets: 4, reps: 8, order: 0 }] },
          { dayName: 'Pull', orderIndex: 1, exercises: [{ name: 'Rows', sets: 3, reps: 10, order: 0 }] },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Nested');
    expect(res.body.data.goal).toBe('Weight Loss');
    expect(res.body.data.days).toHaveLength(2);
    expect(res.body.data.days[0].dayName).toBe('Push');
    expect(res.body.data.days[1].dayName).toBe('Pull');
  });

  it('PUT /api/v1/workouts/:id/nested - update existing and remove missing days', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Diff Test', createdBy: userId });
    const day1 = await WorkoutDay.create({ workoutId: workout._id, dayName: 'Day A', orderIndex: 0 });
    const day2 = await WorkoutDay.create({ workoutId: workout._id, dayName: 'Day B', orderIndex: 1 });

    const res = await request(app)
      .put(`/api/v1/workouts/${workout._id}/nested`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        title: 'Diff Test',
        days: [
          { _id: day1._id.toString(), dayName: 'Day A Updated', orderIndex: 0 },
          { dayName: 'Day C New', orderIndex: 1 },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.days).toHaveLength(2);

    const dayNames = res.body.data.days.map(d => d.dayName);
    expect(dayNames).toContain('Day A Updated');
    expect(dayNames).toContain('Day C New');
    expect(dayNames).not.toContain('Day B');

    const deletedDay = await WorkoutDay.findById(day2._id);
    expect(deletedDay).toBeNull();
  });

  // ── Workout Day CRUD ───────────────────────────────────────

  it('POST /api/v1/workouts/:id/days - add workout day', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Split', createdBy: userId });
    const res = await request(app)
      .post(`/api/v1/workouts/${workout._id}/days`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({
        orderIndex: 0,
        dayName: 'Day 1',
        exercises: [{ name: 'Bench Press', sets: 4, reps: 8, order: 0 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.dayName).toBe('Day 1');
  });

  it('PATCH /api/v1/workouts/:id/days/:dayId - update workout day', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Split', createdBy: userId });
    const day = await WorkoutDay.create({ workoutId: workout._id, orderIndex: 0, dayName: 'Day 1' });
    const res = await request(app)
      .patch(`/api/v1/workouts/${workout._id}/days/${day._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ dayName: 'Chest Day' });
    expect(res.status).toBe(200);
    expect(res.body.data.dayName).toBe('Chest Day');
  });

  it('DELETE /api/v1/workouts/:id/days/:dayId - remove workout day', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Split', createdBy: userId });
    const day = await WorkoutDay.create({ workoutId: workout._id, orderIndex: 0, dayName: 'Day 1' });
    const res = await request(app)
      .delete(`/api/v1/workouts/${workout._id}/days/${day._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    const found = await WorkoutDay.findById(day._id);
    expect(found).toBeNull();
  });

  // ── Edge Cases ─────────────────────────────────────────────

  it('GET /api/v1/workouts/:id - 404 on deleted workout', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Gone', isDeleted: true, createdBy: userId });
    const res = await request(app)
      .get(`/api/v1/workouts/${workout._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(404);
  });

  it('POST /api/v1/workouts/:id/duplicate - 404 on nonexistent workout', async () => {
    const res = await request(app)
      .post('/api/v1/workouts/000000000000000000000000/duplicate')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(404);
  });

  it('estimatedDuration is optional', async () => {
    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'No Duration' });
    expect(res.status).toBe(201);
    expect(res.body.data.estimatedDuration).toBeUndefined();
  });

  it('category is optional', async () => {
    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'No Category' });
    expect(res.status).toBe(201);
    expect(res.body.data.category).toBeUndefined();
  });

  it('goal accepts any free-text string', async () => {
    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'Custom Goal', goal: 'Senior Citizen Flexibility' });
    expect(res.status).toBe(201);
    expect(res.body.data.goal).toBe('Senior Citizen Flexibility');
  });

  // ── Authorization: Shared Gym Workout Library ───────────

  describe('Workout Authorization', () => {
    let sharedGym, adminToken, trainerAToken, trainerBToken, adminUser, trainerAUser, trainerBUser;

    beforeEach(async () => {
      sharedGym = await createTestGym();
      adminUser = await createTestUser(sharedGym._id, { role: 'gym_admin' });
      adminToken = createAuthToken(adminUser);
      trainerAUser = await createTestUser(sharedGym._id, { role: 'trainer' });
      trainerAToken = createAuthToken(trainerAUser);
      trainerBUser = await createTestUser(sharedGym._id, { role: 'trainer' });
      trainerBToken = createAuthToken(trainerBUser);
    });

    it('trainer sees every workout in the gym', async () => {
      const gymId = sharedGym._id.toString();

      await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Admin Workout' });

      await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Workout' });

      await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerBToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer B Workout' });

      const res = await request(app)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId);

      expect(res.status).toBe(200);
      const titles = res.body.data.map(w => w.title);
      expect(titles).toContain('Admin Workout');
      expect(titles).toContain('Trainer A Workout');
      expect(titles).toContain('Trainer B Workout');
    });

    it('admin sees every workout in the gym', async () => {
      const gymId = sharedGym._id.toString();

      await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Admin Workout' });

      await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Workout' });

      await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerBToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer B Workout' });

      const res = await request(app)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', gymId);

      expect(res.status).toBe(200);
      const titles = res.body.data.map(w => w.title);
      expect(titles).toContain('Admin Workout');
      expect(titles).toContain('Trainer A Workout');
      expect(titles).toContain('Trainer B Workout');
    });

    it('trainer edits own workout → 200', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Workout' });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      const res = await request(app)
        .patch(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Updated' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Trainer A Updated');
    });

    it('trainer edits another trainer workout → 403', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Workout' });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      const res = await request(app)
        .patch(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${trainerBToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Hacked Title' });
      expect(res.status).toBe(403);
    });

    it('trainer deletes own workout → 200', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Workout' });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId);
      expect(res.status).toBe(200);
    });

    it('trainer deletes another trainer workout → 403', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Workout' });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${trainerBToken}`)
        .set('x-tenant-id', gymId);
      expect(res.status).toBe(403);
    });

    it('admin edits any workout → 200', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Workout' });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      const res = await request(app)
        .patch(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Admin Edited' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Admin Edited');
    });

    it('admin deletes any workout → 200', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Trainer A Workout' });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', gymId);
      expect(res.status).toBe(200);
    });

    it('duplicate transfers ownership to the duplicator', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Original' });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      // Trainer B duplicates Trainer A's workout
      const res = await request(app)
        .post(`/api/v1/workouts/${workoutId}/duplicate`)
        .set('Authorization', `Bearer ${trainerBToken}`)
        .set('x-tenant-id', gymId);
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Original (Copy)');
      expect(res.body.data.createdBy).toBe(trainerBUser._id.toString());
    });

    it('duplicate preserves workout status', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', gymId)
        .send({ title: 'Draft Program', status: 'DRAFT' });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      const res = await request(app)
        .post(`/api/v1/workouts/${workoutId}/duplicate`)
        .set('Authorization', `Bearer ${trainerAToken}`)
        .set('x-tenant-id', gymId);

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('duplicate copies nested workout data correctly', async () => {
      const gymId = sharedGym._id.toString();

      const createRes = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-tenant-id', gymId)
        .send({
          title: 'Full Program',
          description: 'A complete program',
          goal: 'Strength',
          estimatedDuration: 60,
          category: 'Full Body',
          days: [
            {
              orderIndex: 0,
              dayName: 'Push Day',
              title: 'Upper Body Push',
              exercises: [
                { name: 'Bench Press', sets: 4, reps: 8, restTime: 90, notes: 'Slow negatives', order: 0 },
                { name: 'Overhead Press', sets: 3, reps: 10, order: 1 },
              ],
            },
            {
              orderIndex: 1,
              dayName: 'Pull Day',
              title: 'Upper Body Pull',
              exercises: [
                { name: 'Deadlift', sets: 3, reps: 5, restTime: 120, order: 0 },
              ],
            },
          ],
        });
      const workoutId = createRes.body.data._id || createRes.body.data.id;

      const res = await request(app)
        .post(`/api/v1/workouts/${workoutId}/duplicate`)
        .set('Authorization', `Bearer ${trainerBToken}`)
        .set('x-tenant-id', gymId);

      expect(res.status).toBe(201);
      expect(res.body.data.description).toBe('A complete program');
      expect(res.body.data.goal).toBe('Strength');
      expect(res.body.data.estimatedDuration).toBe(60);
      expect(res.body.data.category).toBe('Full Body');
      expect(res.body.data.days).toHaveLength(2);
      expect(res.body.data.days[0].dayName).toBe('Push Day');
      expect(res.body.data.days[0].title).toBe('Upper Body Push');
      expect(res.body.data.days[0].exercises).toHaveLength(2);
      expect(res.body.data.days[0].exercises[0].name).toBe('Bench Press');
      expect(res.body.data.days[0].exercises[0].sets).toBe(4);
      expect(res.body.data.days[0].exercises[0].reps).toBe(8);
      expect(res.body.data.days[0].exercises[0].restTime).toBe(90);
      expect(res.body.data.days[0].exercises[0].notes).toBe('Slow negatives');
      expect(res.body.data.days[1].dayName).toBe('Pull Day');
      expect(res.body.data.days[1].title).toBe('Upper Body Pull');
      expect(res.body.data.days[1].exercises).toHaveLength(1);
      expect(res.body.data.days[1].exercises[0].name).toBe('Deadlift');
    });
  });
});
