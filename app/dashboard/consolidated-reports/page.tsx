'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Teacher, Feedback, Response } from '@/types/database';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';

interface ConsolidatedStaffReport {
  staffId: string;
  name: string;
  role: string;
  staffType: string;
  overallScore: number;
  categoryScores: Record<string, number>;
  totalAppraisals: number;
  raterTypeScores: Record<string, number>;
  interventions: string[];
  reviewerName?: string;
}

export default function ConsolidatedReportsPage() {
  const [reports, setReports] = useState<ConsolidatedStaffReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<ConsolidatedStaffReport | null>(null);

  useEffect(() => {
    fetchConsolidatedData();
  }, []);

  const fetchConsolidatedData = async () => {
    try {
      setLoading(true);
      const staffRes = await dbHelpers.getAll(COLLECTIONS.TEACHERS);
      const feedbacksRes = await dbHelpers.getAll(COLLECTIONS.FEEDBACKS);
      const responsesRes = await dbHelpers.getAll(COLLECTIONS.RESPONSES);
      const assignmentsRes = await dbHelpers.getAll(COLLECTIONS.APPRAISAL_ASSIGNMENTS);
      
      const staffList = staffRes.documents as unknown as Teacher[];
      const feedbacksList = feedbacksRes.documents as unknown as Feedback[];
      const responsesList = responsesRes.documents as unknown as Response[];
      const allAssignments = assignmentsRes.documents as unknown as any[];

      const consolidated: ConsolidatedStaffReport[] = staffList.map(s => {
        const staffFeedbacks = feedbacksList.filter(f => f.teacherId === s.id);
        
        // Group responses by rater type
        const raterTypeScores: Record<string, { sum: number; count: number }> = {
          student: { sum: 0, count: 0 },
          staff: { sum: 0, count: 0 },
          hod: { sum: 0, count: 0 },
          supervisor: { sum: 0, count: 0 },
          peer: { sum: 0, count: 0 },
        };

        const categoryTotals: Record<string, { sum: number; count: number }> = {};

        staffFeedbacks.forEach(f => {
          const raterType = f.appraisalAssignmentId ? 
            (allAssignments.find(a => a.id === f.appraisalAssignmentId)?.appraiserType || 'staff') : 
            'student';
          
          const feedbackResponses = responsesList.filter(r => r.feedbackId === f.id);
          
          feedbackResponses.forEach(r => {
            const score = Number(r.answer);
            if (!isNaN(score)) {
              // Rater type aggregation
              raterTypeScores[raterType].sum += score;
              raterTypeScores[raterType].count += 1;

              // Category aggregation
              const category = r.questionId.split('-')[0] || 'General';
              if (!categoryTotals[category]) categoryTotals[category] = { sum: 0, count: 0 };
              categoryTotals[category].sum += score;
              categoryTotals[category].count += 1;
            }
          });
        });

        const categoryScores: Record<string, number> = {};
        Object.keys(categoryTotals).forEach(cat => {
          categoryScores[cat] = categoryTotals[cat].sum / categoryTotals[cat].count;
        });

        // Weighted Calculation
        // Weights: HOD (40%), Supervisor (20%), Students (20%), Peers (20%)
        const weights: Record<string, number> = {
          hod: 0.4,
          supervisor: 0.2,
          student: 0.2,
          peer: 0.2,
          staff: 0.2 // default staff fallback
        };

        let weightedSum = 0;
        let totalWeightUsed = 0;

        Object.entries(raterTypeScores).forEach(([type, data]) => {
          if (data.count > 0) {
            const avg = data.sum / data.count;
            const weight = weights[type] || 0;
            weightedSum += avg * weight;
            totalWeightUsed += weight;
          }
        });

        const overallScore = totalWeightUsed > 0 ? weightedSum / totalWeightUsed : 0;
        
        // Suggested Interventions Logic
        const interventions: string[] = [];
        if (overallScore > 0) {
          if (overallScore < 3.0) interventions.push("General performance improvement plan required.");
          if (categoryScores['A'] < 3.0) interventions.push("Peer-mentorship for Student-Teacher relationship building.");
          if (categoryScores['D'] < 3.0) interventions.push("Subject-matter expertise refresher course.");
          if (categoryScores['F'] < 3.0) interventions.push("Time management workshop.");
          if (categoryScores['H'] < 3.0) interventions.push("Classroom management and discipline training.");
        }

        return {
          staffId: s.id,
          name: s.name,
          role: s.role,
          staffType: s.staffType,
          overallScore,
          categoryScores,
          raterTypeScores: Object.fromEntries(
            Object.entries(raterTypeScores).map(([k, v]) => [k, v.count > 0 ? v.sum / v.count : 0])
          ),
          totalAppraisals: staffFeedbacks.length,
          interventions,
          reviewerName: s.id ? (allAssignments.find(a => a.appraiseeId === s.id)?.reviewerId ? 
            staffList.find(st => st.id === allAssignments.find(a => a.appraiseeId === s.id).reviewerId)?.name : 'Not Assigned') : 'Not Assigned'
        };
      });

      setReports(consolidated.filter(r => r.totalAppraisals > 0));
    } catch (error) {
      console.error('Error fetching consolidated data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8 pb-12">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Consolidated Appraisals</h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">Aggregated performance intelligence across all rater groups</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Staff Overview</h3>
              {reports.map(report => (
                <button 
                  key={report.staffId}
                  onClick={() => setSelectedStaff(report)}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all ${
                    selectedStaff?.staffId === report.staffId ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black">{report.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${
                      selectedStaff?.staffId === report.staffId ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {report.overallScore.toFixed(1)}
                    </span>
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedStaff?.staffId === report.staffId ? 'text-slate-400' : 'text-slate-400'}`}>
                    {report.role} • {report.totalAppraisals} Appraisals
                  </p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedStaff ? (
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-10 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedStaff.name}</h3>
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">{selectedStaff.role} Appraisal Summary</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consolidated GPA</p>
                      <span className="text-4xl font-black text-slate-900">{selectedStaff.overallScore.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sub-Heading Breakdown</h4>
                        {Object.entries(selectedStaff.categoryScores).map(([cat, score]) => (
                          <div key={cat} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                              <span>Section {cat}</span>
                              <span>{score.toFixed(1)} / 5.0</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${(score / 5) * 100}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 pt-6 border-t border-slate-50">
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">360-Degree Matrix Breakdown</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selectedStaff.raterTypeScores).map(([type, score]) => (
                            <div key={type} className={`p-4 rounded-2xl border ${score > 0 ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50/50 border-slate-100 opacity-40'}`}>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{type}</p>
                              <p className="text-lg font-black text-slate-900">{score > 0 ? score.toFixed(1) : 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reviewing Authority</p>
                        <p className="text-lg font-black">{selectedStaff.reviewerName}</p>
                        <p className="text-[10px] text-slate-500 mt-2 italic">Headmaster / Higher Authority responsible for final oversight.</p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">Suggested Interventions</h4>
                        {selectedStaff.interventions.length > 0 ? (
                          <div className="space-y-3">
                            {selectedStaff.interventions.map((intervention, i) => (
                              <div key={i} className="flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-700">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {intervention}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-700">
                            Performance is optimal. No urgent interventions identified.
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => window.location.href = `/dashboard/responses?teacher=${encodeURIComponent(selectedStaff.name)}`}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
                      >
                        Initiate Review & Audit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-20 text-center flex flex-col items-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Select Personnel</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Choose a staff member from the left to view their consolidated performance intelligence.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
