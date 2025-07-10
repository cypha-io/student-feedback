"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './homepage.module.css';
import CopyrightPopup from '../components/CopyrightPopup';

export default function Home() {
  const [siteName, setSiteName] = useState('EduFeedback System');
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

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${styles.heroBackground}`}>
      <div className={`absolute inset-0 z-0 ${styles.backgroundOverlay}`} />
      
      {/* Subtle Floating Elements */}
      <div className="absolute top-16 left-16 w-8 h-8 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-24 right-24 w-6 h-6 bg-purple-400 rounded-full opacity-10 animate-bounce"></div>
      <div className="absolute top-1/3 right-16 w-4 h-4 bg-indigo-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md z-10">
        {/* Compact Card Container */}
        <div className={`${styles.cardGlass} dark:${styles.cardGlassDark} rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden`}>
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-30 -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-purple-100 to-transparent rounded-full opacity-30 translate-y-6 -translate-x-6"></div>
          
          {/* Compact Header */}
          <div className="text-center space-y-4 relative z-10">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                {siteName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-base">
                Modern education feedback system
              </p>
              <div className="flex items-center justify-center mt-3 space-x-2">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                <div className="h-1 w-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                <div className="h-1 w-2 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="space-y-4 relative z-10">
            {/* Admin Login Button */}
            <button
              onClick={() => router.push('/admin-login')}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Admin Portal</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Student Access Section */}
            <div className={`${styles.studentSectionGlass} dark:${styles.studentSectionGlassDark} rounded-xl p-5 group hover:scale-[1.02] transition-all duration-300`}>
              <div className="flex items-center justify-center mb-3">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3 rounded-xl shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                Student Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center text-sm">
                Share feedback about your teachers
              </p>
              <button
                onClick={() => router.push('/student-feedback')}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Start Feedback</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Compact Footer */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700 relative z-10">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              🔒 Secure •  Anonymous • ✅ Trusted
            </p>
            <div className="flex items-center justify-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">Secure</span>
              </span>
              <span className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">Private</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Popup */}
      <CopyrightPopup />
    </div>
  );
}
