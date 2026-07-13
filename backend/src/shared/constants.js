export const ROLES = {
  SUPER_ADMIN: 'super_admin', // SaaS owner
  GYM_ADMIN: 'gym_admin',     // Gym owner
  STAFF: 'staff',             // Gym employee
  MEMBER: 'member',           // Gym client
};

export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

export const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
