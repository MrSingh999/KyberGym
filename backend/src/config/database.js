import { env } from './env.js';

export const dbConfig = {
  uri: env.MONGO_URI,
  options: {
    // Mongoose 6+ no longer requires useNewUrlParser, useUnifiedTopology, etc.
    // but we can place other connection pool settings here
    maxPoolSize: 100,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};
