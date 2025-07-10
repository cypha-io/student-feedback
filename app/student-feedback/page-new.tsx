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
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-school-image">
      <style jsx>{`
        .bg-school-image {
          background-image: url('https://olagshs.edu.gh/wp-content/uploads/2024/12/olag-shs-2024-brast-cancer-program-16-scaled.jpg');
        }
      `}</style>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-0" />
      <div className="w-full max-w-4xl z-10">
        {/* Card Container */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                {siteTitle}
              </h1>
              <p className="text-white text-lg">
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
                    <span className={`ml-2 text-sm ${step >= index + 1 ? 'text-white font-medium' : 'text-gray-300'}`}>
                      {stepName}
                    </span>
                    {index < 3 && (
                      <div className={`flex-1 h-1 mx-4 rounded ${
                        step > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {/* Step 1: Student Information */}
              {step === 1 && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Information</h2>
                  <form onSubmit={handleStudentInfoSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={studentInfo.name}
                        onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        id="studentId"
                        value={studentInfo.studentId}
                        onChange={(e) => setStudentInfo({...studentInfo, studentId: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your student ID"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Class
                      </label>
                      <input
                        type="text"
                        id="class"
                        value={studentInfo.class}
                        onChange={(e) => setStudentInfo({...studentInfo, class: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your class (e.g., Form 1A)"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      Continue
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Teacher Selection */}
              {step === 2 && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Teacher & Subject</h2>
                  <form onSubmit={handleTeacherSelection} className="space-y-6">
                    <div>
                      <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Teacher
                      </label>
                      <select
                        id="teacher"
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Subject
                      </label>
                      <select
                        id="subject"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Feedback Form */}
              {step === 3 && (
                <div className="p-8">
                  {/* Header with teacher info */}
                  <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Evaluation</h2>
                    <div className="text-sm text-gray-600">
                      <p><strong>Name of Teacher:</strong> {selectedTeacherData?.name}</p>
                      <p><strong>Department:</strong> {selectedTeacherData?.department}</p>
                      <p><strong>Subject:</strong> {selectedSubject}</p>
                      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Rating Scale Legend */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Rating Scale:</h3>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      {Object.entries(RATING_LABELS).reverse().map(([value, data]) => (
                        <div key={value} className="text-center">
                          <div className="font-medium">{value}</div>
                          <div className="text-gray-600">{data.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Feedback Sections */}
                    {Object.entries(FEEDBACK_SECTIONS).map(([sectionKey, sectionData]) => {
                      const sectionScore = calculateSectionScore(sectionKey);
                      return (
                        <div key={sectionKey} className="border rounded-lg p-6 bg-white">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                              {sectionKey}. {sectionData.title}
                            </h3>
                            {(sectionScore.answeredQuestions || 0) > 0 && (
                              <div className="text-sm text-blue-600 font-medium">
                                Score: {sectionScore.score}/{sectionScore.maxScore} ({sectionScore.percentage.toFixed(1)}%)
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-6">
                            {sectionData.questions.map((question, questionIndex) => {
                              const questionKey = `${sectionKey}-${questionIndex}`;
                              const currentRating = responses[questionKey] || 0;
                              const questionNumber = Object.keys(FEEDBACK_SECTIONS)
                                .slice(0, Object.keys(FEEDBACK_SECTIONS).indexOf(sectionKey))
                                .reduce((total, key) => total + FEEDBACK_SECTIONS[key as keyof typeof FEEDBACK_SECTIONS].questions.length, 0) + questionIndex + 1;

                              return (
                                <div key={questionIndex} className="p-4 border-l-4 border-blue-200 bg-blue-50">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-900">
                                        {questionNumber}. {question}
                                      </span>
                                    </div>
                                    {currentRating > 0 && (
                                      <div className="ml-4 text-sm font-medium text-blue-600">
                                        {currentRating}/5
                                      </div>
                                    )}
                                  </div>
                                  {renderRatingScale(sectionKey, questionIndex, currentRating)}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Section Sub-total */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-right font-medium text-gray-700">
                              Sub-Total: {sectionScore.score}/{sectionScore.maxScore}
                              {(sectionScore.answeredQuestions || 0) > 0 && (
                                <span className="ml-2 text-blue-600">({sectionScore.percentage.toFixed(1)}%)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Grand Total */}
                    {(() => {
                      const overallScore = calculateOverallScore();
                      return overallScore.totalAnswered > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Performance Summary</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{overallScore.totalScore}</div>
                              <div className="text-sm text-gray-600">Total Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{overallScore.maxTotalScore}</div>
                              <div className="text-sm text-gray-600">Max Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{overallScore.percentage.toFixed(1)}%</div>
                              <div className="text-sm text-gray-600">Percentage</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${overallScore.rating?.color || 'text-gray-600'}`}>
                                {overallScore.rating?.label || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Grade</div>
                            </div>
                          </div>
                          
                          {/* Performance Scale */}
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Performance Scale:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {PERFORMANCE_RATINGS.map((rating) => (
                                <div key={rating.label} className={`text-center p-2 rounded ${
                                  overallScore.rating?.label === rating.label ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
                                }`}>
                                  <div className={`font-medium ${rating.color}`}>{rating.label}</div>
                                  <div className="text-gray-600">{rating.min}-{rating.max}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !isFormComplete()}
                        className={`flex-1 py-3 px-6 rounded-lg transition-colors duration-200 font-medium ${
                          loading || !isFormComplete()
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Feedback Submitted Successfully!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Thank you for your valuable feedback. Your responses will help improve the quality of education.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Feedback Summary</h3>
                    <div className="text-sm text-gray-600">
                      <p><strong>Teacher:</strong> {selectedTeacherData?.name}</p>
                      <p><strong>Subject:</strong> {selectedSubject}</p>
                      <p><strong>Submitted:</strong> {new Date().toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setStep(1);
                      setStudentInfo({ name: '', studentId: '', class: '' });
                      setSelectedTeacher('');
                      setSelectedSubject('');
                      setResponses({});
                    }}
                    className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
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
