'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { House, Subject, Class, Department } from '@/types/database';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'houses' | 'subjects' | 'classes' | 'departments'>('general');
  
  // State for all data types
  const [houses, setHouses] = useState<House[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Website settings state
  const [websiteSettings, setWebsiteSettings] = useState({
    siteName: 'SMEI - Cypha Inc.',
    siteTitle: 'Student-Teacher Evaluation & Management Intelligence',
    academicYear: '2024-2025'
  });
  const [loading, setLoading] = useState(false);

  // Modal states for all entities
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  // Form states for all entities
  const [houseForm, setHouseForm] = useState<Omit<House, 'id'>>({
    name: '',
    color: '#000000',
  });

  const [subjectForm, setSubjectForm] = useState<Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    department: '',
  });

  const [classForm, setClassForm] = useState<Omit<Class, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    year: 1,
    capacity: 30,
  });

  const [departmentForm, setDepartmentForm] = useState<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    head: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Load data on component mount and when tab changes
  useEffect(() => {
    if (activeTab === 'houses') {
      fetchHouses();
    } else if (activeTab === 'subjects') {
      fetchSubjects();
    } else if (activeTab === 'classes') {
      fetchClasses();
    } else if (activeTab === 'departments') {
      fetchDepartments();
    }
    
    // Load website settings from localStorage
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
      setWebsiteSettings(JSON.parse(savedSettings));
    }
  }, [activeTab]);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/houses');
      if (!res.ok) throw new Error('Failed to fetch houses');
      const data = await res.json();
      setHouses(data);
    } catch (error) {
      console.error('❌ Error fetching houses:', error);
      setHouses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subjects');
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      setSubjects(data);
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/classes');
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/departments');
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHouse = async () => {
    try {
      // Validate required fields
      if (!houseForm.name || !houseForm.color) {
        alert('Please fill in all required fields (Name, Color)');
        return;
      }
      
      setLoading(true);
      const url = editingId ? `/api/houses/${editingId}` : '/api/houses';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(houseForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save house');
      }

      await fetchHouses();
      resetHouseForm();
      alert('House saved successfully!');
    } catch (error) {
      console.error('❌ Error saving house:', error);
      alert(`Failed to save house: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const resetHouseForm = () => {
    setHouseForm({
      name: '',
      color: '#000000',
    });
    setEditingId(null);
    setShowHouseModal(false);
  };

  const handleEditHouse = (house: House) => {
    setEditingId(house.id);
    setHouseForm({
      name: house.name,
      color: house.color,
    });
    setShowHouseModal(true);
  };

  const handleDeleteHouse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this house?')) return;

    try {
      const response = await fetch(`/api/houses/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete house');
      setHouses(houses.filter(house => house.id !== id));
      alert('House deleted successfully.');
    } catch (error) {
      console.error('Error deleting house:', error);
      alert('Failed to delete house.');
    }
  };

  // Subject CRUD handlers
  const handleAddSubject = async () => {
    try {
      if (!subjectForm.name || !subjectForm.department) {
        alert('Please fill in all required fields (Name, Department)');
        return;
      }
      
      setLoading(true);
      const url = editingId ? `/api/subjects/${editingId}` : '/api/subjects';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save subject');
      }

      await fetchSubjects();
      resetSubjectForm();
      alert('Subject saved successfully!');
    } catch (error) {
      console.error('❌ Error saving subject:', error);
      alert(`Failed to save subject: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const resetSubjectForm = () => {
    setSubjectForm({ name: '', department: '' });
    setEditingId(null);
    setShowSubjectModal(false);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingId(subject.id);
    setSubjectForm({ name: subject.name, department: subject.department });
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete subject');
      setSubjects(subjects.filter(subject => subject.id !== id));
      alert('Subject deleted successfully.');
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject.');
    }
  };

  // Class CRUD handlers
  const handleAddClass = async () => {
    try {
      if (!classForm.name || !classForm.year || !classForm.capacity) {
        alert('Please fill in all required fields (Name, Year, Capacity)');
        return;
      }
      
      setLoading(true);
      const url = editingId ? `/api/classes/${editingId}` : '/api/classes';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save class');
      }

      await fetchClasses();
      resetClassForm();
      alert('Class saved successfully!');
    } catch (error) {
      console.error('❌ Error saving class:', error);
      alert(`Failed to save class: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const resetClassForm = () => {
    setClassForm({ name: '', year: 1, capacity: 30 });
    setEditingId(null);
    setShowClassModal(false);
  };

  const handleEditClass = (classItem: Class) => {
    setEditingId(classItem.id);
    setClassForm({ name: classItem.name, year: classItem.year, capacity: classItem.capacity });
    setShowClassModal(true);
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete class');
      setClasses(classes.filter(classItem => classItem.id !== id));
      alert('Class deleted successfully.');
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class.');
    }
  };

  // Department CRUD handlers
  const handleAddDepartment = async () => {
    try {
      if (!departmentForm.name || !departmentForm.head) {
        alert('Please fill in all required fields (Name, Head)');
        return;
      }
      
      setLoading(true);
      const url = editingId ? `/api/departments/${editingId}` : '/api/departments';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departmentForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save department');
      }

      await fetchDepartments();
      resetDepartmentForm();
      alert('Department saved successfully!');
    } catch (error) {
      console.error('❌ Error saving department:', error);
      alert(`Failed to save department: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({ name: '', head: '' });
    setEditingId(null);
    setShowDepartmentModal(false);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingId(department.id);
    setDepartmentForm({ name: department.name, head: department.head });
    setShowDepartmentModal(true);
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete department');
      setDepartments(departments.filter(department => department.id !== id));
      alert('Department deleted successfully.');
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department.');
    }
  };

  const tabs = [
    { id: 'general', name: 'General Settings', icon: '⚙️' },
    { id: 'houses', name: 'Houses', icon: '🏠' },
    { id: 'subjects', name: 'Subjects', icon: '📚' },
    { id: 'classes', name: 'Classes', icon: '🎓' },
    { id: 'departments', name: 'Departments', icon: '🏢' },
  ];

  const saveWebsiteSettings = () => {
    localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));
    alert('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage system settings and configuration
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'general' | 'houses' | 'subjects' | 'classes' | 'departments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </span>
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
                    Website Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="website-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website Name
                      </label>
                      <input
                        id="website-name"
                        type="text"
                        value={websiteSettings.siteName}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, siteName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter website name"
                      />
                    </div>
                    <div>
                      <label htmlFor="website-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website Title
                      </label>
                      <input
                        id="website-title"
                        type="text"
                        value={websiteSettings.siteTitle}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, siteTitle: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter website title"
                      />
                    </div>
                    <div>
                      <label htmlFor="academic-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Academic Year
                      </label>
                      <input
                        id="academic-year"
                        type="text"
                        value={websiteSettings.academicYear}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, academicYear: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter academic year"
                      />
                    </div>
                    <button
                      onClick={saveWebsiteSettings}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Houses Management Tab */}
          {activeTab === 'houses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Houses
                </h2>
                <button
                  onClick={() => setShowHouseModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Add House
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          House
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Color
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            Loading houses...
                          </td>
                        </tr>
                      ) : houses.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No houses found. Add your first house!
                          </td>
                        </tr>
                      ) : (
                        houses.map((house) => (
                          <tr key={house.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {house.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <div 
                                  className="w-6 h-6 rounded-full mr-2 border border-gray-300" 
                                  style={{backgroundColor: house.color}}
                                ></div>
                                {house.color}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => handleEditHouse(house)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteHouse(house.id)}
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

          {/* Subjects Management Tab */}
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
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Department</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Created</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="mt-2">Loading subjects...</p>
                            </td>
                          </tr>
                        ) : subjects.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No subjects found. Add your first subject!
                            </td>
                          </tr>
                        ) : (
                          subjects.map((subject) => (
                            <tr key={subject.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="py-4 font-medium text-gray-900 dark:text-white">
                                {subject.name}
                              </td>
                              <td className="py-4 text-gray-600 dark:text-gray-400">
                                {subject.department}
                              </td>
                              <td className="py-4 text-gray-600 dark:text-gray-400">
                                {new Date(subject.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-4 text-sm space-x-2">
                                <button
                                  onClick={() => handleEditSubject(subject)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteSubject(subject.id)}
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
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Year</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Capacity</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Created</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="mt-2">Loading classes...</p>
                            </td>
                          </tr>
                        ) : classes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No classes found. Add your first class!
                            </td>
                          </tr>
                        ) : (
                          classes.map((classItem) => (
                            <tr key={classItem.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="py-4 font-medium text-gray-900 dark:text-white">
                                {classItem.name}
                              </td>
                              <td className="py-4 text-gray-600 dark:text-gray-400">
                                Year {classItem.year}
                              </td>
                              <td className="py-4 text-gray-600 dark:text-gray-400">
                                {classItem.capacity} students
                              </td>
                              <td className="py-4 text-gray-600 dark:text-gray-400">
                                {new Date(classItem.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-4 text-sm space-x-2">
                                <button
                                  onClick={() => handleEditClass(classItem)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(classItem.id)}
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
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Head</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Created</th>
                          <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="mt-2">Loading departments...</p>
                            </td>
                          </tr>
                        ) : departments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No departments found. Add your first department!
                            </td>
                          </tr>
                        ) : (
                          departments.map((department) => (
                            <tr key={department.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="py-4 font-medium text-gray-900 dark:text-white">
                                {department.name}
                              </td>
                              <td className="py-4 text-gray-600 dark:text-gray-400">
                                {department.head}
                              </td>
                              <td className="py-4 text-gray-600 dark:text-gray-400">
                                {new Date(department.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-4 text-sm space-x-2">
                                <button
                                  onClick={() => handleEditDepartment(department)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteDepartment(department.id)}
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
            </div>
          )}
        </div>

        {/* House Modal */}
        {showHouseModal && (
          <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingId ? 'Edit House' : 'Add New House'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="house-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    House Name
                  </label>
                  <input
                    id="house-name"
                    type="text"
                    placeholder="Enter house name"
                    value={houseForm.name}
                    onChange={(e) => setHouseForm({...houseForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="house-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    House Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="house-color"
                      type="color"
                      value={houseForm.color}
                      onChange={(e) => setHouseForm({...houseForm, color: e.target.value})}
                      className="h-10 w-14 p-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      value={houseForm.color}
                      onChange={(e) => setHouseForm({...houseForm, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="#RRGGBB"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={resetHouseForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHouse}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700"
                >
                  {editingId ? 'Update' : 'Add'} House
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <label htmlFor="subject-department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    id="subject-department"
                    type="text"
                    placeholder="Enter department name"
                    value={subjectForm.department}
                    onChange={(e) => setSubjectForm({...subjectForm, department: e.target.value})}
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
                  <label htmlFor="class-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    id="class-year"
                    value={classForm.year}
                    onChange={(e) => setClassForm({...classForm, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
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
                    onChange={(e) => setClassForm({...classForm, capacity: parseInt(e.target.value)})}
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
