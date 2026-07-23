import { vi, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars!!';
process.env.REFRESH_SECRET = 'test-refresh-secret-that-is-at-least-32-chars';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ data: { id: 'mock_email_id' } }) },
  })),
}));

const TEST_DB = 'kybergym_test';
const uri = process.env.MONGO_URI || `mongodb://localhost:27017/${TEST_DB}`;
process.env.MONGO_URI = uri;

beforeAll(async () => {
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
