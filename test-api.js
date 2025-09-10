const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_fz3xrnXlJgc6@ep-flat-fog-adsk3osy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const sql = neon(DATABASE_URL);
    
    // Test basic connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
    // Test if teachers table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Available tables:', tables.map(t => t.table_name));
    
    // Test teachers table structure
    const teachersColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teachers'
    `;
    console.log('👨‍🏫 Teachers table columns:', teachersColumns);
    
    // Test if teachers table has data
    const teachersCount = await sql`SELECT COUNT(*) as count FROM teachers`;
    console.log('👥 Teachers count:', teachersCount[0].count);
    
    // Try to fetch teachers
    const teachers = await sql`SELECT * FROM teachers LIMIT 5`;
    console.log('🎓 Sample teachers:', teachers);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
  }
}

testConnection();
