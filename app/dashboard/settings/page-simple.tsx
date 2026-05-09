'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { House } from '@/types/database';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'houses'>('houses');
  
  // State for houses data
  const [houses, setHouses] = useState<House[]>([]);

  // Website settings state
  const [websiteSettings, setWebsiteSettings] = useState({
    siteName: '',
    siteTitle: 'Student-Teacher Evaluation & Management Intelligence',
    academicYear: '2024-2025'
  });
  const [loading, setLoading] = useState(false);

  // House modal states
  const [showHouseModal, setShowHouseModal] = useState(false);

  // House form states
  const [houseForm, setHouseForm] = useState<Omit<House, 'id'>>({
    name: '',
    color: '#000000',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'houses') {
      fetchHouses();
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
      console.error('Error fetching houses:', error);
      setHouses([]);
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
      console.error('Error saving house:', error);
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

  const tabs = [
    {
      id: 'general',
      name: 'General Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'houses',
      name: 'Houses',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M4 10v10h16V10" />
        </svg>
      )
    },
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
            <h1 className="text-3xl font-bold text-gray-900">
              Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage system settings and configuration
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'general' | 'houses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Website Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="website-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Website Name
                      </label>
                      <input
                        id="website-name"
                        type="text"
                        value={websiteSettings.siteName}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, siteName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter website name"
                      />
                    </div>
                    <div>
                      <label htmlFor="website-title" className="block text-sm font-medium text-gray-700 mb-2">
                        Website Title
                      </label>
                      <input
                        id="website-title"
                        type="text"
                        value={websiteSettings.siteTitle}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, siteTitle: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter website title"
                      />
                    </div>
                    <div>
                      <label htmlFor="academic-year" className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year
                      </label>
                      <input
                        id="academic-year"
                        type="text"
                        value={websiteSettings.academicYear}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, academicYear: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Manage Houses
                </h2>
                <button
                  onClick={() => setShowHouseModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Add House
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          House
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Color
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                            Loading houses...
                          </td>
                        </tr>
                      ) : houses.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                            No houses found. Add your first house!
                          </td>
                        </tr>
                      ) : (
                        houses.map((house) => (
                          <tr key={house.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {house.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full mr-2 border border-gray-300" style={{ backgroundColor: house.color }}></div>
                                {house.color}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => handleEditHouse(house)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteHouse(house.id)}
                                className="text-red-600 hover:text-red-800"
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

        {/* House Modal */}
        {showHouseModal && (
          <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit House' : 'Add New House'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="house-name" className="block text-sm font-medium text-gray-700 mb-2">
                    House Name
                  </label>
                  <input
                    id="house-name"
                    type="text"
                    placeholder="Enter house name"
                    value={houseForm.name}
                    onChange={(e) => setHouseForm({...houseForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="house-color" className="block text-sm font-medium text-gray-700 mb-2">
                    House Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="house-color"
                      type="color"
                      value={houseForm.color}
                      onChange={(e) => setHouseForm({...houseForm, color: e.target.value})}
                      className="h-10 w-14 p-1 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={houseForm.color}
                      onChange={(e) => setHouseForm({...houseForm, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#RRGGBB"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={resetHouseForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
      </div>
    </DashboardLayout>
  );
}
