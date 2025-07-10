'use client';

import { useState, useEffect } from 'react';
import { Client, Databases, Query } from 'appwrite';
import DashboardLayout from '../../../components/DashboardLayout';
import styles from './responses.module.css';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

interface FeedbackResponse {
  $id: string;
  teacherName: string;
  studentName?: string;
  responses: Record<string, number>;
  overallScore: number;
  sectionScores: Record<string, number>;
  performanceGrade: string;
  submittedAt: string;
  $createdAt: string;
  [key: string]: unknown; // Allow additional properties from Appwrite
}

export default function StudentResponsesPage() {
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'teacher'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<FeedbackResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const result = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_FEEDBACK_COLLECTION_ID!,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      setResponses(result.documents as unknown as FeedbackResponse[]);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedResponses = responses
    .filter(response => {
      const matchesSearch = !searchTerm || 
        response.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeacher = !filterTeacher || response.teacherName === filterTeacher;
      return matchesSearch && matchesTeacher;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime();
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

  const handleViewDetails = (response: FeedbackResponse) => {
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Responses</h1>
              <p className="text-gray-600">View and analyze all student feedback submissions</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-semibold">{responses.length} Total Responses</span>
            </div>
          </div>
        </div>

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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses found</h3>
              <p className="text-gray-600">No feedback responses match your current filters.</p>
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
                      <tr key={response.$id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{response.teacherName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">{response.studentName || 'Anonymous'}</div>
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
                          {formatDate(response.$createdAt)}
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
                    Submitted on {formatDate(selectedResponse.$createdAt)}
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
                      <span className="text-sm font-medium text-gray-600">Student:</span>
                      <span className="ml-2 text-gray-900">{selectedResponse.studentName || 'Anonymous'}</span>
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
  );
}
