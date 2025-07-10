'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { dbHelpers, COLLECTIONS } from '@/lib/appwrite';
import { Feedback, Response, Teacher } from '@/types/database';

// Section structure matching the feedback form
const EVALUATION_SECTIONS = {
  A: 'Encourages Student-Teacher Relationship',
  B: 'Encourages Cooperation & Team Work Among Students', 
  C: 'Encourages Active Learning',
  D: 'Mastery Over Teaching Field/Subject',
  E: 'Gives Prompt Feedback and Rewards Students Appropriately',
  F: 'Emphasizes Time on Task',
  G: 'Communicates High Expectations',
  H: 'Class Control'
};

const PERFORMANCE_RATINGS = [
  { min: 85, max: 100, label: 'Excellent', color: 'bg-green-100 text-green-800', bgClass: 'bg-green-50' },
  { min: 75, max: 84, label: 'Very Good', color: 'bg-blue-100 text-blue-800', bgClass: 'bg-blue-50' },
  { min: 70, max: 74, label: 'Good', color: 'bg-indigo-100 text-indigo-800', bgClass: 'bg-indigo-50' },
  { min: 60, max: 69, label: 'Average', color: 'bg-yellow-100 text-yellow-800', bgClass: 'bg-yellow-50' },
  { min: 50, max: 59, label: 'Weak', color: 'bg-orange-100 text-orange-800', bgClass: 'bg-orange-50' },
  { min: 40, max: 49, label: 'Poor', color: 'bg-red-100 text-red-800', bgClass: 'bg-red-50' },
  { min: 0, max: 39, label: 'Very Poor', color: 'bg-red-200 text-red-900', bgClass: 'bg-red-100' }
];

interface SectionScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  count: number;
}

interface TeacherReport {
  teacher: Teacher;
  totalFeedbacks: number;
  overallPercentage: number;
  overallRating: string;
  sectionScores: Record<string, SectionScore>;
  recentFeedbacks: Feedback[];
}

export default function TeacherEvaluationReports() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [teacherReports, setTeacherReports] = useState<TeacherReport[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [teachersRes, feedbacksRes, responsesRes] = await Promise.all([
          dbHelpers.getAll(COLLECTIONS.TEACHERS),
          dbHelpers.getAll(COLLECTIONS.FEEDBACKS),
          dbHelpers.getAll(COLLECTIONS.RESPONSES)
        ]);

        const teachersData = teachersRes.documents as unknown as Teacher[];
        const feedbacksData = feedbacksRes.documents as unknown as Feedback[];
        const responsesData = responsesRes.documents as unknown as Response[];

        setTeachers(teachersData);
        setFeedbacks(feedbacksData);
        setResponses(responsesData);

        // Calculate reports for each teacher
        const reports = calculateTeacherReports(teachersData, feedbacksData, responsesData);
        setTeacherReports(reports);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTeacherReports = (teachers: Teacher[], feedbacks: Feedback[], responses: Response[]): TeacherReport[] => {
    return teachers.map(teacher => {
      const teacherFeedbacks = feedbacks.filter(f => f.teacherId === teacher.$id);
      const teacherResponses = responses.filter(r => 
        teacherFeedbacks.some(f => f.$id === r.feedbackId)
      );

      // Calculate section scores
      const sectionScores: Record<string, SectionScore> = {};
      
      Object.keys(EVALUATION_SECTIONS).forEach(section => {
        const sectionResponses = teacherResponses.filter(r => 
          r.questionId && r.questionId.startsWith(section) && r.type === 'rating'
        );
        
        if (sectionResponses.length > 0) {
          const totalScore = sectionResponses.reduce((sum, r) => {
            const score = typeof r.answer === 'string' ? parseInt(r.answer) : r.answer;
            return sum + (score || 0);
          }, 0);
          const maxScore = sectionResponses.length * 5; // Assuming 5 is max rating
          const percentage = (totalScore / maxScore) * 100;
          
          sectionScores[section] = {
            totalScore,
            maxScore,
            percentage,
            count: sectionResponses.length
          };
        }
      });

      // Calculate overall percentage
      const allSectionPercentages = Object.values(sectionScores).map((s: SectionScore) => s.percentage);
      const overallPercentage = allSectionPercentages.length > 0 
        ? allSectionPercentages.reduce((sum, p) => sum + p, 0) / allSectionPercentages.length 
        : 0;

      // Get performance rating
      const rating = PERFORMANCE_RATINGS.find(r => 
        overallPercentage >= r.min && overallPercentage <= r.max
      ) || PERFORMANCE_RATINGS[PERFORMANCE_RATINGS.length - 1];

      return {
        teacher,
        totalFeedbacks: teacherFeedbacks.length,
        overallPercentage,
        overallRating: rating.label,
        sectionScores,
        recentFeedbacks: teacherFeedbacks.slice(-5).reverse() // Last 5 feedbacks
      };
    });
  };

  const getPerformanceColor = (percentage: number) => {
    const rating = PERFORMANCE_RATINGS.find(r => 
      percentage >= r.min && percentage <= r.max
    ) || PERFORMANCE_RATINGS[PERFORMANCE_RATINGS.length - 1];
    return rating.color;
  };

  const getPerformanceBg = (percentage: number) => {
    const rating = PERFORMANCE_RATINGS.find(r => 
      percentage >= r.min && percentage <= r.max
    ) || PERFORMANCE_RATINGS[PERFORMANCE_RATINGS.length - 1];
    return rating.bgClass;
  };

  const filteredReports = selectedTeacher === 'all' 
    ? teacherReports 
    : teacherReports.filter(r => r.teacher.$id === selectedTeacher);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teacher evaluation reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teacher Evaluation Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive performance analytics based on student feedback
            </p>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Select teacher to view report"
            >
              <option value="all">All Teachers</option>
              {teachers.map(teacher => (
                <option key={teacher.$id} value={teacher.$id}>
                  {teacher.name} - {teacher.department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Teachers</h3>
            <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Feedbacks</h3>
            <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <p className="text-2xl font-bold text-gray-900">
              {teacherReports.length > 0 
                ? (teacherReports.reduce((sum, r) => sum + r.overallPercentage, 0) / teacherReports.length).toFixed(1)
                : '0'
              }%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Responses</h3>
            <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
          </div>
        </div>

        {/* Teacher Reports */}
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <div key={report.teacher.$id} className={`rounded-lg shadow-lg overflow-hidden ${getPerformanceBg(report.overallPercentage)}`}>
              {/* Teacher Header */}
              <div className="bg-white px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{report.teacher.name}</h2>
                    <p className="text-gray-600">{report.teacher.department} • {report.teacher.email}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(report.overallPercentage)}`}>
                      {report.overallRating}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {report.overallPercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">{report.totalFeedbacks} feedback(s)</p>
                  </div>
                </div>
              </div>

              {/* Section Breakdown */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(EVALUATION_SECTIONS).map(([section, title]) => {
                    const sectionData = report.sectionScores[section];
                    if (!sectionData) return null;

                    return (
                      <div key={section} className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-bold text-blue-600">{section}</span>
                          <span className="text-sm font-medium text-gray-600">
                            {sectionData.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{title}</h4>
                        <div className="text-xs text-gray-500">
                          Score: {sectionData.totalScore}/{sectionData.maxScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          Responses: {sectionData.count}
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(sectionData.percentage, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Performance Scale Reference */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Scale:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                    {PERFORMANCE_RATINGS.map((rating) => (
                      <div key={rating.label} className={`text-center p-2 rounded ${
                        report.overallRating === rating.label ? 'ring-2 ring-blue-500' : ''
                      }`}>
                        <div className={`inline-block px-2 py-1 rounded-full ${rating.color}`}>
                          {rating.label}
                        </div>
                        <div className="text-gray-600 mt-1">{rating.min}-{rating.max}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Available</h3>
              <p className="text-gray-600">
                {selectedTeacher === 'all' 
                  ? 'No teacher evaluation data found. Please ensure feedback has been submitted.'
                  : 'No evaluation data found for the selected teacher.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
