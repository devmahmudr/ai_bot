import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { configs } from '../configs/env.config';

const client = postgres(configs.DATABASE_URL);
export const db = drizzle(client, { schema });