'use client'; // Need this for hooks like useAuth

import React from 'react';
import BookList from '@/components/BookList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gradient-to-b from-white to-purple-50">
      {/* Hero section */}
      <div className="w-full max-w-6xl mx-auto py-8 md:py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-700 mb-4">
          Peer-to-Peer Book Exchange
        </h1>
        <p className="text-lg md:text-xl text-purple-700 max-w-2xl mx-auto mb-8">
          Share your books with the community and discover new reads from fellow book lovers.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#books" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg">
            Browse Books
          </a>
          <a href="/add-book" className="bg-white hover:bg-purple-50 text-purple-600 border border-purple-600 font-medium py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg">
            Share Your Books
          </a>
        </div>
      </div>

      {/* Books section */}
      <div id="books" className="w-full max-w-6xl mx-auto py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-purple-700">Available Books</h2>
        <BookList />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-8 mt-auto border-t border-purple-100">
        <div className="text-center text-purple-500 text-sm">
          <p>© {new Date().getFullYear()} BookSwap. All rights reserved.</p>
          <p className="mt-2">Connect with fellow book lovers and share your collection.</p>
        </div>
      </footer>
    </main>
  );
}

