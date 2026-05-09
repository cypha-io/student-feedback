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
      const teacherFeedbacks = feedbacks.filter(f => f.teacherId === teacher.id);
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

  const filteredReports = selectedTeacher === 'all' 
    ? teacherReports 
    : teacherReports.filter(r => r.teacher.id === selectedTeacher);

  const handlePrint = () => {
    // Get the report content element
    const reportContent = document.getElementById('report-content');
    if (!reportContent) {
      alert('No report content found to print');
      return;
    }

    // Create a new window for printing with system watermark
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString();
    const reportTitle = selectedTeacher === 'all' 
      ? 'All Teachers Evaluation Report' 
      : `${teachers.find(t => t.id === selectedTeacher)?.name} Evaluation Report`;

    // Generate print-friendly HTML with watermark (only the data)
    const printHTML = generatePrintHTML(filteredReports, reportTitle, currentDate);
    
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Trigger print dialog
    printWindow.focus();
    printWindow.print();
  };

  const handleDownload = () => {
    // For PDF download, we'll use the same approach but with a different title
    const reportContent = document.getElementById('report-content');
    if (!reportContent) {
      alert('No report content found to download');
      return;
    }

    const currentDate = new Date().toLocaleDateString();
    const reportTitle = selectedTeacher === 'all' 
      ? 'All_Teachers_Evaluation_Report' 
      : `${teachers.find(t => t.id === selectedTeacher)?.name}_Evaluation_Report`;
    
    // Create a temporary window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printHTML = generatePrintHTML(filteredReports, reportTitle.replace(/_/g, ' '), currentDate);
    
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Set the document title for PDF download
    printWindow.document.title = `${reportTitle}_${currentDate.replace(/\//g, '-')}`;
    printWindow.focus();
    
    // Show instruction to user
    setTimeout(() => {
      alert('Please use Ctrl+P (Cmd+P on Mac) and select "Save as PDF" as the destination.');
      printWindow.print();
    }, 500);
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
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23f0f0f0' text-anchor='middle' transform='rotate(-45 100 100)'%3ESMEI - SwapGPA Technologies Limited%3C/text%3E%3C/svg%3E");
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
            <p>Powered by SwapGPA Technologies Limited.</p>
          </div>
          
          ${reportContent}
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SMEI - SwapGPA Technologies Limited | Confidential Document</p>
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-50/30 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-50/30 border-b-blue-600 rounded-full animate-spin-reverse"></div>
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Aggregating Intel...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        {/* Intelligence Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Evaluation Intelligence
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium max-w-xl">
              High-fidelity performance mapping and analytics derived from verified student feedback cohorts.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[280px]">
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none transition-all cursor-pointer"
              >
                <option value="all">Comprehensive Analysis</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} • {t.department}</option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePrint()}
                className="p-4 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group active:scale-95"
                title="Print Report"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
              
              <button
                onClick={() => handleDownload()}
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 group active:scale-95"
              >
                <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Global Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'Active Faculty', 
              val: teachers.length, 
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ), 
              color: 'blue' 
            },
            { 
              label: 'Verified Feedbacks', 
              val: feedbacks.length, 
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              ), 
              color: 'indigo' 
            },
            { 
              label: 'Global Index', 
              val: `${teacherReports.length > 0 ? (teacherReports.reduce((sum, r) => sum + r.overallPercentage, 0) / teacherReports.length).toFixed(1) : '0'}%`,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ), 
              color: 'emerald' 
            },
            { 
              label: 'Atomic Responses', 
              val: responses.length, 
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              ), 
              color: 'slate' 
            }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 group hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className={`w-10 h-10 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Report Matrix */}
        <div id="report-content" className="space-y-10">
          {filteredReports.map((report) => (
            <div key={report.teacher.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
              {/* Teacher Profile Section */}
              <div className="px-10 py-10 border-b border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-3xl -mr-48 -mt-48 group-hover:bg-blue-100/40 transition-colors"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                      {report.teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{report.teacher.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.teacher.department}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.teacher.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${getPerformanceColor(report.overallPercentage)}`}>
                      {report.overallRating}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">{report.overallPercentage.toFixed(1)}%</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Score</span>
                    </div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                      {report.totalFeedbacks} Cohort Feedbacks
                    </p>
                  </div>
                </div>
              </div>

              {/* Vector Analysis (Section Breakdown) */}
              <div className="p-10 space-y-10">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Section Performance Matrix</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(EVALUATION_SECTIONS).map(([section, title]) => {
                      const data = report.sectionScores[section];
                      if (!data) return null;

                      return (
                        <div key={section} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group/card">
                          <div className="flex justify-between items-center mb-4">
                            <span className="w-8 h-8 bg-white text-blue-600 rounded-xl flex items-center justify-center font-black text-xs shadow-sm border border-slate-100">{section}</span>
                            <span className="text-xs font-black text-slate-900 tracking-tight">{data.percentage.toFixed(1)}%</span>
                          </div>
                          <h5 className="text-[11px] font-bold text-slate-600 leading-relaxed mb-4 min-h-[40px] line-clamp-2">{title}</h5>
                          
                          <div className="space-y-4">
                            <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover/card:bg-blue-500"
                                style={{ width: `${data.percentage}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                              <span>Raw Score: {data.totalScore}/{data.maxScore}</span>
                              <span>n={data.count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rating Glossary Reference */}
                <div className="pt-10 border-t border-slate-50">
                  <div className="bg-slate-900 rounded-[3rem] p-8 text-white">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                      {PERFORMANCE_RATINGS.map((rating) => (
                        <div key={rating.label} className={`flex flex-col items-center gap-2 transition-all ${
                          report.overallRating === rating.label ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-100'
                        }`}>
                          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${rating.color}`}>
                            {rating.label}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 tracking-widest">{rating.min}-{rating.max}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Intelligence Void Detected</h3>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                {selectedTeacher === 'all' 
                  ? 'No evaluation datasets identified in the current institutional registry.'
                  : 'Specified subject has not yet generated sufficient evaluation telemetry.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
