'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 shadow-md"> {/* Adjusted padding */}
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          BookSwap
        </Link>
        <div className="space-x-4 flex items-center">
          {isLoading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <span className="text-sm">Welcome, {user.name}!</span>
              {/* Optional: Link to Dashboard */}
              {/* <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link> */}
              {user.role === 'Owner' && (
                <Link href="/add-book" className="hover:text-gray-300 text-sm">
                  Add Book
                </Link>
              )}
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded focus:outline-none focus:shadow-outline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link href="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;