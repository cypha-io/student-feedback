'use client';

import { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
import { Teacher, Student, Feedback, Response } from '@/types/database';

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

export default function Dashboard() {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalFeedbacks: 0,
    averageRating: 0,
    loading: true
  });

  const [recentActivities, setRecentActivities] = useState<Array<{
    action: string;
    time: string;
    type: string;
    user: string;
    status: string;
  }>>([]);
  const [chartData, setChartData] = useState({
    monthlySubmissions: [] as number[],
    ratingDistribution: [0, 0, 0, 0], // Poor, Average, Good, Excellent
    weeklyRatings: [] as number[]
  });

  // Fetch dashboard data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true }));
        // Fetch all collections
        const [teachersRes, studentsRes, feedbacksRes, responsesRes] = await Promise.all([
          dbHelpers.getAll(COLLECTIONS.TEACHERS).catch(() => ({ documents: [] })),
          dbHelpers.getAll(COLLECTIONS.STUDENTS).catch(() => ({ documents: [] })),
          dbHelpers.getAll(COLLECTIONS.FEEDBACKS).catch(() => ({ documents: [] })),
          dbHelpers.getAll(COLLECTIONS.RESPONSES).catch(() => ({ documents: [] }))
        ]);
        const teachers = teachersRes.documents as Teacher[];
        const students = studentsRes.documents as Student[];
        const feedbacks = feedbacksRes.documents as Feedback[];
        const responses = responsesRes.documents as Response[];

        // Calculate statistics
        const totalTeachers = teachers.length;
        const totalStudents = students.length;
        const totalFeedbacks = feedbacks.length;

        // Calculate average rating from responses
        const ratingResponses = responses.filter(r => r.type === 'rating' && typeof r.answer === 'number');
        const averageRating = ratingResponses.length > 0 
          ? ratingResponses.reduce((sum, response) => sum + (response.answer as number), 0) / ratingResponses.length 
          : 0;

        // Generate chart data
        const monthlyData = (() => {
          const monthly = new Array(6).fill(0);
          const now = new Date();
          feedbacks.forEach(feedback => {
            if (feedback.$createdAt) {
              const feedbackDate = new Date(feedback.$createdAt);
              const monthDiff = now.getMonth() - feedbackDate.getMonth() + 12 * (now.getFullYear() - feedbackDate.getFullYear());
              if (monthDiff >= 0 && monthDiff < 6) {
                monthly[5 - monthDiff]++;
              }
            }
          });
          return monthly;
        })();
        const ratingDist = (() => {
          const dist = [0, 0, 0, 0];
          responses.forEach(response => {
            if (response.type === 'rating' && typeof response.answer === 'number') {
              const rating = response.answer as number;
              if (rating <= 2) dist[0]++;
              else if (rating <= 3) dist[1]++;
              else if (rating <= 4) dist[2]++;
              else dist[3]++;
            }
          });
          return dist;
        })();
        const weeklyRatings = (() => {
          const weeklyData = new Array(4).fill(0);
          const weeklyCount = new Array(4).fill(0);
          const now = new Date();
          responses.forEach(response => {
            if (response.$createdAt && response.type === 'rating' && typeof response.answer === 'number') {
              const responseDate = new Date(response.$createdAt);
              const daysDiff = Math.floor((now.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24));
              const weekIndex = Math.floor(daysDiff / 7);
              if (weekIndex >= 0 && weekIndex < 4) {
                weeklyData[3 - weekIndex] += response.answer as number;
                weeklyCount[3 - weekIndex]++;
              }
            }
          });
          return weeklyData.map((sum, i) => weeklyCount[i] > 0 ? sum / weeklyCount[i] : 0);
        })();

        // Generate recent activities
        const activities = (() => {
          const acts: Array<{ action: string; time: string; type: string; user: string; status: string; }> = [];
          // Recent feedbacks
          const recentFeedbacks = feedbacks
            .sort((a, b) => new Date(b.$createdAt || '').getTime() - new Date(a.$createdAt || '').getTime())
            .slice(0, 2);
          recentFeedbacks.forEach(feedback => {
            const teacher = teachers.find(t => t.$id === feedback.teacherId);
            acts.push({
              action: `New feedback submitted for ${teacher?.name || 'Teacher'}`,
              time: getTimeAgo(feedback.$createdAt),
              type: 'feedback',
              user: `Student feedback`,
              status: 'completed'
            });
          });
          // Recent teachers
          const recentTeachers = teachers
            .sort((a, b) => new Date(b.$createdAt || '').getTime() - new Date(a.$createdAt || '').getTime())
            .slice(0, 1);
          recentTeachers.forEach(teacher => {
            acts.push({
              action: `Teacher ${teacher.name} added to ${teacher.department} department`,
              time: getTimeAgo(teacher.$createdAt),
              type: 'teacher',
              user: 'Admin User',
              status: 'completed'
            });
          });
          return acts.slice(0, 5);
        })();

        setDashboardData({
          totalTeachers,
          totalStudents,
          totalFeedbacks,
          averageRating: Math.round(averageRating * 10) / 10,
          loading: false
        });

        setChartData({
          monthlySubmissions: monthlyData,
          ratingDistribution: ratingDist,
          weeklyRatings: weeklyRatings
        });

        setRecentActivities(activities);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData({
          totalTeachers: 0,
          totalStudents: 0,
          totalFeedbacks: 0,
          averageRating: 0,
          loading: false
        });

        setChartData({
          monthlySubmissions: [0, 0, 0, 0, 0, 0],
          ratingDistribution: [0, 0, 0, 0],
          weeklyRatings: [0, 0, 0, 0]
        });

        setRecentActivities([]);
      }
    };

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper functions to generate chart data


  const generateWeeklyRatings = (responses: Response[]) => {
    const weeklyData = new Array(4).fill(0);
    const weeklyCount = new Array(4).fill(0);
    const currentDate = new Date();
    
    responses.forEach(response => {
      if (response.$createdAt && response.type === 'rating' && typeof response.answer === 'number') {
        const responseDate = new Date(response.$createdAt);
        const daysDiff = Math.floor((currentDate.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(daysDiff / 7);
        
        if (weekIndex >= 0 && weekIndex < 4) {
          weeklyData[3 - weekIndex] += response.answer as number;
          weeklyCount[3 - weekIndex]++;
        }
      }
    });
    
    const averages = weeklyData.map((sum, index) => 
      weeklyCount[index] > 0 ? sum / weeklyCount[index] : 0
    );
    
    return averages.some(a => a > 0) ? averages : [3.8, 4.1, 4.3, 4.2];
  };

  const generateRecentActivities = (teachers: Teacher[], students: Student[], feedbacks: Feedback[]) => {
    const activities: Array<{
      action: string;
      time: string;
      type: string;
      user: string;
      status: string;
    }> = [];
    
    // Recent feedbacks
    const recentFeedbacks = feedbacks
      .sort((a, b) => new Date(b.$createdAt || '').getTime() - new Date(a.$createdAt || '').getTime())
      .slice(0, 2);
    
    recentFeedbacks.forEach(feedback => {
      const teacher = teachers.find(t => t.$id === feedback.teacherId);
      activities.push({
        action: `New feedback submitted for ${teacher?.name || 'Teacher'}`,
        time: getTimeAgo(feedback.$createdAt),
        type: 'feedback',
        user: `Student feedback`,
        status: 'completed'
      });
    });
    
    // Recent teachers
    const recentTeachers = teachers
      .sort((a, b) => new Date(b.$createdAt || '').getTime() - new Date(a.$createdAt || '').getTime())
      .slice(0, 1);
    
    recentTeachers.forEach(teacher => {
      activities.push({
        action: `Teacher ${teacher.name} added to ${teacher.department} department`,
        time: getTimeAgo(teacher.$createdAt),
        type: 'teacher',
        user: 'Admin User',
        status: 'completed'
      });
    });
    
    return activities.slice(0, 5);
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
  };

  // Chart configurations using dynamic data
  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Feedback Submissions',
        data: chartData.monthlySubmissions,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Poor', 'Average', 'Good', 'Excellent'],
    datasets: [
      {
        data: chartData.ratingDistribution,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Average Rating',
        data: chartData.weeklyRatings,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                Welcome back, Admin
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Here&apos;s what&apos;s happening with your feedback system today
              </p>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last updated:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Teachers
                  </p>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {dashboardData.loading ? '...' : dashboardData.totalTeachers}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-green-200 dark:hover:border-green-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Students
                  </p>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {dashboardData.loading ? '...' : dashboardData.totalStudents}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+8%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-200 dark:hover:border-purple-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Feedbacks
                  </p>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {dashboardData.loading ? '...' : dashboardData.totalFeedbacks.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+24%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-yellow-200 dark:hover:border-yellow-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Rating
                  </p>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-baseline mt-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.loading ? '...' : dashboardData.averageRating}
                  </p>
                  <div className="flex items-center ml-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(dashboardData.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">+0.3</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/25 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Monthly Feedback Submissions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Track feedback submissions over the last 6 months
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {chartData.monthlySubmissions.reduce((a, b) => a + b, 0)}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total submissions</p>
              </div>
            </div>
            <div className="h-80">
              <Bar data={barChartData} options={{...chartOptions, maintainAspectRatio: false}} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Feedback Distribution
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Rating breakdown
                </p>
              </div>
            </div>
            <div className="h-80">
              <Pie data={pieChartData} options={{maintainAspectRatio: false}} />
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Weekly Rating Trends
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Average ratings over the last 4 weeks
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {chartData.weeklyRatings.length > 0 ? chartData.weeklyRatings[chartData.weeklyRatings.length - 1].toFixed(1) : '0.0'}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
            </div>
          </div>
          <div className="h-80">
            <Line data={lineChartData} options={{...chartOptions, maintainAspectRatio: false}} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Latest updates and system activity
              </p>
            </div>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.loading ? (
              <div className="text-center py-4">
                <div className="text-gray-500 dark:text-gray-400">Loading recent activities...</div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-500 dark:text-gray-400">No recent activities found</div>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={index} className="group flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                  <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.type === 'feedback' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    activity.type === 'teacher' ? 'bg-green-100 dark:bg-green-900/20' :
                    activity.type === 'questions' ? 'bg-purple-100 dark:bg-purple-900/20' :
                    activity.type === 'student' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                    'bg-indigo-100 dark:bg-indigo-900/20'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      activity.type === 'feedback' ? 'text-blue-600 dark:text-blue-400' :
                      activity.type === 'teacher' ? 'text-green-600 dark:text-green-400' :
                      activity.type === 'questions' ? 'text-purple-600 dark:text-purple-400' :
                      activity.type === 'student' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-indigo-600 dark:text-indigo-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {activity.type === 'feedback' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      )}
                      {activity.type === 'teacher' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {activity.action}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      by {activity.user}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
