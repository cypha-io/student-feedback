// Test Appwrite connection
import { Client, Databases } from 'appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('Testing Appwrite Configuration...');
console.log('Environment Variables:');
console.log('- ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log('- PROJECT_ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
console.log('- DATABASE_ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
console.log('- TEACHERS_COLLECTION:', process.env.NEXT_PUBLIC_APPWRITE_TEACHERS_COLLECTION_ID);

// This will help debug the connection
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

const databases = new Databases(client);

async function testConnection() {
  try {
    console.log('\n🔍 Testing database connection...');
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
      process.env.NEXT_PUBLIC_APPWRITE_TEACHERS_COLLECTION_ID || 'teachers'
    );
    console.log('✅ Connection successful!');
    console.log('📊 Found', result.documents.length, 'teachers in database');
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 Possible issues:');
    console.log('1. Check if your Appwrite project is running');
    console.log('2. Verify the project ID is correct');
    console.log('3. Make sure the database and collection exist');
    console.log('4. Check if you have proper permissions set');
  }
}

testConnection();
