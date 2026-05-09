'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Teacher, Question, AppraisalAssignment } from '@/types/database';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';

export default function StaffEvaluationPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { staffId } = useAuth();
  
  const [assignment, setAssignment] = useState<AppraisalAssignment | null>(null);
  const [appraisee, setAppraisee] = useState<Teacher | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const assignRes = await dbHelpers.getById(COLLECTIONS.APPRAISAL_ASSIGNMENTS, id as string);
      const assignmentData = assignRes as unknown as AppraisalAssignment;
      setAssignment(assignmentData);

      const appraiseeRes = await dbHelpers.getById(COLLECTIONS.TEACHERS, assignmentData.appraiseeId);
      const appraiseeData = appraiseeRes as unknown as Teacher;
      setAppraisee(appraiseeData);

      const questionsRes = await dbHelpers.getAll(COLLECTIONS.QUESTIONS);
      const allQuestions = questionsRes.documents as unknown as Question[];
      
      // Filter questions by appraisee's staff type
      const filteredQuestions = allQuestions.filter(q => 
        q.targetRole === appraiseeData.staffType || q.targetRole === 'General'
      );
      setQuestions(filteredQuestions.sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0)));
    } catch (error) {
      console.error('Error fetching evaluation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSelect = (questionId: string, rating: number) => {
    setResponses(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment || !appraisee) return;

    try {
      setSubmitting(true);
      
      const feedbackData = {
        teacherId: appraisee.id,
        subjectId: '00000000-0000-0000-0000-000000000000', // Placeholder for non-subject specific
        classId: '00000000-0000-0000-0000-000000000000',
        status: 'completed',
        appraisalAssignmentId: assignment.id,
        submittedAt: new Date().toISOString()
      };

      const responsesData = Object.entries(responses).map(([qId, answer]) => ({
        questionId: qId,
        answer: answer.toString(),
        type: 'rating',
        teacherId: appraisee.id
      }));

      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackData, responsesData }),
      });

      // Update assignment status
      await dbHelpers.update(COLLECTIONS.APPRAISAL_ASSIGNMENTS, assignment.id, {
        status: 'completed',
        updatedAt: new Date()
      });

      alert('Evaluation submitted successfully!');
      router.push('/dashboard/my-appraisals');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Failed to submit evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading form...</div>;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight">Personnel Evaluation</h2>
              <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">
                Appraising: <span className="text-white">{appraisee?.name}</span> ({appraisee?.role})
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                   <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-slate-900 font-bold leading-relaxed">{q.question}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingSelect(q.id, rating)}
                      className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                        responses[q.id] === rating 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105' 
                          : 'bg-slate-50 border-transparent text-slate-400 hover:border-blue-200 hover:bg-white'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-10 flex justify-end">
              <button
                type="submit"
                disabled={submitting || Object.keys(responses).length < questions.length}
                className="px-12 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting Intelligence...' : 'Finalize Appraisal'}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
