import { defineConfig } from 'drizzle-kit';
import { configs } from './src/configs/env.config';


export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: configs.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});