'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Teacher, Department, Class as ClassType } from '@/types/database';
import { dbHelpers, COLLECTIONS } from '@/lib/appwrite';

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Omit<Teacher, '$id' | '$createdAt' | '$updatedAt'>>({
    name: '',
    employeeId: '',
    department: '',
    class: '',
    subjects: [],
    email: '',
    phone: '',
  });

  // Load teachers from database on component mount
  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
    fetchClasses();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Attempting to fetch teachers from Appwrite...');
      console.log('Collection ID:', COLLECTIONS.TEACHERS);
      
      const response = await dbHelpers.getAll(COLLECTIONS.TEACHERS);
      console.log('✅ Successfully fetched teachers:', response);
      setTeachers(response.documents as unknown as Teacher[]);
    } catch (error) {
      console.error('❌ Error fetching teachers:', error);
      console.log('📝 Using empty array as fallback');
      // For demo purposes if Appwrite is not configured, use empty array
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('🔍 Fetching departments from database...');
      const response = await dbHelpers.getAll(COLLECTIONS.DEPARTMENTS);
      const deptNames = (response.documents as unknown as Department[]).map(dept => dept.name);
      setDepartments(deptNames);
      console.log('✅ Loaded departments:', deptNames);
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      // Fallback to default options
      setDepartments(['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Art']);
    }
  };

  const fetchClasses = async () => {
    try {
      console.log('🔍 Fetching classes from database...');
      const response = await dbHelpers.getAll(COLLECTIONS.CLASSES);
      const classNames = (response.documents as unknown as ClassType[]).map(cls => cls.name);
      setClasses(classNames);
      console.log('✅ Loaded classes:', classNames);
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      // Fallback to default options
      setClasses(['9th Grade', '10th Grade', '11th Grade', '12th Grade']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      console.log('🚀 Attempting to save teacher to Appwrite...');
      console.log('Form data:', formData);
      console.log('Collection ID:', COLLECTIONS.TEACHERS);
      
      if (editingTeacher) {
        // Update existing teacher
        console.log('📝 Updating teacher with ID:', editingTeacher.$id);
        const updatedTeacher = await dbHelpers.update(COLLECTIONS.TEACHERS, editingTeacher.$id!, formData);
        console.log('✅ Successfully updated teacher:', updatedTeacher);
        setTeachers(teachers.map(teacher => 
          teacher.$id === editingTeacher.$id 
            ? { ...formData, $id: editingTeacher.$id } as Teacher
            : teacher
        ));
      } else {
        // Add new teacher
        console.log('➕ Creating new teacher...');
        const newTeacher = await dbHelpers.create(COLLECTIONS.TEACHERS, formData);
        console.log('✅ Successfully created teacher:', newTeacher);
        setTeachers([...teachers, newTeacher as unknown as Teacher]);
      }
      
      resetForm();
      alert('Teacher saved successfully!');
    } catch (error) {
      console.error('❌ Error saving teacher:', error);
      console.log('📝 Falling back to local state...');
      
      // Show detailed error to user
      alert(`Failed to save to database: ${error}. Data will be saved locally for demo purposes.`);
      
      // For demo purposes, fall back to local state if Appwrite fails
      if (editingTeacher) {
        setTeachers(teachers.map(teacher => 
          teacher.$id === editingTeacher.$id 
            ? { ...formData, $id: editingTeacher.$id } as Teacher
            : teacher
        ));
      } else {
        const newTeacher: Teacher = {
          ...formData,
          $id: Date.now().toString(),
        } as Teacher;
        setTeachers([...teachers, newTeacher]);
      }
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      employeeId: '',
      department: '',
      class: '',
      subjects: [],
      email: '',
      phone: '',
    });
    setEditingTeacher(null);
    setIsModalOpen(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      employeeId: teacher.employeeId,
      department: teacher.department,
      class: teacher.class,
      subjects: teacher.subjects,
      email: teacher.email,
      phone: teacher.phone,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await dbHelpers.delete(COLLECTIONS.TEACHERS, id);
      setTeachers(teachers.filter(teacher => teacher.$id !== id));
    } catch (error) {
      console.error('Error deleting teacher:', error);
      // For demo purposes, fall back to local state if Appwrite fails
      setTeachers(teachers.filter(teacher => teacher.$id !== id));
    }
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const availableSubjects = ['Mathematics', 'Algebra', 'Geometry', 'Physics', 'Chemistry', 'Biology', 'English', 'Literature', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Teachers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, and manage teacher information
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            Add New Teacher
          </button>
        </div>

        {/* Teachers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Teachers List ({teachers.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Teacher Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Department & Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
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
                      Loading teachers...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No teachers found. Add your first teacher!
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                  <tr key={teacher.$id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {teacher.employeeId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {teacher.department}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {teacher.class}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {teacher.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {teacher.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.$id || '')}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Delete
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="teacher-name"
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter employee ID"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      aria-label="Select department"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class
                    </label>
                    <select
                      required
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      aria-label="Select class"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subjects (Select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                    {availableSubjects.map(subject => (
                      <label key={subject} htmlFor={`subject-${subject}`} className="flex items-center space-x-2">
                        <input
                          id={`subject-${subject}`}
                          type="checkbox"
                          checked={formData.subjects.includes(subject)}
                          onChange={() => handleSubjectChange(subject)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select ${subject} subject`}
                          title={`Select ${subject} subject`}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700"
                  >
                    {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}