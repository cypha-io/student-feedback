import { db, TABLES, eq } from './db';
import * as schema from './db/schema';

// Updated database helpers for Neon database
export const dbHelpers = {
  // Generic CRUD operations
  async create(collectionName: string, data: Record<string, unknown>) {
    try {
      console.log(`📝 Creating document in collection: ${collectionName}`);
      console.log('Data:', data);
      
      const table = this.getTableByCollection(collectionName);
      const result = await db.insert(table).values(data).returning();
      console.log('✅ Document created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error(`❌ Error creating document in collection ${collectionName}:`, error);
      throw error;
    }
  },

  async update(collectionName: string, id: string, data: Record<string, unknown>) {
    try {
      const table = this.getTableByCollection(collectionName);
      const result = await db.update(table).set({
        ...data,
        updatedAt: new Date()
      }).where(eq(table.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async delete(collectionName: string, id: string) {
    try {
      const table = this.getTableByCollection(collectionName);
      const result = await db.delete(table).where(eq(table.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  getTableByCollection(collectionName: string) {
    switch (collectionName.toLowerCase()) {
      case 'teachers':
        return TABLES.TEACHERS;
      case 'students':
        return TABLES.STUDENTS;
      case 'subjects':
        return TABLES.SUBJECTS;
      case 'classes':
        return TABLES.CLASSES;
      case 'departments':
        return TABLES.DEPARTMENTS;
      case 'houses':
        return TABLES.HOUSES;
      case 'questions':
        return TABLES.QUESTIONS;
      case 'feedbacks':
        return TABLES.FEEDBACKS;
      case 'responses':
        return TABLES.RESPONSES;
      default:
        throw new Error(`Unknown collection: ${collectionName}`);
    }
  },
  // Teachers
  async getAllTeachers() {
    try {
      const result = await db.select().from(TABLES.TEACHERS);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  async createTeacher(data: Omit<typeof schema.teachers.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.TEACHERS).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  // Students
  async getAllStudents() {
    try {
      const result = await db.select().from(TABLES.STUDENTS);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  async createStudent(data: Omit<typeof schema.students.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.STUDENTS).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // Subjects (without code field)
  async getAllSubjects() {
    try {
      const result = await db.select().from(TABLES.SUBJECTS);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  async createSubject(data: Omit<typeof schema.subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.SUBJECTS).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  // Classes (with year field)
  async getAllClasses() {
    try {
      const result = await db.select().from(TABLES.CLASSES);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  async createClass(data: Omit<typeof schema.classes.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.CLASSES).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  // Departments
  async getAllDepartments() {
    try {
      const result = await db.select().from(TABLES.DEPARTMENTS);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  async createDepartment(data: Omit<typeof schema.departments.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.DEPARTMENTS).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  },

  // Houses
  async getAllHouses() {
    try {
      const result = await db.select().from(TABLES.HOUSES);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching houses:', error);
      throw error;
    }
  },

  async createHouse(data: Omit<typeof schema.houses.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.HOUSES).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating house:', error);
      throw error;
    }
  },

  // Questions
  async getAllQuestions() {
    try {
      const result = await db.select().from(TABLES.QUESTIONS);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  async createQuestion(data: Omit<typeof schema.questions.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.QUESTIONS).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Feedbacks
  async getAllFeedbacks() {
    try {
      const result = await db.select().from(TABLES.FEEDBACKS);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  },

  async createFeedback(data: Omit<typeof schema.feedbacks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.FEEDBACKS).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  // Responses
  async getAllResponses() {
    try {
      const result = await db.select().from(TABLES.RESPONSES);
      return { documents: result };
    } catch (error) {
      console.error('Error fetching responses:', error);
      throw error;
    }
  },

  async createResponse(data: Omit<typeof schema.responses.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await db.insert(TABLES.RESPONSES).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating response:', error);
      throw error;
    }
  },

  // Generic helpers
  async getAll(collectionName: string) {
    switch (collectionName.toLowerCase()) {
      case 'teachers':
        return this.getAllTeachers();
      case 'students':
        return this.getAllStudents();
      case 'subjects':
        return this.getAllSubjects();
      case 'classes':
        return this.getAllClasses();
      case 'departments':
        return this.getAllDepartments();
      case 'houses':
        return this.getAllHouses();
      case 'questions':
        return this.getAllQuestions();
      case 'feedbacks':
        return this.getAllFeedbacks();
      case 'responses':
        return this.getAllResponses();
      default:
        throw new Error(`Unknown collection: ${collectionName}`);
    }
  },

  // Specific query helpers
  async getTeachersByDepartment(department: string) {
    try {
      const result = await db.select().from(TABLES.TEACHERS).where(eq(TABLES.TEACHERS.department, department));
      return { documents: result };
    } catch (error) {
      console.error('Error fetching teachers by department:', error);
      throw error;
    }
  },

  async getSubjectsByDepartment(department: string) {
    try {
      const result = await db.select().from(TABLES.SUBJECTS).where(eq(TABLES.SUBJECTS.department, department));
      return { documents: result };
    } catch (error) {
      console.error('Error fetching subjects by department:', error);
      throw error;
    }
  },

  async getFeedbacksByTeacher(teacherId: string) {
    try {
      const result = await db.select().from(TABLES.FEEDBACKS).where(eq(TABLES.FEEDBACKS.teacherId, teacherId));
      return { documents: result };
    } catch (error) {
      console.error('Error fetching feedbacks by teacher:', error);
      throw error;
    }
  },

  async getResponsesByFeedback(feedbackId: string) {
    try {
      const result = await db.select().from(TABLES.RESPONSES).where(eq(TABLES.RESPONSES.feedbackId, feedbackId));
      return { documents: result };
    } catch (error) {
      console.error('Error fetching responses by feedback:', error);
      throw error;
    }
  },
};

// Export collection names for compatibility
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
