import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  console.log('Running migrations...');
  
  await migrate(db, { 
    migrationsFolder: './lib/db/migrations' 
  });
  
  console.log('Migrations completed!');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
