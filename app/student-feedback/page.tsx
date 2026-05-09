'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Teacher, Subject, Class } from '@/types/database';
import styles from './feedback.module.css';
import { FEEDBACK_SECTIONS } from '@/lib/feedback-questions';

const RATING_OPTIONS = [
  { value: 5, label: 'Always', color: 'bg-green-500 hover:bg-green-600', description: 'This happens all the time' },
  { value: 4, label: 'Often', color: 'bg-blue-500 hover:bg-blue-600', description: 'This happens frequently' },
  { value: 3, label: 'Sometimes', color: 'bg-indigo-500 hover:bg-indigo-600', description: 'This happens occasionally' },
  { value: 2, label: 'Rarely', color: 'bg-yellow-500 hover:bg-yellow-600', description: 'This rarely happens' },
  { value: 1, label: 'Never', color: 'bg-red-500 hover:bg-red-600', description: 'This never happens' }
];

const RatingIcon = ({ value }: { value: number }) => {
  if (value >= 4) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }

  if (value === 3) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 16v.01M12 8v.01" />
      </svg>
    );
  }

  if (value === 2) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-8 14A2 2 0 004 21h16a2 2 0 001.71-3.14l-8-14a2 2 0 00-3.42 0z" />
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};

export default function FeedbackPortal() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [appraiserMode, setAppraiserMode] = useState<'student' | 'staff'>('student');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [siteTitle, setSiteTitle] = useState('Feedback Portal');

  const [questions, setQuestions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  // Form data states
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
    class: ''
  });

  const [staffInfo, setStaffInfo] = useState({
    name: '',
    staffId: '',
    appraiserType: 'peer'
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

  // Dynamic Sections based on questions in DB
  const getSectionsFromQuestions = () => {
    const selectedTeacherData = teachers.find(t => t.id === selectedTeacher);
    if (!selectedTeacherData) return {};

    const filteredQuestions = questions.filter(q => 
      q.targetRole === selectedTeacherData.staffType || q.targetRole === 'General'
    );

    const sections: Record<string, any> = {};
    filteredQuestions.forEach(q => {
      const sectionKey = q.section || 'General';
      if (!sections[sectionKey]) {
        sections[sectionKey] = {
          title: q.sectionTitle || 'General Performance',
          icon: '📊',
          description: 'Evaluating professional conduct and performance',
          color: 'from-blue-500 to-indigo-500',
          questions: []
        };
      }
      sections[sectionKey].questions.push({ id: q.id, text: q.question });
    });
    return sections;
  };

  const FEEDBACK_SECTIONS_DYNAMIC = getSectionsFromQuestions();
  const sectionKeys = Object.keys(FEEDBACK_SECTIONS_DYNAMIC);
  const totalSections = sectionKeys.length;

  useEffect(() => {
    fetchData();
    // Load site title from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setSiteTitle(settings.siteTitle || 'SMEI');
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, classesRes, questionsRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/subjects'),
        fetch('/api/classes'),
        fetch('/api/questions')
      ]);

      const teachersData = teachersRes.ok ? await teachersRes.json() : [];
      const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
      const classesData = classesRes.ok ? await classesRes.json() : [];
      const questionsData = questionsRes.ok ? await questionsRes.json() : [];

      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTeachers([]);
      setSubjects([]);
      setClasses([]);
      setQuestions([]);
    }
  };

  const handleAppraiserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appraiserMode === 'student') {
      if (studentInfo.name && studentInfo.studentId && studentInfo.class) {
        setCurrentStep(2);
      }
    } else {
      if (staffInfo.name && staffInfo.staffId && staffInfo.appraiserType) {
        setCurrentStep(2);
      }
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

  const handleRatingSelect = (questionId: string, rating: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  const getCurrentSection = () => {
    const sectionKey = sectionKeys[currentSectionIndex];
    return FEEDBACK_SECTIONS_DYNAMIC[sectionKey];
  };

  const isCurrentSectionComplete = () => {
    const currentSection = getCurrentSection();
    if (!currentSection) return false;

    return currentSection.questions.every((q: any) => {
      return responses[q.id] !== undefined;
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
        studentId: appraiserMode === 'student' ? studentInfo.studentId : staffInfo.staffId,
        appraiserType: appraiserMode === 'student' ? 'student' : staffInfo.appraiserType,
        teacherId: selectedTeacher,
        teacherName: selectedTeacherData?.name || '',
        subjectId: selectedSubject,
        classId: appraiserMode === 'student' ? studentInfo.class : 'N/A',
        status: 'completed',
        submittedAt: new Date().toISOString()
      };

      const responsesData = Object.entries(responses).map(([questionId, answer]) => ({
        questionId,
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
          {/* Header text and icons removed as per user request */}
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full h-3 mb-4">
            <div 
              className={`bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ${styles.progressBar} ${getProgressWidthClass()}`}
            />
          </div>
          <div className="text-center text-white/90 text-sm">
            {currentStep === 1 && (appraiserMode === 'student' ? 'Student Information' : 'Staff Information')}
            {currentStep === 2 && 'Appraisee Selection'}
            {currentStep === 3 && `Section ${currentSectionIndex + 1} of ${totalSections}: ${getCurrentSection().title}`}
            {currentStep === 4 && 'Feedback Complete'}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-3xl mx-auto">
          <div className={`${styles.feedbackCard} rounded-2xl shadow-2xl overflow-hidden`}>
            
            {/* Step 1: Appraiser Information */}
            {currentStep === 1 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Identify Yourself</h2>
                  <p className="text-gray-600">Select your role to begin evaluation</p>
                </div>

                <div className="flex items-center gap-4 mb-10 bg-gray-50 p-2 rounded-2xl max-w-sm mx-auto border border-gray-100 shadow-inner">
                  <button
                    onClick={() => setAppraiserMode('student')}
                    className={`flex-1 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      appraiserMode === 'student' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => setAppraiserMode('staff')}
                    className={`flex-1 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      appraiserMode === 'staff' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Staff Member
                  </button>
                </div>
                
                <form onSubmit={handleAppraiserInfoSubmit} className="space-y-6 max-w-md mx-auto">
                  {appraiserMode === 'student' ? (
                    <>
                      <div>
                        <label htmlFor="name" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={studentInfo.name}
                          onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                          className="w-full px-5 py-4 border-2 border-gray-100 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="studentId" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Student ID
                        </label>
                        <input
                          type="text"
                          id="studentId"
                          value={studentInfo.studentId}
                          onChange={(e) => setStudentInfo({...studentInfo, studentId: e.target.value})}
                          className="w-full px-5 py-4 border-2 border-gray-100 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold"
                          placeholder="Enter your student ID"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="class" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Class/Grade
                        </label>
                        <select
                          id="class"
                          value={studentInfo.class}
                          onChange={(e) => setStudentInfo({...studentInfo, class: e.target.value})}
                          className="w-full px-5 py-4 border-2 border-gray-100 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold appearance-none cursor-pointer"
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
                    </>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="staff-name" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Staff Name
                        </label>
                        <input
                          type="text"
                          id="staff-name"
                          value={staffInfo.name}
                          onChange={(e) => setStaffInfo({...staffInfo, name: e.target.value})}
                          className="w-full px-5 py-4 border-2 border-gray-100 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold"
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="staffId" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Staff ID
                        </label>
                        <input
                          type="text"
                          id="staffId"
                          value={staffInfo.staffId}
                          onChange={(e) => setStaffInfo({...staffInfo, staffId: e.target.value})}
                          className="w-full px-5 py-4 border-2 border-gray-100 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold"
                          placeholder="Enter your staff ID"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="appraiserType" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                          Appraiser Relationship
                        </label>
                        <select
                          id="appraiserType"
                          value={staffInfo.appraiserType}
                          onChange={(e) => setStaffInfo({...staffInfo, appraiserType: e.target.value})}
                          className="w-full px-5 py-4 border-2 border-gray-100 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                          required
                        >
                          <option value="peer">Peer (Colleague)</option>
                          <option value="hod">HOD (Head of Dept)</option>
                          <option value="supervisor">Direct Supervisor</option>
                          <option value="assistant_head">Asst. Headmaster</option>
                          <option value="other">Other Staff Member</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.2em] py-5 px-6 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-blue-100 transition-all duration-300"
                  >
                    Start Evaluation Process
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Teacher Selection */}
            {currentStep === 2 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Select Personnel</h2>
                  <p className="text-gray-600">Choose who you want to evaluate today</p>
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
                      <option value="">Choose personnel...</option>
                      {teachers && teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.role}) - {teacher.department}
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
                        {selectedTeacher ? 'Choose a subject...' : 'Select personnel first'}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{getCurrentSection().title}</h2>
                  <p className="text-gray-600 mb-4">{getCurrentSection().description}</p>
                  <div className="text-sm text-blue-600 font-medium">
                    Section {currentSectionIndex + 1} of {totalSections}
                  </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  {getCurrentSection().questions.map((question: any, questionIndex: number) => {
                    const currentRating = responses[question.id] || 0;
                    
                    return (
                      <div key={question.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="mb-6">
                          <div className="flex items-start space-x-3 mb-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                              {questionIndex + 1}
                            </div>
                            <p className="text-gray-900 font-medium leading-relaxed">{question.text}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                          {RATING_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleRatingSelect(question.id, option.value)}
                              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                currentRating === option.value
                                  ? `${option.color} text-white border-transparent shadow-lg scale-105`
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                              title={option.description}
                            >
                              <span className="mb-1"><RatingIcon value={option.value} /></span>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Your feedback has been submitted successfully and will help improve education quality.
                </p>
                
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">Evaluation Summary</h3>
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
                      setStaffInfo({ name: '', staffId: '', appraiserType: 'peer' });
                      setSelectedTeacher('');
                      setSelectedSubject('');
                      setResponses({});
                    }}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest py-5 px-6 rounded-2xl transition-all duration-300"
                  >
                    Evaluate Another Personnel
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
                    SMEI by SwapGPA Technologies Limited | Deployed for OLAGSHS
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
