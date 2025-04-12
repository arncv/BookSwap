import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext"; // Import AuthProvider
import Navbar from "@/components/Navbar"; // Import Navbar
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookSwap - Peer-to-Peer Book Exchange", // Updated title
  description: "Exchange books with others in your community.", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <AuthProvider>
          <Navbar /> {/* Add Navbar here */}
          <main className="flex-grow container mx-auto px-4 py-6"> {/* Adjusted padding */}
            {children}
          </main>
          {/* Optional: Add a Footer component here */}
        </AuthProvider>
      </body>
    </html>
  );
}
