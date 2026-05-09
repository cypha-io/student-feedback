'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { AppraisalAssignment, Teacher } from '@/types/database';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';
import Link from 'next/link';

export default function MyAppraisalsPage() {
  const { staffId } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (staffId) {
      fetchAssignments();
    }
  }, [staffId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await dbHelpers.getAll(COLLECTIONS.APPRAISAL_ASSIGNMENTS);
      const staffRes = await dbHelpers.getAll(COLLECTIONS.TEACHERS);
      
      const allAssignments = res.documents as unknown as AppraisalAssignment[];
      const allStaff = staffRes.documents as unknown as Teacher[];

      const myAssignments = allAssignments
        .filter(a => a.appraiserId === staffId)
        .map(a => {
          const appraisee = allStaff.find(s => s.id === a.appraiseeId);
          return {
            ...a,
            appraiseeName: appraisee?.name || 'Unknown Staff',
            appraiseeRole: appraisee?.role || 'Staff'
          };
        });

      setAssignments(myAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8 pb-12">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Appraisal Tasks</h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">Complete evaluations for your colleagues as assigned</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[2rem] border border-slate-100 text-center">
                <p className="text-slate-400 font-bold">No appraisal assignments found for you.</p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                      {assignment.appraiseeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 leading-tight">{assignment.appraiseeName}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{assignment.appraiseeRole}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Type</span>
                      <span className="text-slate-900 uppercase">{assignment.appraiserType}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Status</span>
                      <span className={`uppercase ${assignment.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {assignment.status}
                      </span>
                    </div>
                  </div>

                  {assignment.status !== 'completed' ? (
                    <Link 
                      href={`/dashboard/appraisals/evaluate/${assignment.id}`}
                      className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
                    >
                      Start Evaluation
                    </Link>
                  ) : (
                    <button 
                      disabled
                      className="block w-full py-3 bg-slate-100 text-slate-400 text-center rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed"
                    >
                      Completed
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
