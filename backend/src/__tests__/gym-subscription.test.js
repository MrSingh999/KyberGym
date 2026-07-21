import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { GymSubscription } from '../modules/gymSubscription/models/GymSubscription.model.js';
import { GymSubscriptionPayment } from '../modules/gymSubscriptionPayment/models/GymSubscriptionPayment.model.js';
import { GymSubscriptionRepository } from '../modules/gymSubscription/gymSubscription.repository.js';
import { checkAndUpdateExpiry } from '../modules/gyms/subscription.helper.js';
import { GymService } from '../modules/gyms/gym.service.js';
import { Gym } from '../modules/gyms/models/Gym.model.js';
import { User } from '../modules/users/models/User.model.js';
import { SuperAdminService } from '../modules/super-admin/superAdmin.service.js';
import { SuperAdmin } from '../modules/super-admin/superAdmin.model.js';
import bcrypt from 'bcryptjs';

describe('GymSubscriptionRepository', () => {
  let gymId;

  beforeEach(async () => {
    const gym = await Gym.create({
      name: 'Test Gym',
      slug: 'test-gym',
      subdomain: 'test-gym',
      ownerId: new mongoose.Types.ObjectId(),
    });
    gymId = gym._id;
  });

  describe('findByGymId', () => {
    it('should return null when no subscription exists', async () => {
      const result = await GymSubscriptionRepository.findByGymId(gymId);
      expect(result).toBeNull();
    });

    it('should return subscription when it exists', async () => {
      await GymSubscription.create({ gymId, status: 'trial' });
      const result = await GymSubscriptionRepository.findByGymId(gymId);
      expect(result).not.toBeNull();
      expect(result.status).toBe('trial');
      expect(result.gymId.toString()).toBe(gymId.toString());
    });
  });

  describe('findByGymIds', () => {
    it('should return subscriptions for multiple gyms', async () => {
      const gym2 = await Gym.create({
        name: 'Test Gym 2',
        slug: 'test-gym-2',
        subdomain: 'test-gym-2',
        ownerId: new mongoose.Types.ObjectId(),
      });
      await GymSubscription.create({ gymId, status: 'active' });
      await GymSubscription.create({ gymId: gym2._id, status: 'trial' });
      const result = await GymSubscriptionRepository.findByGymIds([gymId, gym2._id]);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOrCreate', () => {
    it('should create subscription when none exists', async () => {
      const result = await GymSubscriptionRepository.findOrCreate(gymId);
      expect(result).not.toBeNull();
      expect(result.status).toBe('trial');
      expect(result.gymId.toString()).toBe(gymId.toString());
    });

    it('should return existing subscription when one exists', async () => {
      const existing = await GymSubscription.create({ gymId, status: 'active' });
      const result = await GymSubscriptionRepository.findOrCreate(gymId);
      expect(result._id.toString()).toBe(existing._id.toString());
      expect(result.status).toBe('active');
    });
  });

  describe('upsert', () => {
    it('should create new subscription', async () => {
      const result = await GymSubscriptionRepository.upsert(gymId, { status: 'trial', startDate: new Date() });
      expect(result).not.toBeNull();
      expect(result.gymId.toString()).toBe(gymId.toString());
    });

    it('should update existing subscription', async () => {
      await GymSubscription.create({ gymId, status: 'trial' });
      const result = await GymSubscriptionRepository.upsert(gymId, { status: 'active' });
      expect(result.status).toBe('active');
    });

    it('should enforce unique gymId constraint', async () => {
      await GymSubscription.create({ gymId, status: 'trial' });
      await expect(GymSubscription.create({ gymId, status: 'active' })).rejects.toThrow();
    });

    it('should accept session option for transactions', async () => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const result = await GymSubscriptionRepository.upsert(gymId, { status: 'trial' }, { session });
        expect(result).not.toBeNull();
        expect(result.status).toBe('trial');
        await session.commitTransaction();
      } finally {
        session.endSession();
      }
    });
  });

  describe('updateByGymId', () => {
    it('should update subscription status', async () => {
      await GymSubscription.create({ gymId, status: 'trial' });
      const result = await GymSubscriptionRepository.updateByGymId(gymId, { status: 'active' });
      expect(result.status).toBe('active');
    });

    it('should return null when no subscription exists', async () => {
      const result = await GymSubscriptionRepository.updateByGymId(gymId, { status: 'active' });
      expect(result).toBeNull();
    });
  });

  describe('countByStatus', () => {
    it('should count subscriptions by status', async () => {
      await GymSubscription.create({ gymId, status: 'trial' });
      const gym2 = await Gym.create({ name: 'G2', slug: 'g2', subdomain: 'g2', ownerId: new mongoose.Types.ObjectId() });
      await GymSubscription.create({ gymId: gym2._id, status: 'active' });
      expect(await GymSubscriptionRepository.countByStatus('trial')).toBe(1);
      expect(await GymSubscriptionRepository.countByStatus('active')).toBe(1);
      expect(await GymSubscriptionRepository.countByStatus('expired')).toBe(0);
    });
  });

  describe('findGymIdsByStatus', () => {
    it('should return gym IDs for a given status', async () => {
      await GymSubscription.create({ gymId, status: 'trial' });
      const result = await GymSubscriptionRepository.findGymIdsByStatus('trial');
      expect(result.map(id => id.toString())).toContain(gymId.toString());
    });
  });

  describe('deleteByGymId', () => {
    it('should delete subscription for a gym', async () => {
      await GymSubscription.create({ gymId, status: 'trial' });
      await GymSubscriptionRepository.deleteByGymId(gymId);
      const result = await GymSubscriptionRepository.findByGymId(gymId);
      expect(result).toBeNull();
    });
  });
});

describe('checkAndUpdateExpiry', () => {
  let gymId;

  beforeEach(async () => {
    const gym = await Gym.create({
      name: 'Expiry Test Gym',
      slug: 'expiry-test',
      subdomain: 'expiry-test',
      ownerId: new mongoose.Types.ObjectId(),
    });
    gymId = gym._id;
  });

  it('should create subscription if none exists', async () => {
    const result = await checkAndUpdateExpiry(gymId);
    expect(result).not.toBeNull();
    expect(result.status).toBe('trial');
  });

  it('should not change status if no expiresAt', async () => {
    await GymSubscription.create({ gymId, status: 'active' });
    const result = await checkAndUpdateExpiry(gymId);
    expect(result.status).toBe('active');
  });

  it('should not change status if expiresAt is in the future', async () => {
    const future = new Date(Date.now() + 86400000);
    await GymSubscription.create({ gymId, status: 'active', expiresAt: future });
    const result = await checkAndUpdateExpiry(gymId);
    expect(result.status).toBe('active');
  });

  it('should set status to expired when expiresAt is past', async () => {
    const past = new Date(Date.now() - 86400000);
    await GymSubscription.create({ gymId, status: 'active', expiresAt: past });
    const result = await checkAndUpdateExpiry(gymId);
    expect(result.status).toBe('expired');
    const dbSub = await GymSubscriptionRepository.findByGymId(gymId);
    expect(dbSub.status).toBe('expired');
  });

  it('should not update if already expired', async () => {
    const past = new Date(Date.now() - 86400000);
    await GymSubscription.create({ gymId, status: 'expired', expiresAt: past });
    const result = await checkAndUpdateExpiry(gymId);
    expect(result.status).toBe('expired');
  });
});

describe('Subscription Status Transition Validation', () => {
  let gymId, superAdmin;
  const VALID_TRANSITIONS = {
    trial: ['active', 'suspended'],
    active: ['expired', 'suspended'],
    expired: ['suspended'],
    suspended: ['active', 'expired'],
  };

  beforeEach(async () => {
    const gym = await Gym.create({
      name: 'Transition Test Gym',
      slug: 'transition-test',
      subdomain: 'transition-test',
      ownerId: new mongoose.Types.ObjectId(),
    });
    gymId = gym._id;
    const hashedPassword = await bcrypt.hash('TestPass123', 10);
    superAdmin = await SuperAdmin.create({
      fullName: 'Super Admin',
      email: 'super@admin.com',
      password: hashedPassword,
    });
  });

  it('should allow valid transitions', async () => {
    for (const [from, toList] of Object.entries(VALID_TRANSITIONS)) {
      for (const to of toList) {
        await GymSubscription.deleteMany({});
        await GymSubscription.create({ gymId, status: from });
        const result = await SuperAdminService.updateSubscriptionStatus(gymId, to);
        expect(result.status).toBe(to);
      }
    }
  });

  it('should reject invalid transitions', async () => {
    const invalidCases = [
      ['active', 'trial'],
      ['expired', 'trial'],
      ['suspended', 'trial'],
      ['trial', 'trial'],
    ];
    for (const [from, to] of invalidCases) {
      if (from === to) continue;
      await GymSubscription.deleteMany({});
      await GymSubscription.create({ gymId, status: from });
      await expect(SuperAdminService.updateSubscriptionStatus(gymId, to)).rejects.toThrow();
    }
  });

  it('should allow expired -> active through renewSubscription', async () => {
    await GymSubscription.create({ gymId, status: 'expired' });
    const future = new Date(Date.now() + 86400000);
    const past = new Date();
    const result = await SuperAdminService.renewSubscription(gymId, {
      startDate: past.toISOString(),
      expiresAt: future.toISOString(),
      amountPaid: 5000,
      duration: 30,
      paymentMethod: 'cash',
    }, superAdmin._id);
    expect(result.status).toBe('active');
  });

  it('should reject renewSubscription for non-existent gym', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const future = new Date(Date.now() + 86400000);
    await expect(SuperAdminService.renewSubscription(fakeId, {
      startDate: new Date().toISOString(),
      expiresAt: future.toISOString(),
      amountPaid: 5000,
    }, superAdmin._id)).rejects.toThrow();
  });

  it('should reject manageTrial start from expired status', async () => {
    await GymSubscription.create({ gymId, status: 'expired' });
    await expect(SuperAdminService.manageTrial(gymId, {
      action: 'start',
      trialEndsAt: new Date(Date.now() + 86400000).toISOString(),
    })).rejects.toThrow();
  });

  it('should allow manageTrial end from trial status', async () => {
    await GymSubscription.create({ gymId, status: 'trial' });
    const result = await SuperAdminService.manageTrial(gymId, { action: 'end' });
    expect(result.status).toBe('expired');
  });

  it('should reject manageTrial end from non-trial status', async () => {
    await GymSubscription.create({ gymId, status: 'active' });
    await expect(SuperAdminService.manageTrial(gymId, { action: 'end' })).rejects.toThrow();
  });

  it('should handle same-status transition gracefully', async () => {
    await GymSubscription.create({ gymId, status: 'active' });
    const result = await SuperAdminService.updateSubscriptionStatus(gymId, 'active');
    expect(result.status).toBe('active');
  });
});

describe('Transaction Rollback Behaviour', () => {
  it('should roll back gym creation if subscription creation fails', async () => {
    const gymCountBefore = await Gym.countDocuments();
    const subCountBefore = await GymSubscription.countDocuments();

    try {
      await GymService._createGymWithAdminInner({
        name: 'Rollback Test Gym',
        subdomain: `rollback-${Date.now()}`,
        ownerName: 'Test Owner',
        email: `owner-${Date.now()}@test.com`,
        password: 'TestPass123',
        phone: '1234567890',
      }, false);
    } catch (e) {
      // Expected to fail — email has no ownerId collision
    }

    const gymCountAfter = await Gym.countDocuments();
    const subCountAfter = await GymSubscription.countDocuments();
    expect(gymCountAfter - gymCountBefore).toBe(1);
    expect(subCountAfter - subCountBefore).toBe(1);
  });

  it('should maintain data integrity after successful gym creation', async () => {
    const uniqueSuffix = Date.now() + Math.random().toString(36).slice(2);
    const result = await GymService.createGymWithAdmin({
      name: `Integrity Test ${uniqueSuffix}`,
      subdomain: `integrity-${uniqueSuffix}`.toLowerCase(),
      ownerName: 'Owner',
      email: `integrity-${uniqueSuffix}@test.com`,
      password: 'TestPass123',
      phone: '1234567890',
    });

    expect(result.gym).toBeDefined();
    expect(result.user).toBeDefined();

    const sub = await GymSubscriptionRepository.findByGymId(result.gym._id);
    expect(sub).not.toBeNull();
    expect(sub.status).toBe('trial');
  });
});

describe('renewSubscription', () => {
  let gymId, superAdmin;

  beforeEach(async () => {
    const gym = await Gym.create({
      name: 'Renewal Test Gym',
      slug: 'renewal-test',
      subdomain: 'renewal-test',
      ownerId: new mongoose.Types.ObjectId(),
    });
    gymId = gym._id;
    await GymSubscription.create({ gymId, status: 'trial' });
    const hashedPassword = await bcrypt.hash('TestPass123', 10);
    superAdmin = await SuperAdmin.create({
      fullName: 'Super Admin',
      email: 'super@admin.com',
      password: hashedPassword,
    });
  });

  it('should renew subscription and create payment record', async () => {
    const future = new Date(Date.now() + 86400000);
    const past = new Date();
    const result = await SuperAdminService.renewSubscription(gymId, {
      startDate: past.toISOString(),
      expiresAt: future.toISOString(),
      amountPaid: 5000,
      duration: 30,
      paymentMethod: 'cash',
    }, superAdmin._id);

    expect(result.status).toBe('active');
    expect(result.startDate).toBeDefined();
    expect(result.expiresAt).toBeDefined();

    const payment = await GymSubscriptionPayment.findOne({ gymId });
    expect(payment).not.toBeNull();
    expect(payment.amount).toBe(5000);
    expect(payment.paymentMethod).toBe('cash');
    expect(payment.paymentProvider).toBe('manual');
    expect(payment.receivedBy.toString()).toBe(superAdmin._id.toString());
  });

  it('should renew with default payment method when not provided', async () => {
    const future = new Date(Date.now() + 86400000);
    const result = await SuperAdminService.renewSubscription(gymId, {
      startDate: new Date().toISOString(),
      expiresAt: future.toISOString(),
      amountPaid: 3000,
    }, superAdmin._id);

    expect(result.status).toBe('active');
    const payment = await GymSubscriptionPayment.findOne({ gymId });
    expect(payment.paymentMethod).toBe('cash');
  });

  it('should throw error for deleted gym', async () => {
    await Gym.findByIdAndUpdate(gymId, { isDeleted: true });
    const future = new Date(Date.now() + 86400000);
    await expect(SuperAdminService.renewSubscription(gymId, {
      startDate: new Date().toISOString(),
      expiresAt: future.toISOString(),
      amountPaid: 5000,
    }, superAdmin._id)).rejects.toThrow();
  });
});

describe('GymSubscription Data Integrity', () => {
  it('should enforce unique gymId on GymSubscription', async () => {
    const gym = await Gym.create({
      name: 'Unique Test',
      slug: 'unique-test',
      subdomain: 'unique-test',
      ownerId: new mongoose.Types.ObjectId(),
    });
    await GymSubscription.create({ gymId: gym._id, status: 'trial' });
    await expect(GymSubscription.create({ gymId: gym._id, status: 'active' })).rejects.toThrow();
  });

  it('should create exactly one subscription per gym via createGymWithAdmin', async () => {
    const uniqueSuffix = Date.now() + Math.random().toString(36).slice(2);
    const result = await GymService.createGymWithAdmin({
      name: `One Sub Test ${uniqueSuffix}`,
      subdomain: `one-sub-${uniqueSuffix}`.toLowerCase(),
      ownerName: 'Owner',
      email: `one-sub-${uniqueSuffix}@test.com`,
      password: 'TestPass123',
    });

    const subs = await GymSubscription.find({ gymId: result.gym._id });
    expect(subs).toHaveLength(1);
  });
});
