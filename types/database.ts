// Types for database entities
export interface Subject {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  department: string;
}

export interface Teacher {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  employeeId: string;
  department: string;
  class: string;
  subjects: string[];
  email: string;
  phone: string;
}

export interface Student {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  studentId: string;
  class: string;
  section: string;
  email: string;
  phone?: string;
}

export interface Class {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  grade: string;
  year: string;
  capacity: number;
}

export interface House {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  color: string;
  description: string;
}

export interface Department {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  code: string;
  head: string;
  description: string;
}

export interface Question {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  question: string;
  type: 'rating' | 'text' | 'multiple_choice';
  options?: string[];
  required: boolean;
  category: string;
  order?: number;
  section: string; // A, B, C, D, E, F, G, H
  sectionTitle: string; // e.g., "Encourages Student-Teacher Relationship"
  questionNumber: number; // 1-20
  maxScore: number; // Usually 5 for rating questions
}

export interface Feedback {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  status: 'pending' | 'completed' | 'draft';
  submittedAt?: string;
  rating?: number;
  comment?: string;
}

export interface Response {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  feedbackId: string;
  questionId: string;
  answer: string | number;
  type: 'rating' | 'text' | 'multiple_choice';
  teacherId?: string;
}

export interface DatabaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}