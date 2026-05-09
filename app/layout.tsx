import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import { NotificationProvider } from "../components/NotificationSystem";
import { ConfirmationProvider } from "../components/ConfirmationDialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMEI | Teacher Feedback System | OLAGSHS",
  description: "Student-Teacher Evaluation & Management Intelligence by SwapGPA Technologies Limited. Deployed for Our Lady of Grace Senior High School (OLAGSHS)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <ConfirmationProvider>
              <ClientLayoutWrapper>
                {children}
              </ClientLayoutWrapper>
            </ConfirmationProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
