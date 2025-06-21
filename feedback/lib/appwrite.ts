import { Client, Databases, Account, ID, Query } from 'appwrite';

// Log configuration status (client-side only)
if (typeof window !== 'undefined') {
  console.log('🔧 Appwrite Configuration:');
  console.log('- Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  console.log('- Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  console.log('- Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
}

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const databases = new Databases(client);
export const account = new Account(client);

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '68567c3a002af4b231c1';
export const COLLECTIONS = {
  TEACHERS: process.env.NEXT_PUBLIC_APPWRITE_TEACHERS_COLLECTION_ID || 'teachers',
  STUDENTS: process.env.NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID || 'students',
  SUBJECTS: process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID || 'subjects',
  CLASSES: process.env.NEXT_PUBLIC_APPWRITE_CLASSES_COLLECTION_ID || 'classes',
  DEPARTMENTS: process.env.NEXT_PUBLIC_APPWRITE_DEPARTMENTS_COLLECTION_ID || 'departments',
  QUESTIONS: process.env.NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID || 'questions',
  FEEDBACKS: process.env.NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID || 'feedbacks',
  RESPONSES: process.env.NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID || 'responses',
};

// Helper functions for database operations
export const dbHelpers = {
  // Generic CRUD operations
  async create(collectionId: string, data: Record<string, unknown>) {
    try {
      console.log(`📝 Creating document in collection: ${collectionId}`);
      console.log('Data:', data);
      const result = await databases.createDocument(DATABASE_ID, collectionId, ID.unique(), data);
      console.log('✅ Document created successfully:', result);
      return result;
    } catch (error) {
      console.error(`❌ Error creating document in collection ${collectionId}:`, error);
      throw error;
    }
  },

  async getAll(collectionId: string, queries: string[] = []) {
    try {
      console.log(`📖 Fetching documents from collection: ${collectionId}`);
      const result = await databases.listDocuments(DATABASE_ID, collectionId, queries);
      console.log(`✅ Found ${result.documents.length} documents`);
      return result;
    } catch (error) {
      console.error(`❌ Error fetching documents from collection ${collectionId}:`, error);
      throw error;
    }
  },

  async getById(collectionId: string, documentId: string) {
    try {
      return await databases.getDocument(DATABASE_ID, collectionId, documentId);
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  async update(collectionId: string, documentId: string, data: Record<string, unknown>) {
    try {
      return await databases.updateDocument(DATABASE_ID, collectionId, documentId, data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async delete(collectionId: string, documentId: string) {
    try {
      return await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Specific operations
  async getTeachersByDepartment(department: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEACHERS,
        [Query.equal('department', department)]
      );
    } catch (error) {
      console.error('Error fetching teachers by department:', error);
      throw error;
    }
  },

  async getSubjectsByDepartment(department: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SUBJECTS,
        [Query.equal('department', department)]
      );
    } catch (error) {
      console.error('Error fetching subjects by department:', error);
      throw error;
    }
  },

  async getFeedbacksByTeacher(teacherId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FEEDBACKS,
        [Query.equal('teacherId', teacherId)]
      );
    } catch (error) {
      console.error('Error fetching feedbacks by teacher:', error);
      throw error;
    }
  },

  async getResponsesByFeedback(feedbackId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RESPONSES,
        [Query.equal('feedbackId', feedbackId)]
      );
    } catch (error) {
      console.error('Error fetching responses by feedback:', error);
      throw error;
    }
  },
};

export { ID, Query };
export default client;