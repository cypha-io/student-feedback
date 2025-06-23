// Types for database entities
export interface Subject {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  code: string;
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

export interface Subject {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  code: string;
  department: string;
//   credits: number;
}

export interface Class {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  name: string;
  grade: string;
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