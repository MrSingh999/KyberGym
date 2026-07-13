import { vi, afterEach } from 'vitest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars!!';
process.env.REFRESH_SECRET = 'test-refresh-secret-that-is-at-least-32-chars';

const dTemp = path.join('D:\\', 'tmp', 'kybergym-test');
fs.mkdirSync(dTemp, { recursive: true });
process.env.TMPDIR = dTemp;
process.env.TEMP = dTemp;
process.env.TMP = dTemp;
process.env.MONGOMS_DOWNLOAD_DIR = path.join('D:\\', 'mongodb-cache');
fs.mkdirSync(process.env.MONGOMS_DOWNLOAD_DIR, { recursive: true });

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ data: { id: 'mock_email_id' } }) },
  })),
}));

const replSet = await MongoMemoryReplSet.create({
  replSet: { count: 1 },
});
const uri = replSet.getUri();
process.env.MONGO_URI = uri;
await mongoose.connect(uri);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
