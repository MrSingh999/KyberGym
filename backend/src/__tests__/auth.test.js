import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Gym } from '../modules/gyms/models/Gym.model.js';
import { User } from '../modules/users/models/User.model.js';
import { setupAuth } from './helpers.js';

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/register-owner', () => {
    it('should register a new owner', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register-owner')
        .send({ gymName: 'Test Gym', subdomain: `sub-${Date.now()}`, ownerName: 'Owner', email: `o-${Date.now()}@test.com`, password: 'Password123' });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 409 if subdomain is taken', async () => {
      await Gym.create({ name: 'Test Gym', slug: 'taken', subdomain: 'dup-sub', ownerId: '507f1f77bcf86cd799439001' });
      const res = await request(app).post('/api/v1/auth/register-owner').send({ gymName: 'Test Gym', subdomain: 'dup-sub', ownerName: 'Owner', email: 'e@t.com', password: 'Password123' });
      expect(res.status).toBe(409);
    });

    it('should return 400 on validation error', async () => {
      const res = await request(app).post('/api/v1/auth/register-owner').send({ gymName: 'X' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let gymId;
    beforeEach(async () => {
      const gym = await Gym.create({ name: 'Test Gym', slug: 'lg', subdomain: 'lg', ownerId: '507f1f77bcf86cd799439010', features: { members: true, workouts: true, notifications: true, attendance: false, branding: false } });
      gymId = gym._id.toString();
      const bcrypt = await import('bcryptjs');
      await User.create({ gymId: gym._id, role: 'gym_admin', name: 'User', email: 'login@test.com', password: await bcrypt.hash('Password123', 10), phone: '123', status: 'active', isEmailVerified: true });
    });

    it('should login successfully', async () => {
      const res = await request(app).post('/api/v1/auth/login').set('x-tenant-id', gymId).send({ email: 'login@test.com', password: 'Password123' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').set('x-tenant-id', gymId).send({ email: 'login@test.com', password: 'WrongPass1' });
      expect(res.status).toBe(401);
    });

    it('should return 404 for unknown tenant', async () => {
      const res = await request(app).post('/api/v1/auth/login').set('x-tenant-id', '507f1f77bcf86cd799439999').send({ email: 'login@test.com', password: 'Password123' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should return 401 without cookie', async () => {
      const { gym } = await setupAuth();
      const res = await request(app).post('/api/v1/auth/refresh-token').set('x-tenant-id', gym._id.toString());
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile', async () => {
      const { gym, user, token } = await setupAuth();
      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`).set('x-tenant-id', gym._id.toString());
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(user.email);
    });

    it('should return 401 without token', async () => {
      const { gym } = await setupAuth();
      const res = await request(app).get('/api/v1/auth/me').set('x-tenant-id', gym._id.toString());
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return 200 even if email does not exist', async () => {
      const { gym } = await setupAuth();
      const res = await request(app).post('/api/v1/auth/forgot-password').set('x-tenant-id', gym._id.toString()).send({ email: 'nonexistent@test.com' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const { gym, token } = await setupAuth();
      const res = await request(app).post('/api/v1/auth/logout').set('Authorization', `Bearer ${token}`).set('x-tenant-id', gym._id.toString());
      expect(res.status).toBe(200);
    });
  });
});
