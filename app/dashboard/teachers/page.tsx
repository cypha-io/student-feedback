'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNotification } from '@/components/NotificationSystem';
import { useConfirmation } from '@/components/ConfirmationDialog';
import { Teacher, Department, Class as ClassType, Subject } from '@/types/database';

export default function ManagePersonnel() {
  const { addNotification } = useNotification();
  const { confirm } = useConfirmation();
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [departments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    employeeId: '',
    department: '', // Changed from departmentId
    class: '', // Changed from classId
    subjects: [],
    email: '',
    phone: '',
    staffType: 'Teaching',
    role: 'Teacher',
  });

  // Load data from database on component mount
  useEffect(() => {
    fetchTeachers();
    fetchClasses();
    fetchSubjects();
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teachers');
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = '/api/teachers'; // Same endpoint for both POST and PUT
    const method = editingTeacher ? 'PUT' : 'POST';

    try {
      // Prepare data for API (ensure we use the correct property names)
      const apiData = {
        ...formData,
        class: formData.class, // Make sure 'class' property is used
        id: editingTeacher?.id // Include ID for PUT requests
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
        }
        throw new Error(errorData.error || 'Failed to save teacher');
      }

      await fetchTeachers(); // Refresh the list
      resetForm();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Teacher saved successfully!'
      });
    } catch (error) {
      console.error('Error saving teacher:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to save teacher: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      employeeId: '',
      department: '', // Changed from departmentId
      class: '', // Changed from classId
      subjects: [],
      email: '',
      phone: '',
      staffType: 'Teaching',
      role: 'Teacher',
    });
    setEditingTeacher(null);
    setIsModalOpen(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      employeeId: teacher.employeeId,
      department: teacher.department, // Changed from departmentId
      class: teacher.class, // Changed from classId
      subjects: teacher.subjects,
      email: teacher.email,
      phone: teacher.phone || '',
      staffType: teacher.staffType || 'Teaching',
      role: teacher.role || 'Teacher',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Teacher',
      message: 'Are you sure you want to delete this teacher? This action cannot be undone.',
      type: 'danger'
    });
    if (!confirmed) return;
    
    try {
      const response = await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete teacher');
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Teacher deleted successfully.'
      });
      await fetchTeachers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting teacher:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete teacher.'
      });
    }
  };

  const handleSubjectChange = (subjectName: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectName)
        ? prev.subjects.filter(s => s !== subjectName)
        : [...prev.subjects, subjectName]
    }));
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Personnel Management
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Maintain a detailed database of all staff (Teaching & Non-Teaching) and their assignments
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-blue-100 flex items-center gap-2 group active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Add New Personnel
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Staff Records <span className="ml-2 text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg text-xs uppercase tracking-widest">{teachers.length}</span>
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl">
                {['All', 'Teaching', 'Non-Teaching'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filterType === type ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Intelligence Search..."
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-64"
                />
                <svg className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Assignment</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Expertise</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Connectivity</th>
                  <th className="py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-slate-500 font-bold text-sm">Syncing records...</p>
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">No Personnel Identified</h3>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto">Start by onboarding your first staff member to begin evaluation telemetry.</p>
                    </td>
                  </tr>
                ) : (
                  teachers
                    .filter(t => filterType === 'All' || t.staffType === filterType)
                    .map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-slate-200">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {teacher.name}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400">
                            ID: {teacher.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-700">
                          {teacher.department}
                        </div>
                        <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md inline-block uppercase tracking-wider">
                          {teacher.staffType} - {teacher.role}
                        </div>
                        {teacher.staffType === 'Teaching' && (
                          <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md inline-block uppercase tracking-wider ml-2">
                            {teacher.class}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {teacher.subjects.map((subjectName, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md border border-slate-200"
                          >
                            {subjectName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-500 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {teacher.email}
                        </div>
                        <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {teacher.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all group/btn"
                          title="Edit Record"
                        >
                          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id || '')}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all group/btn"
                          title="Delete Record"
                        >
                          <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Premium Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
              
              <div className="relative bg-white rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-100 animate-scale-up">
                <div className="px-10 pt-10 pb-6 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {editingTeacher ? 'Update Personnel Record' : 'Onboard New Personnel'}
                    </h3>
                    <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">Fill in the professional details below</p>
                  </div>
                  <button onClick={resetForm} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="teacher-name" className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Full Name
                      </label>
                      <input
                        id="teacher-name"
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. EMP-2024-001"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Staff Type
                      </label>
                      <select
                        required
                        value={formData.staffType}
                        onChange={(e) => setFormData({...formData, staffType: e.target.value as 'Teaching' | 'Non-Teaching'})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="Teaching">Teaching Staff</option>
                        <option value="Non-Teaching">Non-Teaching Staff</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Designated Role
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Teacher, Cleaner, HOD, Supervisor"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Department
                      </label>
                      <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Class Assignment
                      </label>
                      <select
                        required
                        value={formData.class}
                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name} - Year {cls.year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="teacher@olagshs.edu.gh"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+233 00 000 0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Subject Specialization
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-40 overflow-y-auto scrollbar-hide">
                      {subjects.map(subject => (
                        <label key={subject.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 hover:border-blue-200 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={formData.subjects.includes(subject.name)}
                            onChange={() => handleSubjectChange(subject.name)}
                            className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20"
                          />
                          <span className="text-xs font-bold text-slate-700 truncate">{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-4 mt-10">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white/30 border-b-white rounded-full animate-spin"></div>}
                      {editingTeacher ? 'Update Staff Member' : 'Register Personnel'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}