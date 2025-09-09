'use client';

import { useState } from 'react';
import { dbHelpers, COLLECTIONS } from '@/lib/neon';

export default function DatabaseTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    addLog('🔍 Starting database connectivity test...');
    addLog(`📊 Database: Neon PostgreSQL`);
    
    // Test each collection
    const collections = Object.entries(COLLECTIONS);
    
    for (const [name, id] of collections) {
      try {
        addLog(`📖 Testing ${name} collection (${id})...`);
        const result = await dbHelpers.getAll(id);
        addLog(`✅ ${name}: Found ${result.documents.length} documents`);
      } catch (error) {
        addLog(`❌ ${name}: Error - ${error}`);
      }
    }
    
    // Test creating a simple department
    try {
      addLog('🧪 Testing department creation...');
      const testDept = {
        name: 'Test Department',
        code: 'TEST',
        head: 'Test Head',
        description: 'Test Description'
      };
      
      const result = await dbHelpers.create(COLLECTIONS.DEPARTMENTS, testDept);
      addLog(`✅ Department created successfully: ${result.id}`);
      
      // Clean up - delete the test department
      await dbHelpers.delete(COLLECTIONS.DEPARTMENTS, result.id);
      addLog(`🗑️ Test department cleaned up`);
      
    } catch (error) {
      addLog(`❌ Department creation failed: ${error}`);
    }
    
    addLog('🏁 Test completed');
    setLoading(false);
  };

  const testSubjectCreation = async () => {
    setLoading(true);
    addLog('🧪 Testing subject creation...');
    
    try {
      const testSubject = {
        name: 'Test Subject',
        code: 'TEST101',
        department: 'Test Department',
        credits: 3
      };
      
      const result = await dbHelpers.create(COLLECTIONS.SUBJECTS, testSubject);
      addLog(`✅ Subject created successfully: ${result.id}`);
      
      // Clean up
      await dbHelpers.delete(COLLECTIONS.SUBJECTS, result.id);
      addLog(`🗑️ Test subject cleaned up`);
      
    } catch (error) {
      addLog(`❌ Subject creation failed: ${error}`);
    }
    
    setLoading(false);
  };

  const testClassCreation = async () => {
    setLoading(true);
    addLog('🧪 Testing class creation...');
    
    try {
      const testClass = {
        name: 'Test Year 1 A',
        grade: 'Year 1',
        section: 'A',
        capacity: 30
      };
      
      const result = await dbHelpers.create(COLLECTIONS.CLASSES, testClass);
      addLog(`✅ Class created successfully: ${result.id}`);
      
      // Clean up
      await dbHelpers.delete(COLLECTIONS.CLASSES, result.id);
      addLog(`🗑️ Test class cleaned up`);
      
    } catch (error) {
      addLog(`❌ Class creation failed: ${error}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Database Connectivity Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={testDatabaseConnection}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test All Collections
            </button>
            
            <button
              onClick={testSubjectCreation}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Subject Creation
            </button>
            
            <button
              onClick={testClassCreation}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Class Creation
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 h-96 overflow-y-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-200">
              {testResults.length === 0 
                ? 'Click a test button to start...' 
                : testResults.join('\n')
              }
            </pre>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Configuration Check:
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Endpoint: {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not set'}</li>
            <li>• Project ID: {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not set'}</li>
            <li>• Database ID: {process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'Not set'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}