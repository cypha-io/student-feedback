'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { dbHelpers, COLLECTIONS } from '@/lib/appwrite';
import { Subject as SubjectType, Class as ClassType, Department as DepartmentType } from '@/types/database';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'classes' | 'departments' | 'general'>('general');
  
  // State for data
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  // Form states
  const [subjectForm, setSubjectForm] = useState<Omit<SubjectType, '$id' | '$createdAt' | '$updatedAt'>>({ 
    name: '', 
    code: '', 
    department: '', 
    credits: 0 
  });
  const [classForm, setClassForm] = useState<Omit<ClassType, '$id' | '$createdAt' | '$updatedAt'>>({ 
    name: '', 
    grade: '', 
    section: '', 
    capacity: 0 
  });
  const [departmentForm, setDepartmentForm] = useState<Omit<DepartmentType, '$id' | '$createdAt' | '$updatedAt'>>({ 
    name: '', 
    code: '', 
    head: '', 
    description: '' 
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects();
    } else if (activeTab === 'classes') {
      fetchClasses();
    } else if (activeTab === 'departments') {
      fetchDepartments();
    }
  }, [activeTab]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await dbHelpers.getAll(COLLECTIONS.SUBJECTS);
      setSubjects(response.documents as unknown as SubjectType[]);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Use mock data if Appwrite is not configured
      setSubjects([
        { $id: '1', name: 'Mathematics', code: 'MATH101', department: 'Mathematics', credits: 3 },
        { $id: '2', name: 'Physics', code: 'PHY101', department: 'Science', credits: 4 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await dbHelpers.getAll(COLLECTIONS.CLASSES);
      setClasses(response.documents as unknown as ClassType[]);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Use mock data if Appwrite is not configured
      setClasses([
        { $id: '1', name: '9th Grade A', grade: '9th', section: 'A', capacity: 30 },
        { $id: '2', name: '10th Grade B', grade: '10th', section: 'B', capacity: 28 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await dbHelpers.getAll(COLLECTIONS.DEPARTMENTS);
      setDepartments(response.documents as unknown as DepartmentType[]);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Use mock data if Appwrite is not configured
      setDepartments([
        { $id: '1', name: 'Mathematics', code: 'MATH', head: 'Dr. John Smith', description: 'Mathematics Department' },
        { $id: '2', name: 'Science', code: 'SCI', head: 'Dr. Sarah Johnson', description: 'Science Department' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General Settings', icon: '⚙️' },
    { id: 'subjects', name: 'Subjects', icon: '📚' },
    { id: 'classes', name: 'Classes', icon: '🏫' },
    { id: 'departments', name: 'Departments', icon: '🏢' },
  ];

  const handleAddSubject = async () => {
    try {
      if (editingId) {
        await dbHelpers.update(COLLECTIONS.SUBJECTS, editingId, subjectForm);
        setSubjects(subjects.map(s => s.$id === editingId ? { ...s, ...subjectForm } : s));
      } else {
        const newSubject = await dbHelpers.create(COLLECTIONS.SUBJECTS, subjectForm);
        setSubjects([...subjects, newSubject as unknown as SubjectType]);
      }
      resetSubjectForm();
    } catch (error) {
      console.error('Error saving subject:', error);
      // For demo purposes, add to local state if Appwrite fails
      if (editingId) {
        setSubjects(subjects.map(s => s.$id === editingId ? { ...s, ...subjectForm } : s));
      } else {
        const newSubject: SubjectType = { $id: Date.now().toString(), ...subjectForm };
        setSubjects([...subjects, newSubject]);
      }
      resetSubjectForm();
    }
  };

  const handleAddClass = async () => {
    try {
      if (editingId) {
        await dbHelpers.update(COLLECTIONS.CLASSES, editingId, classForm);
        setClasses(classes.map(c => c.$id === editingId ? { ...c, ...classForm } : c));
      } else {
        const newClass = await dbHelpers.create(COLLECTIONS.CLASSES, classForm);
        setClasses([...classes, newClass as unknown as ClassType]);
      }
      resetClassForm();
    } catch (error) {
      console.error('Error saving class:', error);
      // For demo purposes, add to local state if Appwrite fails
      if (editingId) {
        setClasses(classes.map(c => c.$id === editingId ? { ...c, ...classForm } : c));
      } else {
        const newClass: ClassType = { $id: Date.now().toString(), ...classForm };
        setClasses([...classes, newClass]);
      }
      resetClassForm();
    }
  };

  const handleAddDepartment = async () => {
    try {
      if (editingId) {
        await dbHelpers.update(COLLECTIONS.DEPARTMENTS, editingId, departmentForm);
        setDepartments(departments.map(d => d.$id === editingId ? { ...d, ...departmentForm } : d));
      } else {
        const newDepartment = await dbHelpers.create(COLLECTIONS.DEPARTMENTS, departmentForm);
        setDepartments([...departments, newDepartment as unknown as DepartmentType]);
      }
      resetDepartmentForm();
    } catch (error) {
      console.error('Error saving department:', error);
      // For demo purposes, add to local state if Appwrite fails
      if (editingId) {
        setDepartments(departments.map(d => d.$id === editingId ? { ...d, ...departmentForm } : d));
      } else {
        const newDepartment: DepartmentType = { $id: Date.now().toString(), ...departmentForm };
        setDepartments([...departments, newDepartment]);
      }
      resetDepartmentForm();
    }
  };

  const resetSubjectForm = () => {
    setSubjectForm({ name: '', code: '', department: '', credits: 0 });
    setShowSubjectModal(false);
    setEditingId(null);
  };

  const resetClassForm = () => {
    setClassForm({ name: '', grade: '', section: '', capacity: 0 });
    setShowClassModal(false);
    setEditingId(null);
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({ name: '', code: '', head: '', description: '' });
    setShowDepartmentModal(false);
    setEditingId(null);
  };

  const handleEdit = (type: 'subject' | 'class' | 'department', item: SubjectType | ClassType | DepartmentType) => {
    setEditingId(item.$id!);
    if (type === 'subject') {
      const subject = item as SubjectType;
      setSubjectForm({ name: subject.name, code: subject.code, department: subject.department, credits: subject.credits });
      setShowSubjectModal(true);
    } else if (type === 'class') {
      const cls = item as ClassType;
      setClassForm({ name: cls.name, grade: cls.grade, section: cls.section, capacity: cls.capacity });
      setShowClassModal(true);
    } else if (type === 'department') {
      const dept = item as DepartmentType;
      setDepartmentForm({ name: dept.name, code: dept.code, head: dept.head, description: dept.description });
      setShowDepartmentModal(true);
    }
  };

  const handleDelete = async (type: 'subject' | 'class' | 'department', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'subject') {
        await dbHelpers.delete(COLLECTIONS.SUBJECTS, id);
        setSubjects(subjects.filter(s => s.$id !== id));
      } else if (type === 'class') {
        await dbHelpers.delete(COLLECTIONS.CLASSES, id);
        setClasses(classes.filter(c => c.$id !== id));
      } else if (type === 'department') {
        await dbHelpers.delete(COLLECTIONS.DEPARTMENTS, id);
        setDepartments(departments.filter(d => d.$id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      // For demo purposes, remove from local state if Appwrite fails
      if (type === 'subject') {
        setSubjects(subjects.filter(s => s.$id !== id));
      } else if (type === 'class') {
        setClasses(classes.filter(c => c.$id !== id));
      } else if (type === 'department') {
        setDepartments(departments.filter(d => d.$id !== id));
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings & Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage system settings, subjects, classes, and departments
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'subjects' | 'classes' | 'departments' | 'general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    System Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="system-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        System Name
                      </label>
                      <input
                        id="system-name"
                        type="text"
                        defaultValue="EduFeedback System"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="academic-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Academic Year
                      </label>
                      <select 
                        id="academic-year"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        aria-label="Select academic year"
                      >
                        <option>2024-2025</option>
                        <option>2023-2024</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Notification Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="email-notifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </label>
                      <input 
                        id="email-notifications"
                        type="checkbox" 
                        defaultChecked 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="sms-notifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        SMS Notifications
                      </label>
                      <input 
                        id="sms-notifications"
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subject Management Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Subjects
                </h2>
                <button
                  onClick={() => setShowSubjectModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Add Subject
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            Loading subjects...
                          </td>
                        </tr>
                      ) : subjects.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No subjects found. Add your first subject!
                          </td>
                        </tr>
                      ) : (
                        subjects.map((subject) => (
                          <tr key={subject.$id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {subject.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {subject.code}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {subject.department}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {subject.credits}
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => handleEdit('subject', subject)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete('subject', subject.$id!)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Classes Management Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Classes
                </h2>
                <button
                  onClick={() => setShowClassModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Add Class
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Class Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            Loading classes...
                          </td>
                        </tr>
                      ) : classes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No classes found. Add your first class!
                          </td>
                        </tr>
                      ) : (
                        classes.map((cls) => (
                          <tr key={cls.$id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {cls.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {cls.grade}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {cls.section}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {cls.capacity}
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => handleEdit('class', cls)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete('class', cls.$id!)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Departments Management Tab */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Departments
                </h2>
                <button
                  onClick={() => setShowDepartmentModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Add Department
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Head
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            Loading departments...
                          </td>
                        </tr>
                      ) : departments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No departments found. Add your first department!
                          </td>
                        </tr>
                      ) : (
                        departments.map((dept) => (
                          <tr key={dept.$id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {dept.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {dept.code}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {dept.head}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {dept.description}
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => handleEdit('department', dept)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete('department', dept.$id!)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subject Modal */}
        {showSubjectModal && (
          <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Subject' : 'Add New Subject'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="subject-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject Name
                  </label>
                  <input
                    id="subject-name"
                    type="text"
                    placeholder="Enter subject name"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="subject-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject Code
                  </label>
                  <input
                    id="subject-code"
                    type="text"
                    placeholder="Enter subject code"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="subject-department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <select
                    id="subject-department"
                    value={subjectForm.department}
                    onChange={(e) => setSubjectForm({...subjectForm, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.$id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="subject-credits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credits
                  </label>
                  <input
                    id="subject-credits"
                    type="number"
                    placeholder="Enter credits"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({...subjectForm, credits: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={resetSubjectForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubject}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700"
                >
                  {editingId ? 'Update' : 'Add'} Subject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Class Modal */}
        {showClassModal && (
          <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Class' : 'Add New Class'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="class-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Name
                  </label>
                  <input
                    id="class-name"
                    type="text"
                    placeholder="Enter class name"
                    value={classForm.name}
                    onChange={(e) => setClassForm({...classForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="class-grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grade
                  </label>
                  <select
                    id="class-grade"
                    value={classForm.grade}
                    onChange={(e) => setClassForm({...classForm, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Grade</option>
                    <option value="1st">1st Grade</option>
                    <option value="2nd">2nd Grade</option>
                    <option value="3rd">3rd Grade</option>
                    <option value="4th">4th Grade</option>
                    <option value="5th">5th Grade</option>
                    <option value="6th">6th Grade</option>
                    <option value="7th">7th Grade</option>
                    <option value="8th">8th Grade</option>
                    <option value="9th">9th Grade</option>
                    <option value="10th">10th Grade</option>
                    <option value="11th">11th Grade</option>
                    <option value="12th">12th Grade</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="class-section" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section
                  </label>
                  <select
                    id="class-section"
                    value={classForm.section}
                    onChange={(e) => setClassForm({...classForm, section: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                    <option value="E">Section E</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="class-capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity
                  </label>
                  <input
                    id="class-capacity"
                    type="number"
                    placeholder="Enter class capacity"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({...classForm, capacity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={resetClassForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClass}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700"
                >
                  {editingId ? 'Update' : 'Add'} Class
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Department Modal */}
        {showDepartmentModal && (
          <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Department' : 'Add New Department'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="department-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department Name
                  </label>
                  <input
                    id="department-name"
                    type="text"
                    placeholder="Enter department name"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="department-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department Code
                  </label>
                  <input
                    id="department-code"
                    type="text"
                    placeholder="Enter department code"
                    value={departmentForm.code}
                    onChange={(e) => setDepartmentForm({...departmentForm, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="department-head" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department Head
                  </label>
                  <input
                    id="department-head"
                    type="text"
                    placeholder="Enter department head name"
                    value={departmentForm.head}
                    onChange={(e) => setDepartmentForm({...departmentForm, head: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="department-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="department-description"
                    placeholder="Enter department description"
                    value={departmentForm.description}
                    onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={resetDepartmentForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700"
                >
                  {editingId ? 'Update' : 'Add'} Department
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}