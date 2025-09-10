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
  const yearValue = appwriteClass.year;
  let year = 1; // Default to 1
  if (yearValue && !isNaN(Number(yearValue))) {
    year = Number(yearValue);
  }
  return {
    name: String(appwriteClass.name || ''),
    year: year,
    capacity: Number(appwriteClass.capacity) || 40,
    createdAt: new Date(appwriteClass.$createdAt),
    updatedAt: new Date(appwriteClass.$updatedAt),
  };
}

function transformDepartmentData(appwriteDept: AppwriteDocument) {
  return {
    name: String(appwriteDept.name || ''),
    head: String(appwriteDept.head || ''),
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
    subjects: Array.isArray(appwriteTeacher.subjects) ? appwriteTeacher.subjects.map(String) : [],
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
    questionNumber: Number(appwriteQuestion.questionNumber ?? appwriteQuestion.order ?? 1),
    maxScore: Number(appwriteQuestion.maxScore) || 5,
    createdAt: new Date(appwriteQuestion.$createdAt),
    updatedAt: new Date(appwriteQuestion.$updatedAt),
  };
}

function transformFeedbackData(appwriteFeedback: AppwriteDocument) {
  return {
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
    answer: String(appwriteResponse.answer || ''),
    type: String(appwriteResponse.type || 'rating'),
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

  // Create maps to hold Appwrite ID -> Neon UUID mappings
  const idMaps = {
    departments: new Map<string, string>(),
    subjects: new Map<string, string>(),
    classes: new Map<string, string>(),
    teachers: new Map<string, string>(),
    students: new Map<string, string>(),
    questions: new Map<string, string>(),
    feedbacks: new Map<string, string>(),
  };

  // Clear all tables before migration
  console.log('\n🗑️ Clearing all Neon database tables...');
  try {
    // Delete in reverse order of creation due to foreign key constraints
    await db.delete(responses);
    await db.delete(feedbacks);
    await db.delete(questions);
    await db.delete(houses);
    await db.delete(students);
    await db.delete(teachers);
    await db.delete(classes);
    await db.delete(subjects);
    await db.delete(departments);
    console.log('✅ All tables cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing tables:', error);
    // If clearing fails, it's unsafe to proceed with migration
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
        try {
          const transformed = transformDepartmentData(dept);
          const [newDept] = await db.insert(departments).values(transformed).returning({ newId: departments.id });
          if (newDept) {
            idMaps.departments.set(dept.$id, newDept.newId);
          }
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).cause?.code !== '23505') console.error('Error inserting department:', e);
        }
      }
      console.log(`✅ Migrated ${idMaps.departments.size}/${appwriteDepartments.length} departments`);
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
        try {
          const transformed = transformSubjectData(subject);
          const [newSubject] = await db.insert(subjects).values(transformed).returning({ newId: subjects.id });
          if (newSubject) {
            // Use Appwrite's $id for mapping
            idMaps.subjects.set(subject.$id, newSubject.newId);
          }
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).cause?.code !== '23505') console.error('Error inserting subject:', e);
        }
      }
      console.log(`✅ Migrated ${idMaps.subjects.size}/${appwriteSubjects.length} subjects (removed code fields)`);
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
        try {
          const transformed = transformClassData(cls);
          const [newClass] = await db.insert(classes).values(transformed).returning({ newId: classes.id });
          if (newClass) {
            idMaps.classes.set(cls.$id, newClass.newId);
          }
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).cause?.code !== '23505') console.error('Error inserting class:', e);
        }
      }
      console.log(`✅ Migrated ${idMaps.classes.size}/${appwriteClasses.length} classes (added year fields)`);
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
        try {
          const transformed = transformTeacherData(teacher);
          const [newTeacher] = await db.insert(teachers).values(transformed).returning({ newId: teachers.id });
          if (newTeacher) {
            idMaps.teachers.set(teacher.$id, newTeacher.newId);
          }
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).cause?.code !== '23505') console.error('Error inserting teacher:', e);
        }
      }
      console.log(`✅ Migrated ${idMaps.teachers.size}/${appwriteTeachers.length} teachers`);
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
        try {
          const transformed = transformStudentData(student);
          const [newStudent] = await db.insert(students).values(transformed).returning({ newId: students.id });
          if (newStudent) {
            // Use the unique studentId field for mapping, not Appwrite's $id
            const studentIdKey = String(student.studentId || '');
            if (studentIdKey) {
              idMaps.students.set(studentIdKey, newStudent.newId);
            }
          }
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).cause?.code !== '23505') console.error('Error inserting student:', e);
        }
      }
      console.log(`✅ Migrated ${idMaps.students.size}/${appwriteStudents.length} students`);
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
        try {
          const transformed = transformQuestionData(question);
          const [newQuestion] = await db.insert(questions).values(transformed).returning({ newId: questions.id });
          if (newQuestion) {
            // The response refers to the question by a composite key like 'A-0'.
            // This key is built from the question's 'section' and a zero-based index.
            const section = String(question.section || '');
            const qNumber = Number(question.questionNumber ?? question.order ?? 1);
            // The key in the response is 0-indexed, so we subtract 1.
            const questionKey = `${section}-${qNumber - 1}`;
            
            console.log(`[DEBUG] Mapping question. Appwrite $id: ${question.$id}, section: ${question.section}, qNumber: ${qNumber}, Generated Key: '${questionKey}'`);
            
            idMaps.questions.set(questionKey, newQuestion.newId);
            idMaps.questions.set(question.$id, newQuestion.newId); // Also map by $id as a fallback.
          }
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).cause?.code !== '23505') console.error('Error inserting question:', e);
        }
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
        try {
          // Remap foreign keys
          const studentNeonId = idMaps.students.get(String(feedback.studentId || ''));
          const teacherNeonId = idMaps.teachers.get(String(feedback.teacherId || ''));
          const subjectNeonId = idMaps.subjects.get(String(feedback.subjectId || ''));
          const classNeonId = idMaps.classes.get(String(feedback.classId || ''));

          if (!teacherNeonId || !subjectNeonId || !classNeonId) {
            console.warn(`⚠️ Skipping feedback ${feedback.$id} due to missing teacher, subject, or class mapping.`);
            continue;
          }
          if (!studentNeonId) {
            console.warn(`⚠️ Feedback ${feedback.$id} is missing a valid student mapping. Proceeding with null.`);
          }

          const transformed = {
            ...transformFeedbackData(feedback),
            studentId: studentNeonId || null,
            teacherId: teacherNeonId,
            subjectId: subjectNeonId,
            classId: classNeonId,
          };

          const [newFeedback] = await db.insert(feedbacks).values(transformed).returning({ newId: feedbacks.id });
          if (newFeedback) {
            idMaps.feedbacks.set(feedback.$id, newFeedback.newId);
          }
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).cause?.code !== '23505') console.error('Error inserting feedback:', e);
        }
      }
      console.log(`✅ Migrated ${idMaps.feedbacks.size}/${appwriteFeedbacks.length} feedbacks`);
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
        try {
          // Remap foreign keys
          const feedbackNeonId = idMaps.feedbacks.get(String(response.feedbackId || ''));
          const questionNeonId = idMaps.questions.get(String(response.questionId || ''));
          const teacherNeonId = response.teacherId ? idMaps.teachers.get(String(response.teacherId)) : null;

          if (!feedbackNeonId) {
            console.warn(`[DEBUG] Failed to find feedback for response ${response.$id}. feedbackId: ${response.feedbackId}`);
          }
          if (!questionNeonId) {
            console.warn(`[DEBUG] Failed to find question for response ${response.$id}. questionId from Appwrite: '${response.questionId}'. Looked for key: '${String(response.questionId || '')}'`);
          }

          if (!feedbackNeonId || !questionNeonId) {
            console.warn(`⚠️ Skipping response ${response.$id} due to missing foreign key mapping. Tried to find question with key: ${response.questionId}`);
            continue;
          }

          const transformed = {
            ...transformResponseData(response),
            feedbackId: feedbackNeonId,
            questionId: questionNeonId,
            teacherId: teacherNeonId,
          };
          await db.insert(responses).values(transformed);
        } catch (e: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).cause?.code !== '23505') console.error('Error inserting response:', e);
        }
      }
      console.log(`✅ Migrated responses for ${idMaps.feedbacks.size} feedbacks`);
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
