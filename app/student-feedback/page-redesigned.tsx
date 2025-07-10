'use client';

import { useState, useEffect } from 'react';
import { dbHelpers, COLLECTIONS } from '@/lib/appwrite';
import { Teacher, Subject } from '@/types/database';
import styles from './feedback.module.css';

// Define the structured feedback questions with modern enhancements
const FEEDBACK_SECTIONS = {
  A: {
    title: 'Encourages Student-Teacher Relationship',
    icon: '🤝',
    description: 'Building positive connections and rapport',
    questions: [
      'Teacher creates positive rapport with students & makes learning a fun experience',
      'Fosters Social and Emotional Learning by Promoting Skills like empathy, self-awareness, and relationship building (SEL).',
      'Identifies students learning challenges and helps them individually (differentiated instruction) or refers them for help (counseling) when necessary'
    ]
  },
  B: {
    title: 'Encourages Cooperation & Team Work Among Students',
    icon: '👥',
    description: 'Promoting collaboration and inclusive learning',
    questions: [
      'Let students see themselves as a team by giving group work and assigning brilliant students to help the weak',
      'Ensures gender equality in all teaching and learning activities in and out of the classroom (GESI).',
      'Teacher accommodates and supports students with special educational needs to ensure inclusive learning (SEN).'
    ]
  },
  C: {
    title: 'Encourages Active Learning',
    icon: '🎯',
    description: 'Engaging students through varied teaching methods',
    questions: [
      'Uses different teaching methods & gives more practical exercises or assignments',
      'Teacher effectively incorporates technology and digital tools into lessons to enhance student learning (ICT).',
      'Uses field trips, and problem-solving methods in teaching'
    ]
  },
  D: {
    title: 'Mastery Over Teaching Field/Subject',
    icon: '🎓',
    description: 'Demonstrating subject expertise and knowledge',
    questions: [
      'Explain lessons to students\' understanding',
      'Gives appropriate examples',
      'Welcomes and answers students\' questions'
    ]
  },
  E: {
    title: 'Gives Prompt Feedback and Rewards Students Appropriately',
    icon: '💬',
    description: 'Providing timely and varied feedback',
    questions: [
      'Marks exercises, assignments & tests promptly',
      'Varies feedback used in class Eg. Verbal, Actions, Students involvement like clapping'
    ]
  },
  F: {
    title: 'Emphasizes Time on Task',
    icon: '⏰',
    description: 'Managing time effectively in class',
    questions: [
      'Punctual to class',
      'Uses lesson time appropriately'
    ]
  },
  G: {
    title: 'Communicates High Expectations',
    icon: '🎯',
    description: 'Challenging students to reach their potential',
    questions: [
      'Challenges students to get out of their comfort zone and give exercises and texts that are challenging enough',
      'Checks to ensure students have the right notes'
    ]
  },
  H: {
    title: 'Class Control',
    icon: '👨‍🏫',
    description: 'Maintaining order and respect in the classroom',
    questions: [
      'Teacher has the respect and attention of students',
      'Uses appropriate means to ensure orderliness in class'
    ]
  }
};

const RATING_LABELS = {
  5: { label: 'Mostly', description: '5 - Mostly (Excellent)', color: 'bg-green-500', emoji: '🌟' },
  4: { label: 'Often', description: '4 - Often (Very Good)', color: 'bg-blue-500', emoji: '👍' },
  3: { label: 'Sometimes', description: '3 - Sometimes (Good)', color: 'bg-indigo-500', emoji: '👌' },
  2: { label: 'Few Times', description: '2 - Few Times (Fair)', color: 'bg-yellow-500', emoji: '⚠️' },
  1: { label: 'Never', description: '1 - Never (Poor)', color: 'bg-red-500', emoji: '❌' }
};

const PERFORMANCE_RATINGS = [
  { min: 85, max: 100, label: 'Excellent', color: 'text-green-600', bgClass: 'scoreBadgeExcellent', icon: '🏆' },
  { min: 75, max: 84, label: 'Very Good', color: 'text-blue-600', bgClass: 'scoreBadge', icon: '⭐' },
  { min: 70, max: 74, label: 'Good', color: 'text-indigo-600', bgClass: 'scoreBadge', icon: '👍' },
  { min: 60, max: 69, label: 'Average', color: 'text-yellow-600', bgClass: 'scoreBadgeGood', icon: '📊' },
  { min: 50, max: 59, label: 'Weak', color: 'text-orange-600', bgClass: 'scoreBadgeGood', icon: '📉' },
  { min: 40, max: 49, label: 'Poor', color: 'text-red-600', bgClass: 'scoreBadgePoor', icon: '⚠️' },
  { min: 0, max: 39, label: 'Very Poor', color: 'text-red-800', bgClass: 'scoreBadgePoor', icon: '❌' }
];

export default function StudentFeedbackNew() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [siteTitle, setSiteTitle] = useState('Student Feedback Portal');
  
  // Form data
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
    class: '',
  });
  
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [responses, setResponses] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    
    // Load site title from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setSiteTitle(settings.siteTitle || 'Student Feedback Portal');
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    }
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await dbHelpers.getAll(COLLECTIONS.TEACHERS);
      setTeachers(response.documents as unknown as Teacher[]);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await dbHelpers.getAll(COLLECTIONS.SUBJECTS);
      const subjectNames = (response.documents as unknown as Subject[]).map(subject => subject.name);
      setSubjects(subjectNames);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const handleStudentInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentInfo.name && studentInfo.studentId && studentInfo.class) {
      setStep(2);
    }
  };

  const handleTeacherSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeacher && selectedSubject) {
      setStep(3);
    }
  };

  const handleQuestionResponse = (section: string, questionIndex: number, rating: number) => {
    const questionKey = `${section}-${questionIndex}`;
    setResponses(prev => ({
      ...prev,
      [questionKey]: rating
    }));
  };

  const calculateSectionScore = (section: string) => {
    const sectionQuestions = FEEDBACK_SECTIONS[section as keyof typeof FEEDBACK_SECTIONS].questions;
    let totalScore = 0;
    let answeredQuestions = 0;

    sectionQuestions.forEach((_, index) => {
      const questionKey = `${section}-${index}`;
      if (responses[questionKey]) {
        totalScore += responses[questionKey];
        answeredQuestions++;
      }
    });

    if (answeredQuestions === 0) return { score: 0, percentage: 0, maxScore: sectionQuestions.length * 5 };
    
    const maxScore = sectionQuestions.length * 5;
    const percentage = (totalScore / maxScore) * 100;
    
    return { score: totalScore, percentage, maxScore, answeredQuestions: answeredQuestions };
  };

  const calculateOverallScore = () => {
    let totalScore = 0;
    let maxTotalScore = 0;
    let totalAnswered = 0;
    let totalQuestions = 0;

    Object.keys(FEEDBACK_SECTIONS).forEach(section => {
      const sectionData = calculateSectionScore(section);
      totalScore += sectionData.score;
      maxTotalScore += sectionData.maxScore;
      totalAnswered += sectionData.answeredQuestions || 0;
      totalQuestions += FEEDBACK_SECTIONS[section as keyof typeof FEEDBACK_SECTIONS].questions.length;
    });

    const percentage = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;
    const rating = PERFORMANCE_RATINGS.find(r => percentage >= r.min && percentage <= r.max);

    return { 
      totalScore, 
      maxTotalScore, 
      percentage, 
      rating,
      totalAnswered,
      totalQuestions
    };
  };

  const isFormComplete = () => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    Object.keys(FEEDBACK_SECTIONS).forEach(section => {
      const sectionQuestions = FEEDBACK_SECTIONS[section as keyof typeof FEEDBACK_SECTIONS].questions;
      totalQuestions += sectionQuestions.length;
      
      sectionQuestions.forEach((_, index) => {
        const questionKey = `${section}-${index}`;
        if (responses[questionKey]) {
          answeredQuestions++;
        }
      });
    });

    return answeredQuestions === totalQuestions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormComplete()) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);

    try {
      const overallScore = calculateOverallScore();
      
      // Create feedback record
      const feedbackData = {
        studentId: studentInfo.studentId,
        teacherId: selectedTeacher,
        subjectId: selectedSubject,
        classId: studentInfo.class,
        status: 'completed',
        submittedAt: new Date().toISOString(),
        rating: Math.round(overallScore.percentage),
        totalScore: overallScore.totalScore,
        maxScore: overallScore.maxTotalScore,
      };

      const feedback = await dbHelpers.create(COLLECTIONS.FEEDBACKS, feedbackData);

      // Create response records for each section and question
      for (const [section, sectionData] of Object.entries(FEEDBACK_SECTIONS)) {
        sectionData.questions.forEach(async (question, index) => {
          const questionKey = `${section}-${index}`;
          const answer = responses[questionKey];
          
          if (answer) {
            const responseData = {
              feedbackId: feedback.$id,
              questionId: questionKey,
              answer: answer.toString(),
              type: 'rating',
              section: section,
              question: question,
              rating: answer
            };
            await dbHelpers.create(COLLECTIONS.RESPONSES, responseData);
          }
        });
      }

      setStep(4); // Success step
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRatingScale = (section: string, questionIndex: number, currentRating: number) => {
    return (
      <div className="flex justify-center gap-3 mt-4">
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleQuestionResponse(section, questionIndex, rating)}
            className={`${styles.ratingButton} ${currentRating === rating ? 'selected' : ''} relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              currentRating === rating
                ? `${RATING_LABELS[rating as keyof typeof RATING_LABELS].color} text-white shadow-lg ring-2 ring-white`
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
            }`}
            title={RATING_LABELS[rating as keyof typeof RATING_LABELS].description}
          >
            <div className="flex flex-col items-center">
              <span className="text-xs mb-1">{RATING_LABELS[rating as keyof typeof RATING_LABELS].emoji}</span>
              <span className="font-bold">{rating}</span>
              <span className="text-xs mt-1">{RATING_LABELS[rating as keyof typeof RATING_LABELS].label}</span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const selectedTeacherData = teachers.find(t => t.$id === selectedTeacher);

  return (
    <div className={`min-h-screen ${styles.feedbackBackground}`}>
      <div className={`absolute inset-0 ${styles.feedbackOverlay}`} />
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Modern Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {siteTitle}
            </h1>
          </div>
          <p className="text-white/90 text-lg mb-2">
            Your voice matters - Share honest feedback to improve education quality
          </p>
          <div className="flex items-center justify-center space-x-2 text-white/70 text-sm">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Anonymous</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Secure</span>
            </span>
          </div>
        </div>

        {/* Modern Progress Indicator */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="flex items-center justify-between">
              {['Student Info', 'Teacher & Subject', 'Evaluation', 'Complete'].map((stepName, index) => (
                <div key={stepName} className={`${styles.stepIndicator} ${step > index + 1 ? 'completed' : ''} flex flex-col items-center relative`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300 ${
                    step > index + 1 
                      ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                      : step === index + 1
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg animate-pulse'
                      : 'bg-white/20 border-white/30 text-white/60'
                  }`}>
                    {step > index + 1 ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`mt-2 text-xs text-center font-medium ${
                    step >= index + 1 ? 'text-white' : 'text-white/60'
                  }`}>
                    {stepName}
                  </span>
                  {index < 3 && (
                    <div className={`absolute top-6 left-full w-full h-1 -translate-y-1/2 transition-all duration-500 ${
                      step > index + 1 ? `${styles.progressBar}` : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className={`flex-1 ${styles.feedbackCard} dark:${styles.feedbackCardDark} rounded-2xl shadow-2xl overflow-hidden`}>
          {/* Step 1: Student Information */}
          {step === 1 && (
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome, Student!</h2>
                <p className="text-gray-600 dark:text-gray-400">Please provide your information to get started</p>
              </div>
              
              <form onSubmit={handleStudentInfoSubmit} className="space-y-6 max-w-md mx-auto">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Full Name</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <span>Student ID</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      value={studentInfo.studentId}
                      onChange={(e) => setStudentInfo({...studentInfo, studentId: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your student ID"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="class" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Class</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="class"
                      value={studentInfo.class}
                      onChange={(e) => setStudentInfo({...studentInfo, class: e.target.value})}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your class (e.g., Form 1A)"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Continue to Teacher Selection</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Teacher Selection */}
          {step === 2 && (
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Select Teacher & Subject</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose the teacher and subject you want to evaluate</p>
              </div>
              
              <form onSubmit={handleTeacherSelection} className="space-y-6 max-w-md mx-auto">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="teacher" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Select Teacher</span>
                      </span>
                    </label>
                    <select
                      id="teacher"
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      required
                    >
                      <option value="">Choose a teacher...</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.$id} value={teacher.$id}>
                          {teacher.name} - {teacher.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Select Subject</span>
                      </span>
                    </label>
                    <select
                      id="subject"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      required
                    >
                      <option value="">Choose a subject...</option>
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-all duration-200"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Back</span>
                    </span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Start Evaluation</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Simplified Evaluation Form */}
          {step === 3 && (
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🎯 Teacher Evaluation</h2>
                <p className="text-gray-600">Rate {selectedTeacherData?.name} in {selectedSubject}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="space-y-6">
                  {Object.entries(FEEDBACK_SECTIONS).map(([sectionKey, sectionData]) => (
                    <div key={sectionKey} className="bg-white/90 rounded-xl p-4 border border-gray-200">
                      <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
                        <span>{sectionData.icon}</span>
                        <span>{sectionData.title}</span>
                      </h3>
                      {sectionData.questions.map((question, questionIndex) => {
                        const questionKey = `${sectionKey}-${questionIndex}`;
                        const currentRating = responses[questionKey] || 0;
                        return (
                          <div key={questionIndex} className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-800 mb-3">{question}</p>
                            {renderRatingScale(sectionKey, questionIndex, currentRating)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isFormComplete()}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      loading || !isFormComplete()
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    }`}
                  >
                    {loading ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🎉 Thank You!</h2>
              <p className="text-gray-600 text-lg mb-8">
                Your feedback has been submitted successfully and will help improve education quality.
              </p>
              
              <div className="bg-green-50 p-6 rounded-xl border border-green-200 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">📋 Evaluation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <p><span className="font-semibold">Teacher:</span> {selectedTeacherData?.name}</p>
                  <p><span className="font-semibold">Subject:</span> {selectedSubject}</p>
                  <p><span className="font-semibold">Student:</span> {studentInfo.name}</p>
                  <p><span className="font-semibold">Submitted:</span> {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setStep(1);
                    setStudentInfo({ name: '', studentId: '', class: '' });
                    setSelectedTeacher('');
                    setSelectedSubject('');
                    setResponses({});
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300"
                >
                  Evaluate Another Teacher
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
