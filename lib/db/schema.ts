import { pgTable, text, integer, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Departments table (removed code field) - moved first due to foreign key references
export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  head: text('head').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Classes table (updated to use year 1-3 instead of grade) - moved before teachers
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  year: integer('year').notNull(), // Year 1, 2, or 3
  capacity: integer('capacity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subjects table (removed code field)
export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  department: text('department').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Teachers table (General Staff)
export const teachers = pgTable('teachers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  employeeId: text('employee_id').notNull().unique(),
  department: text('department').notNull(),
  class: text('class').notNull(),
  subjects: text('subjects').array().notNull().default([]),
  email: text('email').notNull(),
  phone: text('phone'),
  staffType: text('staff_type').notNull().default('Teaching'), // 'Teaching', 'Non-Teaching'
  role: text('role').notNull().default('Teacher'), // 'Teacher', 'HOD', 'Cleaner', 'Supervisor', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Students table
export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  studentId: text('student_id').notNull().unique(),
  class: text('class').notNull(),
  section: text('section').notNull(),
  house: text('house').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Houses table
export const houses = pgTable('houses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Questions table
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  question: text('question').notNull(),
  type: text('type').notNull(), // 'rating', 'text', 'multiple_choice'
  options: text('options').array(),
  required: boolean('required').default(true).notNull(),
  category: text('category').notNull(),
  order: integer('order'),
  section: text('section').notNull(), // A, B, C, D, E, F, G, H
  sectionTitle: text('section_title').notNull(),
  questionNumber: integer('question_number').notNull(),
  maxScore: integer('max_score').default(5).notNull(),
  targetRole: text('target_role').default('Teaching'), // 'Teaching', 'Non-Teaching', or specific role
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Feedback table
export const feedbacks = pgTable('feedbacks', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id'),
  teacherId: uuid('teacher_id').notNull(),
  subjectId: uuid('subject_id').notNull(),
  classId: uuid('class_id').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'completed', 'draft', 'under_review'
  submittedAt: timestamp('submitted_at'),
  rating: integer('rating'),
  comment: text('comment'),
  appraisalAssignmentId: uuid('appraisal_assignment_id'),
  reviewStatus: text('review_status').default('none'), // 'none', 'pending', 'reviewed'
  reviewedBy: uuid('reviewed_by'),
  isConsolidated: boolean('is_consolidated').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Appraisal Assignments table
export const appraisalAssignments = pgTable('appraisal_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  appraiseeId: uuid('appraisee_id').notNull(), // Staff being appraised
  appraiserId: uuid('appraiser_id'), // Staff or Student appraising
  appraiserType: text('appraiser_type').notNull(), // 'student', 'staff', 'peer', 'supervisor', 'hod'
  reviewerId: uuid('reviewer_id'), // Staff reviewing
  status: text('status').default('pending').notNull(), // 'pending', 'completed', 'under_review', 'finalized'
  sessionId: text('session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Responses table
export const responses = pgTable('responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  feedbackId: uuid('feedback_id').notNull(),
  questionId: uuid('question_id').notNull(),
  answer: text('answer').notNull(), // Can store number as text for flexibility
  type: text('type').notNull(), // 'rating', 'text', 'multiple_choice'
  teacherId: uuid('teacher_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relationships
export const teachersRelations = relations(teachers, ({ many }) => ({
  feedbacks: many(feedbacks),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  feedbacks: many(feedbacks),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  feedbacks: many(feedbacks),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  feedbacks: many(feedbacks),
}));

export const feedbacksRelations = relations(feedbacks, ({ one, many }) => ({
  student: one(students, {
    fields: [feedbacks.studentId],
    references: [students.id],
  }),
  teacher: one(teachers, {
    fields: [feedbacks.teacherId],
    references: [teachers.id],
  }),
  subject: one(subjects, {
    fields: [feedbacks.subjectId],
    references: [subjects.id],
  }),
  class: one(classes, {
    fields: [feedbacks.classId],
    references: [classes.id],
  }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  feedback: one(feedbacks, {
    fields: [responses.feedbackId],
    references: [feedbacks.id],
  }),
  question: one(questions, {
    fields: [responses.questionId],
    references: [questions.id],
  }),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  responses: many(responses),
}));

export const appraisalAssignmentsRelations = relations(appraisalAssignments, ({ one }) => ({
  appraisee: one(teachers, {
    fields: [appraisalAssignments.appraiseeId],
    references: [teachers.id],
    relationName: 'appraisee',
  }),
  appraiser: one(teachers, {
    fields: [appraisalAssignments.appraiserId],
    references: [teachers.id],
    relationName: 'appraiser',
  }),
  reviewer: one(teachers, {
    fields: [appraisalAssignments.reviewerId],
    references: [teachers.id],
    relationName: 'reviewer',
  }),
}));

// Admins table for authentication
export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  staffId: uuid('staff_id'), // Link to teachers table
  role: text('role').notNull().default('manager'), // 'superadmin', 'manager', 'viewer', 'staff'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
