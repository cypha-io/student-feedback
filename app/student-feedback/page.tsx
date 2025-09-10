'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Teacher, Subject, Class } from '@/types/database';
import styles from './feedback.module.css';
import { FEEDBACK_SECTIONS } from '@/lib/feedback-questions';

const RATING_OPTIONS = [
  { value: 5, label: 'Always', emoji: '🌟', color: 'bg-green-500 hover:bg-green-600', description: 'This happens all the time' },
  { value: 4, label: 'Often', emoji: '👍', color: 'bg-blue-500 hover:bg-blue-600', description: 'This happens frequently' },
  { value: 3, label: 'Sometimes', emoji: '👌', color: 'bg-indigo-500 hover:bg-indigo-600', description: 'This happens occasionally' },
  { value: 2, label: 'Rarely', emoji: '⚠️', color: 'bg-yellow-500 hover:bg-yellow-600', description: 'This rarely happens' },
  { value: 1, label: 'Never', emoji: '❌', color: 'bg-red-500 hover:bg-red-600', description: 'This never happens' }
];

export default function StudentFeedback() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [siteTitle, setSiteTitle] = useState('Student Feedback Portal');

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

  // Filtered subjects based on selected teacher
  const filteredSubjects = selectedTeacher ? 
    subjects.filter(subject => {
      const teacher = teachers.find(t => t.id === selectedTeacher);
      return teacher?.subjects?.includes(subject.name);
    }) : [];

  const sectionKeys = Object.keys(FEEDBACK_SECTIONS);
  const totalSections = sectionKeys.length;

  useEffect(() => {
    fetchData();
    // Load site title from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setSiteTitle(settings.siteTitle || 'SMEI - Cypha Inc.');
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, classesRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/subjects'),
        fetch('/api/classes')
      ]);

      // Ensure we get valid arrays or default to empty arrays
      const teachersData = teachersRes.ok ? await teachersRes.json() : [];
      const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
      const classesData = classesRes.ok ? await classesRes.json() : [];

      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays as fallback
      setTeachers([]);
      setSubjects([]);
      setClasses([]);
    }
  };

  const handleStudentInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentInfo.name && studentInfo.studentId && studentInfo.class) {
      setCurrentStep(2);
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    setSelectedSubject(''); // Reset subject when teacher changes
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

  const handleSubmit = async () => {
    try {
      const selectedTeacherData = teachers.find(t => t.id === selectedTeacher);

      const feedbackData = {
        studentId: studentInfo.studentId,
        teacherId: selectedTeacher,
        teacherName: selectedTeacherData?.name || '',
        subjectId: selectedSubject,
        classId: studentInfo.class,
        status: 'completed',
        submittedAt: new Date().toISOString()
      };

      const responsesData = Object.entries(responses).map(([questionKey, answer]) => ({
        questionId: questionKey,
        answer: answer.toString(),
        type: 'rating'
      }));

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackData, responsesData }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      setCurrentStep(4);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  const getProgressWidthClass = () => {
    const percentage = getProgressPercentage();
    if (percentage <= 25) return styles.progressWidth25;
    if (percentage <= 40) return styles.progressWidth40;
    if (percentage <= 50) return styles.progressWidth50;
    if (percentage <= 60) return styles.progressWidth60;
    if (percentage <= 70) return styles.progressWidth70;
    if (percentage <= 80) return styles.progressWidth80;
    if (percentage <= 90) return styles.progressWidth90;
    return styles.progressWidth100;
  };

  const getProgressPercentage = () => {
    if (currentStep === 1) return 25;
    if (currentStep === 2) return 40;
    if (currentStep === 3) return 40 + ((currentSectionIndex + 1) / totalSections) * 50;
    return 100;
  };

  return (
    <div className={`min-h-screen ${styles.feedbackBackground} relative`}>
      <div className={`absolute inset-0 ${styles.feedbackOverlay}`} />
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {siteTitle}
            </h1>
          </div>
          <p className="text-white/90 text-lg mb-2">Share feedback to improve education quality</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full h-3 mb-4">
            <div 
              className={`bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ${styles.progressBar} ${getProgressWidthClass()}`}
            />
          </div>
          <div className="text-center text-white/90 text-sm">
            {currentStep === 1 && 'Student Information'}
            {currentStep === 2 && 'Teacher & Subject Selection'}
            {currentStep === 3 && `Section ${currentSectionIndex + 1} of ${totalSections}: ${getCurrentSection().title}`}
            {currentStep === 4 && 'Feedback Complete'}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-3xl mx-auto">
          <div className={`${styles.feedbackCard} rounded-2xl shadow-2xl overflow-hidden`}>
            
            {/* Step 1: Student Information */}
            {currentStep === 1 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Information</h2>
                  <p className="text-gray-600">Let&apos;s get started with your details</p>
                </div>
                
                <form onSubmit={handleStudentInfoSubmit} className="space-y-6 max-w-md mx-auto">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      value={studentInfo.studentId}
                      onChange={(e) => setStudentInfo({...studentInfo, studentId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your student ID"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                      Class/Grade
                    </label>
                    <select
                      id="class"
                      value={studentInfo.class}
                      onChange={(e) => setStudentInfo({...studentInfo, class: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select your class...</option>
                      {classes && classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} - Year {cls.year}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    Continue →
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Teacher Selection */}
            {currentStep === 2 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Teacher & Subject</h2>
                  <p className="text-gray-600">Choose who you want to evaluate</p>
                </div>
                
                <form onSubmit={handleTeacherSelection} className="space-y-6 max-w-md mx-auto">
                  <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-2">
                      Teacher
                    </label>
                    <select
                      id="teacher"
                      value={selectedTeacher}
                      onChange={(e) => handleTeacherChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Choose a teacher...</option>
                      {teachers && teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                      {selectedTeacher && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Only subjects taught by selected teacher)
                        </span>
                      )}
                    </label>
                    <select
                      id="subject"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled={!selectedTeacher}
                    >
                      <option value="">
                        {selectedTeacher ? 'Choose a subject...' : 'Select a teacher first'}
                      </option>
                      {filteredSubjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                    >
                      Continue →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Section-by-Section Evaluation */}
            {currentStep === 3 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${getCurrentSection().color} rounded-xl flex items-center justify-center text-3xl`}>
                    {getCurrentSection().icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{getCurrentSection().title}</h2>
                  <p className="text-gray-600 mb-4">{getCurrentSection().description}</p>
                  <div className="text-sm text-blue-600 font-medium">
                    Section {currentSectionIndex + 1} of {totalSections}
                  </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {getCurrentSection().questions.map((question, questionIndex) => {
                    const questionKey = `${sectionKeys[currentSectionIndex]}-${questionIndex}`;
                    const currentRating = responses[questionKey] || 0;
                    
                    return (
                      <div key={questionIndex} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="mb-6">
                          <div className="flex items-start space-x-3 mb-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                              {questionIndex + 1}
                            </div>
                            <p className="text-gray-900 font-medium leading-relaxed">{question}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                          {RATING_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleRatingSelect(questionIndex, option.value)}
                              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                currentRating === option.value
                                  ? `${option.color} text-white border-transparent shadow-lg scale-105`
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                              title={option.description}
                            >
                              <span className="text-2xl mb-1">{option.emoji}</span>
                              <span className="font-bold text-lg">{option.value}</span>
                              <span className="text-xs font-medium">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-8 max-w-2xl mx-auto">
                  <button
                    type="button"
                    onClick={goToPreviousSection}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    ← {currentSectionIndex === 0 ? 'Back' : 'Previous'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={goToNextSection}
                    disabled={!isCurrentSectionComplete()}
                    className={`font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
                      isCurrentSectionComplete()
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {currentSectionIndex === totalSections - 1 ? 'Submit Feedback' : 'Next Section'} →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {currentStep === 4 && (
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
                    <p><span className="font-semibold">Teacher:</span> {teachers.find(t => t.id === selectedTeacher)?.name}</p>
                    <p><span className="font-semibold">Subject:</span> {subjects.find(s => s.id === selectedSubject)?.name}</p>
                    <p><span className="font-semibold">Student:</span> {studentInfo.name}</p>
                    <p><span className="font-semibold">Class:</span> {(() => {
                      const cls = classes.find(c => c.id === studentInfo.class);
                      return cls ? `${cls.name} - Year ${cls.year}` : '';
                    })()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setCurrentSectionIndex(0);
                      setStudentInfo({ name: '', studentId: '', class: '' });
                      setSelectedTeacher('');
                      setSelectedSubject('');
                      setResponses({});
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
                  >
                    Evaluate Another Teacher
                  </button>
                  
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                  >
                    Return to Homepage
                  </button>
                </div>
                
                {/* Software Attribution */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    SMEI - Cypha Inc. by Chamba Nanang | Deployed for OLAGSHS
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
