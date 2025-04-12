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

  if (loading) {
    return <p className="text-center mt-8">Loading books...</p>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 text-center text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 border border-red-300" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return <p className="text-center mt-8">No books available at the moment.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Render the FilterForm */}
      <FilterForm onFilterChange={handleFilterChange} />
      <h2 className="text-2xl font-bold mb-6 text-center">Available Books</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onStatusChange={handleStatusUpdate} // Pass the handler function
            onDelete={handleDeleteBook} // Pass the delete handler function
          />
        ))}
      </div>
    </div>
  );
}; // Correct closing brace for BookList component

export default BookList;