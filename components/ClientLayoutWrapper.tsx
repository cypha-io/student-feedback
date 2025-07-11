'use client';

import { useState, useEffect, ReactNode } from 'react';
import LoadingScreen from './LoadingScreen';

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownLoading, setHasShownLoading] = useState(false);

  useEffect(() => {
    // Check if loading screen has been shown in this session
    const hasShown = sessionStorage.getItem('hasShownLoadingScreen');
    
    if (hasShown) {
      // If already shown this session, skip loading screen
      setIsLoading(false);
      setHasShownLoading(true);
    } else {
      // Show loading screen for new session
      setIsLoading(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setHasShownLoading(true);
    // Mark as shown for this session
    sessionStorage.setItem('hasShownLoadingScreen', 'true');
  };

  // If loading or first time, show loading screen
  if (isLoading && !hasShownLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Otherwise show the main content
  return <>{children}</>;
}
