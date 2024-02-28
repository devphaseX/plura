import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from './env';
import * as schema from '../schema';

const client = postgres(env.DATABASE_URL, { max: 2 });

const db = drizzle(client, { schema });

export { db };
