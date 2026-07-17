import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { generatePublicId, ALPHABET, SUFFIX_LENGTH } from '../shared/publicId.js';
import { ENTITY_PREFIXES } from '../shared/idPrefixes.js';
import { Gym } from '../modules/gyms/models/Gym.model.js';
import { MembershipPlan } from '../modules/membershipPlan/models/MembershipPlan.model.js';
import { migratePublicIds } from '../database/migratePublicIds.js';

describe('generatePublicId', () => {
  it('should generate a public ID with valid format and prefix', () => {
    Object.values(ENTITY_PREFIXES).forEach((prefix) => {
      const publicId = generatePublicId(prefix);
      expect(publicId).toMatch(new RegExp(`^${prefix}-[A-Z2-9]{${SUFFIX_LENGTH}}$`));
    });
  });

  it('should exclude confusing characters (0, O, 1, I, l)', () => {
    const confusingChars = ['0', 'O', '1', 'I', 'l'];
    
    // Generate many IDs to ensure coverage
    for (let i = 0; i < 1000; i++) {
      const publicId = generatePublicId(ENTITY_PREFIXES.GYM);
      const suffix = publicId.split('-')[1];
      
      confusingChars.forEach((char) => {
        expect(suffix).not.toContain(char);
      });
    }
  });

  it('should throw TypeError for invalid or unsupported prefixes', () => {
    expect(() => generatePublicId('')).toThrow(TypeError);
    expect(() => generatePublicId(null)).toThrow(TypeError);
    expect(() => generatePublicId('INVALID')).toThrow(TypeError);
  });

  it('should produce unique IDs', () => {
    const set = new Set();
    const count = 500;
    
    for (let i = 0; i < count; i++) {
      const publicId = generatePublicId(ENTITY_PREFIXES.MEM);
      set.add(publicId);
    }
    
    expect(set.size).toBe(count);
  });
});

describe('Public ID Database Integration', () => {
  it('should automatically assign publicId upon document creation', async () => {
    const gym = new Gym({
      name: 'Test Gym For Public ID',
      slug: 'test-gym-public-id-' + Date.now(),
      ownerId: new mongoose.Types.ObjectId(),
    });
    
    expect(gym.publicId).toBeDefined();
    expect(gym.publicId).toMatch(/^GYM-[A-Z2-9]{8}$/);
    
    await gym.save();
    expect(gym.publicId).toMatch(/^GYM-[A-Z2-9]{8}$/);
  });

  it('should enforce immutability of publicId', async () => {
    const gym = await Gym.create({
      name: 'Test Gym Immutability',
      slug: 'test-gym-immutability-' + Date.now(),
      ownerId: new mongoose.Types.ObjectId(),
    });
    
    const originalPublicId = gym.publicId;
    
    // Attempting to modify publicId on save
    gym.publicId = 'GYM-CHANGED';
    await gym.save();
    
    // Retrieve the document again and check if it changed
    const reloaded = await Gym.findById(gym._id);
    expect(reloaded.publicId).toBe(originalPublicId);
  });

  it('should migrate documents missing publicId using migration script', async () => {
    const plan = await MembershipPlan.create({
      gymId: new mongoose.Types.ObjectId(),
      name: 'Plan For Migration',
      durationInDays: 30,
      price: 500,
    });
    
    // Explicitly unset publicId in the database
    await MembershipPlan.collection.updateOne(
      { _id: plan._id },
      { $unset: { publicId: '' } }
    );
    
    // Verify it is missing publicId in the database
    const unsetPlan = await MembershipPlan.findById(plan._id).lean();
    expect(unsetPlan.publicId).toBeUndefined();

    // Run migration script
    await migratePublicIds();

    // Verify it has been populated with the correct prefix and suffix format
    const migratedPlan = await MembershipPlan.findById(plan._id).lean();
    expect(migratedPlan.publicId).toBeDefined();
    expect(migratedPlan.publicId).toMatch(/^PLAN-[A-Z2-9]{8}$/);
  });
});

import { serialize } from '../shared/responseSerializer.js';
import { resolveTenant } from '../middleware/tenant.middleware.js';

describe('Response Serialization Helper', () => {
  it('should recursively map publicId to id, strip _id and __v, and preserve Date objects', () => {
    const rawData = {
      _id: new mongoose.Types.ObjectId(),
      __v: 0,
      publicId: 'GYM-XYZ12345',
      name: 'Sample Gym',
      createdAt: new Date('2026-07-17T00:00:00.000Z'),
      members: [
        {
          _id: new mongoose.Types.ObjectId(),
          publicId: 'MEM-ABC88888',
          fullName: 'John Doe',
        }
      ]
    };

    const serialized = serialize(rawData);

    expect(serialized._id).toBeUndefined();
    expect(serialized.__v).toBeUndefined();
    expect(serialized.publicId).toBeUndefined();
    expect(serialized.id).toBe('GYM-XYZ12345');
    expect(serialized.name).toBe('Sample Gym');
    expect(serialized.createdAt).toBeInstanceOf(Date);
    
    expect(serialized.members[0]._id).toBeUndefined();
    expect(serialized.members[0].publicId).toBeUndefined();
    expect(serialized.members[0].id).toBe('MEM-ABC88888');
    expect(serialized.members[0].fullName).toBe('John Doe');
  });
});

describe('Tenant Resolution Middleware Integration', () => {
  it('should resolve Gym using a publicId tenant header', async () => {
    const gym = await Gym.create({
      name: 'Tenant Resolve Gym',
      slug: 'tenant-resolve-' + Date.now(),
      ownerId: new mongoose.Types.ObjectId(),
    });

    const req = {
      get: (header) => {
        if (header === 'x-tenant-id') return gym.publicId;
        return null;
      }
    };

    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    await resolveTenant(req, res, next);

    expect(nextCalled).toBe(true);
    expect(req.gym).toBeDefined();
    expect(req.gym._id.toString()).toBe(gym._id.toString());
  });
});
