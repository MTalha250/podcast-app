"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import Header from "@/components/Header";
import AudioPlayer from "@/components/AudioPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage
    initializeAuth();
  }, [initializeAuth]);

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-background via-background to-card`}
      >
        <div className="min-h-screen flex flex-col relative">
          {/* Animated background elements */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pb-24">{children}</main>
            <AudioPlayer />
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(26, 26, 35, 0.95)",
                color: "#f8fafc",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0.75rem",
                fontSize: "14px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#ffffff",
                },
                style: {
                  background: "rgba(26, 26, 35, 0.95)",
                  color: "#f8fafc",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "0.75rem",
                  fontSize: "14px",
                  backdropFilter: "blur(20px)",
                  boxShadow:
                    "0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(16, 185, 129, 0.1)",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
                style: {
                  background: "rgba(26, 26, 35, 0.95)",
                  color: "#f8fafc",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "0.75rem",
                  fontSize: "14px",
                  backdropFilter: "blur(20px)",
                  boxShadow:
                    "0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(239, 68, 68, 0.1)",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#8b5cf6",
                  secondary: "#ffffff",
                },
                style: {
                  background: "rgba(26, 26, 35, 0.95)",
                  color: "#f8fafc",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "0.75rem",
                  fontSize: "14px",
                  backdropFilter: "blur(20px)",
                  boxShadow:
                    "0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(139, 92, 246, 0.1)",
                },
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
