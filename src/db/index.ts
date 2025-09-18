import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get database URL from environment variable
const connectionString = process.env.DATABASE_URL;

// Check if the DATABASE_URL is set
if (!connectionString && process.env.NODE_ENV !== 'development') {
  throw new Error('DATABASE_URL environment variable is not set');
}

// For server-side only
const client = postgres(connectionString || 'postgres://postgres:postgres@localhost:5432/postgres', {
  max: 100, // Maximum number of connections
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } // Accept self-signed certificates in production
    : false, // No SSL in development
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export table schemas
export * from './schema'; 