import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function main() {
  const sql = neon(databaseUrl!);
  
  console.log('🚀 Creating admins table...');
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "admins" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL,
        "password" text NOT NULL,
        "full_name" text NOT NULL,
        "role" text DEFAULT 'manager' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "admins_email_unique" UNIQUE("email")
      );
    `;
    console.log('✅ Admins table created successfully');
  } catch (error) {
    console.error('❌ Error creating admins table:', error);
  }
}

main();
