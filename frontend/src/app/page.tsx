'use client'; // Need this for hooks like useAuth

import React from 'react';
import BookList from '@/components/BookList';
// import { useAuth } from '@/context/AuthContext'; // Import useAuth - Not used

export default function Home() {
  // const { user, logout, isLoading } = useAuth(); // Use the auth context - Variables unused
  return (
    <main className="flex min-h-screen flex-col items-center p-8"> {/* Adjusted padding */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Peer-to-Peer Book Exchange</h1>
        {/* Placeholder for Login/Register or Dashboard Link */}
        {/* User actions moved to Navbar */}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl mb-4">Available Books</h2>
        {/* Placeholder for BookList component */}
        <BookList /> {/* Use the BookList component */}
      </div>

      {/* Add other sections as needed */}
    </main>
  );
}
