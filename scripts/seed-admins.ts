import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function main() {
  const sql = neon(databaseUrl!);
  const admins = [];

  // 1. Try to read from data/admins.json
  const DATA_PATH = path.join(process.cwd(), 'data', 'admins.json');
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const list = JSON.parse(raw);
    admins.push(...list);
    console.log(`📂 Found ${list.length} admins in data/admins.json`);
  } catch (err) {
    console.log('ℹ️ No data/admins.json found or readable');
  }

  // 2. Try to read from .env
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || process.env.NEXT_PUBLIC_ADMIN_FULL_NAME || 'Super Administrator';

  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    if (!admins.some(a => a.email === ADMIN_EMAIL)) {
      admins.push({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        fullName: ADMIN_FULL_NAME,
        role: 'superadmin'
      });
      console.log(`🔐 Found admin in .env: ${ADMIN_EMAIL}`);
    }
  }

  if (admins.length === 0) {
    console.log('⚠️ No admins found to seed');
    return;
  }

  console.log(`🚀 Seeding ${admins.length} admins to Neon Database...`);

  for (const admin of admins) {
    try {
      await sql`
        INSERT INTO "admins" (email, password, full_name, role)
        VALUES (${admin.email}, ${admin.password}, ${admin.fullName || admin.email}, ${admin.role || 'manager'})
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          updated_at = NOW()
      `;
      console.log(`✅ Seeded admin: ${admin.email}`);
    } catch (error) {
      console.error(`❌ Error seeding admin ${admin.email}:`, error);
    }
  }
}

main();
