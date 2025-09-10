// Script to migrate the database schema to the new format
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrateSchema() {
  try {
    console.log('🔄 Starting database schema migration...');
    
    // First, let's see current data
    const currentClasses = await sql`SELECT * FROM classes LIMIT 5;`;
    console.log('📊 Current sample data:', currentClasses);
    
    // Add section column if it doesn't exist
    try {
      await sql`ALTER TABLE classes ADD COLUMN section text;`;
      console.log('✅ Added section column');
    } catch (error) {
      if (error.code === '42701') {
        console.log('ℹ️ Section column already exists');
      } else {
        throw error;
      }
    }
    
    // Change year column from text to integer
    console.log('🔄 Converting year column to integer...');
    
    // First, update existing data to proper format
    const allClasses = await sql`SELECT * FROM classes;`;
    
    for (const cls of allClasses) {
      let yearNum = 1; // default
      let section = 'General'; // default
      
      // Extract year from existing data
      if (cls.year && cls.year.includes('1')) {
        yearNum = 1;
      } else if (cls.year && cls.year.includes('2')) {
        yearNum = 2;
      } else if (cls.year && cls.year.includes('3')) {
        yearNum = 3;
      }
      
      // Extract section from class name
      if (cls.name.includes('Arts')) {
        section = 'Arts';
      } else if (cls.name.includes('Science')) {
        section = 'Science';
      } else {
        const match = cls.name.match(/([A-Z])$/);
        if (match) {
          section = match[1];
        }
      }
      
      // Update the record
      await sql`
        UPDATE classes 
        SET 
          section = ${section}
        WHERE id = ${cls.id}
      `;
      
      console.log(`✅ Updated ${cls.name}: Year ${yearNum} ${section}`);
    }
    
    // Now alter the year column to integer
    try {
      // Create a temporary column with integer type
      await sql`ALTER TABLE classes ADD COLUMN year_int integer;`;
      
      // Update the integer column based on the text year
      await sql`
        UPDATE classes 
        SET year_int = CASE 
          WHEN year LIKE '%1%' THEN 1
          WHEN year LIKE '%2%' THEN 2  
          WHEN year LIKE '%3%' THEN 3
          ELSE 1
        END;
      `;
      
      // Drop the old year column and rename the new one
      await sql`ALTER TABLE classes DROP COLUMN year;`;
      await sql`ALTER TABLE classes RENAME COLUMN year_int TO year;`;
      
      console.log('✅ Converted year column to integer');
    } catch (error) {
      console.log('⚠️ Year column conversion error:', error.message);
    }
    
    // Make section column not null
    try {
      await sql`ALTER TABLE classes ALTER COLUMN section SET NOT NULL;`;
      console.log('✅ Made section column NOT NULL');
    } catch (error) {
      console.log('⚠️ Section NOT NULL constraint error:', error.message);
    }
    
    // Make year column not null
    try {
      await sql`ALTER TABLE classes ALTER COLUMN year SET NOT NULL;`;
      console.log('✅ Made year column NOT NULL');
    } catch (error) {
      console.log('⚠️ Year NOT NULL constraint error:', error.message);
    }
    
    // Remove grade column if it exists
    try {
      await sql`ALTER TABLE classes DROP COLUMN grade;`;
      console.log('✅ Removed grade column');
    } catch (error) {
      if (error.code === '42703') {
        console.log('ℹ️ Grade column already removed');
      } else {
        console.log('⚠️ Grade column removal error:', error.message);
      }
    }
    
    // Show final result
    const finalClasses = await sql`SELECT * FROM classes LIMIT 10;`;
    console.log('🎉 Migration complete! Final data:');
    finalClasses.forEach(cls => {
      console.log(`  - ${cls.name}: Year ${cls.year} ${cls.section} (Capacity: ${cls.capacity})`);
    });
    
    // Show table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'classes'
      ORDER BY ordinal_position;
    `;
    console.log('📋 Final table structure:', tableInfo);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateSchema();
