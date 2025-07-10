'use client';

import { useState, useEffect } from 'react';

interface CopyrightPopupProps {
  showOnMount?: boolean;
}

export default function CopyrightPopup({ showOnMount = true }: CopyrightPopupProps) {
  const [showCopyrightPopup, setShowCopyrightPopup] = useState(false);

  useEffect(() => {
    if (!showOnMount) return;

    if (typeof window !== 'undefined') {
      const hasSeenCopyright = localStorage.getItem('hasSeenCopyright');
      if (!hasSeenCopyright) {
        // Show popup after a brief delay
        const showTimer = setTimeout(() => {
          setShowCopyrightPopup(true);
        }, 1000);

        // Auto-close popup after 9 seconds (1 second delay + 8 seconds display)
        const closeTimer = setTimeout(() => {
          setShowCopyrightPopup(false);
          localStorage.setItem('hasSeenCopyright', 'true');
        }, 11000);

        return () => {
          clearTimeout(showTimer);
          clearTimeout(closeTimer);
        };
      }
    }
  }, [showOnMount]);

  if (!showCopyrightPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4 transform animate-scale-up">
        {/* Header with Ghana Coat of Arms */}
        <div className="text-center mb-4">
          {/* Ghana Coat of Arms */}
          <div className="mx-auto w-20 h-20 mb-4 relative">
            <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 via-red-500 to-green-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-700">
              {/* Ghana Coat of Arms representation */}
              <div className="text-center">
                <div className="text-white font-bold text-xs">🇬🇭</div>
                <div className="text-white text-[8px] font-bold mt-1">GHANA</div>
              </div>
            </div>
            {/* Tech Badge */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            System Information
          </h3>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          {/* Ghana Software Laws Notice */}
          <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 dark:from-red-900/20 dark:via-yellow-900/20 dark:to-green-900/20 rounded-xl p-4 border-2 border-gradient-to-r from-red-200 via-yellow-200 to-green-200 dark:border-red-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              🇬🇭 Subject to Ghana Software Laws
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              This system operates under the jurisdiction of Ghana&apos;s software and intellectual property regulations.
            </p>
          </div>

          {/* Developer Attribution */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
              This system was built by
            </p>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Chamba Nanang
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Software Engineer
            </p>
          </div>

          {/* Legal Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold">⚠️ Important Notice:</span><br />
              This system is subject to the original developer unless a contract is signed to release it to a third party.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-1.5 rounded-full animate-progress-bar-long"></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This message will close automatically in 8 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
