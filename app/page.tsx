"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [siteName, setSiteName] = useState('EduFeedback System');
  const [testResult, setTestResult] = useState<string | null>(null);
  const router = useRouter();

  // Load site name from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setSiteName(settings.siteName || 'EduFeedback System');
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    }
  }, []);

  // Test DB communication (fetch users from Appwrite Auth via API route)
  const handleTestUser = async () => {
    setTestResult('Testing...');
    try {
      const res = await fetch('/api/list-users');
      const data = await res.json();
      if (res.ok) {
        setTestResult(`Fetched ${data.count} users from Appwrite Auth.`);
      } else {
        setTestResult('Cannot communicate with Appwrite Auth.');
      }
    } catch {
      setTestResult('Cannot communicate with Appwrite DB.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center" style={{ backgroundImage: "url('https://olagshs.edu.gh/wp-content/uploads/2024/12/olag-shs-2024-brast-cancer-program-16-scaled.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-0" />
      <div className="w-full max-w-md z-10">
        {/* Card Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {siteName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Welcome to the feedback system
              </p>
            </div>
          </div>

          {/* Admin Login Button */}
          <div className="flex flex-col items-center space-y-4 mt-8">
            <button
              onClick={() => router.push('/admin-login')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Admin Login
            </button>
          </div>

          {/* Student Access Section */}
          <div className="text-center mt-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Are you a student?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Provide feedback for your teachers and courses
              </p>
              <button
                onClick={() => router.push('/student-feedback')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Student Feedback Form</span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            <button
              type="button"
              onClick={handleTestUser}
              className="mt-4 px-4 py-2 bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-white rounded shadow"
            >
              Test Appwrite DB Communication
            </button>
            {testResult && (
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">{testResult}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
