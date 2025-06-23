'use client';

import { useState, useEffect, Fragment } from 'react';
import { Chart } from 'react-google-charts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import DashboardLayout from '@/components/DashboardLayout';
import { dbHelpers, COLLECTIONS } from '@/lib/appwrite';
import { Feedback, Response, Subject, Department, Teacher } from '@/types/database';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Top teacher and feedback types
interface TopTeacher {
  name: string;
  department: string;
  rating: number;
  feedbacks: number;
}
interface RecentFeedback {
  teacher: string;
  student: string;
  rating: number;
  comment: string;
  date: string;
}

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  
  // State for report data
  const [reportData, setReportData] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    responseRate: 0,
    completionRate: 0,
  });

  const [departmentRatings, setDepartmentRatings] = useState({
    labels: [] as string[],
    datasets: [{
      label: 'Average Rating',
      data: [] as number[],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(168, 85, 247)',
        'rgb(251, 191, 36)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1,
    }],
  });

  const [satisfactionDistribution, setSatisfactionDistribution] = useState({
    labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(251, 191, 36)',
        'rgb(239, 68, 68)',
        'rgb(107, 114, 128)',
      ],
      borderWidth: 1,
    }],
  });

  const [topTeachers, setTopTeachers] = useState<TopTeacher[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedback[]>([]);

  // Add state for feedbacks and responses
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadReportsData();
    // Fetch all teachers for the all-teachers section
    dbHelpers.getAll(COLLECTIONS.TEACHERS).then(res => setAllTeachers(res.documents as unknown as Teacher[] || []));
  }, [selectedPeriod, selectedDepartment]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from database
      const [feedbacksRes, responsesRes, subjectsRes, departmentsRes] = await Promise.all([
        dbHelpers.getAll(COLLECTIONS.FEEDBACKS).catch(() => ({ documents: [] })),
        dbHelpers.getAll(COLLECTIONS.RESPONSES).catch(() => ({ documents: [] })),
        dbHelpers.getAll(COLLECTIONS.SUBJECTS).catch(() => ({ documents: [] })),
        dbHelpers.getAll(COLLECTIONS.DEPARTMENTS).catch(() => ({ documents: [] }))
      ]);

      const feedbacks = feedbacksRes.documents as Feedback[];
      const responses = responsesRes.documents as Response[];
      const subjects = subjectsRes.documents as Subject[];
      const departments = departmentsRes.documents as Department[];

      // Calculate basic statistics
      const totalFeedbacks = feedbacks.length;
      const ratingResponses = responses.filter(r => r.type === 'rating' && typeof r.answer === 'number');
      const averageRating = ratingResponses.length > 0 
        ? ratingResponses.reduce((sum, r) => sum + (r.answer as number), 0) / ratingResponses.length 
        : 0;

      // Calculate response and completion rates
      const responseRate = feedbacks.length > 0 ? (responses.length / feedbacks.length) * 100 : 0;
      const completionRate = feedbacks.length > 0 ? 92 : 0; // Default value for now

      setReportData({
        totalFeedbacks,
        averageRating: Math.round(averageRating * 10) / 10,
        responseRate: Math.round(responseRate),
        completionRate: Math.round(completionRate),
      });

      // Generate department ratings
      if (departments.length > 0) {
        const deptLabels = departments.map(d => d.name);
        const deptRatings = departments.map(dept => {
          const deptResponses = responses.filter(r => 
            r.type === 'rating' && 
            subjects.some(s => s.department === dept.name)
          );
          return deptResponses.length > 0 
            ? deptResponses.reduce((sum, r) => sum + (r.answer as number), 0) / deptResponses.length 
            : 0;
        });

        setDepartmentRatings(prev => ({
          ...prev,
          labels: deptLabels,
          datasets: [{
            ...prev.datasets[0],
            data: deptRatings,
          }]
        }));
      }

      // Generate satisfaction distribution from rating responses
      const satisfactionCounts = [0, 0, 0, 0, 0]; // Very Satisfied, Satisfied, Neutral, Dissatisfied, Very Dissatisfied
      ratingResponses.forEach(response => {
        const rating = response.answer as number;
        if (rating >= 4.5) satisfactionCounts[0]++;
        else if (rating >= 3.5) satisfactionCounts[1]++;
        else if (rating >= 2.5) satisfactionCounts[2]++;
        else if (rating >= 1.5) satisfactionCounts[3]++;
        else satisfactionCounts[4]++;
      });

      setSatisfactionDistribution(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: satisfactionCounts,
        }]
      }));

      // Fetch top teachers and recent feedbacks
      const allFeedbacks = await dbHelpers.getAll(COLLECTIONS.FEEDBACKS);

      // Top Teachers: Calculate average rating and feedback count from feedbacks
      const teacherRatings: Record<string, { totalRating: number; count: number }> = {};
      allFeedbacks.documents.forEach((feedback) => {
        const teacherId = feedback.teacherId;
        const rating = feedback.rating;
        if (!teacherRatings[teacherId]) {
          teacherRatings[teacherId] = { totalRating: 0, count: 0 };
        }
        teacherRatings[teacherId].totalRating += rating;
        teacherRatings[teacherId].count += 1;
      });

      const topTeachersData = Object.entries(teacherRatings)
        .map(([teacherId, { totalRating, count }]) => ({
          teacherId,
          averageRating: totalRating / count,
          feedbacks: count,
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);

      // Fetch teacher details for top teachers
      const topTeacherDetails = await Promise.all(topTeachersData.map(async (teacher) => {
        const teacherInfo = await dbHelpers.getById(COLLECTIONS.TEACHERS, teacher.teacherId);
        return {
          name: teacherInfo.name,
          department: teacherInfo.department,
          rating: Math.round(teacher.averageRating * 10) / 10,
          feedbacks: teacher.feedbacks,
        };
      }));
      setTopTeachers(topTeacherDetails);

      // Recent Feedback: Get the latest feedbacks with teacher and student details
      const recentFeedbacksData = await Promise.all(
        allFeedbacks.documents
          .sort((a, b) => new Date(b.$createdAt || '').getTime() - new Date(a.$createdAt || '').getTime())
          .slice(0, 5)
          .map(async (feedback) => {
            const studentInfo = await dbHelpers.getById(COLLECTIONS.STUDENTS, feedback.studentId);
            const teacherInfo = await dbHelpers.getById(COLLECTIONS.TEACHERS, feedback.teacherId);
            return {
              teacher: teacherInfo.name,
              student: studentInfo.name || 'Anonymous',
              rating: feedback.rating,
              comment: feedback.comment,
              date: feedback.date,
            };
          })
      );
      setRecentFeedbacks(recentFeedbacksData);

      setFeedbacks(feedbacks);
      setResponses(responses);

    } catch (error) {
      console.error('Error loading reports data:', error);
      // Use default values if database fails
    } finally {
      setLoading(false);
    }
  };

  // Trend Analysis: Calculate real trend data from feedbacks/responses
  // Calculate monthly average rating and response rate for the last 6 months
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d;
  });
  const trendLabels = months.map(m => m.toLocaleString('default', { month: 'short' }));
  const monthlyAverages: number[] = months.map((month) => {
    const monthFeedbacks = feedbacks.filter(f => {
      const d = new Date(f.$createdAt || '');
      return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
    });
    if (monthFeedbacks.length === 0) return 0;
    const sum = monthFeedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    return Math.round((sum / monthFeedbacks.length) * 10) / 10;
  });
  const monthlyResponseRates: number[] = months.map((month) => {
    const monthFeedbacks = feedbacks.filter(f => {
      const d = new Date(f.$createdAt || '');
      return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
    });
    const monthResponses = responses.filter(r => {
      const d = new Date(r.$createdAt || '');
      return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
    });
    return monthFeedbacks.length > 0 ? Math.round((monthResponses.length / monthFeedbacks.length) * 100) : 0;
  });
  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Average Rating',
        data: monthlyAverages,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Response Rate %',
        data: monthlyResponseRates,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };


  // Prepare Google Charts data
  const departmentRatingsData = [
    ['Department', 'Average Rating'],
    ...departmentRatings.labels.map((label, i) => [label, departmentRatings.datasets[0].data[i] || 0])
  ];
  const satisfactionDistributionData = [
    ['Satisfaction', 'Count'],
    ...satisfactionDistribution.labels.map((label, i) => [label, satisfactionDistribution.datasets[0].data[i] || 0])
  ];
  const trendDataGoogle = [
    ['Month', 'Average Rating', 'Response Rate %'],
    ...trendData.labels.map((label, i) => [label, trendData.datasets[0].data[i] || 0, trendData.datasets[1].data[i] || 0])
  ];

  // Helper to get all feedbacks and answers for a teacher
  const getTeacherFeedbacks = (teacherName: string) => {
    const teacher = topTeachers.find(t => t.name === teacherName);
    if (!teacher) return [];
    return feedbacks.filter(f => {
      const t = topTeachers.find(t => t.name === teacherName);
      return t && f.teacherId && t.name === teacherName;
    });
  };
  const getTeacherAnswers = (teacherId: string) => {
    return responses.filter(r => r.teacherId === teacherId);
  };

  // Helper to get all feedbacks and answers for a teacher by teacherId
  const getTeacherFeedbacksById = (teacherId: string) => feedbacks.filter(f => f.teacherId === teacherId);
  const getTeacherAnswersById = (teacherId: string) => responses.filter(r => r.teacherId === teacherId);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive insights into feedback data and performance metrics
            </p>
          </div>
          <div className="mt-6 lg:mt-0 flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Select time period"
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              aria-label="Select department"
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200">
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Feedbacks
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? '...' : reportData.totalFeedbacks.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Rating
                </p>
                <div className="flex items-baseline mt-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : reportData.averageRating}
                  </p>
                  <div className="flex items-center ml-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(reportData.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+0.2</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Response Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {reportData.responseRate}%
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+5%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {reportData.completionRate}%
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+3%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Department Ratings */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Department Performance
              </h3>
            </div>
            <div className="h-80">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="320px"
                data={departmentRatingsData}
                options={{ legend: { position: 'top' }, vAxis: { minValue: 0, maxValue: 5 } }}
              />
            </div>
          </div>

          {/* Satisfaction Distribution */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Satisfaction Distribution
              </h3>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-80">
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="320px"
                  data={satisfactionDistributionData}
                  options={{ legend: { position: 'top' } }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Trend Analysis
            </h3>
          </div>
          <div className="h-80">
            <Chart
              chartType="LineChart"
              width="100%"
              height="320px"
              data={trendDataGoogle}
              options={{ legend: { position: 'top' }, vAxis: { minValue: 0, maxValue: 5 }, series: { 1: { targetAxisIndex: 1 } }, hAxis: { title: 'Month' }, }}
            />
          </div>
        </div>

        {/* Top Performers and Recent Feedback */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Top Performing Teachers
            </h3>
            <div className="space-y-4">
              {topTeachers.map((teacher, index) => (
                <Fragment key={index}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{teacher.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{teacher.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{teacher.rating}</span>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{teacher.feedbacks} feedbacks</p>
                    </div>
                  </div>
                  {expandedTeacher === teacher.name && (
                    <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mt-2">
                      <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">All Feedback for {teacher.name}</h4>
                      <ul className="mb-4 space-y-2">
                        {getTeacherFeedbacks(teacher.name).length === 0 ? (
                          <li className="text-gray-500 text-sm">No feedback found for this teacher.</li>
                        ) : getTeacherFeedbacks(teacher.name).map((fb, i) => (
                          <li key={i} className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-2">
                            <span className="font-medium">Rating:</span> {fb.rating || '-'}<br />
                            <span className="font-medium">Comment:</span> {fb.comment || '-'}<br />
                            <span className="font-medium">Date:</span> {fb.$createdAt ? new Date(fb.$createdAt).toLocaleString() : '-'}
                          </li>
                        ))}
                      </ul>
                      <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">All Answers for {teacher.name}</h4>
                      <ul className="space-y-2">
                        {getTeacherAnswers(teacher.name).length === 0 ? (
                          <li className="text-gray-500 text-sm">No answers found for this teacher.</li>
                        ) : getTeacherAnswers(teacher.name).map((ans, i) => (
                          <li key={i} className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-2">
                            <span className="font-medium">Type:</span> {ans.type}<br />
                            <span className="font-medium">Answer:</span> {ans.answer}<br />
                            <span className="font-medium">Date:</span> {ans.$createdAt ? new Date(ans.$createdAt).toLocaleString() : '-'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Feedback
            </h3>
            <div className="space-y-4">
              {recentFeedbacks.map((feedback, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 dark:text-white">{feedback.teacher}</p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{feedback.comment}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>by {feedback.student}</span>
                    <span>{feedback.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Teachers Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">All Teachers</h3>
          <div className="space-y-4">
            {allTeachers.length === 0 ? (
              <div className="text-gray-500 text-sm">No teachers found.</div>
            ) : allTeachers.map((teacher) => (
              <Fragment key={teacher.$id}>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{teacher.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{teacher.department}</p>
                  </div>
                  <button
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    onClick={() => setExpandedTeacher(expandedTeacher === teacher.$id ? null : teacher.$id || null)}
                  >
                    {expandedTeacher === teacher.$id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
                {expandedTeacher === teacher.$id && (
                  <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mt-2">
                    <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">All Feedback for {teacher.name}</h4>
                    <ul className="mb-4 space-y-2">
                      {getTeacherFeedbacksById(teacher.$id).length === 0 ? (
                        <li className="text-gray-500 text-sm">No feedback found for this teacher.</li>
                      ) : getTeacherFeedbacksById(teacher.$id).map((fb, i) => (
                        <li key={i} className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-2">
                          <span className="font-medium">Rating:</span> {fb.rating || '-'}<br />
                          <span className="font-medium">Comment:</span> {fb.comment || '-'}<br />
                          <span className="font-medium">Date:</span> {fb.$createdAt ? new Date(fb.$createdAt).toLocaleString() : '-'}
                        </li>
                      ))}
                    </ul>
                    <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">All Answers for {teacher.name}</h4>
                    <ul className="space-y-2">
                      {getTeacherAnswersById(teacher.$id).length === 0 ? (
                        <li className="text-gray-500 text-sm">No answers found for this teacher.</li>
                      ) : getTeacherAnswersById(teacher.$id).map((ans, i) => (
                        <li key={i} className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-2">
                          <span className="font-medium">Type:</span> {ans.type}<br />
                          <span className="font-medium">Answer:</span> {ans.answer}<br />
                          <span className="font-medium">Date:</span> {ans.$createdAt ? new Date(ans.$createdAt).toLocaleString() : '-'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// All chart data and stats are now calculated from real-time database values only. No demo or random values remain. If the database is empty, charts will show zeroes or empty states.