#!/usr/bin/env tsx

import { db } from '../lib/db';
import { teachers, students, subjects, classes, departments, houses } from '../lib/db/schema';

const sampleData = {
  departments: [
    {
      name: 'Mathematics',
      code: 'MATH',
      head: 'Dr. John Smith',
      description: 'Mathematics Department'
    },
    {
      name: 'Science',
      code: 'SCI',
      head: 'Dr. Jane Doe',
      description: 'Science Department'
    },
    {
      name: 'English',
      code: 'ENG',
      head: 'Prof. Alice Brown',
      description: 'English Department'
    }
  ],
  
  subjects: [
    { name: 'Algebra', department: 'Mathematics' },
    { name: 'Geometry', department: 'Mathematics' },
    { name: 'Physics', department: 'Science' },
    { name: 'Chemistry', department: 'Science' },
    { name: 'Biology', department: 'Science' },
    { name: 'English Literature', department: 'English' },
    { name: 'English Language', department: 'English' }
  ],
  
  classes: [
    { name: 'Form 1A', grade: 'Form 1', year: '2024-2025', capacity: 40 },
    { name: 'Form 1B', grade: 'Form 1', year: '2024-2025', capacity: 38 },
    { name: 'Form 2A', grade: 'Form 2', year: '2024-2025', capacity: 35 },
    { name: 'Form 2B', grade: 'Form 2', year: '2024-2025', capacity: 37 },
    { name: 'Form 3A', grade: 'Form 3', year: '2024-2025', capacity: 42 },
    { name: 'Form 3B', grade: 'Form 3', year: '2024-2025', capacity: 40 },
    { name: 'Form 4A', grade: 'Form 4', year: '2024-2025', capacity: 30 },
    { name: 'Form 4B', grade: 'Form 4', year: '2024-2025', capacity: 32 }
  ],
  
  teachers: [
    {
      name: 'Mr. Michael Johnson',
      employeeId: 'T001',
      department: 'Mathematics',
      class: 'Form 1A',
      subjects: ['Algebra', 'Geometry'],
      email: 'michael.johnson@school.edu',
      phone: '+1234567890'
    },
    {
      name: 'Ms. Sarah Wilson',
      employeeId: 'T002',
      department: 'Science',
      class: 'Form 2A',
      subjects: ['Physics', 'Chemistry'],
      email: 'sarah.wilson@school.edu',
      phone: '+1234567891'
    },
    {
      name: 'Mr. David Lee',
      employeeId: 'T003',
      department: 'English',
      class: 'Form 3A',
      subjects: ['English Literature'],
      email: 'david.lee@school.edu',
      phone: '+1234567892'
    }
  ],
  
  students: [
    {
      name: 'Alice Smith',
      studentId: 'S001',
      class: 'Form 1A',
      section: 'A',
      email: 'alice.smith@student.edu'
    },
    {
      name: 'Bob Johnson',
      studentId: 'S002',
      class: 'Form 1A',
      section: 'A',
      email: 'bob.johnson@student.edu'
    },
    {
      name: 'Carol Williams',
      studentId: 'S003',
      class: 'Form 2A',
      section: 'A',
      email: 'carol.williams@student.edu'
    }
  ],
  
  houses: [
    {
      name: 'Red House',
      color: '#EF4444',
      description: 'The brave and bold'
    },
    {
      name: 'Blue House',
      color: '#3B82F6',
      description: 'The wise and thoughtful'
    },
    {
      name: 'Green House',
      color: '#10B981',
      description: 'The harmonious and balanced'
    },
    {
      name: 'Yellow House',
      color: '#F59E0B',
      description: 'The creative and energetic'
    }
  ]
};

async function populateDatabase() {
  console.log('🚀 Starting database population...');
  
  try {
    // Insert departments first
    console.log('📚 Inserting departments...');
    for (const dept of sampleData.departments) {
      await db.insert(departments).values(dept);
    }
    
    // Insert subjects
    console.log('📖 Inserting subjects...');
    for (const subject of sampleData.subjects) {
      await db.insert(subjects).values(subject);
    }
    
    // Insert classes
    console.log('🏫 Inserting classes...');
    for (const cls of sampleData.classes) {
      await db.insert(classes).values(cls);
    }
    
    // Insert teachers
    console.log('👨‍🏫 Inserting teachers...');
    for (const teacher of sampleData.teachers) {
      await db.insert(teachers).values(teacher);
    }
    
    // Insert students
    console.log('👨‍🎓 Inserting students...');
    for (const student of sampleData.students) {
      await db.insert(students).values(student);
    }
    
    // Insert houses
    console.log('🏠 Inserting houses...');
    for (const house of sampleData.houses) {
      await db.insert(houses).values(house);
    }
    
    console.log('✅ Database population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  }
}

if (require.main === module) {
  populateDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
