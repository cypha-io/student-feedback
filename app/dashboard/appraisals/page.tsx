'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNotification } from '@/components/NotificationSystem';
import { useConfirmation } from '@/components/ConfirmationDialog';
import { Teacher, AppraisalAssignment } from '@/types/database';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';

export default function AppraisalAssignmentsPage() {
  const { addNotification } = useNotification();
  const { confirm } = useConfirmation();
  
  const [staff, setStaff] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  
  const [formData, setFormData] = useState({
    appraiseeId: '',
    appraiserId: '',
    appraiserType: 'staff' as any,
    reviewerId: '',
    sessionId: 'Annual Appraisal 2024'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const staffRes = await dbHelpers.getAll(COLLECTIONS.TEACHERS);
      setStaff(staffRes.documents as unknown as Teacher[]);
      
      const assignmentsRes = await dbHelpers.getAll(COLLECTIONS.APPRAISAL_ASSIGNMENTS);
      setAssignments(assignmentsRes.documents as unknown as AppraisalAssignment[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await dbHelpers.create(COLLECTIONS.APPRAISAL_ASSIGNMENTS, {
        ...formData,
        status: 'pending'
      });
      addNotification({ type: 'success', title: 'Success', message: 'Assignment created successfully!' });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create assignment.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ title: 'Delete Assignment', message: 'Are you sure?', type: 'danger' });
    if (!confirmed) return;
    
    try {
      await dbHelpers.delete(COLLECTIONS.APPRAISAL_ASSIGNMENTS, id);
      fetchData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Unknown';

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Appraisal Matrix</h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">Define who appraises whom across the institution</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
                {['All', 'Teaching', 'Non-Teaching'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2"
              >
                Add New Assignment
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Appraisee</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Appraiser</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Rater Group</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Reviewer</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments
                  .filter(a => {
                    if (filterType === 'All') return true;
                    const appraisee = staff.find(s => s.id === a.appraiseeId);
                    return appraisee?.staffType === filterType;
                  })
                  .map((assignment) => {
                    const appraisee = staff.find(s => s.id === assignment.appraiseeId);
                    return (
                      <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 px-8">
                          <div className="font-bold text-slate-900">{getStaffName(assignment.appraiseeId)}</div>
                          <div className="text-[10px] text-slate-400">{appraisee?.role}</div>
                        </td>
                        <td className="py-5 px-8">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                            appraisee?.staffType === 'Teaching' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {appraisee?.staffType}
                          </span>
                        </td>
                        <td className="py-5 px-8 text-sm text-slate-600">
                          {assignment.appraiserType === 'student' ? 'Randomized Student Sample' : getStaffName(assignment.appraiserId || '')}
                        </td>
                        <td className="py-5 px-8">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                            {assignment.appraiserType}
                          </span>
                        </td>
                        <td className="py-5 px-8 text-sm font-medium text-slate-600">{getStaffName(assignment.reviewerId || '')}</td>
                        <td className="py-5 px-8 text-right">
                          <button onClick={() => handleDelete(assignment.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl">
              <h3 className="text-xl font-black mb-6">Create Assignment</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400">Staff to be Appraised</label>
                  <select 
                    required 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                    value={formData.appraiseeId}
                    onChange={e => setFormData({...formData, appraiseeId: e.target.value})}
                  >
                    <option value="">Select Staff</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                  </select>
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400">Rater Group (Weightage)</label>
                      <select 
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold"
                        value={formData.appraiserType}
                        onChange={e => setFormData({...formData, appraiserType: e.target.value as any})}
                      >
                        <option value="student">Students (20%)</option>
                        <option value="hod">HOD / Dept. Head (40%)</option>
                        <option value="supervisor">Immediate Supervisor (20%)</option>
                        <option value="peer">Peer / Co-worker (20%)</option>
                        <option value="staff">Other Staff (20%)</option>
                        <option value="assistant_head">Asst. Head (20%)</option>
                      </select>
                    </div>
                    {formData.appraiserType !== 'student' && (
                      <div>
                        <label className="text-[11px] font-black uppercase text-slate-400">Select Appraiser</label>
                        <select 
                          required 
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold"
                          value={formData.appraiserId}
                          onChange={e => setFormData({...formData, appraiserId: e.target.value})}
                        >
                          <option value="">Choose Staff Member</option>
                          {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400">Final Reviewer (Headmaster / Higher Authority)</label>
                  <select 
                    required 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold"
                    value={formData.reviewerId}
                    onChange={e => setFormData({...formData, reviewerId: e.target.value})}
                  >
                    <option value="">Select Reviewing Authority</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-400">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black">Save Assignment</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
