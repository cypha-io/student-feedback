'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dbHelpers, COLLECTIONS } from '@/lib/appwrite';
import { Teacher, Subject, Class } from '@/types/database';
import styles from './feedback.module.css';

// Enhanced feedback sections with modern structure
const FEEDBACK_SECTIONS = {
  A: {
    title: 'Student-Teacher Relationship',
    icon: '🤝',
    description: 'Building positive connections and rapport with students',
    color: 'from-pink-500 to-rose-500',
    questions: [
      'Teacher creates positive rapport with students & makes learning a fun experience',
      'Fosters Social and Emotional Learning by promoting skills like empathy, self-awareness, and relationship building (SEL)',
      'Identifies students learning challenges and helps them individually (differentiated instruction) or refers them for help when necessary'
    ]
  },
  B: {
    title: 'Cooperation & Team Work',
    icon: '👥',
    description: 'Promoting collaboration and inclusive learning environment',
    color: 'from-blue-500 to-cyan-500',
    questions: [
      'Lets students see themselves as a team by giving group work and assigning brilliant students to help the weak',
      'Ensures gender equality in all teaching and learning activities in and out of the classroom (GESI)',
      'Teacher accommodates and supports students with special educational needs to ensure inclusive learning (SEN)'
    ]
  },
  C: {
    title: 'Active Learning Methods',
    icon: '🎯',
    description: 'Engaging students through varied and interactive teaching',
    color: 'from-green-500 to-emerald-500',
    questions: [
      'Uses different teaching methods & gives more practical exercises or assignments',
      'Teacher effectively incorporates technology and digital tools into lessons to enhance student learning (ICT)',
      'Uses field trips and problem-solving methods in teaching'
    ]
  },
  D: {
    title: 'Subject Mastery',
    icon: '🎓',
    description: 'Demonstrating expertise and knowledge in teaching field',
    color: 'from-purple-500 to-violet-500',
    questions: [
      'Explains lessons to students\' understanding clearly',
      'Gives appropriate and relevant examples',
      'Welcomes and answers students\' questions effectively'
    ]
  },
  E: {
    title: 'Feedback & Recognition',
    icon: '💬',
    description: 'Providing timely feedback and appropriate rewards',
    color: 'from-orange-500 to-amber-500',
    questions: [
      'Marks exercises, assignments & tests promptly',
      'Varies feedback used in class (verbal, actions, student involvement like clapping)'
    ]
  },
  F: {
    title: 'Time Management',
    icon: '⏰',
    description: 'Effective use of class time and punctuality',
    color: 'from-indigo-500 to-blue-500',
    questions: [
      'Punctual to class and prepared',
      'Uses lesson time appropriately and efficiently'
    ]
  },
  G: {
    title: 'High Expectations',
    icon: '🚀',
    description: 'Challenging students to reach their full potential',
    color: 'from-red-500 to-pink-500',
    questions: [
      'Challenges students to get out of their comfort zone with appropriately difficult exercises and texts',
      'Checks to ensure students have the right notes and materials'
    ]
  },
  H: {
    title: 'Classroom Management',
    icon: '👨‍🏫',
    description: 'Maintaining order, respect, and positive learning environment',
    color: 'from-teal-500 to-cyan-500',
    questions: [
      'Teacher has the respect and attention of students',
      'Uses appropriate means to ensure orderliness in class'
    ]
  }
};

const RATING_OPTIONS = [
  { value: 5, label: 'Always', emoji: '🌟', color: 'bg-green-500 hover:bg-green-600 border-green-400', textColor: 'text-green-700', description: 'This happens all the time' },
  { value: 4, label: 'Often', emoji: '👍', color: 'bg-blue-500 hover:bg-blue-600 border-blue-400', textColor: 'text-blue-700', description: 'This happens frequently' },
  { value: 3, label: 'Sometimes', emoji: '👌', color: 'bg-indigo-500 hover:bg-indigo-600 border-indigo-400', textColor: 'text-indigo-700', description: 'This happens occasionally' },
  { value: 2, label: 'Rarely', emoji: '⚠️', color: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-400', textColor: 'text-yellow-700', description: 'This rarely happens' },
  { value: 1, label: 'Never', emoji: '❌', color: 'bg-red-500 hover:bg-red-600 border-red-400', textColor: 'text-red-700', description: 'This never happens' }
];

export default function StudentFeedback() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data fetching states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  
  // Form data states
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
    class: ''
  });
  
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [responses, setResponses] = useState<{[key: string]: number}>({});
  
  const sectionKeys = Object.keys(FEEDBACK_SECTIONS);
  const totalSections = sectionKeys.length;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, classesRes] = await Promise.all([
        dbHelpers.getAll(COLLECTIONS.TEACHERS),
        dbHelpers.getAll(COLLECTIONS.SUBJECTS),
        dbHelpers.getAll(COLLECTIONS.CLASSES)
      ]);
      
      setTeachers(teachersRes.documents as unknown as Teacher[]);
      setSubjects(subjectsRes.documents as unknown as Subject[]);
      setClasses(classesRes.documents as unknown as Class[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleStudentInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentInfo.name && studentInfo.studentId && studentInfo.class) {
      setCurrentStep(2);
    }
  };

  const handleTeacherSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeacher && selectedSubject) {
      setCurrentStep(3);
      setCurrentSectionIndex(0);
    }
  };

  const handleRatingSelect = (questionIndex: number, rating: number) => {
    const sectionKey = sectionKeys[currentSectionIndex];
    const questionKey = `${sectionKey}-${questionIndex}`;
    setResponses(prev => ({
      ...prev,
      [questionKey]: rating
    }));
  };

  const getCurrentSection = () => {
    const sectionKey = sectionKeys[currentSectionIndex];
    return FEEDBACK_SECTIONS[sectionKey as keyof typeof FEEDBACK_SECTIONS];
  };

  const isCurrentSectionComplete = () => {
    const currentSection = getCurrentSection();
    const sectionKey = sectionKeys[currentSectionIndex];
    
    return currentSection.questions.every((_, questionIndex) => {
      const questionKey = `${sectionKey}-${questionIndex}`;
      return responses[questionKey] !== undefined;
    });
  };

  const goToNextSection = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // All sections completed, go to submit
      handleSubmit();
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    } else {
      setCurrentStep(2);
    }
  };

  const calculateOverallScore = () => {
    let totalScore = 0;
    let maxTotalScore = 0;
    let answeredQuestions = 0;
    let totalQuestions = 0;

    sectionKeys.forEach(sectionKey => {
      const section = FEEDBACK_SECTIONS[sectionKey as keyof typeof FEEDBACK_SECTIONS];
      totalQuestions += section.questions.length;
      maxTotalScore += section.questions.length * 5;
      
      section.questions.forEach((_, index) => {
        const questionKey = `${sectionKey}-${index}`;
        if (responses[questionKey]) {
          totalScore += responses[questionKey];
          answeredQuestions++;
        }
      });
    });

    const percentage = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;
    
    return { 
      totalScore, 
      maxTotalScore, 
      percentage, 
      answeredQuestions,
      totalQuestions
    };
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const overallData = calculateOverallScore();
      const selectedTeacherData = teachers.find(t => t.$id === selectedTeacher);
      const selectedSubjectData = subjects.find(s => s.$id === selectedSubject);
      const selectedClassData = classes.find(c => c.$id === studentInfo.class);

      const feedbackData = {
        teacherName: selectedTeacherData?.name || '',
        subject: selectedSubjectData?.name || '',
        studentName: studentInfo.name,
        studentId: studentInfo.studentId,
        class: selectedClassData?.name || '',
        responses: JSON.stringify(responses),
        overallScore: overallData.percentage,
        sectionScores: JSON.stringify({}), // Calculate section scores if needed
        performanceGrade: overallData.percentage >= 85 ? 'Excellent' : 
                         overallData.percentage >= 75 ? 'Very Good' :
                         overallData.percentage >= 65 ? 'Good' :
                         overallData.percentage >= 50 ? 'Average' : 'Needs Improvement',
        submittedAt: new Date().toISOString()
      };

      await dbHelpers.create(COLLECTIONS.FEEDBACKS, feedbackData);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${styles.feedbackBackground} relative`}>
      <div className={`absolute inset-0 ${styles.feedbackOverlay}`} />
      
      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: currentStep === 1 ? '25%' : 
                       currentStep === 2 ? '50%' : 
                       currentStep === 3 ? `${50 + ((currentSectionIndex + 1) / totalSections) * 40}%` : 
                       '100%' 
              }}
            />
          </div>
          <div className="text-center text-white/90 text-sm">
            {currentStep === 1 && 'Student Information'}
            {currentStep === 2 && 'Teacher & Subject Selection'}
            {currentStep === 3 && `Section ${currentSectionIndex + 1} of ${totalSections}: ${getCurrentSection().title}`}
            {currentStep === 4 && 'Feedback Complete'}
          </div>
        </div>
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
      
      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {siteTitle}
            </h1>
          </div>
          <p className="text-white/90 text-sm mb-2">
            Share feedback to improve education quality
          </p>
          <div className="flex items-center justify-center space-x-3 text-white/70 text-xs">
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Anonymous</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Secure</span>
            </span>
          </div>
        </div>

        {/* Compact Progress Indicator */}
        <div className="mb-6 max-w-lg mx-auto">
          <div className="relative">
            <div className="flex items-center justify-between">
              {['Info', 'Teacher', 'Evaluate', 'Done'].map((stepName, index) => (
                <div key={stepName} className={`${styles.stepIndicator} ${step > index + 1 ? 'completed' : ''} flex flex-col items-center relative`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    step > index + 1 
                      ? 'bg-green-500 border-green-500 text-white shadow-md' 
                      : step === index + 1
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                      : 'bg-white/20 border-white/30 text-white/60'
                  }`}>
                    {step > index + 1 ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`mt-1 text-xs text-center font-medium ${
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

        {/* Compact Main Content Card */}
        <div className={`flex-1 max-w-lg mx-auto ${styles.feedbackCard} dark:${styles.feedbackCardDark} rounded-2xl shadow-xl overflow-hidden`}>
          {/* Step 1: Student Information */}
          {step === 1 && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Student Information</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Let&apos;s get started with your details</p>
              </div>
              
              <form onSubmit={handleStudentInfoSubmit} className="space-y-4 max-w-sm mx-auto">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      value={studentInfo.studentId}
                      onChange={(e) => setStudentInfo({...studentInfo, studentId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
                      placeholder="Enter your student ID"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Class/Grade
                    </label>
                    <input
                      type="text"
                      id="class"
                      value={studentInfo.class}
                      onChange={(e) => setStudentInfo({...studentInfo, class: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
                      placeholder="Enter your class/grade"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-sm"
                >
                  Continue →
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Teacher Selection */}
          {step === 2 && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Select Teacher & Subject</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Choose who you want to evaluate</p>
              </div>
              
              <form onSubmit={handleTeacherSelection} className="space-y-4 max-w-sm mx-auto">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teacher
                    </label>
                    <select
                      id="teacher"
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
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
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
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
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
                  >
                    Continue →
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
