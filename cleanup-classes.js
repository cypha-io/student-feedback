// Script to clean up class data and fix year values
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function cleanupClassData() {
  try {
    console.log('🧹 Starting class data cleanup...');
    
    // Get all current classes
    const allClasses = await sql`SELECT * FROM classes ORDER BY name;`;
    console.log(`📊 Found ${allClasses.length} classes`);
    
    // Show what we have
    console.log('🔍 Current classes:');
    allClasses.forEach(cls => {
      console.log(`  - ${cls.name}: Year ${cls.year} ${cls.section}`);
    });
    
    // Remove all existing classes (they appear to be test/duplicate data)
    console.log('🗑️ Removing existing demo/duplicate classes...');
    await sql`DELETE FROM classes;`;
    
    // Create clean, realistic class data
    console.log('📝 Creating clean class data...');
    
    const cleanClasses = [
      // Year 1 Classes
      { name: 'Year 1 Arts A', year: 1, section: 'Arts A', capacity: 35 },
      { name: 'Year 1 Arts B', year: 1, section: 'Arts B', capacity: 35 },
      { name: 'Year 1 Science A', year: 1, section: 'Science A', capacity: 30 },
      { name: 'Year 1 Science B', year: 1, section: 'Science B', capacity: 30 },
      { name: 'Year 1 General', year: 1, section: 'General', capacity: 40 },
      
      // Year 2 Classes
      { name: 'Year 2 Arts A', year: 2, section: 'Arts A', capacity: 32 },
      { name: 'Year 2 Arts B', year: 2, section: 'Arts B', capacity: 32 },
      { name: 'Year 2 Science A', year: 2, section: 'Science A', capacity: 28 },
      { name: 'Year 2 Science B', year: 2, section: 'Science B', capacity: 28 },
      { name: 'Year 2 Business', year: 2, section: 'Business', capacity: 35 },
      
      // Year 3 Classes
      { name: 'Year 3 Arts A', year: 3, section: 'Arts A', capacity: 30 },
      { name: 'Year 3 Arts B', year: 3, section: 'Arts B', capacity: 30 },
      { name: 'Year 3 Science A', year: 3, section: 'Science A', capacity: 25 },
      { name: 'Year 3 Science B', year: 3, section: 'Science B', capacity: 25 },
      { name: 'Year 3 Business', year: 3, section: 'Business', capacity: 32 },
    ];
    
    for (const cls of cleanClasses) {
      await sql`
        INSERT INTO classes (name, year, section, capacity)
        VALUES (${cls.name}, ${cls.year}, ${cls.section}, ${cls.capacity})
      `;
      console.log(`✅ Created: ${cls.name}`);
    }
    
    // Show final result
    const finalClasses = await sql`SELECT * FROM classes ORDER BY year, name;`;
    console.log('🎉 Cleanup complete! Final classes:');
    finalClasses.forEach(cls => {
      console.log(`  - ${cls.name}: Year ${cls.year} ${cls.section} (Capacity: ${cls.capacity})`);
    });
    
    console.log(`📊 Total classes: ${finalClasses.length}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanupClassData();
