import { pgTable, text, integer, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Teachers table
export const teachers = pgTable('teachers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  employeeId: text('employee_id').notNull().unique(),
  department: text('department').notNull(),
  class: text('class').notNull(),
  subjects: text('subjects').array().notNull().default([]),
  email: text('email').notNull(),
  phone: text('phone'),
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
  email: text('email').notNull(),
  phone: text('phone'),
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

// Classes table (updated to use year 1-3 instead of grade)
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  year: integer('year').notNull(), // Year 1, 2, or 3
  section: text('section').notNull(), // Arts, Science, etc.
  capacity: integer('capacity').notNull(),
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

// Departments table (removed code field)
export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  head: text('head').notNull(),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Feedback table
export const feedbacks = pgTable('feedbacks', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').notNull(),
  teacherId: uuid('teacher_id').notNull(),
  subjectId: uuid('subject_id').notNull(),
  classId: uuid('class_id').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'completed', 'draft'
  submittedAt: timestamp('submitted_at'),
  rating: integer('rating'),
  comment: text('comment'),
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
