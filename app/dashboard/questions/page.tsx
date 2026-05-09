'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';

interface Question {
  id?: string;
  question: string;
  type: 'rating' | 'text' | 'multiple_choice';
  options?: string[];
  required: boolean;
  category: string;
  order?: number;
  section: string; // A, B, C, D, E, F, G, H
  sectionTitle: string; // e.g., "Encourages Student-Teacher Relationship"
  questionNumber: number; // 1-20
  maxScore: number; // Usually 5 for rating questions
}

// Predefined feedback structure for auto-population
const FEEDBACK_STRUCTURE = {
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

export default function QuestionsForm() {
  const [questions, setQuestions] = useState<Question[]>([]);  
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewResponses, setPreviewResponses] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    question: '',
    type: 'rating',
    options: [],
    required: false,
    category: '',
    order: 1,
    section: 'A',
    sectionTitle: '',
    questionNumber: 1,
    maxScore: 5,
  });
  const [isPopulating, setIsPopulating] = useState(false);

  // Load questions from database on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (isModalOpen || isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isPreviewOpen]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      console.log('Fetching questions from database...');
      const response = await dbHelpers.getAll(COLLECTIONS.QUESTIONS);
      console.log('Successfully fetched questions:', response);
      setQuestions(response.documents as unknown as Question[]);
    } catch (error) {
      console.error('Error fetching questions:', error);
      console.log('Using empty array as fallback');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const questionTypes = [
    { value: 'rating', label: 'Rating (1-5 scale)' },
    { value: 'text', label: 'Text Response' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
  ];

  const categories = [
    'Teaching Quality',
    'Communication',
    'Classroom Management',
    'Subject Knowledge',
    'Student Engagement',
    'Suggestions',
    'General',
  ];  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      console.log('Attempting to save question to database...');
      
      if (editingQuestion) {
        // Update existing question
        console.log('Updating question with ID:', editingQuestion.id);
        await dbHelpers.update(COLLECTIONS.QUESTIONS, editingQuestion.id!, formData);
        setQuestions(questions.map(question => 
          question.id === editingQuestion.id 
            ? { ...formData, id: editingQuestion.id }
            : question
        ));
      } else {
        // Add new question
        console.log('Creating new question...');
        const newQuestion = await dbHelpers.create(COLLECTIONS.QUESTIONS, formData);
        console.log('Successfully created question:', newQuestion);
        setQuestions([...questions, newQuestion as unknown as Question]);
      }
      
      resetForm();
      alert('Question saved successfully!');
    } catch (error) {
      console.error('Error saving question:', error);
      alert(`Failed to save to database: ${error}. Data will be saved locally for demo purposes.`);
      
      // Fallback to local state
      if (editingQuestion) {
        setQuestions(questions.map(question => 
          question.id === editingQuestion.id 
            ? { ...formData, id: editingQuestion.id }
            : question
        ));
      } else {
        const newQuestion: Question = {
          ...formData,
          id: Date.now().toString(),
        };
        setQuestions([...questions, newQuestion]);
      }
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      type: 'rating',
      options: [],
      required: false,
      category: '',
      order: 1,
      section: 'A',
      sectionTitle: '',
      questionNumber: 1,
      maxScore: 5,
    });
    setEditingQuestion(null);
    setIsModalOpen(false);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      type: question.type,
      options: question.options || [],
      required: question.required,
      category: question.category,
      section: question.section,
      sectionTitle: question.sectionTitle,
      questionNumber: question.questionNumber,
      maxScore: question.maxScore,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      console.log('Deleting question with ID:', id);
      await dbHelpers.delete(COLLECTIONS.QUESTIONS, id);
      setQuestions(questions.filter(question => question.id !== id));
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      // Fallback to local state
      setQuestions(questions.filter(question => question.id !== id));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...(formData.options || []), ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = (formData.options || []).filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < questions.length) {
      [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
      setQuestions(newQuestions);
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'rating':
        return (
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case 'multiple_choice':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9a3.5 3.5 0 116.544 1.5c0 1.5-1.5 2-2.5 3M12 17h.01" />
          </svg>
        );
    }
  };

  // Auto-populate questions from the predefined structure
  const populateStandardQuestions = async () => {
    if (!confirm('This will replace all existing questions with the standard teacher evaluation questions. Continue?')) {
      return;
    }
    
    setIsPopulating(true);
    try {
      // Clear existing questions
      for (const question of questions) {
        if (question.id) {
          await dbHelpers.delete(COLLECTIONS.QUESTIONS, question.id);
        }
      }
      
      // Add new structured questions
      let questionNumber = 1;
      const newQuestions: Question[] = [];
      
      for (const [sectionKey, sectionData] of Object.entries(FEEDBACK_STRUCTURE)) {
        for (let i = 0; i < sectionData.questions.length; i++) {
          const questionData = {
            question: `[${sectionKey}] ${sectionData.title}: ${sectionData.questions[i]}`,
            type: 'rating' as const,
            required: true,
            category: 'teaching_effectiveness',
            order: questionNumber
          };
          
          const result = await dbHelpers.create(COLLECTIONS.QUESTIONS, questionData);
          newQuestions.push({ 
            ...questionData, 
            id: result.id,
            section: sectionKey,
            sectionTitle: sectionData.title,
            questionNumber: questionNumber,
            maxScore: 5
          });
          questionNumber++;
        }
      }
      
      setQuestions(newQuestions);
      alert(`Successfully created ${newQuestions.length} standard evaluation questions!`);
    } catch (error) {
      console.error('Error populating questions:', error);
      alert('Failed to populate questions. Please try again.');
    } finally {
      setIsPopulating(false);
    }
  };

  // Parse questions into sections for preview
  const parseQuestionsForPreview = () => {
    const sections: Record<string, { title: string; questions: string[] }> = {};
    
    questions.forEach((q) => {
      // Parse section from question text like "[A] Section Title: Question text"
      const match = q.question.match(/^\[([A-H])\]\s*([^:]+):\s*(.+)$/);
      if (match) {
        const [, sectionKey, sectionTitle, questionText] = match;
        
        if (!sections[sectionKey]) {
          sections[sectionKey] = {
            title: sectionTitle.trim(),
            questions: []
          };
        }
        
        sections[sectionKey].questions.push(questionText.trim());
      } else {
        // Fallback: use question as-is
        if (!sections['A']) {
          sections['A'] = { title: 'General Questions', questions: [] };
        }
        sections['A'].questions.push(q.question);
      }
    });
    
    return sections;
  };

  const handlePreviewResponse = (section: string, questionIndex: number, rating: number) => {
    const key = `${section}-${questionIndex}`;
    setPreviewResponses(prev => ({
      ...prev,
      [key]: rating
    }));
  };

  const calculatePreviewScores = () => {
    const sections = parseQuestionsForPreview();
    const sectionScores: Record<string, number> = {};
    let totalScore = 0;
    let totalQuestions = 0;

    Object.entries(sections).forEach(([sectionKey, sectionData]) => {
      let sectionTotal = 0;
      let sectionCount = 0;

      sectionData.questions.forEach((_, questionIndex) => {
        const responseKey = `${sectionKey}-${questionIndex}`;
        const response = previewResponses[responseKey];
        if (response) {
          sectionTotal += response;
          sectionCount++;
          totalScore += response;
          totalQuestions++;
        }
      });

      if (sectionCount > 0) {
        sectionScores[sectionKey] = (sectionTotal / sectionCount);
      }
    });

    const overallScore = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
    const percentage = (overallScore / 5) * 100;

    return {
      sectionScores,
      overallScore,
      percentage,
      totalQuestions,
      answeredQuestions: totalQuestions
    };
  };

  const getPerformanceGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'Excellent', color: 'text-green-600 bg-green-100' };
    if (percentage >= 75) return { grade: 'Good', color: 'text-blue-600 bg-blue-100' };
    if (percentage >= 60) return { grade: 'Average', color: 'text-yellow-600 bg-yellow-100' };
    return { grade: 'Poor', color: 'text-red-600 bg-red-100' };
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Evaluation Builder
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Configure and structure student-teacher feedback questionnaires
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={populateStandardQuestions}
              disabled={isPopulating}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50 shadow-sm group active:scale-95"
            >
              <svg className="w-4 h-4 text-emerald-500 group-hover:translate-y-[-2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {isPopulating ? 'Processing...' : 'Auto-Populate'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-100 flex items-center gap-2 group active:scale-95"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Questionnaire Structure
                <span className="text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest">{questions.length} Items</span>
              </h3>
              <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">Active evaluation blueprint for OLAG SHS</p>
            </div>
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-4 py-2.5 rounded-2xl transition-all group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Live Preview
            </button>
          </div>
          
          <div className="p-10 space-y-6 max-h-[700px] overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-500 font-bold">Assembling builder interface...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Workspace Empty</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Click "Add Question" or "Auto-Populate" to start building your evaluation form.</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div
                  key={question.id}
                  className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {getQuestionIcon(question.type)}
                        </div>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-blue-100/50">
                          {question.category.replace('_', ' ')}
                        </span>
                        {question.required && (
                          <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-rose-100/50">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4 leading-snug">
                        <span className="text-slate-300 font-black mr-2">{(index + 1).toString().padStart(2, '0')}</span>
                        {question.question}
                      </h4>
                      
                      {question.section && (
                        <div className="flex items-center gap-3 mb-6">
                          <span className="w-8 h-8 bg-slate-900 text-white rounded-xl text-[10px] font-black flex items-center justify-center shadow-lg shadow-slate-200">
                            {question.section}
                          </span>
                          <span className="text-xs font-bold text-slate-500 italic">
                            {question.sectionTitle}
                          </span>
                        </div>
                      )}
                      
                      {/* Interactive Visual Element based on type */}
                      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-50">
                        {question.type === 'rating' && (
                          <div className="flex items-center gap-6">
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:border-amber-200 group-hover:text-amber-400 transition-all">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scale: 1 — 5</span>
                          </div>
                        )}
                        
                        {question.type === 'multiple_choice' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-4 h-4 rounded-full border-2 border-slate-200"></div>
                                <span className="text-xs font-bold text-slate-700">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'text' && (
                          <div className="w-full h-24 bg-white border border-slate-100 rounded-xl shadow-inner flex items-center justify-center italic text-xs text-slate-300">
                            Simulated multi-line text input area
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 ml-6">
                      <button
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="p-3 bg-white text-slate-400 hover:text-blue-600 hover:shadow-xl rounded-2xl border border-slate-100 transition-all disabled:opacity-30 group/move"
                      >
                        <svg className="w-4 h-4 group-hover/move:translate-y-[-2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === questions.length - 1}
                        className="p-3 bg-white text-slate-400 hover:text-blue-600 hover:shadow-xl rounded-2xl border border-slate-100 transition-all disabled:opacity-30 group/move"
                      >
                        <svg className="w-4 h-4 group-hover/move:translate-y-[2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="h-px bg-slate-100 my-2"></div>
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-3 bg-white text-blue-600 hover:shadow-xl rounded-2xl border border-slate-100 transition-all group/edit"
                      >
                        <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(question.id || '')}
                        className="p-3 bg-white text-rose-500 hover:shadow-xl rounded-2xl border border-slate-100 transition-all group/del"
                      >
                        <svg className="w-4 h-4 group-hover/del:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Builder Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
              
              <div className="relative bg-white rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-100 animate-scale-up">
                <div className="px-10 pt-10 pb-6 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {editingQuestion ? 'Edit Question' : 'Add Question'}
                    </h3>
                    <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">Define the feedback component</p>
                  </div>
                  <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Description</label>
                      <textarea
                        required
                        value={formData.question}
                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                        placeholder="What would you like to ask the students?"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Response Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as Question['type']})}
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                        >
                          {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Category</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Section</label>
                        <select
                          value={formData.section}
                          onChange={(e) => setFormData({
                            ...formData, 
                            section: e.target.value,
                            sectionTitle: FEEDBACK_STRUCTURE[e.target.value as keyof typeof FEEDBACK_STRUCTURE]?.title || ''
                          })}
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                        >
                          {Object.entries(FEEDBACK_STRUCTURE).map(([key, data]) => (
                            <option key={key} value={key}>{key} - {data.title}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Position Number</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.questionNumber}
                          onChange={(e) => setFormData({...formData, questionNumber: parseInt(e.target.value) || 1})}
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Weightage</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.maxScore}
                          onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value) || 5})}
                          className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                        />
                      </div>
                    </div>
                    
                    <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.required}
                        onChange={(e) => setFormData({...formData, required: e.target.checked})}
                        className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20"
                      />
                      <span className="text-sm font-bold text-slate-700">Mandatory Response (Student must answer to submit)</span>
                    </label>
                    {formData.type === 'multiple_choice' && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Choice Options</label>
                        <div className="grid grid-cols-1 gap-3">
                          {(formData.options || []).map((option, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addOption}
                            className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-2"
                          >
                            + Append New Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-10 flex justify-end gap-3 border-t border-slate-50 pt-8">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-8 py-3.5 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50 transition-all"
                    >
                      {loading ? 'Processing...' : editingQuestion ? 'Update Question' : 'Save Question'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsPreviewOpen(false)}></div>
              
              <div className="relative bg-white rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-slate-100 animate-scale-up">
                <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Evaluation Live Preview</h3>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Real-time student experience simulation</p>
                  </div>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-12 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  {questions.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">No Content to Preview</h3>
                      <p className="text-slate-400 text-sm">Add questions to the builder to see them rendered here.</p>
                    </div>
                  ) : (
                  <div className="space-y-8">
                    {/* Form Header */}
                    <div className="text-center border-b border-gray-200 pb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Teacher Evaluation Form
                      </h2>
                      <p className="text-gray-600">
                        Please rate your teacher on the following criteria
                      </p>
                    </div>

                    {/* Preview Sections */}
                    {Object.entries(parseQuestionsForPreview()).map(([sectionKey, sectionData]) => (
                      <div key={sectionKey} className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Section {sectionKey}: {sectionData.title}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {sectionData.questions.map((question, questionIndex) => {
                            const responseKey = `${sectionKey}-${questionIndex}`;
                            const currentRating = previewResponses[responseKey] || 0;
                            
                            return (
                              <div key={questionIndex} className="bg-gray-50 rounded-lg p-4">
                                <div className="mb-3">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    {questionIndex + 1}. {question}
                                  </h4>
                                </div>

                                {/* Rating Scale */}
                                <div className="flex justify-center space-x-2">
                                  {[5, 4, 3, 2, 1].map((rating) => (
                                    <button
                                      key={rating}
                                      type="button"
                                      onClick={() => handlePreviewResponse(sectionKey, questionIndex, rating)}
                                      className={`w-12 h-12 rounded-full border-2 font-semibold text-sm transition-all duration-200 ${
                                        currentRating === rating
                                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                      }`}
                                    >
                                      {rating}
                                    </button>
                                  ))}
                                </div>
                                
                                <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                                  <span>Excellent (5)</span>
                                  <span>Poor (1)</span>
                                </div>

                                {currentRating > 0 && (
                                  <div className="mt-2 text-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      Rating: {currentRating}/5
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Preview Results */}
                    {Object.keys(previewResponses).length > 0 && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Live Preview Results
                        </h3>
                        
                        {(() => {
                          const scores = calculatePreviewScores();
                          const performance = getPerformanceGrade(scores.percentage);
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Overall Score */}
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Overall Performance</h4>
                                <div className="text-2xl font-bold text-blue-600">
                                  {scores.overallScore.toFixed(1)}/5.0
                                </div>
                                <div className="text-sm text-gray-600">
                                  {scores.percentage.toFixed(1)}% ({scores.answeredQuestions} questions answered)
                                </div>
                                <div className="mt-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${performance.color}`}>
                                    {performance.grade}
                                  </span>
                                </div>
                              </div>

                              {/* Section Scores */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Section Scores</h4>
                                {Object.entries(scores.sectionScores).map(([section, score]) => (
                                  <div key={section} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Section {section}</span>
                                    <span className="font-medium text-gray-900">
                                      {score.toFixed(1)}/5.0
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  This is a preview of how students will see the evaluation form
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => setPreviewResponses({})}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Responses
                  </button>
                  <button
                    onClick={() => {
                      setIsPreviewOpen(false);
                      setPreviewResponses({});
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}