const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '68567c270022407815f0')
  .setKey(process.env.APPWRITE_API_KEY || process.env.NEXT_APPWRITE_API_KEY);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '68567c3a002af4b231c1';
const QUESTIONS_COLLECTION_ID = 'questions';

// Define the structured questions as per your requirements
const feedbackQuestions = [
  // Section A: Encourages Student-Teacher Relationship
  {
    questionNumber: 1,
    section: 'A',
    sectionTitle: 'Encourages Student-Teacher Relationship',
    question: 'Teacher creates positive rapport with students & makes learning a fun experience',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 2,
    section: 'A',
    sectionTitle: 'Encourages Student-Teacher Relationship',
    question: 'Fosters Social and Emotional Learning by Promoting Skills like empathy, self-awareness, and relationship building (SEL).',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 3,
    section: 'A',
    sectionTitle: 'Encourages Student-Teacher Relationship',
    question: 'Identifies students learning challenges and helps them individually (differentiated instruction) or refers them for help (counseling) when necessary',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },

  // Section B: Encourages Cooperation & Team Work Among Students
  {
    questionNumber: 4,
    section: 'B',
    sectionTitle: 'Encourages Cooperation & Team Work Among Students',
    question: 'Let students see themselves as a team by giving group work and assigning brilliant students to help the weak',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 5,
    section: 'B',
    sectionTitle: 'Encourages Cooperation & Team Work Among Students',
    question: 'Ensures gender equality in all teaching and learning activities in and out of the classroom (GESI).',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 6,
    section: 'B',
    sectionTitle: 'Encourages Cooperation & Team Work Among Students',
    question: 'Teacher accommodates and supports students with special educational needs to ensure inclusive learning (SEN).',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },

  // Section C: Encourages Active Learning
  {
    questionNumber: 7,
    section: 'C',
    sectionTitle: 'Encourages Active Learning',
    question: 'Uses different teaching methods & gives more practical exercises or assignments',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 8,
    section: 'C',
    sectionTitle: 'Encourages Active Learning',
    question: 'Teacher effectively incorporates technology and digital tools into lessons to enhance student learning (ICT).',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 9,
    section: 'C',
    sectionTitle: 'Encourages Active Learning',
    question: 'Uses field trips, and problem-solving methods in teaching',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },

  // Section D: Mastery Over Teaching Field/Subject
  {
    questionNumber: 10,
    section: 'D',
    sectionTitle: 'Mastery Over Teaching Field/Subject',
    question: 'Explain lessons to students\' understanding',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 11,
    section: 'D',
    sectionTitle: 'Mastery Over Teaching Field/Subject',
    question: 'Gives appropriate examples',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 12,
    section: 'D',
    sectionTitle: 'Mastery Over Teaching Field/Subject',
    question: 'Welcomes and answers students\' questions',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },

  // Section E: Gives Prompt Feedback and Rewards Students Appropriately
  {
    questionNumber: 13,
    section: 'E',
    sectionTitle: 'Gives Prompt Feedback and Rewards Students Appropriately',
    question: 'Marks exercises, assignments & tests promptly',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 14,
    section: 'E',
    sectionTitle: 'Gives Prompt Feedback and Rewards Students Appropriately',
    question: 'Varies feedback used in class Eg. Verbal, Actions, Students involvement like clapping',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },

  // Section F: Emphasizes Time on Task
  {
    questionNumber: 15,
    section: 'F',
    sectionTitle: 'Emphasizes Time on Task',
    question: 'Punctual to class',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 16,
    section: 'F',
    sectionTitle: 'Emphasizes Time on Task',
    question: 'Uses lesson time appropriately',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },

  // Section G: Communicates High Expectations
  {
    questionNumber: 17,
    section: 'G',
    sectionTitle: 'Communicates High Expectations',
    question: 'Challenges students to get out of their comfort zone and give exercises and texts that are challenging enough',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 18,
    section: 'G',
    sectionTitle: 'Communicates High Expectations',
    question: 'Checks to ensure students have the right notes',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },

  // Section H: Class Control
  {
    questionNumber: 19,
    section: 'H',
    sectionTitle: 'Class Control',
    question: 'Teacher has the respect and attention of students',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  },
  {
    questionNumber: 20,
    section: 'H',
    sectionTitle: 'Class Control',
    question: 'Uses appropriate means to ensure orderliness in class',
    type: 'rating',
    required: true,
    category: 'teaching_effectiveness',
    maxScore: 5
  }
];

async function clearExistingQuestions() {
  try {
    console.log('Clearing existing questions...');
    const existingQuestions = await databases.listDocuments(DATABASE_ID, QUESTIONS_COLLECTION_ID);
    
    for (const question of existingQuestions.documents) {
      await databases.deleteDocument(DATABASE_ID, QUESTIONS_COLLECTION_ID, question.$id);
      console.log(`Deleted question: ${question.$id}`);
    }
    
    console.log('Existing questions cleared successfully');
  } catch (error) {
    console.error('Error clearing existing questions:', error);
  }
}

async function populateQuestions() {
  try {
    console.log('Starting to populate feedback questions...');
    
    // Clear existing questions first
    await clearExistingQuestions();
    
    // Add new structured questions
    for (const questionData of feedbackQuestions) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          QUESTIONS_COLLECTION_ID,
          'unique()',
          questionData
        );
        console.log(`Created question ${questionData.questionNumber}: ${questionData.question.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Error creating question ${questionData.questionNumber}:`, error);
      }
    }
    
    console.log('✅ All feedback questions populated successfully!');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`Total questions: ${feedbackQuestions.length}`);
    
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    sections.forEach(section => {
      const sectionQuestions = feedbackQuestions.filter(q => q.section === section);
      const sectionTitle = sectionQuestions[0]?.sectionTitle || section;
      console.log(`Section ${section} (${sectionTitle}): ${sectionQuestions.length} questions`);
    });
    
  } catch (error) {
    console.error('❌ Error populating questions:', error);
  }
}

// Run the population script
populateQuestions().then(() => {
  console.log('Script completed');
}).catch(error => {
  console.error('Script failed:', error);
});
