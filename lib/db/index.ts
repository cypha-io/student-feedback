import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, or, desc, asc } from 'drizzle-orm';
import * as schema from './schema';
import { DATABASE_URL } from '../env-loader';

// Get DATABASE_URL with better error messaging
const databaseUrl = DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('💡 Please ensure your .env.local file contains:');
  console.error('   DATABASE_URL=postgresql://...');
  console.error('🔄 Try restarting the development server if the variable exists.');
  console.error('📂 Current working directory:', process.cwd());
  throw new Error('DATABASE_URL must be set in environment variables');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

// Helper functions for database operations
export const dbHelpers = {
  // Specific operations for each table
  async getTeachersByDepartment(department: string) {
    try {
      const result = await db.select().from(schema.teachers).where(eq(schema.teachers.departmentId, department));
      return { documents: result };
    } catch (error) {
      console.error('Error fetching teachers by department:', error);
      throw error;
    }
  },

  async getSubjectsByDepartment(department: string) {
    try {
      const result = await db.select().from(schema.subjects).where(eq(schema.subjects.department, department));
      return { documents: result };
    } catch (error) {
      console.error('Error fetching subjects by department:', error);
      throw error;
    }
  },

  async getFeedbacksByTeacher(teacherId: string) {
    try {
      const result = await db.select().from(schema.feedbacks).where(eq(schema.feedbacks.teacherId, teacherId));
      return { documents: result };
    } catch (error) {
      console.error('Error fetching feedbacks by teacher:', error);
      throw error;
    }
  },

  async getResponsesByFeedback(feedbackId: string) {
    try {
      const result = await db.select().from(schema.responses).where(eq(schema.responses.feedbackId, feedbackId));
      return { documents: result };
    } catch (error) {
      console.error('Error fetching responses by feedback:', error);
      throw error;
    }
  },
};

// Tables for direct access
export const TABLES = {
  TEACHERS: schema.teachers,
  STUDENTS: schema.students,
  SUBJECTS: schema.subjects,
  CLASSES: schema.classes,
  DEPARTMENTS: schema.departments,
  HOUSES: schema.houses,
  QUESTIONS: schema.questions,
  FEEDBACKS: schema.feedbacks,
  RESPONSES: schema.responses,
};

// Export schema and utilities
export * from './schema';
export { eq, and, or, desc, asc };
