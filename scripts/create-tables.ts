#!/usr/bin/env tsx

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in .env.local');
}

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  console.log('🏗️ Creating database tables...');
  
  try {
    // Create departments table
    console.log('📝 Creating table: departments');
    await sql`CREATE TABLE IF NOT EXISTS "departments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "code" text NOT NULL,
      "head" text NOT NULL,
      "description" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "departments_code_unique" UNIQUE("code")
    )`;
    
    // Create subjects table
    console.log('📝 Creating table: subjects');
    await sql`CREATE TABLE IF NOT EXISTS "subjects" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "department" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`;
    
    // Create classes table
    console.log('📝 Creating table: classes');
    await sql`CREATE TABLE IF NOT EXISTS "classes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "grade" text NOT NULL,
      "year" text NOT NULL,
      "capacity" integer NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`;
    
    // Create teachers table
    console.log('📝 Creating table: teachers');
    await sql`CREATE TABLE IF NOT EXISTS "teachers" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "employee_id" text NOT NULL,
      "department" text NOT NULL,
      "class" text NOT NULL,
      "subjects" text[] DEFAULT '{}' NOT NULL,
      "email" text NOT NULL,
      "phone" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "teachers_employee_id_unique" UNIQUE("employee_id")
    )`;
    
    // Create students table
    console.log('📝 Creating table: students');
    await sql`CREATE TABLE IF NOT EXISTS "students" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "student_id" text NOT NULL,
      "class" text NOT NULL,
      "section" text NOT NULL,
      "email" text NOT NULL,
      "phone" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
    )`;
    
    // Create houses table
    console.log('📝 Creating table: houses');
    await sql`CREATE TABLE IF NOT EXISTS "houses" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL,
      "color" text NOT NULL,
      "description" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`;
    
    // Create questions table
    console.log('📝 Creating table: questions');
    await sql`CREATE TABLE IF NOT EXISTS "questions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "question" text NOT NULL,
      "type" text NOT NULL,
      "options" text[],
      "required" boolean DEFAULT true NOT NULL,
      "category" text NOT NULL,
      "order" integer,
      "section" text NOT NULL,
      "section_title" text NOT NULL,
      "question_number" integer NOT NULL,
      "max_score" integer DEFAULT 5 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`;
    
    // Create feedbacks table
    console.log('📝 Creating table: feedbacks');
    await sql`CREATE TABLE IF NOT EXISTS "feedbacks" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "student_id" uuid NOT NULL,
      "teacher_id" uuid NOT NULL,
      "subject_id" uuid NOT NULL,
      "class_id" uuid NOT NULL,
      "status" text DEFAULT 'pending' NOT NULL,
      "submitted_at" timestamp,
      "rating" integer,
      "comment" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`;
    
    // Create responses table
    console.log('📝 Creating table: responses');
    await sql`CREATE TABLE IF NOT EXISTS "responses" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "feedback_id" uuid NOT NULL,
      "question_id" uuid NOT NULL,
      "answer" text NOT NULL,
      "type" text NOT NULL,
      "teacher_id" uuid,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )`;
    
    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

if (require.main === module) {
  createTables()
    .then(() => {
      console.log('\n🎉 Database schema setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database setup failed:', error);
      process.exit(1);
    });
}
