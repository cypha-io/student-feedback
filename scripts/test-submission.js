import { config } from 'dotenv';
import { Client, Databases, ID } from 'appwrite';

// Load environment variables
config({ path: '.env.local' });

console.log('🧪 Testing Feedback Submission...\n');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const FEEDBACKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID;
const RESPONSES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID;

async function testFeedbackSubmission() {
  try {
    console.log('📝 Creating test feedback...');
    
    // Create a test feedback
    const feedbackData = {
      studentId: 'TEST-STUDENT-001',
      teacherId: 'teacher-001',
      teacherName: 'Test Teacher',
      subjectId: 'subject-001',
      classId: 'class-001',
      status: 'completed',
      submittedAt: new Date().toISOString()
    };

    console.log('Submitting feedback data:', feedbackData);
    
    const feedback = await databases.createDocument(
      DATABASE_ID,
      FEEDBACKS_COLLECTION_ID,
      ID.unique(),
      feedbackData
    );
    
    console.log('✅ Feedback created successfully!');
    console.log(`   Feedback ID: ${feedback.$id}`);
    
    // Create some test responses
    console.log('\n📊 Creating test responses...');
    
    const testResponses = [
      { questionId: 'A-0', answer: '5' },
      { questionId: 'A-1', answer: '4' },
      { questionId: 'A-2', answer: '5' },
      { questionId: 'B-0', answer: '3' },
      { questionId: 'B-1', answer: '4' },
    ];
    
    for (const responseData of testResponses) {
      const fullResponseData = {
        feedbackId: feedback.$id,
        questionId: responseData.questionId,
        answer: responseData.answer,
        type: 'rating'
      };
      
      try {
        await databases.createDocument(
          DATABASE_ID,
          RESPONSES_COLLECTION_ID,
          ID.unique(),
          fullResponseData
        );
        console.log(`✅ Response created for ${responseData.questionId}: ${responseData.answer}`);
      } catch (responseError) {
        console.error(`❌ Failed to create response for ${responseData.questionId}:`, responseError);
      }
    }
    
    console.log('\n🎉 Test submission completed successfully!');
    console.log('You should now see data in the Student Responses dashboard.');
    
  } catch (error) {
    console.error('❌ Error during test submission:', error);
    if (error.type) {
      console.error(`Error type: ${error.type}`);
    }
    if (error.message) {
      console.error(`Error message: ${error.message}`);
    }
    
    // Check if it's a permissions error
    if (error.message && error.message.includes('permissions')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check Appwrite collection permissions');
      console.log('2. Ensure collections allow public write access or configure proper authentication');
      console.log('3. Verify the API key has proper permissions');
    }
  }
}

testFeedbackSubmission();
