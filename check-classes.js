// Simple script to check if classes exist in the database
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please set DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function checkClasses() {
  try {
    console.log('🔍 Checking classes in database...');
    
    // Check if classes table exists and what structure it has
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'classes'
      ORDER BY ordinal_position;
    `;
    
    console.log('� Classes table structure:', tableInfo);
    
    // Get all classes
    const classes = await sql`SELECT * FROM classes LIMIT 10;`;
    
    console.log(`� Found ${classes.length} classes:`);
    classes.forEach(cls => {
      console.log(`  - ${cls.name}: ${cls.grade ? `Grade ${cls.grade}` : `Year ${cls.year} ${cls.section || 'No Section'}`}`);
    });
    
    // Check if we have old data with grade field
    try {
      const oldFormatCount = await sql`SELECT COUNT(*) as count FROM classes WHERE grade IS NOT NULL;`;
      console.log(`🔄 Classes with old format (grade field): ${oldFormatCount[0].count}`);
    } catch (e) {
      console.log('� No grade column found (expected for new format)');
    }
    
    const newFormatCount = await sql`SELECT COUNT(*) as count FROM classes WHERE year IS NOT NULL AND section IS NOT NULL;`;
    console.log(`✅ Classes with new format (year + section): ${newFormatCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking classes:', error);
  }
}

checkClasses();
