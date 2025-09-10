#!/usr/bin/env tsx

import { db } from '../lib/db';
import { subjects } from '../lib/db/schema';

const subjectsData = [
  { name: 'Core Maths', department: 'Math' },
  { name: 'Elective Maths', department: 'Math' },
  { name: 'Integrated Science', department: 'Science' },
  { name: 'Social Studies', department: 'Social Studies' },
  { name: 'P.E', department: 'Physical Education and Health' },
  { name: 'RME', department: 'Religion and Ethics' },
  { name: 'Core ICT', department: 'IT' },
  { name: 'Elective ICT', department: 'IT' },
  { name: 'Geography', department: 'Social Studies' },
  { name: 'Economics', department: 'Social Studies' },
  { name: 'GKA', department: 'Languages' },
  { name: 'Literature', department: 'Languages' },
  { name: 'CRS', department: 'Religion and Ethics' },
  { name: 'Biology', department: 'Science' },
  { name: 'Chemistry', department: 'Science' },
  { name: 'Physics', department: 'Science' },
  { name: 'Leatherwork', department: 'General Art' },
  { name: 'Government', department: 'Social Studies' },
  { name: 'Business Management', department: 'Business ' }
];

async function populateSubjects() {
  console.log('📖 Starting subjects population...');
  
  try {
    // Clear existing subjects
    console.log('🧹 Clearing existing subjects...');
    await db.delete(subjects);
    
    // Insert subjects
    console.log('📚 Inserting subjects...');
    for (const subject of subjectsData) {
      await db.insert(subjects).values(subject);
      console.log(`   ✓ Added: ${subject.name} (${subject.department})`);
    }
    
    console.log('✅ Subjects population completed successfully!');
    console.log(`📊 Total subjects added: ${subjectsData.length}`);
    
  } catch (error) {
    console.error('❌ Error populating subjects:', error);
    throw error;
  }
}

if (require.main === module) {
  populateSubjects()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { populateSubjects };
