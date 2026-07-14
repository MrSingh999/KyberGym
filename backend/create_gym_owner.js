import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Error: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined in the .env file.');
    process.exit(1);
  }
  
  try {
    console.log('1. Logging in as Super Admin...');
    const loginRes = await fetch(`${BACKEND_URL}/super-admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
    }
    
    const token = loginJson.data.token;
    console.log('Super Admin login successful! Token retrieved.');
    
    console.log('2. Registering a new Gym and Owner...');
    const createGymRes = await fetch(`${BACKEND_URL}/super-admin/gyms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        gymName: "Heaven's Arena Gym",
        subdomain: "heavens-arena",
        ownerName: "Ging Freecss",
        email: "ging@heavensarena.com",
        phone: "9876543210"
      })
    });
    
    const createGymJson = await createGymRes.json();
    if (!createGymRes.ok) {
      throw new Error(`Gym creation failed: ${JSON.stringify(createGymJson)}`);
    }
    
    const { gym, admin, temporaryPassword } = createGymJson.data;
    console.log('\n==================================================');
    console.log('GYM & OWNER REGISTERED SUCCESSFULLY!');
    console.log('==================================================');
    console.log(`Gym Name:  ${gym.name}`);
    console.log(`Gym ID:    ${gym._id}`);
    console.log(`Owner Name: ${admin.name}`);
    console.log(`Email:     ${admin.email}`);
    console.log(`Password:  ${temporaryPassword}`);
    console.log('==================================================\n');
    
  } catch (err) {
    console.error('Error executing gym owner creation:', err.message);
  }
}

main();
