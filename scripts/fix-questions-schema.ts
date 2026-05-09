import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixQuestionsSchema() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('Ensuring target_role exists on questions table...');
  
  try {
    // Add target_role if it doesn't exist
    await sql`
      ALTER TABLE questions 
      ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'Teaching'
    `;
    console.log('Successfully updated questions schema.');
  } catch (error) {
    console.error('Error updating questions schema:', error);
  }
}

fixQuestionsSchema();
