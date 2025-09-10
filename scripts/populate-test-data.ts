// Test script to populate sample teachers data
import { db } from '../lib/db';
import { teachers, departments, classes, subjects } from '../lib/db/schema';

async function populateTestData() {
  try {
    console.log('Populating test data...');
    
    // First, create some departments
    const mathDept = await db.insert(departments).values({
      name: 'Mathematics',
      head: 'Dr. Smith'
    }).returning();
    
    const scienceDept = await db.insert(departments).values({
      name: 'Science',
      head: 'Dr. Johnson'
    }).returning();

    // Create some classes
    const class1A = await db.insert(classes).values({
      name: 'Class 1A',
      year: 1,
      capacity: 30
    }).returning();

    // Create some subjects
    const mathSubject = await db.insert(subjects).values({
      name: 'Mathematics',
      department: 'Mathematics'
    }).returning();
    
    const physicsSubject = await db.insert(subjects).values({
      name: 'Physics',
      department: 'Science'
    }).returning();

    // Create some teachers
    await db.insert(teachers).values({
      name: 'John Doe',
      employeeId: 'T001',
      departmentId: mathDept[0].id,
      classId: class1A[0].id,
      subjects: ['Mathematics'], // Array of subject names
      email: 'john.doe@school.edu',
      phone: '+1234567890'
    });
    
    await db.insert(teachers).values({
      name: 'Jane Smith',
      employeeId: 'T002',
      departmentId: scienceDept[0].id,
      classId: class1A[0].id,
      subjects: ['Physics'], // Array of subject names
      email: 'jane.smith@school.edu',
      phone: '+1234567891'
    });

    console.log('Test data populated successfully!');
  } catch (error) {
    console.error('Error populating test data:', error);
  }
}

populateTestData();
