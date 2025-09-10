'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { House } from '@/types/database';

export default function ManageHouses() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [formData, setFormData] = useState<Omit<House, 'id'>>({
    name: '',
    color: '',
  });

  useEffect(() => {
    fetchHouses();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = editingHouse ? `/api/houses/${editingHouse.id}` : '/api/houses';
    const method = editingHouse ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save house');
      }

      await fetchHouses();
      resetForm();
      alert('House saved successfully!');
    } catch (error) {
      console.error('❌ Error saving house:', error);
      alert(`Failed to save house: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#000000',
    });
    setEditingHouse(null);
    setIsModalOpen(false);
  };

  const handleEdit = (house: House) => {
    setEditingHouse(house);
    setFormData({
      name: house.name,
      color: house.color,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Houses
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Add, edit, and manage school houses
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              Add New House
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Houses List ({houses.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      House Name
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
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {house.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-300" 
                            style={{ backgroundColor: house.color }}
                          ></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{house.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(house)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(house.id)}
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

          {isModalOpen && (
            <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingHouse ? 'Edit House' : 'Add New House'}
                  </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="house-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      House Name
                    </label>
                    <input
                      id="house-name"
                      type="text"
                      required
                      placeholder="e.g., Gryffindor"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                        required
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="h-10 w-14 p-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      />
                       <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="#RRGGBB"
                      />
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
                      {editingHouse ? 'Update House' : 'Add House'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
