import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import { SuperAdmin } from '../modules/super-admin/superAdmin.model.js';
import { Gym } from '../modules/gyms/models/Gym.model.js';
import { GymSubscriptionPayment } from '../modules/gymSubscriptionPayment/models/GymSubscriptionPayment.model.js';
import { authConfig } from '../config/env.js';
import { createTestGym, createTestUser, createAuthToken } from './helpers.js';

const createSuperAdminToken = (superAdmin) => {
  return jwt.sign(
    { id: superAdmin._id },
    authConfig.superAdminJwtSecret,
    { expiresIn: '1h' }
  );
};

describe('Gym Subscription Payment Routes', () => {
  let gym, superAdmin, token;

  beforeEach(async () => {
    gym = await createTestGym();
    const hashedPassword = await bcrypt.hash('TestPass123', 10);
    superAdmin = await SuperAdmin.create({
      fullName: 'Super Admin',
      email: 'super@admin.com',
      password: hashedPassword,
    });
    token = createSuperAdminToken(superAdmin);
  });

  describe('POST /api/v1/gym-subscription-payments', () => {
    it('should create a payment', async () => {
      const res = await request(app)
        .post('/api/v1/gym-subscription-payments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gymId: gym.publicId,
          subscriptionId: 'SUB-2026-Q3',
          amount: 5000,
          paymentMethod: 'cash',
          notes: 'Monthly subscription',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(5000);
      expect(res.body.data.paymentMethod).toBe('cash');
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.id).toMatch(/^GPAY-/);
      expect(res.body.data.subscriptionId).toBe('SUB-2026-Q3');
    });

    it('should return 400 when subscriptionId is missing', async () => {
      const res = await request(app)
        .post('/api/v1/gym-subscription-payments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          gymId: gym.publicId,
          amount: 5000,
          paymentMethod: 'cash',
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 on invalid data', async () => {
      const res = await request(app)
        .post('/api/v1/gym-subscription-payments')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: -100, paymentMethod: 'invalid' });
      expect(res.status).toBe(400);
    });

    it('should return 400 when gymId is missing', async () => {
      const res = await request(app)
        .post('/api/v1/gym-subscription-payments')
        .set('Authorization', `Bearer ${token}`)
        .send({ subscriptionId: 'SUB-2026-Q3', amount: 5000, paymentMethod: 'cash' });
      expect(res.status).toBe(400);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/gym-subscription-payments')
        .send({ gymId: gym.publicId, subscriptionId: 'SUB-2026-Q3', amount: 5000, paymentMethod: 'cash' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/gym-subscription-payments', () => {
    it('should list payments', async () => {
      await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 1000, paymentMethod: 'cash', receivedBy: superAdmin._id });
      await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S2', amount: 2000, paymentMethod: 'upi', receivedBy: superAdmin._id });

      const res = await request(app)
        .get('/api/v1/gym-subscription-payments')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('should filter by gymId', async () => {
      const gym2 = await createTestGym();
      await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 1000, paymentMethod: 'cash', receivedBy: superAdmin._id });
      await GymSubscriptionPayment.create({ gymId: gym2._id, subscriptionId: 'S2', amount: 2000, paymentMethod: 'upi', receivedBy: superAdmin._id });

      const res = await request(app)
        .get(`/api/v1/gym-subscription-payments?gymId=${gym.publicId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should filter by status', async () => {
      await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 1000, paymentMethod: 'cash', receivedBy: superAdmin._id });
      await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S2', amount: 2000, paymentMethod: 'upi', status: 'refunded', receivedBy: superAdmin._id });

      const res = await request(app)
        .get('/api/v1/gym-subscription-payments?status=refunded')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('refunded');
    });

    it('should filter by subscriptionId', async () => {
      await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'SUB-Q3', amount: 1000, paymentMethod: 'cash', receivedBy: superAdmin._id });
      await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'SUB-Q4', amount: 2000, paymentMethod: 'upi', receivedBy: superAdmin._id });

      const res = await request(app)
        .get('/api/v1/gym-subscription-payments?subscriptionId=SUB-Q4')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].subscriptionId).toBe('SUB-Q4');
    });
  });

  describe('GET /api/v1/gym-subscription-payments/:id', () => {
    it('should get payment by publicId (GPAY-XXXX format)', async () => {
      const payment = await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 3000, paymentMethod: 'card', receivedBy: superAdmin._id });

      const res = await request(app)
        .get(`/api/v1/gym-subscription-payments/${payment.publicId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(3000);
    });

    it('should return 400 for non-GPAY format ID', async () => {
      const res = await request(app)
        .get('/api/v1/gym-subscription-payments/INVALID-ID')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent payment', async () => {
      const res = await request(app)
        .get('/api/v1/gym-subscription-payments/GPAY-AAAAAAAA')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/gym-subscription-payments/:id', () => {
    it('should update a payment', async () => {
      const payment = await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 1000, paymentMethod: 'cash', receivedBy: superAdmin._id });

      const res = await request(app)
        .patch(`/api/v1/gym-subscription-payments/${payment.publicId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 2500, notes: 'Updated amount' });
      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(2500);
      expect(res.body.data.notes).toBe('Updated amount');
    });

    it('should reject updating status via PATCH', async () => {
      const payment = await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 1000, paymentMethod: 'cash', receivedBy: superAdmin._id });

      const res = await request(app)
        .patch(`/api/v1/gym-subscription-payments/${payment.publicId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'refunded' });
      expect(res.status).toBe(400);
    });

    it('should reject updating immutable fields', async () => {
      const payment = await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 1000, paymentMethod: 'cash', receivedBy: superAdmin._id });

      const res = await request(app)
        .patch(`/api/v1/gym-subscription-payments/${payment.publicId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ publicId: 'GPAY-FAKE1234' });
      expect(res.status).toBe(400);
    });

    it('should reject update on refunded payment', async () => {
      const payment = await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 1000, paymentMethod: 'cash', status: 'refunded', receivedBy: superAdmin._id, refundedAt: new Date(), refundedBy: superAdmin._id });

      const res = await request(app)
        .patch(`/api/v1/gym-subscription-payments/${payment.publicId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 2000 });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent payment', async () => {
      const res = await request(app)
        .patch('/api/v1/gym-subscription-payments/GPAY-AAAAAAAA')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 2500 });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/gym-subscription-payments/:id/refund', () => {
    it('should refund a payment', async () => {
      const payment = await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 5000, paymentMethod: 'cash', receivedBy: superAdmin._id });

      const res = await request(app)
        .post(`/api/v1/gym-subscription-payments/${payment.publicId}/refund`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Customer requested refund' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('refunded');
      expect(res.body.data.refundedAt).toBeDefined();
    });

    it('should reject refund on already refunded payment', async () => {
      const payment = await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 5000, paymentMethod: 'cash', status: 'refunded', receivedBy: superAdmin._id, refundedAt: new Date(), refundedBy: superAdmin._id });

      const res = await request(app)
        .post(`/api/v1/gym-subscription-payments/${payment.publicId}/refund`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Double refund' });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent payment', async () => {
      const res = await request(app)
        .post('/api/v1/gym-subscription-payments/GPAY-AAAAAAAA/refund')
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Refund' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/gym-subscription-payments/:id', () => {
    it('should delete a payment', async () => {
      const payment = await GymSubscriptionPayment.create({ gymId: gym._id, subscriptionId: 'S1', amount: 1000, paymentMethod: 'cash', receivedBy: superAdmin._id });

      const res = await request(app)
        .delete(`/api/v1/gym-subscription-payments/${payment.publicId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);

      const check = await GymSubscriptionPayment.findOne({ publicId: payment.publicId });
      expect(check).toBeNull();
    });

    it('should return 404 for non-existent payment', async () => {
      const res = await request(app)
        .delete('/api/v1/gym-subscription-payments/GPAY-AAAAAAAA')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Auth guard', () => {
    it('should reject requests without token', async () => {
      const res = await request(app)
        .get('/api/v1/gym-subscription-payments');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/gym-subscription-payments')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
    });

    it('should reject Gym Admin tokens', async () => {
      const gymAdmin = await createTestUser(gym._id);
      const gymAdminToken = createAuthToken(gymAdmin);

      const res = await request(app)
        .get('/api/v1/gym-subscription-payments')
        .set('Authorization', `Bearer ${gymAdminToken}`);
      expect(res.status).toBe(401);
    });

    it('should reject Gym Admin tokens on POST', async () => {
      const gymAdmin = await createTestUser(gym._id);
      const gymAdminToken = createAuthToken(gymAdmin);

      const res = await request(app)
        .post('/api/v1/gym-subscription-payments')
        .set('Authorization', `Bearer ${gymAdminToken}`)
        .send({ gymId: gym.publicId, subscriptionId: 'S1', amount: 5000, paymentMethod: 'cash' });
      expect(res.status).toBe(401);
    });
  });
});
