'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new teacher evaluation reports page
    router.replace('/dashboard/teacher-evaluation-reports');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Teacher Evaluation Reports...</p>
      </div>
    </div>
  );
}
