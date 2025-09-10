'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';
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

  const handlePrint = () => {
    // Create a new window for printing with system watermark
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString();
    const reportTitle = selectedTeacher === 'all' 
      ? 'All Teachers Evaluation Report' 
      : `${teachers.find(t => t.$id === selectedTeacher)?.name} Evaluation Report`;

    // Generate print-friendly HTML with watermark
    const printHTML = generatePrintHTML(filteredReports, reportTitle, currentDate);
    
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Trigger print dialog
    printWindow.focus();
    printWindow.print();
  };

  const handleDownload = () => {
    // For now, we'll use the browser's print to PDF functionality
    // In a production environment, you'd want to use a proper PDF library
    const currentDate = new Date().toLocaleDateString();
    const reportTitle = selectedTeacher === 'all' 
      ? 'All_Teachers_Evaluation_Report' 
      : `${teachers.find(t => t.$id === selectedTeacher)?.name}_Evaluation_Report`;
    
    // Create a temporary link to trigger download
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printHTML = generatePrintHTML(filteredReports, reportTitle.replace(/_/g, ' '), currentDate);
    
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Set the document title for PDF download
    printWindow.document.title = `${reportTitle}_${currentDate.replace(/\//g, '-')}`;
    printWindow.focus();
    printWindow.print();
  };

  const generatePrintHTML = (reports: TeacherReport[], title: string, date: string) => {
    const reportContent = reports.map(report => `
      <div class="teacher-report">
        <div class="teacher-header">
          <h2>${report.teacher.name}</h2>
          <p>Department: ${report.teacher.department}</p>
          <p>Employee ID: ${report.teacher.employeeId}</p>
          <p>Overall Rating: <span class="rating ${getPerformanceClass(report.overallPercentage)}">${getPerformanceLabel(report.overallPercentage)}</span> (${report.overallPercentage.toFixed(1)}%)</p>
          <p>Total Evaluations: ${report.totalFeedbacks}</p>
        </div>
        
        <div class="sections">
          <h3>Performance by Section</h3>
          ${Object.entries(report.sectionScores).map(([section, score]) => `
            <div class="section-item">
              <strong>${section}: ${EVALUATION_SECTIONS[section as keyof typeof EVALUATION_SECTIONS]}</strong>
              <span class="score">${score.percentage.toFixed(1)}% (${score.totalScore}/${score.maxScore})</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page { margin: 0.5in; }
              body { margin: 0; }
            }
            
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23f0f0f0' text-anchor='middle' transform='rotate(-45 100 100)'%3ESMEI - Cypha Inc.%3C/text%3E%3C/svg%3E");
              background-repeat: repeat;
              background-size: 200px 200px;
              position: relative;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            
            .header h1 {
              margin: 0;
              color: #2563eb;
              font-size: 24px;
            }
            
            .header p {
              margin: 5px 0 0 0;
              color: #666;
            }
            
            .teacher-report {
              margin-bottom: 40px;
              border: 1px solid #ddd;
              padding: 20px;
              background: rgba(255, 255, 255, 0.9);
              border-radius: 8px;
              page-break-inside: avoid;
            }
            
            .teacher-header {
              margin-bottom: 20px;
              border-bottom: 1px solid #eee;
              padding-bottom: 15px;
            }
            
            .teacher-header h2 {
              margin: 0 0 10px 0;
              color: #1f2937;
            }
            
            .teacher-header p {
              margin: 5px 0;
              color: #4b5563;
            }
            
            .rating {
              font-weight: bold;
              padding: 2px 8px;
              border-radius: 4px;
            }
            
            .rating.excellent { background: #dcfce7; color: #166534; }
            .rating.very-good { background: #dbeafe; color: #1e40af; }
            .rating.good { background: #e0e7ff; color: #3730a3; }
            .rating.average { background: #fef3c7; color: #92400e; }
            .rating.weak { background: #fed7aa; color: #c2410c; }
            .rating.poor { background: #fecaca; color: #dc2626; }
            .rating.very-poor { background: #fca5a5; color: #991b1b; }
            
            .sections h3 {
              margin: 0 0 15px 0;
              color: #374151;
            }
            
            .section-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 8px 0;
              border-bottom: 1px dotted #d1d5db;
            }
            
            .score {
              font-weight: bold;
              color: #059669;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Generated on: ${date}</p>
            <p>SMEI - Student-Teacher Evaluation & Management Intelligence</p>
            <p>Powered by Cypha Inc.</p>
          </div>
          
          ${reportContent}
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SMEI - Cypha Inc. | Confidential Document</p>
            <p>This report contains confidential information and is intended for authorized personnel only.</p>
          </div>
        </body>
      </html>
    `;
  };

  const getPerformanceClass = (percentage: number) => {
    const rating = PERFORMANCE_RATINGS.find(r => 
      percentage >= r.min && percentage <= r.max
    ) || PERFORMANCE_RATINGS[PERFORMANCE_RATINGS.length - 1];
    
    return rating.label.toLowerCase().replace(' ', '-');
  };

  const getPerformanceLabel = (percentage: number) => {
    const rating = PERFORMANCE_RATINGS.find(r => 
      percentage >= r.min && percentage <= r.max
    ) || PERFORMANCE_RATINGS[PERFORMANCE_RATINGS.length - 1];
    
    return rating.label;
  };

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
            
            {/* Print and Download buttons */}
            <button
              onClick={() => handlePrint()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              title="Print Report"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print</span>
            </button>
            
            <button
              onClick={() => handleDownload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              title="Download Report as PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
            </button>
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
