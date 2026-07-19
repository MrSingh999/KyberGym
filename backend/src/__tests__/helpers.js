import crypto from 'crypto';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../app.js';
import { Gym } from '../modules/gyms/models/Gym.model.js';
import { User } from '../modules/users/models/User.model.js';
import { Member } from '../modules/member/models/Member.model.js';
import { MembershipPlan } from '../modules/membershipPlan/models/MembershipPlan.model.js';
import { MemberSubscription } from '../modules/memberSubscription/models/MemberSubscription.model.js';
import { Payment } from '../modules/payment/models/Payment.model.js';
import { Broadcast } from '../modules/broadcast/models/Broadcast.model.js';
import { MessageTemplate } from '../modules/messageTemplate/models/MessageTemplate.model.js';
import { Workout } from '../modules/workouts/models/Workout.model.js';
import { WorkoutDay } from '../modules/workoutDay/models/WorkoutDay.model.js';
import { Notification } from '../modules/notification/models/Notification.model.js';
import { env } from '../config/env.js';

export const generateObjectId = () => crypto.randomBytes(12).toString('hex');

export const createTestGym = async (overrides = {}) => {
  return Gym.create({
    name: faker.company.name(),
    slug: faker.lorem.slug(),
    subdomain: faker.lorem.slug().toLowerCase(),
    ownerId: generateObjectId(),
    features: { members: true, workouts: true, notifications: true, payments: true, whatsappBroadcast: true, qrEntry: true, branding: true, attendance: false },
    ...overrides,
  });
};

export const createTestUser = async (gymId, overrides = {}) => {
  const password = overrides.password || 'TestPass123';
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({
    gymId,
    role: 'gym_admin',
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: hashedPassword,
    phone: faker.phone.number(),
    status: 'active',
    isEmailVerified: true,
    ...overrides,
    password: hashedPassword,
  });
};

export const createAuthToken = (user) => {
  return jwt.sign(
    { userId: user._id, gymId: user.gymId, role: user.role, tokenVersion: user.tokenVersion },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const setupAuth = async (role = 'gym_admin') => {
  const gym = await createTestGym();
  const user = await createTestUser(gym._id, { role });
  const token = createAuthToken(user);
  return { gym, user, token };
};

const HEADERS = (token, gymId) => ({
  Authorization: `Bearer ${token}`,
  'x-tenant-id': gymId.toString(),
});

export const authRequest = (token, gymId) => {
  const h = HEADERS(token, gymId);
  return {
    get: (url) => request(app).get(url).set(h),
    post: (url) => request(app).post(url).set(h),
    patch: (url) => request(app).patch(url).set(h),
    delete: (url) => request(app).delete(url).set(h),
  };
};

export const createTestMember = async (gymId, userId, overrides = {}) => {
  return Member.create({
    gymId,
    fullName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
    createdBy: userId,
    ...overrides,
  });
};

export const createTestPlan = async (gymId, overrides = {}) => {
  return MembershipPlan.create({
    gymId,
    name: faker.commerce.productName(),
    durationInDays: 30,
    price: 999,
    ...overrides,
  });
};

export const createTestSubscription = async (gymId, memberId, planId, userId, overrides = {}) => {
  return MemberSubscription.create({
    gymId,
    memberId,
    membershipPlanId: planId,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 86400000),
    amount: 999,
    finalAmount: 999,
    status: 'active',
    assignedBy: userId,
    ...overrides,
  });
};

export const createTestPayment = async (gymId, memberId, userId, overrides = {}) => {
  return Payment.create({
    gymId,
    memberId,
    amount: 500,
    paymentMethod: 'cash',
    status: 'completed',
    receivedBy: userId,
    ...overrides,
  });
};

export const createTestBroadcast = async (gymId, userId, overrides = {}) => {
  return Broadcast.create({
    gymId,
    title: faker.lorem.sentence({ min: 2, max: 5 }),
    message: faker.lorem.paragraph(),
    channel: 'inApp',
    target: 'all',
    createdBy: userId,
    ...overrides,
  });
};

export const createTestTemplate = async (gymId, overrides = {}) => {
  return MessageTemplate.create({
    gymId,
    name: faker.lorem.words(2),
    type: 'custom',
    channel: 'inApp',
    content: faker.lorem.paragraph(),
    ...overrides,
  });
};

export const createTestWorkout = async (gymId, userId, overrides = {}) => {
  return Workout.create({
    gymId,
    title: faker.lorem.words(2),
    assignmentType: 'ALL',
    createdBy: userId,
    ...overrides,
  });
};

export const createTestWorkoutDay = async (workoutId, overrides = {}) => {
  return WorkoutDay.create({
    workoutId,
    dayNumber: 1,
    dayName: faker.lorem.word(),
    ...overrides,
  });
};

export const createTestNotification = async (gymId, userId, overrides = {}) => {
  return Notification.create({
    gymId,
    userId,
    title: faker.lorem.sentence(),
    message: faker.lorem.paragraph(),
    type: 'info',
    ...overrides,
  });
};
