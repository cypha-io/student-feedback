import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import { NotificationProvider } from "../components/NotificationSystem";
import { ConfirmationProvider } from "../components/ConfirmationDialog";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
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
        className={`${inter.variable} ${robotoMono.variable} antialiased font-sans`}
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
