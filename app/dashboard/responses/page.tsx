'use client';

import { useState, useEffect, useCallback } from 'react';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';
import DashboardLayout from '../../../components/DashboardLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';

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
  appraisalAssignmentId?: string;
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
  raterType: string;
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
  const [raterTypeFilter, setRaterTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'teacher'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<ProcessedFeedbackResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [editedResponses, setEditedResponses] = useState<Record<string, number>>({});
  const [savingReview, setSavingReview] = useState(false);



  // Lock background scroll when modal is open
  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetailsModal]);

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
      
      console.log('Fetching feedbacks from database...');
      
      // Fetch feedbacks using new Neon database
      const feedbacksResult = await dbHelpers.getAll(COLLECTIONS.FEEDBACKS);
      
      console.log('Feedbacks fetched:', feedbacksResult.documents.length);
      
      if (feedbacksResult.documents.length === 0) {
        console.log('No feedbacks found in database');
        setResponses([]);
        return;
      }

      // Fetch all responses
      const responsesResult = await dbHelpers.getAll(COLLECTIONS.RESPONSES);
      const assignmentsResult = await dbHelpers.getAll(COLLECTIONS.APPRAISAL_ASSIGNMENTS);
      const allAssignments = assignmentsResult.documents as any[];
      
      console.log('Responses fetched:', responsesResult.documents.length);

      // Process the data
      // Process the data
      const processedResponses: ProcessedFeedbackResponse[] = [];
      
      for (const feedback of feedbacksResult.documents as unknown as Feedback[]) {
        // Get the assignment to check rater type
        const assignment = feedback.appraisalAssignmentId ? 
          allAssignments.find(a => a.id === feedback.appraisalAssignmentId) : 
          null;
        
        const raterType = assignment?.appraiserType || 'student';
        
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
        
        // Calculate overall score
        const allScores = Object.values(responseScores);
        const overallScore = allScores.length > 0 
          ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
          : 0;
        
        processedResponses.push({
          id: feedback.id,
          teacherName: feedback.teacherName,
          studentId: feedback.studentId || (assignment ? 'Staff Appraiser' : 'Anonymous Student'),
          raterType,
          responses: responseScores,
          overallScore,
          sectionScores,
          performanceGrade: calculatePerformanceGrade(overallScore),
          submittedAt: feedback.submittedAt,
          createdAt: feedback.createdAt
        });
      }
      
      setResponses(processedResponses);
      console.log('Processed responses:', processedResponses.length);
      
    } catch (error) {
      console.error('Error fetching responses:', error);
      setError(`Failed to load responses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teacherParam = params.get('teacher');
    if (teacherParam) {
      setFilterTeacher(teacherParam);
    }
    fetchResponses();
  }, [fetchResponses]);

  const filteredAndSortedResponses = responses
    .filter(response => {
      const matchesSearch = !searchTerm || 
        response.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeacher = !filterTeacher || response.teacherName === filterTeacher;
      const matchesRaterType = !raterTypeFilter || response.raterType === raterTypeFilter;
      return matchesSearch && matchesTeacher && matchesRaterType;
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
    setIsReviewMode(false);
    setEditedResponses({});
  };

  const handleToggleReviewMode = () => {
    if (!isReviewMode && selectedResponse) {
      setEditedResponses(selectedResponse.responses);
    }
    setIsReviewMode(!isReviewMode);
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    setEditedResponses(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  const handleSaveReview = async () => {
    if (!selectedResponse) return;
    
    try {
      setSavingReview(true);
      
      // Get the actual response documents for this feedback to get their IDs
      const responsesResult = await dbHelpers.getAll(COLLECTIONS.RESPONSES);
      const feedbackResponses = responsesResult.documents.filter(
        (r: any) => r.feedbackId === selectedResponse.id
      );

      // Update each response
      for (const [questionId, rating] of Object.entries(editedResponses)) {
        const responseDoc = feedbackResponses.find((r: any) => r.questionId === questionId);
        if (responseDoc) {
          await fetch('/api/responses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: responseDoc.id, answer: rating })
          });
        }
      }

      alert('Appraisal reviewed and updated successfully!');
      setIsReviewMode(false);
      fetchResponses();
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to save review changes.');
    } finally {
      setSavingReview(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading appraisal responses...</p>
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
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Appraisal Intelligence
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Analyze multi-rater submissions and performance metrics across all roles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-blue-50 border border-blue-100 rounded-2xl">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{responses.length} Submissions</span>
            </div>
          </div>
        </div>

        {/* Intelligence Metrics */}
        {filteredAndSortedResponses.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Total Volume', value: filteredAndSortedResponses.length, color: 'blue', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { label: 'Aggregate GPA', value: (filteredAndSortedResponses.reduce((sum, r) => sum + r.overallScore, 0) / filteredAndSortedResponses.length).toFixed(2), color: 'emerald', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
              { label: 'Staff Coverage', value: uniqueTeachers.length, color: 'indigo', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              { label: 'Elite Ratings', value: filteredAndSortedResponses.filter(r => r.performanceGrade === 'Excellent').length, color: 'rose', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Discovery & Filters */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Feedbacks</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="ID or Teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
                <svg className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Filter</label>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Personnel</option>
                {uniqueTeachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Rater Group</label>
              <select
                value={raterTypeFilter}
                onChange={(e) => setRaterTypeFilter(e.target.value)}
                className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Raters</option>
                <option value="student">Students</option>
                <option value="hod">HODs</option>
                <option value="supervisor">Supervisors</option>
                <option value="peer">Peers</option>
                <option value="staff">Other Staff</option>
                <option value="assistant_head">Asst. Heads</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Order By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'teacher')}
                className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="date">Submission Date</option>
                <option value="score">Performance Score</option>
                <option value="teacher">Alphabetical (Staff)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Direction</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Appraisee</th>
                  <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Appraiser</th>
                  <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Rater Group</th>
                  <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                  <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                  <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAndSortedResponses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">No Records Found</h3>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto">Either no evaluations have been submitted yet, or your filter parameters are too restrictive.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedResponses.map((response) => (
                    <tr key={response.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-lg shadow-slate-200">
                            {response.teacherName.charAt(0)}
                          </div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{response.teacherName}</div>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-xs font-bold text-slate-600">
                        {response.studentId}
                      </td>
                      <td className="py-6 px-8">
                        <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg border inline-block uppercase tracking-widest ${
                          response.raterType === 'student' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                          response.raterType === 'hod' ? 'text-purple-600 bg-purple-50 border-purple-100' :
                          'text-indigo-600 bg-indigo-50 border-indigo-100'
                        }`}>
                          {response.raterType}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-center">
                        <div className="text-sm font-black text-slate-900">
                          {response.overallScore.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          response.performanceGrade === 'Excellent' ? 'bg-emerald-50 text-emerald-600' :
                          response.performanceGrade === 'Good' ? 'bg-blue-50 text-blue-600' :
                          response.performanceGrade === 'Average' ? 'bg-amber-50 text-amber-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {response.performanceGrade}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <button 
                          onClick={() => handleViewDetails(response)}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-200 hover:shadow-blue-100"
                        >
                          Review Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Intelligence Detail Modal */}
      {showDetailsModal && selectedResponse && (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={closeDetailsModal}></div>
            
            <div className="relative bg-[#F8FAFC] rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-white/20 animate-scale-up">
              {/* Modal Header */}
              <div className="px-10 py-10 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center font-black text-xl shadow-xl shadow-slate-200">
                    {selectedResponse.teacherName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personnel Intelligence Report</h3>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">Appraiser Group: {selectedResponse.raterType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleToggleReviewMode}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isReviewMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isReviewMode ? 'Exit Review' : 'Edit Ratings'}
                  </button>
                  <button onClick={closeDetailsModal} className="w-12 h-12 bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white rounded-2xl transition-all flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-10 space-y-10">
                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Overall Proficiency</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">{selectedResponse.overallScore.toFixed(1)}</span>
                      <span className="text-xl font-black text-slate-300 mb-1">/ 5.0</span>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Performance Grade</p>
                    <span className={`inline-flex px-4 py-2 text-sm font-black rounded-xl uppercase tracking-widest self-start ${getPerformanceColor(selectedResponse.performanceGrade)}`}>
                      {selectedResponse.performanceGrade}
                    </span>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Date</p>
                    <p className="text-sm font-bold text-slate-900">{formatDate(selectedResponse.createdAt)}</p>
                  </div>
                </div>

                {/* Section Intelligence */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sectional Performance Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(selectedResponse.sectionScores).map(([section, score]) => (
                      <div key={section} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <span className="w-8 h-8 bg-slate-900 text-white rounded-xl text-[10px] font-black flex items-center justify-center shadow-lg">
                              {section}
                            </span>
                            <span className="text-lg font-black text-slate-900">{score.toFixed(1)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-1000"
                              style={{ width: `${(score / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Feedbacks */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Individual Parameter Breakdown</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(selectedResponse.responses).map(([question, rating]) => (
                      <div key={question} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-100 transition-all flex items-center justify-between gap-10">
                        <p className="text-sm font-bold text-slate-700 flex-1">{question}</p>
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                disabled={!isReviewMode}
                                onClick={() => handleRatingChange(question, star)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                  star <= (isReviewMode ? editedResponses[question] : rating) 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-300'
                                } ${isReviewMode ? 'hover:scale-110' : 'cursor-default'}`}
                              >
                                {star}
                              </button>
                            ))}
                          </div>
                          <div className="w-12 text-right">
                            <span className="text-xl font-black text-slate-900">
                              {isReviewMode ? editedResponses[question] : rating}
                            </span>
                            <span className="text-[10px] font-black text-slate-300 ml-1">/5</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-10 py-8 bg-white border-t border-slate-100 flex justify-end gap-4">
                {isReviewMode ? (
                  <button
                    onClick={handleSaveReview}
                    disabled={savingReview}
                    className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                  >
                    {savingReview ? 'Saving Changes...' : 'Save Review Changes'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3 border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Export PDF
                    </button>
                    <button
                      onClick={closeDetailsModal}
                      className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
                    >
                      Dismiss Report
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
    </ProtectedRoute>
  );
}
