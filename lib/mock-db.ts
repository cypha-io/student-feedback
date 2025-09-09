// Fallback database helpers for development when database is not available
export const COLLECTIONS = {
  TEACHERS: 'teachers',
  STUDENTS: 'students',
  SUBJECTS: 'subjects',
  CLASSES: 'classes',
  DEPARTMENTS: 'departments',
  HOUSES: 'houses',
  QUESTIONS: 'questions',
  FEEDBACKS: 'feedbacks',
  RESPONSES: 'responses',
};

// Mock data for development
const mockData = {
  teachers: [
    {
      id: '1',
      $id: '1',
      name: 'Mr. John Smith',
      employeeId: 'T001',
      department: 'Mathematics',
      class: 'Form 1A',
      subjects: ['Algebra', 'Geometry'],
      email: 'john.smith@school.edu',
      phone: '+1234567890'
    }
  ],
  subjects: [
    {
      id: '1',
      $id: '1',
      name: 'Mathematics',
      department: 'Science'
    },
    {
      id: '2',
      $id: '2',
      name: 'Physics',
      department: 'Science'
    }
  ],
  classes: [
    {
      id: '1',
      $id: '1',
      name: 'Form 1A',
      grade: 'Form 1',
      year: '2024-2025',
      capacity: 40
    },
    {
      id: '2',
      $id: '2',
      name: 'Form 2A',
      grade: 'Form 2',
      year: '2024-2025',
      capacity: 38
    }
  ],
  departments: [],
  houses: [],
  questions: [],
  feedbacks: [],
  responses: [],
  students: []
};

export const dbHelpers = {
  async getAll(collectionName: string) {
    console.log(`📖 Fetching mock data for collection: ${collectionName}`);
    const data = mockData[collectionName.toLowerCase() as keyof typeof mockData] || [];
    return { documents: data };
  },

  async create(collectionName: string, data: Record<string, unknown>) {
    console.log(`📝 Mock creating document in collection: ${collectionName}`, data);
    const newDoc = { 
      id: Date.now().toString(), 
      $id: Date.now().toString(), 
      ...data 
    };
    return newDoc;
  },

  async update(collectionName: string, id: string, data: Record<string, unknown>) {
    console.log(`📝 Mock updating document in collection: ${collectionName}`, { id, data });
    return { id, ...data };
  },

  async delete(collectionName: string, id: string) {
    console.log(`🗑️ Mock deleting document in collection: ${collectionName}`, { id });
    return { id };
  },

  // Specific helpers
  async getAllTeachers() {
    return this.getAll('teachers');
  },

  async getAllSubjects() {
    return this.getAll('subjects');
  },

  async getAllClasses() {
    return this.getAll('classes');
  },

  async getAllDepartments() {
    return this.getAll('departments');
  },

  async getTeachersByDepartment(department: string) {
    console.log(`📖 Mock fetching teachers by department: ${department}`);
    return { documents: mockData.teachers.filter(t => t.department === department) };
  },

  async getSubjectsByDepartment(department: string) {
    console.log(`📖 Mock fetching subjects by department: ${department}`);
    return { documents: mockData.subjects.filter(s => s.department === department) };
  },

  async getFeedbacksByTeacher(teacherId: string) {
    console.log(`📖 Mock fetching feedbacks by teacher: ${teacherId}`);
    return { documents: [] };
  },

  async getResponsesByFeedback(feedbackId: string) {
    console.log(`📖 Mock fetching responses by feedback: ${feedbackId}`);
    return { documents: [] };
  }
};
