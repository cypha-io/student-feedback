const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_fz3xrnXlJgc6@ep-flat-fog-adsk3osy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function compareSchema() {
  try {
    const sql = neon(DATABASE_URL);
    
    console.log('🔍 Checking teachers table schema...');
    
    // Check actual database columns
    const actualColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'teachers'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Actual database columns:');
    actualColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check for foreign keys
    const foreignKeys = await sql`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='teachers'
    `;
    
    console.log('🔗 Foreign keys:');
    if (foreignKeys.length === 0) {
      console.log('  No foreign keys found');
    } else {
      foreignKeys.forEach(fk => {
        console.log(`  ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
    
    // Sample data
    const sampleTeacher = await sql`SELECT * FROM teachers LIMIT 1`;
    console.log('👨‍🏫 Sample teacher data:');
    console.log(JSON.stringify(sampleTeacher[0], null, 2));
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

compareSchema();
