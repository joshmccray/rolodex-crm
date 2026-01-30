import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

const sql = neon(process.env.DATABASE_URL!);

// @ts-ignore - neon types are complex, this works at runtime
export const db = drizzle(sql, { schema });

export * from './schema.js';
