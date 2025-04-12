'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext'; // Assuming AuthContext is in src/context

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if finished loading and no user is logged in
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <p className="text-lg text-purple-300">Loading dashboard...</p>
      </div>
    );
  }

  // If user is null after loading, the useEffect hook should have redirected.
  // Render null or a placeholder while redirecting.
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-3 text-purple-800">Dashboard</h1>
        <p className="text-xl mb-8 text-purple-400">Welcome back, <span className="font-semibold text-purple-700">{user.name}</span>!</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {user.role === 'Owner' && (
            <div className="bg-white border border-purple-100 rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-600 px-6 py-3">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Owner Actions
                </h2>
              </div>
              <div className="px-6 py-4">
                <p className="mb-4 text-purple-500">As an Owner, you can manage your book listings and track exchanges.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/add-book" className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Book
                  </Link>
                  <Link href="#" className="inline-flex items-center bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Listings
                  </Link>
                </div>
              </div>
            </div>
          )}

          {user.role === 'Seeker' && (
            <div className="bg-white border border-purple-100 rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-600 px-6 py-3">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Seeker Actions
                </h2>
              </div>
              <div className="px-6 py-4">
                <p className="mb-4 text-purple-500">As a Seeker, you can discover and browse books available for exchange.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/" className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Browse All Books
                  </Link>
                  <Link href="#" className="inline-flex items-center bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved Books
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-purple-100 rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-600 px-6 py-3">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Activity
              </h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-purple-500 mb-3">Track your recent book exchanges and activities.</p>
              <div className="border-t border-purple-100 pt-3 text-center">
                <p className="text-purple-400 italic">No recent activity to display</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Features Section */}
        <div className="bg-gradient-to-r from-white to-white p-6 rounded-lg border border-purple-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-3 text-purple-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Coming Soon
          </h2>
          <p className="text-purple-500 mb-2">We're working on exciting new features for BookSwap:</p>
          <ul className="list-disc list-inside text-purple-400 ml-2 space-y-1">
            <li>In-app messaging between book owners and seekers</li>
            <li>Book condition verification system</li>
            <li>Community book recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}