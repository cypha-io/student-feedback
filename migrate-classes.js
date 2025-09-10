import { db } from './lib/db/index.js';
import { classes } from './lib/db/schema.js';
import { eq } from 'drizzle-orm';

async function migrateClassData() {
  try {
    console.log('🔄 Starting class data migration...');
    
    // First, let's see what we have
    const currentClasses = await db.select().from(classes);
    console.log('📊 Current classes:', currentClasses.length);
    
    if (currentClasses.length > 0) {
      console.log('📋 Sample class:', currentClasses[0]);
    }
    
    // If there are classes that need migration (have grade but no year/section)
    for (const cls of currentClasses) {
      let needsUpdate = false;
      let updateData = {};
      
      // If we have grade but no year, convert grade to year
      if (cls.grade && !cls.year) {
        needsUpdate = true;
        // Convert Form X to Year X
        if (cls.grade.includes('Form 1')) {
          updateData.year = 1;
        } else if (cls.grade.includes('Form 2')) {
          updateData.year = 2;
        } else if (cls.grade.includes('Form 3')) {
          updateData.year = 3;
        } else {
          updateData.year = 1; // Default fallback
        }
      }
      
      // If no section, extract from name or set default
      if (!cls.section) {
        needsUpdate = true;
        // Try to extract section from class name (e.g., "Form 1A" -> "A")
        const match = cls.name.match(/[A-Z]$/);
        if (match) {
          updateData.section = match[0];
        } else {
          // Set a default section based on name pattern
          if (cls.name.includes('Science')) {
            updateData.section = 'Science';
          } else if (cls.name.includes('Arts')) {
            updateData.section = 'Arts';
          } else {
            updateData.section = 'General';
          }
        }
      }
      
      if (needsUpdate) {
        await db.update(classes)
          .set(updateData)
          .where(eq(classes.id, cls.id));
        console.log(`✅ Updated class ${cls.name}:`, updateData);
      }
    }
    
    // Show final state
    const updatedClasses = await db.select().from(classes);
    console.log('🎉 Migration complete! Updated classes:');
    updatedClasses.forEach(cls => {
      console.log(`  - ${cls.name}: Year ${cls.year} ${cls.section}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateClassData();
