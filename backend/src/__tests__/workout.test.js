import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Workout } from '../modules/workouts/models/Workout.model.js';
import { WorkoutDay } from '../modules/workoutDay/models/WorkoutDay.model.js';
import { setupAuth } from './helpers.js';

describe('Workout Routes', () => {
  let gym, token, userId;

  beforeEach(async () => {
    const ctx = await setupAuth();
    gym = ctx.gym;
    token = ctx.token;
    userId = ctx.user._id;
  });

  it('POST /api/v1/workouts - create workout', async () => {
    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'Full Body', assignmentType: 'ALL' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Full Body');
  });

  it('POST - return 400 on invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/workouts - list workouts', async () => {
    await Workout.create({ gymId: gym._id, title: 'Push', assignmentType: 'ALL', createdBy: userId });
    await Workout.create({ gymId: gym._id, title: 'Pull', assignmentType: 'ALL', createdBy: userId });
    const res = await request(app)
      .get('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/v1/workouts/:id - get workout with days', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Leg Day', assignmentType: 'ALL', createdBy: userId });
    await WorkoutDay.create({ workoutId: workout._id, dayNumber: 1, dayName: 'Monday', exercises: [{ name: 'Squat', sets: 3, reps: 10 }] });
    const res = await request(app)
      .get(`/api/v1/workouts/${workout._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    expect(res.body.data.days).toHaveLength(1);
    expect(res.body.data.days[0].exercises[0].name).toBe('Squat');
  });

  it('PATCH /api/v1/workouts/:id - update workout', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Old Title', assignmentType: 'ALL', createdBy: userId });
    const res = await request(app)
      .patch(`/api/v1/workouts/${workout._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ title: 'New Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New Title');
  });

  it('DELETE /api/v1/workouts/:id - deactivate workout', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'To Delete', assignmentType: 'ALL', createdBy: userId });
    const res = await request(app)
      .delete(`/api/v1/workouts/${workout._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    const found = await Workout.findById(workout._id);
    expect(found.isActive).toBe(false);
  });

  it('POST /api/v1/workouts/:id/days - add workout day', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Split', assignmentType: 'ALL', createdBy: userId });
    const res = await request(app)
      .post(`/api/v1/workouts/${workout._id}/days`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ dayNumber: 1, dayName: 'Day 1', exercises: [{ name: 'Bench Press', sets: 4, reps: 8 }] });
    expect(res.status).toBe(201);
    expect(res.body.data.dayName).toBe('Day 1');
  });

  it('PATCH /api/v1/workouts/:id/days/:dayId - update workout day', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Split', assignmentType: 'ALL', createdBy: userId });
    const day = await WorkoutDay.create({ workoutId: workout._id, dayNumber: 1, dayName: 'Day 1' });
    const res = await request(app)
      .patch(`/api/v1/workouts/${workout._id}/days/${day._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString())
      .send({ dayName: 'Chest Day' });
    expect(res.status).toBe(200);
    expect(res.body.data.dayName).toBe('Chest Day');
  });

  it('DELETE /api/v1/workouts/:id/days/:dayId - remove workout day', async () => {
    const workout = await Workout.create({ gymId: gym._id, title: 'Split', assignmentType: 'ALL', createdBy: userId });
    const day = await WorkoutDay.create({ workoutId: workout._id, dayNumber: 1, dayName: 'Day 1' });
    const res = await request(app)
      .delete(`/api/v1/workouts/${workout._id}/days/${day._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', gym._id.toString());
    expect(res.status).toBe(200);
    const found = await WorkoutDay.findById(day._id);
    expect(found).toBeNull();
  });
});
