export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

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
