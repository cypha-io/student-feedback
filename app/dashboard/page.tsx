'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';
import { Teacher, Feedback, Response } from '@/types/database';

// Section performance data structure
const EVALUATION_SECTIONS = {
  A: 'Student-Teacher Relationship',
  B: 'Cooperation & Team Work', 
  C: 'Active Learning',
  D: 'Subject Mastery',
  E: 'Feedback & Rewards',
  F: 'Time Management',
  G: 'High Expectations',
  H: 'Class Control'
};

const PERFORMANCE_RATINGS = [
  { min: 85, max: 100, label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' },
  { min: 75, max: 84, label: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { min: 70, max: 74, label: 'Good', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { min: 60, max: 69, label: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { min: 50, max: 59, label: 'Weak', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { min: 40, max: 49, label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' },
  { min: 0, max: 39, label: 'Very Poor', color: 'text-red-800', bgColor: 'bg-red-200' }
];

interface DashboardStats {
  totalTeachers: number;
  totalEvaluations: number;
  totalResponses: number;
  averageScore: number;
  excellentTeachers: number;
  needsImprovement: number;
  sectionAverages: Record<string, number>;
  recentEvaluations: Array<{
    teacherName: string;
    department: string;
    score: number;
    rating: string;
    date: string;
  }>;
}

export default function EvaluationOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    totalEvaluations: 0,
    totalResponses: 0,
    averageScore: 0,
    excellentTeachers: 0,
    needsImprovement: 0,
    sectionAverages: {},
    recentEvaluations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [teachersRes, feedbacksRes, responsesRes] = await Promise.all([
        dbHelpers.getAll(COLLECTIONS.TEACHERS),
        dbHelpers.getAll(COLLECTIONS.FEEDBACKS),
        dbHelpers.getAll(COLLECTIONS.RESPONSES)
      ]);

      const teachers = teachersRes.documents as unknown as Teacher[];
      const feedbacks = feedbacksRes.documents as unknown as Feedback[];
      const responses = responsesRes.documents as unknown as Response[];

      // Calculate section averages
      const sectionAverages: Record<string, number> = {};
      Object.keys(EVALUATION_SECTIONS).forEach(section => {
        const sectionResponses = responses.filter(r => 
          r.questionId && r.questionId.startsWith(section) && r.type === 'rating'
        );
        
        if (sectionResponses.length > 0) {
          const totalScore = sectionResponses.reduce((sum, r) => {
            const score = typeof r.answer === 'string' ? parseInt(r.answer) : r.answer;
            return sum + (score || 0);
          }, 0);
          const maxPossible = sectionResponses.length * 5;
          sectionAverages[section] = (totalScore / maxPossible) * 100;
        } else {
          sectionAverages[section] = 0;
        }
      });

      // Calculate teacher performance ratings
      const teacherPerformance = teachers.map(teacher => {
        const teacherFeedbacks = feedbacks.filter(f => f.teacherId === teacher.$id);
        const teacherResponses = responses.filter(r => 
          teacherFeedbacks.some(f => f.$id === r.feedbackId)
        );

        if (teacherResponses.length === 0) return { teacher, score: 0, rating: 'No Data' };

        const totalScore = teacherResponses.reduce((sum, r) => {
          const score = typeof r.answer === 'string' ? parseInt(r.answer) : r.answer;
          return sum + (score || 0);
        }, 0);
        const maxPossible = teacherResponses.length * 5;
        const percentage = (totalScore / maxPossible) * 100;
        
        const rating = PERFORMANCE_RATINGS.find(r => 
          percentage >= r.min && percentage <= r.max
        ) || PERFORMANCE_RATINGS[PERFORMANCE_RATINGS.length - 1];

        return { teacher, score: percentage, rating: rating.label };
      });

      // Count excellent and needs improvement teachers
      const excellentTeachers = teacherPerformance.filter(tp => tp.score >= 85).length;
      const needsImprovement = teacherPerformance.filter(tp => tp.score < 60).length;

      // Get recent evaluations
      const recentEvaluations = feedbacks
        .sort((a, b) => new Date(b.$createdAt || '').getTime() - new Date(a.$createdAt || '').getTime())
        .slice(0, 5)
        .map(feedback => {
          const teacher = teachers.find(t => t.$id === feedback.teacherId);
          const teacherPerf = teacherPerformance.find(tp => tp.teacher.$id === feedback.teacherId);
          
          return {
            teacherName: teacher?.name || 'Unknown',
            department: teacher?.department || 'Unknown',
            score: teacherPerf?.score || 0,
            rating: teacherPerf?.rating || 'No Data',
            date: new Date(feedback.$createdAt || '').toLocaleDateString()
          };
        });

      // Calculate overall average
      const allScores = teacherPerformance.map(tp => tp.score).filter(score => score > 0);
      const averageScore = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;

      setStats({
        totalTeachers: teachers.length,
        totalEvaluations: feedbacks.length,
        totalResponses: responses.length,
        averageScore,
        excellentTeachers,
        needsImprovement,
        sectionAverages,
        recentEvaluations
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    const rating = PERFORMANCE_RATINGS.find(r => score >= r.min && score <= r.max);
    return rating?.color || 'text-gray-600';
  };

  const getPerformanceBg = (score: number) => {
    const rating = PERFORMANCE_RATINGS.find(r => score >= r.min && score <= r.max);
    return rating?.bgColor || 'bg-gray-100';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading evaluation overview...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teacher Evaluation Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive analytics for teacher performance evaluation system
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTeachers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvaluations}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
                <p className={`text-sm font-medium ${getPerformanceColor(stats.averageScore)}`}>
                  {PERFORMANCE_RATINGS.find(r => stats.averageScore >= r.min && stats.averageScore <= r.max)?.label || 'No Rating'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalResponses}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Performance Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-600">Excellent (85-100%)</span>
                <span className="text-sm font-bold text-gray-900">{stats.excellentTeachers} teachers</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-orange-600">Needs Improvement (&lt;60%)</span>
                <span className="text-sm font-bold text-gray-900">{stats.needsImprovement} teachers</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">Above Average (60-84%)</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.totalTeachers - stats.excellentTeachers - stats.needsImprovement} teachers
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Performance Averages</h3>
            <div className="space-y-3">
              {Object.entries(EVALUATION_SECTIONS).map(([section, title]) => (
                <div key={section} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded text-xs font-bold flex items-center justify-center">
                      {section}
                    </span>
                    <span className="text-sm text-gray-700">{title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {(stats.sectionAverages[section] || 0).toFixed(1)}%
                    </span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(stats.sectionAverages[section] || 0, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Teacher Evaluations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Teacher</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEvaluations.map((evaluation, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{evaluation.teacherName}</td>
                    <td className="py-3 px-4 text-gray-600">{evaluation.department}</td>
                    <td className="py-3 px-4 font-medium">{evaluation.score.toFixed(1)}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceBg(evaluation.score)} ${getPerformanceColor(evaluation.score)}`}>
                        {evaluation.rating}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{evaluation.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.recentEvaluations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No evaluations found. Start collecting teacher feedback to see data here.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
