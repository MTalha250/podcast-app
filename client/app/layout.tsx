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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-24">{children}</main>
          <AudioPlayer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
