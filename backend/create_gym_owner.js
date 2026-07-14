async function main() {
  const BACKEND_URL = 'http://localhost:5000/api';
  
  try {
    console.log('1. Logging in as Super Admin...');
    const loginRes = await fetch(`${BACKEND_URL}/super-admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@kybergym.com',
        password: 'Admin@123'
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
