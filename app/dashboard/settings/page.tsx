'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { House, Subject, Class, Department } from '@/types/database';
import { useNotification, showSuccess, showError } from '@/components/NotificationSystem';
import { useConfirmation } from '@/components/ConfirmationDialog';

export default function Settings() {
  const { addNotification } = useNotification();
  const { confirm } = useConfirmation();
  const notifySuccess = useMemo(() => showSuccess(addNotification), [addNotification]);
  const notifyError = useMemo(() => showError(addNotification), [addNotification]);
  
  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'houses' | 'subjects' | 'classes' | 'departments'>('general');
  
  // State for all data types
  const [houses, setHouses] = useState<House[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Website settings state
  const [websiteSettings, setWebsiteSettings] = useState({
    siteName: '',
    siteTitle: 'Student-Teacher Evaluation & Management Intelligence',
    academicYear: '2024-2025'
  });
  const [loading, setLoading] = useState(false);

  // Modal states for all entities
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  // Additional state for subject modal departments
  const [modalDepartments, setModalDepartments] = useState<Department[]>([]);

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

  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    superadmin: ['viewOverview', 'manageTeachers', 'manageQuestions', 'viewReports', 'viewResponses', 'manageSettings', 'manageUsers'],
    manager: ['viewOverview', 'manageTeachers', 'manageQuestions', 'viewReports', 'viewResponses'],
    viewer: ['viewOverview', 'viewReports'],
  });
  const [rolePermissionsSaving, setRolePermissionsSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);



  // Lock background scroll when modals are open
  useEffect(() => {
    if (showHouseModal || showSubjectModal || showClassModal || showDepartmentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showHouseModal, showSubjectModal, showClassModal, showDepartmentModal]);

  const fetchRolePermissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/role-permissions');
      if (!res.ok) throw new Error('Failed to fetch role permissions');
      const data = await res.json();
      if (data?.rolePermissions) {
        setRolePermissions({
          superadmin: data.rolePermissions.superadmin || [],
          manager: data.rolePermissions.manager || [],
          viewer: data.rolePermissions.viewer || [],
        });
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      notifyError('Load Failed', 'Failed to load role permissions.');
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  const allPermissionOptions = [
    { key: 'viewOverview', label: 'View dashboard overview' },
    { key: 'manageTeachers', label: 'Manage teachers' },
    { key: 'manageQuestions', label: 'Manage evaluation questions' },
    { key: 'viewReports', label: 'View performance reports' },
    { key: 'viewResponses', label: 'View student responses' },
    { key: 'manageSettings', label: 'Manage system settings' },
    { key: 'manageUsers', label: 'Manage admin users' },
  ];

  const toggleRolePermission = (role: string, permission: string) => {
    setRolePermissions((current) => {
      const currentPermissions = current[role] || [];
      const nextPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(item => item !== permission)
        : [...currentPermissions, permission];
      return { ...current, [role]: nextPermissions };
    });
  };

  const handleSaveRolePermissions = async () => {
    try {
      setRolePermissionsSaving(true);
      const res = await fetch('/api/admin/role-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolePermissions }),
      });
      if (!res.ok) throw new Error('Failed to save role permissions');
      notifySuccess('Role permissions saved successfully!');
    } catch (error) {
      console.error('Error saving role permissions:', error);
      notifyError('Save Failed', 'Failed to save role permissions.');
    } finally {
      setRolePermissionsSaving(false);
    }
  };

  const fetchHouses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/houses');
      if (!res.ok) throw new Error('Failed to fetch houses');
      const data = await res.json();
      setHouses(data);
    } catch (error) {
      console.error('Error fetching houses:', error);
      setHouses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subjects');
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/classes');
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/departments');
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    } else if (activeTab === 'roles') {
      fetchRolePermissions();
    }
    
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
      setWebsiteSettings(JSON.parse(savedSettings));
    }
  }, [activeTab, fetchHouses, fetchSubjects, fetchClasses, fetchDepartments, fetchRolePermissions]);

  // Fetch departments for subject modal
  const fetchDepartmentsForModal = async () => {
    try {
      const res = await fetch('/api/departments');
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setModalDepartments(data);
    } catch (error) {
      console.error('Error fetching departments for modal:', error);
      setModalDepartments([]);
    }
  };

  const handleAddHouse = async () => {
    try {
      // Validate required fields
      if (!houseForm.name || !houseForm.color) {
        notifyError('Validation Error', 'Please fill in all required fields (Name, Color)');
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
      notifySuccess('House saved successfully!');
    } catch (err) {
      console.error('Error saving house:', err);
      notifyError('Save Failed', `Failed to save house: ${err instanceof Error ? err.message : String(err)}`);
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
    const confirmed = await confirm({
      title: 'Delete House',
      message: 'Are you sure you want to delete this house? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/houses/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete house');
      setHouses(houses.filter(house => house.id !== id));
      notifySuccess('House deleted successfully.');
    } catch (error) {
      console.error('Error deleting house:', error);
      notifyError('Delete Failed', 'Failed to delete house.');
    }
  };

  // Subject CRUD handlers
  const handleAddSubject = async () => {
    try {
      if (!subjectForm.name || !subjectForm.department) {
        notifyError('Validation Error', 'Please fill in all required fields (Name, Department)');
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
      notifySuccess('Subject saved successfully!');
    } catch (err) {
      console.error('Error saving subject:', err);
      notifyError('Save Failed', `Failed to save subject: ${err instanceof Error ? err.message : String(err)}`);
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
    fetchDepartmentsForModal(); // Fetch departments for dropdown
  };

  const handleDeleteSubject = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Subject',
      message: 'Are you sure you want to delete this subject? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete subject');
      setSubjects(subjects.filter(subject => subject.id !== id));
      notifySuccess('Subject deleted successfully.');
    } catch (error) {
      console.error('Error deleting subject:', error);
      notifyError('Delete Failed', 'Failed to delete subject.');
    }
  };

  // Class CRUD handlers
  const handleAddClass = async () => {
    try {
      if (!classForm.name || !classForm.year || !classForm.capacity) {
        notifyError('Validation Error', 'Please fill in all required fields (Name, Year, Capacity)');
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
      notifySuccess('Class saved successfully!');
    } catch (err) {
      console.error('Error saving class:', err);
      notifyError('Save Failed', `Failed to save class: ${err instanceof Error ? err.message : String(err)}`);
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
    const confirmed = await confirm({
      title: 'Delete Class',
      message: 'Are you sure you want to delete this class? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete class');
      setClasses(classes.filter(classItem => classItem.id !== id));
      notifySuccess('Class deleted successfully.');
    } catch (error) {
      console.error('Error deleting class:', error);
      notifyError('Delete Failed', 'Failed to delete class.');
    }
  };

  // Department CRUD handlers
  const handleAddDepartment = async () => {
    try {
      if (!departmentForm.name || !departmentForm.head) {
        notifyError('Validation Error', 'Please fill in all required fields (Name, Head)');
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
      notifySuccess('Department saved successfully!');
    } catch (err) {
      console.error('Error saving department:', err);
      notifyError('Save Failed', `Failed to save department: ${err instanceof Error ? err.message : String(err)}`);
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
    const confirmed = await confirm({
      title: 'Delete Department',
      message: 'Are you sure you want to delete this department? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete department');
      setDepartments(departments.filter(department => department.id !== id));
      notifySuccess('Department deleted successfully.');
    } catch (error) {
      console.error('Error deleting department:', error);
      notifyError('Delete Failed', 'Failed to delete department.');
    }
  };

  const tabs = [
    {
      id: 'general',
      name: 'General Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'roles',
      name: 'Role Permissions',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H6a4 4 0 01-4-4v-2a4 4 0 014-4h1m7 0a4 4 0 100-8 4 4 0 000 8zm-6 0a4 4 0 100-8 4 4 0 000 8z" />
        </svg>
      )
    },
    {
      id: 'houses',
      name: 'Houses',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l9-9 9 9M4 10v10h16V10" />
        </svg>
      )
    },
    {
      id: 'subjects',
      name: 'Subjects',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'classes',
      name: 'Classes',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 20.055a12.083 12.083 0 01-6.16-9.477L12 14z" />
        </svg>
      )
    },
    {
      id: 'departments',
      name: 'Departments',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l8-4 6 3v15M9 9h.01M9 12h.01M9 15h.01M13 12h.01M13 15h.01M13 18h.01" />
        </svg>
      )
    },
  ];

  const saveWebsiteSettings = () => {
    localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));
    notifySuccess('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              System Configuration
            </h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Calibrate system behavior, manage structural entities and access control
            </p>
          </div>
        </div>

        {/* Dynamic Tab Navigation */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-2 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'general' | 'roles' | 'houses' | 'subjects' | 'classes' | 'departments')}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-3 px-4 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-blue-400' : 'text-slate-300 group-hover:text-slate-400'}>
                {tab.icon}
              </span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Main Intelligence View */}
        <div className="animate-fade-in">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity & Branding</h3>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Primary System Identifiers</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Alias</label>
                        <input
                          type="text"
                          value={websiteSettings.siteName}
                          onChange={(e) => setWebsiteSettings({...websiteSettings, siteName: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                          placeholder="e.g. OLAG Academy"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Cycle</label>
                        <input
                          type="text"
                          value={websiteSettings.academicYear}
                          onChange={(e) => setWebsiteSettings({...websiteSettings, academicYear: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                          placeholder="2024 - 2025"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Title</label>
                      <input
                        type="text"
                        value={websiteSettings.siteTitle}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, siteTitle: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="Platform Title"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button
                        onClick={saveWebsiteSettings}
                        className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 hover:shadow-blue-100 active:scale-95"
                      >
                        Apply Global Identity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-black tracking-tight">System Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Connection</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          <span className="text-[10px] font-black uppercase text-emerald-500">Live</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment</span>
                        <span className="text-[10px] font-black uppercase text-blue-400">Production</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                        Settings changed here affect the entire student evaluation portal and administrative dashboard globally.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Governance & Permissions</h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Granular access control matrix</p>
                </div>
                <button
                  onClick={handleSaveRolePermissions}
                  disabled={rolePermissionsSaving}
                  className="px-8 py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95 group"
                >
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${rolePermissionsSaving ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {rolePermissionsSaving ? 'Synchronizing...' : 'Save Matrix'}
                  </div>
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {(['superadmin', 'manager', 'viewer'] as const).map((role) => (
                  <div key={role} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 group hover:border-blue-100 transition-all">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 capitalize tracking-tight">{role}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Level</p>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center font-black text-xs">
                        {rolePermissions[role]?.length || 0}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {allPermissionOptions.map((permission) => (
                        <label key={permission.key} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white cursor-pointer transition-all group/item">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={(rolePermissions[role] || []).includes(permission.key)}
                              onChange={() => toggleRolePermission(role, permission.key)}
                              className="peer h-5 w-5 rounded-lg border-slate-200 text-blue-600 focus:ring-0 appearance-none bg-white transition-all cursor-pointer border-2 checked:bg-blue-600 checked:border-blue-600"
                            />
                            <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest peer-checked:text-slate-900">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structural Tabs (Houses, Subjects, Classes, Departments) */}
          {['houses', 'subjects', 'classes', 'departments'].includes(activeTab) && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight capitalize">{activeTab} Registry</h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Manage institutional {activeTab}</p>
                </div>
                <button
                  onClick={() => {
                    if (activeTab === 'houses') setShowHouseModal(true);
                    if (activeTab === 'subjects') { setShowSubjectModal(true); fetchDepartmentsForModal(); }
                    if (activeTab === 'classes') setShowClassModal(true);
                    if (activeTab === 'departments') setShowDepartmentModal(true);
                  }}
                  className="px-8 py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    New Entry
                  </div>
                </button>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        {activeTab === 'houses' && (
                          <>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">House Identification</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Visual Marker</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </>
                        )}
                        {activeTab === 'subjects' && (
                          <>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Academic Discipline</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Departmental Hub</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Registration Date</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </>
                        )}
                        {activeTab === 'classes' && (
                          <>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Cohort Name</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Level</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Enrollment Cap</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </>
                        )}
                        {activeTab === 'departments' && (
                          <>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Departmental Identity</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Head of Personnel</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Operational Since</th>
                            <th className="py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="py-20 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          </td>
                        </tr>
                      ) : (
                        <>
                          {activeTab === 'houses' && houses.map((house) => (
                            <tr key={house.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-6 px-8 font-bold text-slate-900">{house.name}</td>
                              <td className="py-6 px-8">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-lg shadow-inner border border-slate-100" style={{backgroundColor: house.color}}></div>
                                  <span className="text-[11px] font-black text-slate-400 tracking-widest">{house.color}</span>
                                </div>
                              </td>
                              <td className="py-6 px-8 text-right">
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={() => handleEditHouse(house)} className="p-2.5 bg-white text-slate-400 hover:text-blue-600 hover:shadow-lg rounded-xl border border-slate-50 transition-all group/edit">
                                    <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                  </button>
                                  <button onClick={() => handleDeleteHouse(house.id)} className="p-2.5 bg-white text-slate-400 hover:text-rose-600 hover:shadow-lg rounded-xl border border-slate-50 transition-all group/del">
                                    <svg className="w-4 h-4 group-hover/del:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {activeTab === 'subjects' && subjects.map((subject) => (
                            <tr key={subject.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-6 px-8 font-bold text-slate-900">{subject.name}</td>
                              <td className="py-6 px-8 text-sm font-medium text-slate-500">{subject.department}</td>
                              <td className="py-6 px-8 text-xs font-bold text-slate-400">{new Date(subject.createdAt).toLocaleDateString()}</td>
                              <td className="py-6 px-8 text-right">
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={() => handleEditSubject(subject)} className="p-2.5 bg-white text-slate-400 hover:text-blue-600 hover:shadow-lg rounded-xl border border-slate-50 transition-all group/edit">
                                    <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                  </button>
                                  <button onClick={() => handleDeleteSubject(subject.id)} className="p-2.5 bg-white text-slate-400 hover:text-rose-600 hover:shadow-lg rounded-xl border border-slate-50 transition-all group/del">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {activeTab === 'classes' && classes.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-6 px-8 font-bold text-slate-900">{item.name}</td>
                              <td className="py-6 px-8"><span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Level {item.year}</span></td>
                              <td className="py-6 px-8 text-center text-sm font-black text-slate-900">{item.capacity}</td>
                              <td className="py-6 px-8 text-right">
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={() => handleEditClass(item)} className="p-2.5 bg-white text-slate-400 hover:text-blue-600 hover:shadow-lg rounded-xl border border-slate-50 transition-all group/edit">
                                    <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                  </button>
                                  <button onClick={() => handleDeleteClass(item.id)} className="p-2.5 bg-white text-slate-400 hover:text-rose-600 hover:shadow-lg rounded-xl border border-slate-50 transition-all group/del">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {activeTab === 'departments' && departments.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-6 px-8 font-bold text-slate-900">{item.name}</td>
                              <td className="py-6 px-8 text-sm font-medium text-slate-500">{item.head}</td>
                              <td className="py-6 px-8 text-xs font-bold text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                              <td className="py-6 px-8 text-right">
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                  <button onClick={() => handleEditDepartment(item)} className="p-2.5 bg-white text-slate-400 hover:text-blue-600 hover:shadow-lg rounded-xl border border-slate-50 transition-all group/edit">
                                    <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                  </button>
                                  <button onClick={() => handleDeleteDepartment(item.id)} className="p-2.5 bg-white text-slate-400 hover:text-rose-600 hover:shadow-lg rounded-xl border border-slate-50 transition-all group/del">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Intelligence Modals */}
        {showHouseModal && (
          <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={resetHouseForm}></div>
              <div className="relative bg-white rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-md sm:w-full border border-white/20">
                <div className="px-10 py-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">
                    {editingId ? 'Refine House' : 'New House Assignment'}
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Label</label>
                      <input
                        type="text"
                        placeholder="e.g. St. Thomas Aquinas"
                        value={houseForm.name}
                        onChange={(e) => setHouseForm({...houseForm, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Color Representation</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={houseForm.color}
                          onChange={(e) => setHouseForm({...houseForm, color: e.target.value})}
                          className="h-14 w-14 p-1 bg-white border border-slate-200 rounded-2xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={houseForm.color}
                          onChange={(e) => setHouseForm({...houseForm, color: e.target.value})}
                          className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-600"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={resetHouseForm} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Abort</button>
                      <button onClick={handleAddHouse} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200">Commit</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSubjectModal && (
          <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={resetSubjectForm}></div>
              <div className="relative bg-white rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-md sm:w-full border border-white/20">
                <div className="px-10 py-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">
                    {editingId ? 'Edit Discipline' : 'Provision New Subject'}
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Nomenclature</label>
                      <input
                        type="text"
                        placeholder="e.g. Advanced Physics"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Departmental Hub</label>
                      <select
                        value={subjectForm.department}
                        onChange={(e) => setSubjectForm({...subjectForm, department: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold appearance-none"
                      >
                        <option value="">Select Department</option>
                        {modalDepartments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={resetSubjectForm} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Abort</button>
                      <button onClick={handleAddSubject} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200">Commit</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showClassModal && (
          <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={resetClassForm}></div>
              <div className="relative bg-white rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-md sm:w-full border border-white/20">
                <div className="px-10 py-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">
                    {editingId ? 'Edit Cohort' : 'Establish New Class'}
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cohort Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Science 1A"
                        value={classForm.name}
                        onChange={(e) => setClassForm({...classForm, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                        <select
                          value={classForm.year}
                          onChange={(e) => setClassForm({...classForm, year: parseInt(e.target.value)})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                        >
                          {[1, 2, 3].map(v => <option key={v} value={v}>Year {v}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Capacity</label>
                        <input
                          type="number"
                          value={classForm.capacity}
                          onChange={(e) => setClassForm({...classForm, capacity: parseInt(e.target.value)})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={resetClassForm} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Abort</button>
                      <button onClick={handleAddClass} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200">Commit</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDepartmentModal && (
          <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={resetDepartmentForm}></div>
              <div className="relative bg-white rounded-[3rem] text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-md sm:w-full border border-white/20">
                <div className="px-10 py-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">
                    {editingId ? 'Edit Department' : 'Authorize New Department'}
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Departmental Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mathematics Hub"
                        value={departmentForm.name}
                        onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Head of Personnel</label>
                      <input
                        type="text"
                        placeholder="Name of Department Head"
                        value={departmentForm.head}
                        onChange={(e) => setDepartmentForm({...departmentForm, head: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={resetDepartmentForm} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Abort</button>
                      <button onClick={handleAddDepartment} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200">Commit</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
