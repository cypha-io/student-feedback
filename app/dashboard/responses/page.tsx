'use client';

import { useState, useEffect, useCallback } from 'react';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';
import DashboardLayout from '../../../components/DashboardLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import styles from './responses.module.css';

interface Feedback {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  classId: string;
  status: string;
  submittedAt: string;
  createdAt: string;
}

interface Response {
  id: string;
  feedbackId: string;
  questionId: string;
  answer: string;
  type: string;
}

interface ProcessedFeedbackResponse {
  id: string;
  teacherName: string;
  studentId: string;
  responses: Record<string, number>;
  overallScore: number;
  sectionScores: Record<string, number>;
  performanceGrade: string;
  submittedAt: string;
  createdAt: string;
}

export default function StudentResponsesPage() {
  const [responses, setResponses] = useState<ProcessedFeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'teacher'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<ProcessedFeedbackResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Debug info for development
  const [debugInfo, setDebugInfo] = useState<{
    totalFeedbacks: number;
    totalResponses: number;
    environmentOk: boolean;
    lastFetch: string | null;
  }>({
    totalFeedbacks: 0,
    totalResponses: 0,
    environmentOk: false,
    lastFetch: null
  });

  useEffect(() => {
    const loadResponses = async () => {
      await fetchResponses();
    };
    loadResponses();
  }, []);

  const calculatePerformanceGrade = (score: number): string => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    return 'Poor';
  };

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching feedbacks from database...');
      
      // Fetch feedbacks using new Neon database
      const feedbacksResult = await dbHelpers.getAll(COLLECTIONS.FEEDBACKS);
      
      console.log('📊 Feedbacks fetched:', feedbacksResult.documents.length);
      
      if (feedbacksResult.documents.length === 0) {
        console.log('⚠️ No feedbacks found in database');
        setResponses([]);
        return;
      }

      // Fetch all responses
      const responsesResult = await dbHelpers.getAll(COLLECTIONS.RESPONSES);
      
      console.log('📝 Responses fetched:', responsesResult.documents.length);

      // Update debug info
      setDebugInfo({
        totalFeedbacks: feedbacksResult.documents.length,
        totalResponses: responsesResult.documents.length,
        environmentOk: !!(process.env.DATABASE_URL),
        lastFetch: new Date().toISOString()
      });

      // Process the data
      const processedResponses: ProcessedFeedbackResponse[] = [];
      
      for (const feedback of feedbacksResult.documents as unknown as Feedback[]) {
        // Get responses for this feedback
        const feedbackResponses = responsesResult.documents.filter(
          (response: unknown) => (response as Response).feedbackId === feedback.id
        ) as unknown as Response[];
        
        // Calculate scores
        const responseScores: Record<string, number> = {};
        const sectionScores: Record<string, number> = {};
        
        for (const response of feedbackResponses) {
          const score = parseInt(response.answer);
          if (!isNaN(score)) {
            responseScores[response.questionId] = score;
            
            // Extract section from questionId (e.g., "A-0" -> "A")
            const section = response.questionId.split('-')[0];
            if (!sectionScores[section]) {
              sectionScores[section] = 0;
            }
            sectionScores[section] += score;
          }
        }
        
        // Calculate section averages
        const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const sectionsPerQuestionCount: Record<string, number> = {
          'A': 3, 'B': 3, 'C': 3, 'D': 3, 'E': 2, 'F': 2, 'G': 2, 'H': 2
        };
        
        for (const section of sections) {
          if (sectionScores[section]) {
            sectionScores[section] = sectionScores[section] / sectionsPerQuestionCount[section];
          }
        }
        
        // Calculate overall score
        const allScores = Object.values(responseScores);
        const overallScore = allScores.length > 0 
          ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
          : 0;
        
        processedResponses.push({
          id: feedback.id,
          teacherName: feedback.teacherName,
          studentId: feedback.studentId,
          responses: responseScores,
          overallScore,
          sectionScores,
          performanceGrade: calculatePerformanceGrade(overallScore),
          submittedAt: feedback.submittedAt,
          createdAt: feedback.createdAt
        });
      }
      
      setResponses(processedResponses);
      console.log('✅ Processed responses:', processedResponses.length);
      
    } catch (error) {
      console.error('❌ Error fetching responses:', error);
      setError(`Failed to load responses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const filteredAndSortedResponses = responses
    .filter(response => {
      const matchesSearch = !searchTerm || 
        response.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeacher = !filterTeacher || response.teacherName === filterTeacher;
      return matchesSearch && matchesTeacher;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'score':
          comparison = a.overallScore - b.overallScore;
          break;
        case 'teacher':
          comparison = a.teacherName.localeCompare(b.teacherName);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const uniqueTeachers = Array.from(new Set(responses.map(r => r.teacherName))).sort();

  const getPerformanceColor = (grade: string) => {
    switch (grade) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Good': return 'text-blue-600 bg-blue-100';
      case 'Average': return 'text-yellow-600 bg-yellow-100';
      case 'Poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (response: ProcessedFeedbackResponse) => {
    setSelectedResponse(response);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedResponse(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading student responses...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Failed to load responses</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button 
                  onClick={fetchResponses}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Responses</h1>
              <p className="text-gray-600">View and analyze all student feedback submissions</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-700 font-semibold">{responses.length} Total Responses</span>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Show debug information"
                >
                  🐛 Debug
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Debug Panel (Development Only) */}
        {process.env.NODE_ENV === 'development' && showDebugInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">🐛 Debug Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-yellow-900 mb-2">Environment Variables:</h3>
                <ul className="space-y-1 text-yellow-800">
                  <li>Database URL: {process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}</li>
                  <li>Database Type: Neon PostgreSQL</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-yellow-900 mb-2">Database Status:</h3>
                <ul className="space-y-1 text-yellow-800">
                  <li>Total Feedbacks in DB: {debugInfo.totalFeedbacks}</li>
                  <li>Total Responses in DB: {debugInfo.totalResponses}</li>
                  <li>Environment OK: {debugInfo.environmentOk ? '✅ Yes' : '❌ No'}</li>
                  <li>Last Fetch: {debugInfo.lastFetch ? new Date(debugInfo.lastFetch).toLocaleTimeString() : 'Never'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by teacher or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Teacher Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Teacher</label>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by teacher"
              >
                <option value="">All Teachers</option>
                {uniqueTeachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'teacher')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Sort by field"
              >
                <option value="date">Date</option>
                <option value="score">Score</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Sort order"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Responses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredAndSortedResponses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback responses found</h3>
              <p className="text-gray-600 mb-4">
                {responses.length === 0 
                  ? "No student feedback has been submitted yet. Students need to submit feedback through the feedback form first."
                  : "No responses match your current filters."
                }
              </p>
              {responses.length === 0 && (
                <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-blue-900 mb-2">To see feedback responses:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Students must visit the feedback form</li>
                    <li>2. Complete and submit their evaluations</li>
                    <li>3. Responses will then appear here automatically</li>
                  </ol>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> In production, ensure environment variables are properly configured and database collections have the correct permissions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedResponses.map((response) => (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{response.teacherName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">{response.studentId || 'Anonymous'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {response.overallScore.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-500 ml-1">/5.0</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(response.performanceGrade)}`}>
                            {response.performanceGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(response.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleViewDetails(response)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredAndSortedResponses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredAndSortedResponses.length}
                </div>
                <div className="text-sm text-gray-600">Total Responses</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(filteredAndSortedResponses.reduce((sum, r) => sum + r.overallScore, 0) / filteredAndSortedResponses.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {uniqueTeachers.length}
                </div>
                <div className="text-sm text-gray-600">Teachers Evaluated</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredAndSortedResponses.filter(r => r.performanceGrade === 'Excellent').length}
                </div>
                <div className="text-sm text-gray-600">Excellent Ratings</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
                  <p className="text-gray-600 mt-1">
                    Submitted on {formatDate(selectedResponse.createdAt)}
                  </p>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Teacher:</span>
                      <span className="ml-2 text-gray-900">{selectedResponse.teacherName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Student ID:</span>
                      <span className="ml-2 text-gray-900">{selectedResponse.studentId || 'Anonymous'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Overall Score:</span>
                      <span className="ml-2 text-gray-900 font-semibold">{selectedResponse.overallScore.toFixed(1)}/5.0</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Performance Grade:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(selectedResponse.performanceGrade)}`}>
                        {selectedResponse.performanceGrade}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Scores */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Section Scores</h3>
                  <div className="space-y-2">
                    {selectedResponse.sectionScores && Object.entries(selectedResponse.sectionScores).map(([section, score]) => (
                      <div key={section} className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Section {section}:</span>
                        <span className="text-gray-900 font-semibold">{score.toFixed(1)}/5.0</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Responses */}
              {selectedResponse.responses && Object.keys(selectedResponse.responses).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Individual Question Responses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedResponse.responses).map(([question, rating]) => (
                      <div key={question} className="bg-white rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{question}</span>
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-blue-600">{rating}</span>
                            <span className="text-sm text-gray-500 ml-1">/5</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className={styles.progressBar}>
                            <div 
                              className={`${styles.progressFill} ${
                                rating === 1 ? styles.progressFill20 :
                                rating === 2 ? styles.progressFill40 :
                                rating === 3 ? styles.progressFill60 :
                                rating === 4 ? styles.progressFill80 :
                                styles.progressFill100
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
    </ProtectedRoute>
  );
}
