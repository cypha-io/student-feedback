import { config } from 'dotenv';
import { Client, Databases, Query } from 'appwrite';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 Checking Student Responses Data...\n');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const FEEDBACKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID;
const RESPONSES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID;

console.log('Configuration:');
console.log(`- Database ID: ${DATABASE_ID}`);
console.log(`- Feedbacks Collection: ${FEEDBACKS_COLLECTION_ID}`);
console.log(`- Responses Collection: ${RESPONSES_COLLECTION_ID}\n`);

async function checkCollections() {
  try {
    // Check feedbacks collection
    console.log('📊 Checking FEEDBACKS collection...');
    const feedbacksResult = await databases.listDocuments(
      DATABASE_ID,
      FEEDBACKS_COLLECTION_ID,
      [Query.limit(5)]
    );
    
    console.log(`✅ Found ${feedbacksResult.total} feedbacks in total`);
    console.log(`📝 Showing first ${feedbacksResult.documents.length} documents:`);
    
    feedbacksResult.documents.forEach((doc, index) => {
      console.log(`\n  ${index + 1}. Feedback ID: ${doc.$id}`);
      console.log(`     Student ID: ${doc.studentId || 'N/A'}`);
      console.log(`     Teacher: ${doc.teacherName || 'N/A'}`);
      console.log(`     Status: ${doc.status || 'N/A'}`);
      console.log(`     Created: ${doc.$createdAt || 'N/A'}`);
    });

    // Check responses collection
    console.log('\n\n📝 Checking RESPONSES collection...');
    const responsesResult = await databases.listDocuments(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      [Query.limit(5)]
    );
    
    console.log(`✅ Found ${responsesResult.total} responses in total`);
    console.log(`📝 Showing first ${responsesResult.documents.length} documents:`);
    
    responsesResult.documents.forEach((doc, index) => {
      console.log(`\n  ${index + 1}. Response ID: ${doc.$id}`);
      console.log(`     Feedback ID: ${doc.feedbackId || 'N/A'}`);
      console.log(`     Question ID: ${doc.questionId || 'N/A'}`);
      console.log(`     Answer: ${doc.answer || 'N/A'}`);
      console.log(`     Type: ${doc.type || 'N/A'}`);
    });

    // Check if there are any feedbacks with corresponding responses
    if (feedbacksResult.documents.length > 0 && responsesResult.documents.length > 0) {
      console.log('\n\n🔗 Checking feedback-response relationships...');
      
      for (const feedback of feedbacksResult.documents.slice(0, 2)) {
        const relatedResponses = await databases.listDocuments(
          DATABASE_ID,
          RESPONSES_COLLECTION_ID,
          [Query.equal('feedbackId', feedback.$id)]
        );
        
        console.log(`\n  Feedback ${feedback.$id} has ${relatedResponses.total} related responses`);
        if (relatedResponses.documents.length > 0) {
          relatedResponses.documents.slice(0, 3).forEach(response => {
            console.log(`    - Question ${response.questionId}: ${response.answer}`);
          });
        }
      }
    }

    console.log('\n✅ Data check completed successfully!');

  } catch (error) {
    console.error('❌ Error checking collections:', error);
    if (error.type) {
      console.error(`Error type: ${error.type}`);
    }
    if (error.message) {
      console.error(`Error message: ${error.message}`);
    }
  }
}

checkCollections();
