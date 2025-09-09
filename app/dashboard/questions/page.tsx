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

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching questions from database...');
      const response = await dbHelpers.getAll(COLLECTIONS.QUESTIONS);
      console.log('✅ Successfully fetched questions:', response);
      setQuestions(response.documents as unknown as Question[]);
    } catch (error) {
      console.error('❌ Error fetching questions:', error);
      console.log('📝 Using empty array as fallback');
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
      console.log('🚀 Attempting to save question to database...');
      
      if (editingQuestion) {
        // Update existing question
        console.log('📝 Updating question with ID:', editingQuestion.id);
        await dbHelpers.update(COLLECTIONS.QUESTIONS, editingQuestion.id!, formData);
        setQuestions(questions.map(question => 
          question.id === editingQuestion.id 
            ? { ...formData, id: editingQuestion.id }
            : question
        ));
      } else {
        // Add new question
        console.log('➕ Creating new question...');
        const newQuestion = await dbHelpers.create(COLLECTIONS.QUESTIONS, formData);
        console.log('✅ Successfully created question:', newQuestion);
        setQuestions([...questions, newQuestion as unknown as Question]);
      }
      
      resetForm();
      alert('Question saved successfully!');
    } catch (error) {
      console.error('❌ Error saving question:', error);
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
      console.log('🗑️ Deleting question with ID:', id);
      await dbHelpers.delete(COLLECTIONS.QUESTIONS, id);
      setQuestions(questions.filter(question => question.id !== id));
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting question:', error);
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
        return '⭐';
      case 'text':
        return '📝';
      case 'multiple_choice':
        return '☑️';
      default:
        return '❓';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Questions Form
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage feedback questions for student evaluations
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={populateStandardQuestions}
              disabled={isPopulating}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isPopulating ? 'Populating...' : 'Load Standard Questions'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              Add New Question
            </button>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Feedback Form Preview ({questions.length} questions)
              </h2>
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Preview Form
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  Loading questions...
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No questions added yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start by adding your first feedback question
                </p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getQuestionIcon(question.type)}</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {question.category}
                        </span>
                        {question.required && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {question.section && question.questionNumber ? 
                          `${question.section}.${question.questionNumber - Object.keys(FEEDBACK_STRUCTURE).slice(0, Object.keys(FEEDBACK_STRUCTURE).indexOf(question.section)).reduce((total, key) => total + FEEDBACK_STRUCTURE[key as keyof typeof FEEDBACK_STRUCTURE].questions.length, 0)} ${question.question}` :
                          `${index + 1}. ${question.question}`
                        }
                      </h4>
                      
                      {question.section && question.sectionTitle && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Section {question.section}: {question.sectionTitle}
                          </span>
                        </div>
                      )}
                      
                      {question.type === 'rating' && (
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-gray-300 text-lg">⭐</span>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                disabled
                                className="text-blue-600"
                                aria-label={`Option: ${option}`}
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'text' && (
                        <textarea
                          disabled
                          placeholder="Student response will appear here..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm"
                          rows={3}
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveQuestion(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveQuestion(index, 'down')}
                          disabled={index === questions.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                        title="Edit question"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(question.id!)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                        title="Delete question"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Text
                  </label>
                  <textarea
                    required
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    placeholder="Enter your question here..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as Question['type']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      aria-label="Question Type"
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      aria-label="Category"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Section Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Section
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({
                        ...formData, 
                        section: e.target.value,
                        sectionTitle: FEEDBACK_STRUCTURE[e.target.value as keyof typeof FEEDBACK_STRUCTURE]?.title || ''
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      aria-label="Question Section"
                    >
                      {Object.entries(FEEDBACK_STRUCTURE).map(([key, data]) => (
                        <option key={key} value={key}>
                          {key} - {data.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.questionNumber}
                      onChange={(e) => setFormData({...formData, questionNumber: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Question number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Score
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value) || 5})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Maximum score"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={formData.required}
                    onChange={(e) => setFormData({...formData, required: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="required" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Make this question required
                  </label>
                </div>
                
                {formData.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {(formData.options || []).map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700"
                  >
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Populate Standard Questions */}
        <div className="flex justify-end">
          <button
            onClick={populateStandardQuestions}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            disabled={isPopulating}
          >
            {isPopulating ? 'Populating...' : 'Populate Standard Questions'}
          </button>
        </div>

        {/* Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Student Feedback Form Preview</h3>
                    <p className="text-blue-100 text-sm">Interactive preview of the evaluation form</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsPreviewOpen(false);
                      setPreviewResponses({});
                    }}
                    className="text-white hover:text-blue-200 transition-colors"
                    title="Close preview"
                    aria-label="Close preview"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Questions to Preview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add some questions first to see the preview
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Form Header */}
                    <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Teacher Evaluation Form
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Please rate your teacher on the following criteria
                      </p>
                    </div>

                    {/* Preview Sections */}
                    {Object.entries(parseQuestionsForPreview()).map(([sectionKey, sectionData]) => (
                      <div key={sectionKey} className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Section {sectionKey}: {sectionData.title}
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {sectionData.questions.map((question, questionIndex) => {
                            const responseKey = `${sectionKey}-${questionIndex}`;
                            const currentRating = previewResponses[responseKey] || 0;
                            
                            return (
                              <div key={questionIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <div className="mb-3">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
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
                                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                      }`}
                                    >
                                      {rating}
                                    </button>
                                  ))}
                                </div>
                                
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-2">
                                  <span>Excellent (5)</span>
                                  <span>Poor (1)</span>
                                </div>

                                {currentRating > 0 && (
                                  <div className="mt-2 text-center">
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
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
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Live Preview Results
                        </h3>
                        
                        {(() => {
                          const scores = calculatePreviewScores();
                          const performance = getPerformanceGrade(scores.percentage);
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Overall Score */}
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Overall Performance</h4>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {scores.overallScore.toFixed(1)}/5.0
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
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
                                <h4 className="font-medium text-gray-900 dark:text-white">Section Scores</h4>
                                {Object.entries(scores.sectionScores).map(([section, score]) => (
                                  <div key={section} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Section {section}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
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
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This is a preview of how students will see the evaluation form
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => setPreviewResponses({})}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
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
        )}
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}