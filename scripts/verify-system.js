import { config } from 'dotenv';
import { Client, Databases, Query } from 'appwrite';

// Load environment variables
config({ path: '.env.local' });

console.log('🎯 Final System Verification\n');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const FEEDBACKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID;
const RESPONSES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID;

async function verifySystem() {
  console.log('📋 System Verification Checklist\n');
  
  let allGood = true;
  
  try {
    // 1. Environment Variables Check
    console.log('1️⃣ Environment Variables:');
    const requiredVars = [
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
      'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
      'NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID',
      'NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID'
    ];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`   ✅ ${varName}: ${value}`);
      } else {
        console.log(`   ❌ ${varName}: MISSING`);
        allGood = false;
      }
    });
    
    // 2. Database Connection Check
    console.log('\n2️⃣ Database Connection:');
    const feedbacksResult = await databases.listDocuments(
      DATABASE_ID,
      FEEDBACKS_COLLECTION_ID,
      [Query.limit(1)]
    );
    console.log(`   ✅ Successfully connected to Appwrite`);
    console.log(`   ✅ Can access feedbacks collection`);
    
    const responsesResult = await databases.listDocuments(
      DATABASE_ID,
      RESPONSES_COLLECTION_ID,
      [Query.limit(1)]
    );
    console.log(`   ✅ Can access responses collection`);
    
    // 3. Data Check
    console.log('\n3️⃣ Data Availability:');
    console.log(`   📊 Total Feedbacks: ${feedbacksResult.total}`);
    console.log(`   📊 Total Responses: ${responsesResult.total}`);
    
    if (feedbacksResult.total === 0) {
      console.log(`   ⚠️  No feedback data found - students need to submit feedback first`);
    } else {
      console.log(`   ✅ Feedback data available`);
    }
    
    // 4. Data Structure Validation
    if (feedbacksResult.documents.length > 0) {
      console.log('\n4️⃣ Data Structure Validation:');
      const sampleFeedback = feedbacksResult.documents[0];
      const requiredFields = ['studentId', 'teacherId', 'teacherName', 'status', '$createdAt'];
      
      requiredFields.forEach(field => {
        if (sampleFeedback[field] !== undefined) {
          console.log(`   ✅ Feedback has ${field} field`);
        } else {
          console.log(`   ❌ Feedback missing ${field} field`);
          allGood = false;
        }
      });
      
      if (responsesResult.documents.length > 0) {
        const sampleResponse = responsesResult.documents[0];
        const responseFields = ['feedbackId', 'questionId', 'answer'];
        
        responseFields.forEach(field => {
          if (sampleResponse[field] !== undefined) {
            console.log(`   ✅ Response has ${field} field`);
          } else {
            console.log(`   ❌ Response missing ${field} field`);
            allGood = false;
          }
        });
      }
    }
    
    // 5. Summary
    console.log('\n🎯 Verification Summary:');
    if (allGood && feedbacksResult.total > 0) {
      console.log('   ✅ ALL SYSTEMS READY - Dashboard should display data correctly');
      console.log('   🚀 Safe to deploy to production');
    } else if (allGood && feedbacksResult.total === 0) {
      console.log('   ⚠️  SYSTEM READY BUT NO DATA - Database is working, just needs feedback submissions');
      console.log('   📝 Run test-submission.js to create test data, or have students submit feedback');
      console.log('   🚀 Safe to deploy to production');
    } else {
      console.log('   ❌ ISSUES FOUND - Fix the above errors before deployment');
    }
    
  } catch (error) {
    console.error('\n❌ System verification failed:', error);
    console.log('\n💡 Common solutions:');
    console.log('   - Check environment variables are correct');
    console.log('   - Verify Appwrite project ID and database ID');
    console.log('   - Ensure collection IDs match your Appwrite setup');
    console.log('   - Check collection permissions allow read/write access');
    allGood = false;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(allGood ? '🎉 VERIFICATION PASSED' : '❌ VERIFICATION FAILED');
  console.log('='.repeat(60));
}

verifySystem();
