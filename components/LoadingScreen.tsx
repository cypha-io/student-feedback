'use client';

import { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const loadingTexts = [
    "Initializing SMEI Platform...",
    "Loading Student-Teacher Intelligence...",
    "Connecting to Database Systems...",
    "Preparing Evaluation Modules...",
    "Setting up Analytics Engine...",
    "Configuring Security Protocols...",
    "Loading User Interface...",
    "Finalizing System Components...",
    "Almost Ready..."
  ];

  useEffect(() => {
    // Progress animation - 20 seconds total
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 2 + 1; // Slower progress increment
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }, 800);
          return 100;
        }
        return newProgress;
      });
    }, 200); // 20 seconds = 20000ms, 100 steps = ~200ms per step

    // Text cycling - slower to match longer duration
    const textInterval = setInterval(() => {
      setCurrentText(prev => (prev + 1) % loadingTexts.length);
    }, 3000); // Changed to 3 seconds for longer loading time

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [onComplete, loadingTexts.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className={`absolute top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-lg rotate-45 ${styles['animate-spin-slow']}`}></div>
        <div className={`absolute bottom-32 left-40 w-28 h-28 bg-indigo-500/10 rounded-full ${styles['animate-bounce-slow']}`}></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-cyan-500/10 rounded-lg animate-pulse"></div>
        
        {/* Animated Grid Pattern */}
        <div className={`absolute inset-0 ${styles['bg-grid-pattern']} opacity-5 ${styles['animate-grid-flow']}`}></div>
        
        {/* Floating Particles */}
        <div className={`absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full ${styles['animate-float-1']}`}></div>
        <div className={`absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full ${styles['animate-float-2']}`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full ${styles['animate-float-3']}`}></div>
        <div className={`absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-indigo-400 rounded-full ${styles['animate-float-4']}`}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8 max-w-lg">
        {/* Main Logo/Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            {/* Rotating Outer Ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin"></div>
            <div className={`absolute inset-2 border-4 border-transparent border-b-cyan-400 border-l-indigo-400 rounded-full ${styles['animate-spin-reverse']}`}></div>
            
            {/* Central Icon */}
            <div className="absolute inset-6 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl">
              <div className="relative">
                {/* Brain/Intelligence Icon */}
                <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                
                {/* Pulsing Glow Effect */}
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-8 space-y-4">
          <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent ${styles['animate-fade-in-up']}`}>
            Welcome to SMEI
          </h1>
          
          <div className={`text-xl md:text-2xl font-medium text-blue-200 ${styles['animate-fade-in-up-delay-1']}`}>
            <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Systems Made Easier Initiative
            </span>
          </div>
          
          <div className={`text-sm md:text-base text-gray-300 space-y-1 ${styles['animate-fade-in-up-delay-2']}`}>
            <p>by <span className="font-semibold text-white">Chamba Nanang</span></p>
            <p className="text-blue-200">Cypha Inc.</p>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-8">
          <p className={`text-lg text-gray-300 h-7 ${styles['animate-fade-in-out']}`}>
            {loadingTexts[currentText]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4 overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden ${styles['progress-bar']}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {/* Shimmer Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent ${styles['animate-shimmer']}`}></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              {Math.round(progress)}% Complete
            </p>
            <p className="text-xs text-gray-500">
              ~{Math.max(0, Math.round((100 - progress) / 5))} seconds remaining
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className={`grid grid-cols-3 gap-4 text-center ${styles['animate-fade-in-up-delay-3']}`}>
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400">Evaluation</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400">Analytics</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400">Management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
