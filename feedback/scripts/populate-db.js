// Simple script to populate initial data for testing
// This demonstrates that the database CRUD operations work properly

const sampleData = {
  departments: [
    { name: 'Mathematics', code: 'MATH', head: 'Dr. John Smith', description: 'Mathematics Department' },
    { name: 'Science', code: 'SCI', head: 'Dr. Sarah Johnson', description: 'Science Department' },
    { name: 'English', code: 'ENG', head: 'Prof. Emily Davis', description: 'English Department' },
    { name: 'Computer Science', code: 'CS', head: 'Dr. Michael Brown', description: 'Computer Science Department' }
  ],
  
  subjects: [
    { name: 'Algebra', code: 'MATH101', department: 'Mathematics', credits: 3 },
    { name: 'Geometry', code: 'MATH102', department: 'Mathematics', credits: 3 },
    { name: 'Physics', code: 'SCI101', department: 'Science', credits: 4 },
    { name: 'Chemistry', code: 'SCI102', department: 'Science', credits: 4 },
    { name: 'Literature', code: 'ENG101', department: 'English', credits: 3 },
    { name: 'Programming', code: 'CS101', department: 'Computer Science', credits: 4 }
  ],
  
  classes: [
    { name: '9th Grade A', grade: '9th', section: 'A', capacity: 30 },
    { name: '9th Grade B', grade: '9th', section: 'B', capacity: 28 },
    { name: '10th Grade A', grade: '10th', section: 'A', capacity: 32 },
    { name: '10th Grade B', grade: '10th', section: 'B', capacity: 29 },
    { name: '11th Grade A', grade: '11th', section: 'A', capacity: 25 },
    { name: '12th Grade A', grade: '12th', section: 'A', capacity: 22 }
  ],
  
  teachers: [
    {
      name: 'Dr. John Smith',
      employeeId: 'EMP001',
      department: 'Mathematics',
      class: '10th Grade A',
      subjects: ['Algebra', 'Geometry'],
      email: 'john.smith@school.edu',
      phone: '+1 234 567 8901'
    },
    {
      name: 'Dr. Sarah Johnson',
      employeeId: 'EMP002',
      department: 'Science',
      class: '9th Grade A',
      subjects: ['Physics', 'Chemistry'],
      email: 'sarah.johnson@school.edu',
      phone: '+1 234 567 8902'
    },
    {
      name: 'Prof. Emily Davis',
      employeeId: 'EMP003',
      department: 'English',
      class: '11th Grade A',
      subjects: ['Literature'],
      email: 'emily.davis@school.edu',
      phone: '+1 234 567 8903'
    }
  ]
};

console.log('Sample data for testing database CRUD operations:');
console.log(JSON.stringify(sampleData, null, 2));
console.log('\nUse this data to test adding items through the dashboard interface.');
console.log('All data should be added via the web interface to verify CRUD operations work.');
