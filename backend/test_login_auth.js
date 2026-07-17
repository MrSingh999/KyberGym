import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthService } from './src/modules/auth/auth.service.js';
import { Gym } from './src/modules/gyms/models/Gym.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kybergym';

async function main() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected!');

  const gym = await Gym.findOne({ subdomain: 'test-gym', isDeleted: false });
  if (!gym) {
    console.error('Active Gym with subdomain "test-gym" not found.');
    process.exit(1);
  }

  try {
    console.log(`Testing login for test@test.com with password "test1234" at Gym ID: ${gym._id}...`);
    const result = await AuthService.login('test@test.com', 'test1234', gym._id);
    console.log('\n======================================');
    console.log('LOGIN SUCCESSFUL!');
    console.log('======================================');
    console.log(`User: ${result.user.name} (${result.user.email})`);
    console.log(`Role: ${result.user.role}`);
    console.log('======================================\n');
  } catch (err) {
    console.error('\n======================================');
    console.log('LOGIN FAILED!');
    console.log('======================================');
    console.error(err.message);
    console.log('======================================\n');
  }

  await mongoose.disconnect();
}

main().catch(console.error);
