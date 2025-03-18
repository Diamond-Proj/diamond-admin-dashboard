import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
  },
  verbose: true,
  strict: true
} satisfies Config; 