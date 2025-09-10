// Types for database entities
export interface Subject {
  id: string;
  name: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  departmentId: string;
  classId: string;
  subjects: string[];
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  classId: string;
  section: string;
  house: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  year: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface House {
  id: string;
  name: string;
  color: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  createdAt: string;
  updatedAt: string;
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