'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Question {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'multiple_choice';
  options?: string[];
  required: boolean;
  category: string;
}

export default function QuestionsForm() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: 'How would you rate the teacher\'s communication skills?',
      type: 'rating',
      required: true,
      category: 'Communication',
    },
    {
      id: '2',
      question: 'Does the teacher explain concepts clearly?',
      type: 'multiple_choice',
      options: ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'],
      required: true,
      category: 'Teaching Quality',
    },
    {
      id: '3',
      question: 'What improvements would you suggest for this teacher?',
      type: 'text',
      required: false,
      category: 'Suggestions',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    question: '',
    type: 'rating',
    options: [],
    required: false,
    category: '',
  });

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
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

  const resetForm = () => {
    setFormData({
      question: '',
      type: 'rating',
      options: [],
      required: false,
      category: '',
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
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(question => question.id !== id));
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

  return (
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            Add New Question
          </button>
        </div>

        {/* Questions Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Feedback Form Preview ({questions.length} questions)
              </h2>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                Preview Form
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {questions.length === 0 ? (
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
                        {index + 1}. {question.question}
                      </h4>
                      
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
                        onClick={() => handleDelete(question.id)}
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
      </div>
    </DashboardLayout>
  );
}