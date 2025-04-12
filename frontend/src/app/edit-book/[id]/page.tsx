'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AddBookForm from '@/components/AddBookForm'; // Use the adapted form

// Define the structure for a Book object (consider moving to a shared types file later)
interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  location: string;
  contact: string;
  ownerId: string;
  status: 'Available' | 'Rented/Exchanged';
  // ownerInfo is not strictly needed on this page but included for completeness
  ownerInfo?: { name: string; email: string; mobile: string; } | null;
}

const EditBookPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const id = params?.id as string; // Get book ID from URL

  const [bookData, setBookData] = useState<Book | null>(null);
  const [isBookLoading, setIsBookLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Book ID is missing.');
      setIsBookLoading(false);
      return;
    }

    const fetchBook = async () => {
      setIsBookLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3001/api/books/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Book not found.');
          }
          throw new Error(`Failed to fetch book data (Status: ${response.status})`);
        }
        const data: Book = await response.json();
        setBookData(data);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching the book.');
      } finally {
        setIsBookLoading(false);
      }
    };

    fetchBook();
  }, [id]); // Re-fetch if ID changes

  // Handle loading states
  if (isAuthLoading || isBookLoading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  // Handle not logged in
  if (!user) {
    // Redirect to login page after checking loading state
    router.push('/login?redirect=/edit-book/' + id); // Add redirect query param
    return null; // Return null while redirecting
  }

  // Handle fetch errors
  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  // Handle book not found (redundant if error handles 404, but safe)
  if (!bookData) {
     return <div className="container mx-auto p-4 text-center text-red-500">Error: Book data could not be loaded.</div>;
  }

  // Authorization check: Ensure the logged-in user is the owner
  if (user.id !== bookData.ownerId) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        Access Denied: You do not have permission to edit this book.
      </div>
    );
  }

  // If authorized and data loaded, render the form
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Book: {bookData.title}</h1>
      {/* Render the adapted AddBookForm for editing */}
      <AddBookForm initialData={bookData} bookId={id} />
      {/* The AddBookForm component handles displaying and editing the data */}
    </div>
  );
};

export default EditBookPage;