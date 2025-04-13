'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AddBookForm from '@/components/AddBookForm';

const AddBookPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect logic should run only after loading is complete and user state is determined
    if (!isLoading) {
      if (!user) {
        router.push('/login'); // Redirect to login if not authenticated
      } else if (user.role !== 'Owner') {
        // Option 1: Redirect to home or dashboard
        router.push('/');
        // Option 2: Keep them on the page but show Access Denied (handled below)
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-purple-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Double-check authorization after loading, before rendering the form
  if (!user) {
    // Should have been redirected, but as a fallback, show nothing or a message
    return null; // Or <p>Redirecting to login...</p>
  }

  if (user.role !== 'Owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-purple-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to add books. Only users with the Owner role can add new books.</p>
          <Link href="/dashboard" className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out text-center">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If loading is done, user exists, and role is 'Owner', render the form
  return (
    <div className="min-h-screen bg-purple-50 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
      <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-3">Add New Book Listing</h1>
          <p className="text-lg text-purple-600">Share your book with the BookSwap community</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Add New Book
            </h2>
          </div>
          <div className="p-4">
            <AddBookForm />
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/dashboard" className="inline-flex items-center px-3 py-1 rounded-md bg-white shadow-sm border border-purple-200 text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all duration-200 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage;
