// Ensure environment variables are loaded
import 'dotenv/config';

import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '@shared/schema';

// Get the environment-specific database URL
const getDatabaseUrl = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return process.env.PROD_DATABASE_URL;
    case 'staging':
      return process.env.STAGING_DATABASE_URL;
    case 'test':
      return process.env.TEST_DATABASE_URL;
    default:
      return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL;
  }
};

const databaseUrl = getDatabaseUrl();
if (!databaseUrl) {
  throw new Error(
    'Database URL must be set. Please check your environment configuration.',
  );
}

// Add connection pool for better performance
const connection = await mysql.createConnection({
  uri: databaseUrl,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
export const db = drizzle(connection, { schema, mode: 'default' });
