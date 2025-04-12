'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 text-white px-6 py-4 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
        <Link href="/" className="text-2xl font-bold hover:text-purple-100 transition-all duration-200 flex items-center group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          BookSwap
        </Link>
        
        <div className="flex items-center space-x-6">
          {isLoading ? (
            <div className="animate-pulse bg-white bg-opacity-20 rounded-full h-8 w-24"></div>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hidden md:block hover:text-purple-100 font-medium transition-all duration-200 border-b-2 border-transparent hover:border-purple-100 pb-1">
                Dashboard
              </Link>
              
              {user.role === 'Owner' && (
                <Link 
                  href="/add-book" 
                  className="hidden md:flex items-center space-x-2 bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Book</span>
                </Link>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 bg-purple-500 bg-opacity-30 hover:bg-opacity-40 px-4 py-2 rounded-lg transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-white text-purple-700 hover:bg-purple-50 font-medium py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 focus:ring-offset-purple-700 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="font-medium hover:text-purple-100 transition-all duration-200 px-4 py-2 border-b-2 border-transparent hover:border-purple-100"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-white text-purple-700 hover:bg-purple-50 font-medium py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 focus:ring-offset-purple-700"
              >
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