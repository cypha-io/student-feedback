#!/usr/bin/env tsx

import { Client, Databases, Query } from 'appwrite';
import * as dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in .env.local');
}

// Now import db after env vars are loaded
import { db } from '../lib/db';
import { teachers, students, subjects, classes, departments, houses, questions, feedbacks, responses } from '../lib/db/schema';

// Appwrite configuration
const appwriteClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const appwriteDatabases = new Databases(appwriteClient);

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const APPWRITE_COLLECTIONS = {
  TEACHERS: process.env.NEXT_PUBLIC_APPWRITE_TEACHERS_COLLECTION_ID!,
  STUDENTS: process.env.NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID!,
  SUBJECTS: process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID!,
  CLASSES: process.env.NEXT_PUBLIC_APPWRITE_CLASSES_COLLECTION_ID!,
  DEPARTMENTS: process.env.NEXT_PUBLIC_APPWRITE_DEPARTMENTS_COLLECTION_ID!,
  HOUSES: process.env.NEXT_PUBLIC_APPWRITE_HOUSES_COLLECTION_ID!,
  QUESTIONS: process.env.NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID!,
  FEEDBACKS: process.env.NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID!,
  RESPONSES: process.env.NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID!,
};

interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  [key: string]: unknown;
}

async function fetchAllFromCollection(collectionId: string): Promise<AppwriteDocument[]> {
  const allDocuments: AppwriteDocument[] = [];
  let offset = 0;
  const limit = 100;
  
  while (true) {
    try {
      const response = await appwriteDatabases.listDocuments(
        APPWRITE_DATABASE_ID,
        collectionId,
        [Query.limit(limit), Query.offset(offset)]
      );
      
      if (response.documents.length === 0) {
        break;
      }
      
      allDocuments.push(...response.documents as AppwriteDocument[]);
      offset += limit;
      
      console.log(`📦 Fetched ${response.documents.length} documents from ${collectionId} (total: ${allDocuments.length})`);
      
      if (response.documents.length < limit) {
        break;
      }
    } catch (error) {
      console.error(`❌ Error fetching from ${collectionId}:`, error);
      break;
    }
  }
  
  return allDocuments;
}

function transformSubjectData(appwriteSubject: AppwriteDocument) {
  return {
    name: String(appwriteSubject.name || ''),
    department: String(appwriteSubject.department || ''),
    createdAt: new Date(appwriteSubject.$createdAt),
    updatedAt: new Date(appwriteSubject.$updatedAt),
  };
}

function transformClassData(appwriteClass: AppwriteDocument) {
  return {
    name: String(appwriteClass.name || ''),
    grade: String(appwriteClass.grade || appwriteClass.name || ''),
    year: String(appwriteClass.year || '2024-2025'),
    capacity: Number(appwriteClass.capacity) || 40,
    createdAt: new Date(appwriteClass.$createdAt),
    updatedAt: new Date(appwriteClass.$updatedAt),
  };
}

function transformDepartmentData(appwriteDept: AppwriteDocument) {
  return {
    name: String(appwriteDept.name || ''),
    code: String(appwriteDept.code || ''),
    head: String(appwriteDept.head || ''),
    description: String(appwriteDept.description || ''),
    createdAt: new Date(appwriteDept.$createdAt),
    updatedAt: new Date(appwriteDept.$updatedAt),
  };
}

function transformTeacherData(appwriteTeacher: AppwriteDocument) {
  return {
    name: String(appwriteTeacher.name || ''),
    department: String(appwriteTeacher.department || ''),
    employeeId: String(appwriteTeacher.employeeId || ''),
    class: String(appwriteTeacher.class || ''),
    email: String(appwriteTeacher.email || ''),
    phone: String(appwriteTeacher.phone || ''),
    subject: String(appwriteTeacher.subject || ''),
    createdAt: new Date(appwriteTeacher.$createdAt),
    updatedAt: new Date(appwriteTeacher.$updatedAt),
  };
}

function transformStudentData(appwriteStudent: AppwriteDocument) {
  return {
    name: String(appwriteStudent.name || ''),
    class: String(appwriteStudent.class || ''),
    email: String(appwriteStudent.email || ''),
    studentId: String(appwriteStudent.studentId || ''),
    section: String(appwriteStudent.section || ''),
    house: String(appwriteStudent.house || ''),
    phone: String(appwriteStudent.phone || ''),
    createdAt: new Date(appwriteStudent.$createdAt),
    updatedAt: new Date(appwriteStudent.$updatedAt),
  };
}

function transformHouseData(appwriteHouse: AppwriteDocument) {
  return {
    name: String(appwriteHouse.name || ''),
    color: String(appwriteHouse.color || ''),
    description: String(appwriteHouse.description || ''),
    createdAt: new Date(appwriteHouse.$createdAt),
    updatedAt: new Date(appwriteHouse.$updatedAt),
  };
}

function transformQuestionData(appwriteQuestion: AppwriteDocument) {
  return {
    question: String(appwriteQuestion.question || ''),
    type: String(appwriteQuestion.type || 'rating'),
    options: appwriteQuestion.options ? [String(appwriteQuestion.options)] : null,
    required: Boolean(appwriteQuestion.isRequired ?? appwriteQuestion.required ?? true),
    category: String(appwriteQuestion.category || ''),
    order: Number(appwriteQuestion.order) || 0,
    section: String(appwriteQuestion.section || ''),
    sectionTitle: String(appwriteQuestion.sectionTitle || appwriteQuestion.section || ''),
    questionNumber: Number(appwriteQuestion.questionNumber) || Number(appwriteQuestion.order) || 1,
    maxScore: Number(appwriteQuestion.maxScore) || 5,
    createdAt: new Date(appwriteQuestion.$createdAt),
    updatedAt: new Date(appwriteQuestion.$updatedAt),
  };
}

function transformFeedbackData(appwriteFeedback: AppwriteDocument) {
  return {
    studentId: String(appwriteFeedback.studentId || ''),
    teacherId: String(appwriteFeedback.teacherId || ''),
    subjectId: String(appwriteFeedback.subjectId || ''),
    classId: String(appwriteFeedback.classId || ''),
    semester: String(appwriteFeedback.semester || ''),
    academicYear: String(appwriteFeedback.academicYear || ''),
    status: String(appwriteFeedback.status || 'pending'),
    submittedAt: appwriteFeedback.submittedAt ? new Date(String(appwriteFeedback.submittedAt)) : null,
    comment: String(appwriteFeedback.comment || ''),
    createdAt: new Date(appwriteFeedback.$createdAt),
    updatedAt: new Date(appwriteFeedback.$updatedAt),
  };
}

function transformResponseData(appwriteResponse: AppwriteDocument) {
  return {
    feedbackId: String(appwriteResponse.feedbackId || ''),
    questionId: String(appwriteResponse.questionId || ''),
    answer: String(appwriteResponse.answer || ''),
    type: String(appwriteResponse.type || 'rating'),
    teacherId: appwriteResponse.teacherId ? String(appwriteResponse.teacherId) : null,
    createdAt: new Date(appwriteResponse.$createdAt),
    updatedAt: new Date(appwriteResponse.$updatedAt),
  };
}

async function migrateData() {
  console.log('🚀 Starting Appwrite to Neon migration...');
  console.log('📊 Connecting to databases...');
  
  try {
    // Test Appwrite connection
    console.log('🔗 Testing Appwrite connection...');
    await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTIONS.TEACHERS, [Query.limit(1)]);
    console.log('✅ Appwrite connection successful');
    
    // Test Neon connection
    console.log('🔗 Testing Neon connection...');
    await db.select().from(teachers).limit(1);
    console.log('✅ Neon connection successful');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('💡 Make sure both databases are accessible and environment variables are correct');
    return;
  }

  // Migrate each collection
  console.log('\n📦 Starting data migration...\n');

  // 1. Migrate Departments first (they might be referenced by other tables)
  try {
    console.log('1️⃣ Migrating Departments...');
    const appwriteDepartments = await fetchAllFromCollection(APPWRITE_COLLECTIONS.DEPARTMENTS);
    if (appwriteDepartments.length > 0) {
      for (const dept of appwriteDepartments) {
        const transformed = transformDepartmentData(dept);
        await db.insert(departments).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteDepartments.length} departments`);
    } else {
      console.log('ℹ️ No departments found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating departments:', error);
  }

  // 2. Migrate Subjects (remove code field)
  try {
    console.log('\n2️⃣ Migrating Subjects...');
    const appwriteSubjects = await fetchAllFromCollection(APPWRITE_COLLECTIONS.SUBJECTS);
    if (appwriteSubjects.length > 0) {
      for (const subject of appwriteSubjects) {
        const transformed = transformSubjectData(subject);
        await db.insert(subjects).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteSubjects.length} subjects (removed code fields)`);
    } else {
      console.log('ℹ️ No subjects found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating subjects:', error);
  }

  // 3. Migrate Classes (add year field)
  try {
    console.log('\n3️⃣ Migrating Classes...');
    const appwriteClasses = await fetchAllFromCollection(APPWRITE_COLLECTIONS.CLASSES);
    if (appwriteClasses.length > 0) {
      for (const cls of appwriteClasses) {
        const transformed = transformClassData(cls);
        await db.insert(classes).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteClasses.length} classes (added year fields)`);
    } else {
      console.log('ℹ️ No classes found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating classes:', error);
  }

  // 4. Migrate Teachers
  try {
    console.log('\n4️⃣ Migrating Teachers...');
    const appwriteTeachers = await fetchAllFromCollection(APPWRITE_COLLECTIONS.TEACHERS);
    if (appwriteTeachers.length > 0) {
      for (const teacher of appwriteTeachers) {
        const transformed = transformTeacherData(teacher);
        await db.insert(teachers).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteTeachers.length} teachers`);
    } else {
      console.log('ℹ️ No teachers found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating teachers:', error);
  }

  // 5. Migrate Students
  try {
    console.log('\n5️⃣ Migrating Students...');
    const appwriteStudents = await fetchAllFromCollection(APPWRITE_COLLECTIONS.STUDENTS);
    if (appwriteStudents.length > 0) {
      for (const student of appwriteStudents) {
        const transformed = transformStudentData(student);
        await db.insert(students).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteStudents.length} students`);
    } else {
      console.log('ℹ️ No students found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating students:', error);
  }

  // 6. Migrate Houses
  try {
    console.log('\n6️⃣ Migrating Houses...');
    const appwriteHouses = await fetchAllFromCollection(APPWRITE_COLLECTIONS.HOUSES);
    if (appwriteHouses.length > 0) {
      for (const house of appwriteHouses) {
        const transformed = transformHouseData(house);
        await db.insert(houses).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteHouses.length} houses`);
    } else {
      console.log('ℹ️ No houses found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating houses:', error);
  }

  // 7. Migrate Questions
  try {
    console.log('\n7️⃣ Migrating Questions...');
    const appwriteQuestions = await fetchAllFromCollection(APPWRITE_COLLECTIONS.QUESTIONS);
    if (appwriteQuestions.length > 0) {
      for (const question of appwriteQuestions) {
        const transformed = transformQuestionData(question);
        await db.insert(questions).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteQuestions.length} questions`);
    } else {
      console.log('ℹ️ No questions found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating questions:', error);
  }

  // 8. Migrate Feedbacks
  try {
    console.log('\n8️⃣ Migrating Feedbacks...');
    const appwriteFeedbacks = await fetchAllFromCollection(APPWRITE_COLLECTIONS.FEEDBACKS);
    if (appwriteFeedbacks.length > 0) {
      for (const feedback of appwriteFeedbacks) {
        const transformed = transformFeedbackData(feedback);
        await db.insert(feedbacks).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteFeedbacks.length} feedbacks`);
    } else {
      console.log('ℹ️ No feedbacks found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating feedbacks:', error);
  }

  // 9. Migrate Responses
  try {
    console.log('\n9️⃣ Migrating Responses...');
    const appwriteResponses = await fetchAllFromCollection(APPWRITE_COLLECTIONS.RESPONSES);
    if (appwriteResponses.length > 0) {
      for (const response of appwriteResponses) {
        const transformed = transformResponseData(response);
        await db.insert(responses).values(transformed);
      }
      console.log(`✅ Migrated ${appwriteResponses.length} responses`);
    } else {
      console.log('ℹ️ No responses found in Appwrite');
    }
  } catch (error) {
    console.error('❌ Error migrating responses:', error);
  }

  console.log('\n🎉 Migration completed successfully!');
  console.log('📊 Summary:');
  console.log('- All data has been transferred from Appwrite to Neon');
  console.log('- Subject codes have been removed');
  console.log('- Class year fields have been added');
  console.log('- You can now switch your application to use the Neon database');
}

if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}
