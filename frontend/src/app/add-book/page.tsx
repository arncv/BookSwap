'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AddBookForm from '@/components/AddBookForm'; // Corrected import path

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
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p> {/* Replace with a proper spinner/loading component if available */}
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
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>You do not have permission to add books.</p>
        {/* Optionally add a link back to home */}
        {/* <Link href="/" className="mt-4 text-indigo-600 hover:underline">Go to Homepage</Link> */}
      </div>
    );
  }

  // If loading is done, user exists, and role is 'Owner', render the form
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Book Listing</h1>
      <AddBookForm />
    </div>
  );
};

export default AddBookPage;