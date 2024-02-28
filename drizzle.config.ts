import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { env } from './src/lib/env';
dotenv.config();

export default {
  schema: './src/schema/index',
  out: './src/schema/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
} satisfies Config;
