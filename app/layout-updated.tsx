import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WebsiteSettingsProvider } from '@/lib/websiteSettings';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Student Feedback System',
  description: 'Modern student feedback management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebsiteSettingsProvider>
          {children}
        </WebsiteSettingsProvider>
      </body>
    </html>
  );
}