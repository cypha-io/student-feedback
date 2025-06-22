'use client';

import { WebsiteSettingsProvider } from '@/lib/websiteSettings';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <WebsiteSettingsProvider>
      {children}
    </WebsiteSettingsProvider>
  );
}