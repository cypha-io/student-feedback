'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WebsiteSettings {
  siteName: string;
  siteTitle: string;
  academicYear: string;
}

interface WebsiteSettingsContextType {
  settings: WebsiteSettings;
  updateSettings: (newSettings: WebsiteSettings) => void;
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType | undefined>(undefined);

export function WebsiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteName: 'EduFeedback System',
    siteTitle: 'Student Feedback Portal',
    academicYear: '2024-2025'
  });

  useEffect(() => {
    // Load settings from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
    }
  }, []);

  const updateSettings = (newSettings: WebsiteSettings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('websiteSettings', JSON.stringify(newSettings));
    }
  };

  return (
    <WebsiteSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  const context = useContext(WebsiteSettingsContext);
  if (context === undefined) {
    throw new Error('useWebsiteSettings must be used within a WebsiteSettingsProvider');
  }
  return context;
}