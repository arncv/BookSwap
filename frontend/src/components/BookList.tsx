'use client'; // Mark as a Client Component

import React, { useState, useEffect } from 'react';
import BookCard from './BookCard';
import FilterForm from './FilterForm'; // Import the FilterForm component
import { useAuth } from '../context/AuthContext';

// Define the Book interface (consistent with BookCard and architecture.md)
interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  location: string;
  contact: string;
  ownerId: string;
  status: 'Available' | 'Rented/Exchanged';
  ownerInfo: { name: string; email: string; mobile: string } | null; // Added ownerInfo to match BookCard
}

const BookList: React.FC = () => { // Restore React.FC for clarity
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ title: '', location: '', genre: '' }); // State for filters (incl. genre)
  const { user } = useAuth();

  // Handler for filter changes from FilterForm
  const handleFilterChange = (newFilters: { title: string; location: string; genre: string }) => { // Update signature
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construct API URL with filters
        let apiUrl = 'http://localhost:3001/api/books';
        const queryParams = [];
        if (filters.title) {
          queryParams.push(`title=${encodeURIComponent(filters.title)}`);
        }
        if (filters.location) {
          queryParams.push(`location=${encodeURIComponent(filters.location)}`);
        }
        if (filters.genre) { // Add genre query param
          queryParams.push(`genre=${encodeURIComponent(filters.genre)}`);
        }
        if (queryParams.length > 0) {
          apiUrl += `?${queryParams.join('&')}`;
        }

        // Fetch data from the backend API
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Book[] = await response.json(); // API returns an array directly
        setBooks(data || []); // Set the fetched books
      } catch (err) {
        if (err instanceof Error) {
          setError(`Error fetching books: ${err.message}`);
        } else {
          setError('An unknown error occurred while fetching books.');
        }
        console.error("Fetch error:", err); // Log error for debugging
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [filters]); // Add filters to dependency array to refetch on change

  // Function to handle status updates via API call
  const handleStatusUpdate = async (bookId: string, newStatus: 'Available' | 'Rented/Exchanged'): Promise<void> => { // Explicit Promise<void>
    if (!user) {
      setError("You must be logged in to update book status.");
      throw new Error("User not logged in"); // Prevent API call if not logged in
    }

    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id, // Send mock user ID in header for backend check
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedBook = await response.json();

      // Update the local state to reflect the change
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === bookId ? { ...book, status: updatedBook.status } : book
        )
      );
      setError(null); // Clear previous errors on success
      // No explicit return needed here for void

    } catch (err) {
       if (err instanceof Error) {
          setError(`Error updating status: ${err.message}`);
        } else {
          setError('An unknown error occurred while updating status.');
        }
      console.error("Status update error:", err);
      throw err; // Re-throw error so BookCard can handle its loading/error state
    }
  }; // End of handleStatusUpdate

  // Function to handle deleting a book locally after successful API call
  const handleDeleteBook = (bookId: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    setError(null); // Clear any previous errors
  }; // End of handleDeleteBook

  return (
    <div className="container mx-auto px-4">
      <FilterForm onFilterChange={handleFilterChange} />
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-purple-50 border border-purple-200 text-purple-700 px-6 py-8 rounded-xl text-center my-8 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
          <p className="mt-2 text-sm">Please try again later or contact support if the problem persists.</p>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-purple-50 border border-purple-200 text-purple-700 px-6 py-12 rounded-xl text-center my-8 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          <p className="text-xl font-medium mb-2">No books found</p>
          <p className="text-sm max-w-md mx-auto">Try adjusting your filters or add some books to the community!</p>
          <a href="/add-book" className="inline-block mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-full transition-all shadow-md hover:shadow-lg">
            Add Your First Book
          </a>
        </div>
      ) : (
        <>
          <p className="text-purple-500 dark:text-purple-400 mb-6 text-sm">
            Showing {books.length} book{books.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onStatusChange={handleStatusUpdate}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}; // Correct closing brace for BookList component

export default BookList;