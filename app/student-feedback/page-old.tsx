'use client';

import { useState, useEffect } from 'react';
import { dbHelpers, COLLECTIONS } from '@/lib/appwrite';
import { Teacher, Subject } from '@/types/database';

// Define the structured feedback questions directly in the component
const FEEDBACK_SECTIONS = {
  A: {
    title: 'Encourages Student-Teacher Relationship',
    questions: [
      'Teacher creates positive rapport with students & makes learning a fun experience',
      'Fosters Social and Emotional Learning by Promoting Skills like empathy, self-awareness, and relationship building (SEL).',
      'Identifies students learning challenges and helps them individually (differentiated instruction) or refers them for help (counseling) when necessary'
    ]
  },
  B: {
    title: 'Encourages Cooperation & Team Work Among Students',
    questions: [
      'Let students see themselves as a team by giving group work and assigning brilliant students to help the weak',
      'Ensures gender equality in all teaching and learning activities in and out of the classroom (GESI).',
      'Teacher accommodates and supports students with special educational needs to ensure inclusive learning (SEN).'
    ]
  },
  C: {
    title: 'Encourages Active Learning',
    questions: [
      'Uses different teaching methods & gives more practical exercises or assignments',
      'Teacher effectively incorporates technology and digital tools into lessons to enhance student learning (ICT).',
      'Uses field trips, and problem-solving methods in teaching'
    ]
  },
  D: {
    title: 'Mastery Over Teaching Field/Subject',
    questions: [
      'Explain lessons to students\' understanding',
      'Gives appropriate examples',
      'Welcomes and answers students\' questions'
    ]
  },
  E: {
    title: 'Gives Prompt Feedback and Rewards Students Appropriately',
    questions: [
      'Marks exercises, assignments & tests promptly',
      'Varies feedback used in class Eg. Verbal, Actions, Students involvement like clapping'
    ]
  },
  F: {
    title: 'Emphasizes Time on Task',
    questions: [
      'Punctual to class',
      'Uses lesson time appropriately'
    ]
  },
  G: {
    title: 'Communicates High Expectations',
    questions: [
      'Challenges students to get out of their comfort zone and give exercises and texts that are challenging enough',
      'Checks to ensure students have the right notes'
    ]
  },
  H: {
    title: 'Class Control',
    questions: [
      'Teacher has the respect and attention of students',
      'Uses appropriate means to ensure orderliness in class'
    ]
  }
};

const RATING_LABELS = {
  5: { label: 'Mostly', description: '5 (Mostly)' },
  4: { label: 'Often', description: '4 (Often)' },
  3: { label: 'Sometimes', description: '3 (Sometimes)' },
  2: { label: 'Few Times', description: '2 (Few Times)' },
  1: { label: 'Never', description: '1 (Never)' }
};

const PERFORMANCE_RATINGS = [
  { min: 85, max: 100, label: 'Excellent', color: 'text-green-600' },
  { min: 75, max: 84, label: 'Very Good', color: 'text-blue-600' },
  { min: 70, max: 74, label: 'Good', color: 'text-indigo-600' },
  { min: 60, max: 69, label: 'Average', color: 'text-yellow-600' },
  { min: 50, max: 59, label: 'Weak', color: 'text-orange-600' },
  { min: 40, max: 49, label: 'Poor', color: 'text-red-600' },
  { min: 0, max: 39, label: 'Very Poor', color: 'text-red-800' }
];

export default function StudentFeedback() {
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
    
    return { score: totalScore, percentage, maxScore, answeredQuestions };
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
      <div className="flex justify-center space-x-2 mt-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleQuestionResponse(section, questionIndex, rating)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentRating === rating
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
            }`}
            title={RATING_LABELS[rating as keyof typeof RATING_LABELS].description}
          >
            {rating}
          </button>
        ))}
      </div>
    );
  };

  const selectedTeacherData = teachers.find(t => t.$id === selectedTeacher);

  return (
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
      // Empty fallback - subjects must be added through admin interface
      setSubjects([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await dbHelpers.getAll(COLLECTIONS.QUESTIONS);
      setQuestions(response.documents as unknown as Question[]);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Empty fallback - questions must be added through admin interface
      setQuestions([]);
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

  const handleQuestionResponse = (questionId: string, answer: string | number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create feedback record
      const feedbackData = {
        studentId: studentInfo.studentId,
        teacherId: selectedTeacher,
        subjectId: selectedSubject,
        classId: studentInfo.class,
        status: 'completed',
        submittedAt: new Date().toISOString(),
      };

      const feedback = await dbHelpers.create(COLLECTIONS.FEEDBACKS, feedbackData);

      // Create response records
      for (const [questionId, answer] of Object.entries(responses)) {
        const responseData = {
          feedbackId: feedback.$id,
          questionId,
          answer: answer.toString(),
          type: questions.find(q => q.$id === questionId)?.type || 'text',
        };
        await dbHelpers.create(COLLECTIONS.RESPONSES, responseData);
      }

      setStep(4); // Success step
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (questionId: string, currentRating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleQuestionResponse(questionId, star)}
            className={`text-2xl transition-colors duration-200 ${
              star <= currentRating 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center" style={{ backgroundImage: "url('https://olagshs.edu.gh/wp-content/uploads/2024/12/olag-shs-2024-brast-cancer-program-16-scaled.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-0" />
      <div className="w-full max-w-2xl z-10">
        {/* Card Container */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                {siteTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Help us improve by sharing your feedback about your teachers and courses
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {['Student Info', 'Select Teacher', 'Feedback', 'Complete'].map((stepName, index) => (
                  <div key={stepName} className={`flex items-center ${index < 3 ? 'flex-1' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                      step > index + 1 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : step === index + 1
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }`}>
                      {step > index + 1 ? '✓' : index + 1}
                    </div>
                    <span className={`ml-2 text-sm ${step >= index + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      {stepName}
                    </span>
                    {index < 3 && (
                      <div className={`flex-1 h-1 mx-4 rounded ${
                        step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
              {/* Step 1: Student Information */}
              {step === 1 && (
                <form onSubmit={handleStudentInfoSubmit} className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Student Information</h2>
                  
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="studentName"
                      type="text"
                      required
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Student ID
                    </label>
                    <input
                      id="studentId"
                      type="text"
                      required
                      value={studentInfo.studentId}
                      onChange={(e) => setStudentInfo({...studentInfo, studentId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      placeholder="Enter your student ID"
                    />
                  </div>

                  <div>
                    <label htmlFor="studentClass" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year
                    </label>
                    <select
                      id="studentClass"
                      required
                      value={studentInfo.class}
                      onChange={(e) => setStudentInfo({...studentInfo, class: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                    >
                      <option value="">Select your year</option>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Continue
                  </button>
                </form>
              )}

              {/* Step 2: Teacher Selection */}
              {step === 2 && (
                <form onSubmit={handleTeacherSelection} className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Select Teacher & Subject</h2>
                  
                  <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teacher
                    </label>
                    <select
                      id="teacher"
                      required
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.$id} value={teacher.$id}>
                          {teacher.name} - {teacher.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      required
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Questions */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Feedback Questions</h2>
                  
                  {questions.map((question) => (
                    <div key={question.$id} className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {question.type === 'rating' && (
                        <div className="space-y-2">
                          {renderStarRating(question.$id!, responses[question.$id!] as number || 0)}
                          <p className="text-xs text-gray-500">Click stars to rate (1-5)</p>
                        </div>
                      )}
                      
                      {question.type === 'text' && (
                        <textarea
                          required={question.required}
                          value={responses[question.$id!] as string || ''}
                          onChange={(e) => handleQuestionResponse(question.$id!, e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                          rows={4}
                          placeholder="Enter your response..."
                        />
                      )}
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, index) => (
                            <label key={index} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`question_${question.$id}`}
                                value={option}
                                checked={responses[question.$id!] === option}
                                onChange={(e) => handleQuestionResponse(question.$id!, e.target.value)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                required={question.required}
                              />
                              <span className="text-gray-700 dark:text-gray-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Thank You!</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your feedback has been successfully submitted. Your input helps us improve the quality of education.
                  </p>
                  <button
                    onClick={() => {
                      setStep(1);
                      setStudentInfo({ name: '', studentId: '', class: '' });
                      setSelectedTeacher('');
                      setSelectedSubject('');
                      setResponses({});
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Submit Another Feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}