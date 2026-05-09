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
    
    addLog('INFO: Starting database connectivity test...');
    addLog('INFO: Database: Neon PostgreSQL');
    
    // Test each collection
    const collections = Object.entries(COLLECTIONS);
    
    for (const [name, id] of collections) {
      try {
        addLog(`INFO: Testing ${name} collection (${id})...`);
        const result = await dbHelpers.getAll(id);
        addLog(`OK: ${name}: Found ${result.documents.length} documents`);
      } catch (error) {
        addLog(`ERROR: ${name}: ${error}`);
      }
    }
    
    // Test creating a simple department
    try {
      addLog('INFO: Testing department creation...');
      const testDept = {
        name: 'Test Department',
        code: 'TEST',
        head: 'Test Head',
        description: 'Test Description'
      };
      
      const result = await dbHelpers.create(COLLECTIONS.DEPARTMENTS, testDept);
      addLog(`OK: Department created successfully: ${result.id}`);
      
      // Clean up - delete the test department
      await dbHelpers.delete(COLLECTIONS.DEPARTMENTS, result.id);
      addLog('OK: Test department cleaned up');
      
    } catch (error) {
      addLog(`ERROR: Department creation failed: ${error}`);
    }
    
    addLog('INFO: Test completed');
    setLoading(false);
  };

  const testSubjectCreation = async () => {
    setLoading(true);
    addLog('INFO: Testing subject creation...');
    
    try {
      const testSubject = {
        name: 'Test Subject',
        department: 'Test Department'
      };
      
      const result = await dbHelpers.create(COLLECTIONS.SUBJECTS, testSubject);
      addLog(`OK: Subject created successfully: ${result.id}`);
      
      // Clean up
      await dbHelpers.delete(COLLECTIONS.SUBJECTS, result.id);
      addLog('OK: Test subject cleaned up');
      
    } catch (error) {
      addLog(`ERROR: Subject creation failed: ${error}`);
    }
    
    setLoading(false);
  };

  const testClassCreation = async () => {
    setLoading(true);
    addLog('INFO: Testing class creation...');
    
    try {
      const testClass = {
        name: 'Test Class',
        year: 1,
        capacity: 30
      };
      
      const result = await dbHelpers.create(COLLECTIONS.CLASSES, testClass);
      addLog(`OK: Class created successfully: ${result.id}`);
      
      // Clean up
      await dbHelpers.delete(COLLECTIONS.CLASSES, result.id);
      addLog('OK: Test class cleaned up');
      
    } catch (error) {
      addLog(`ERROR: Class creation failed: ${error}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Database Connectivity Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
          
          <div className="bg-gray-50 rounded p-4 h-96 overflow-y-auto">
            <pre className="text-sm text-gray-800">
              {testResults.length === 0 
                ? 'Click a test button to start...' 
                : testResults.join('\n')
              }
            </pre>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Configuration Check:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Database Provider: Neon PostgreSQL</li>
            <li>• DATABASE_URL: {process.env.DATABASE_URL ? 'Set' : 'Not available on client (expected)'}</li>
            <li>• Server-side DB check: Use /api/list-users endpoint</li>
          </ul>
        </div>
      </div>
    </div>
  );
}