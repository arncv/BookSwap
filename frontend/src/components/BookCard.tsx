import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
// Define the structure for the owner information
interface OwnerInfo {
  name: string;
  email: string;
  mobile: string;
}

// Define the structure for a Book object, including optional ownerInfo
interface Book {
  id: string; // Assuming ID is a string (like UUID)
  title: string;
  author: string;
  genre?: string; // Optional
  location: string;
  contact: string; // Contact info provided by owner
  ownerId: string;
  status: 'Available' | 'Rented/Exchanged'; // Use specific statuses
  ownerInfo?: OwnerInfo | null; // Optional owner details
  coverImageUrl?: string | null; // Optional cover image URL
}

// Define the type for the status update function prop
type HandleStatusUpdate = (bookId: string, newStatus: 'Available' | 'Rented/Exchanged') => Promise<void>;
// Define the type for the delete function prop
type HandleDelete = (bookId: string) => void; // Simple callback, API call handled here

interface BookCardProps {
  book: Book;
  onStatusChange: HandleStatusUpdate;
  onDelete: HandleDelete; // Add the onDelete prop
}

const BookCard: React.FC<BookCardProps> = ({ book, onStatusChange, onDelete }) => { // Destructure onDelete
  const { user } = useAuth(); // Get user from AuthContext
  const [isLoading, setIsLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null); // Renamed for clarity
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Determine if the current user is the owner
  const isOwner = user?.id === book.ownerId;

  // Handler for the status toggle button click
  const handleToggleStatus = async () => {
    if (!isOwner || !user) return; // Should not happen if button is rendered correctly, but good practice

    const newStatus = book.status === 'Available' ? 'Rented/Exchanged' : 'Available';
    setIsLoading(true);
    setStatusError(null);

    try {
      // Call the callback passed from BookList, which handles the API call and state update
      await onStatusChange(book.id, newStatus);
      // No local state update here, parent handles it
    } catch (err) {
      console.error("Failed to update status via callback:", err);
      // The error state is managed here for the status update button
      setStatusError('Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for the delete button click
  const handleDelete = async () => {
    if (!isOwner || !user) return; // Guard clause

    // Confirmation step
    const confirmed = window.confirm("Are you sure you want to delete this book listing?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/books/${book.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id, // Send mock user ID
        },
      });

      if (!response.ok) {
        // Handle non-204 responses (e.g., 403 Forbidden, 404 Not Found)
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch { // Removed unused jsonError variable
            // If response is not JSON, use the status text
            errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      // On success (status 204), call the callback to update UI in parent
      onDelete(book.id);

    } catch (err) {
      console.error("Failed to delete book:", err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete book. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="border border-purple-100 dark:border-purple-800 rounded-xl p-0 shadow-lg mb-6 bg-white dark:bg-purple-900 overflow-hidden transition-all hover:shadow-xl"> 
      {/* Book cover image */}
      {book.coverImageUrl ? (
        <div className="relative w-full h-56"> {/* Increased height for better visual */}
          <Image
            src={`http://localhost:3001${book.coverImageUrl}`}
            alt={`Cover for ${book.title}`}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-t-xl" 
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              console.error(`Failed to load image: ${(e.target as HTMLImageElement).src}`);
            }}
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 h-24 rounded-t-xl flex items-center justify-center">
          <span className="text-white text-xl font-bold px-4 text-center">{book.title}</span>
        </div>
      )}
      
      {/* Book details */}
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-purple-900 dark:text-white line-clamp-2">{book.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${book.status === 'Available' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
            {book.status}
          </span>
        </div>
        
        <div className="space-y-2">
          <p className="text-purple-800 dark:text-purple-200 font-medium">By {book.author}</p>
          {book.genre && <p className="text-purple-600 dark:text-purple-300 text-sm">Genre: {book.genre}</p>}
          
          <div className="flex items-center text-purple-600 dark:text-purple-300 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {book.location}
          </div>
          
          <div className="flex items-center text-purple-600 dark:text-purple-300 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {book.contact}
          </div>
        </div>
        
        {/* Owner info with improved styling */}
        {book.ownerInfo && (
          <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-700">
            <div className="flex items-center text-sm text-purple-600 dark:text-purple-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{book.ownerInfo.name} • {book.ownerInfo.email}</span>
            </div>
            {book.ownerInfo.mobile && (
              <div className="flex items-center text-sm text-purple-600 dark:text-purple-300 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>{book.ownerInfo.mobile}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Action buttons with improved styling */}
      {isOwner && (
        <div className="px-5 pb-5 pt-0 flex flex-wrap gap-2">
          <button
            onClick={handleToggleStatus}
            disabled={isLoading || isDeleting}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              isLoading
                ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                : book.status === 'Available'
                ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow'
            }`}
          >
            {isLoading
              ? 'Updating...'
              : book.status === 'Available'
              ? 'Mark Rented'
              : 'Mark Available'}
          </button>

          <Link
            href={`/edit-book/${book.id}`}
            className={`flex-1 py-2 rounded-lg text-sm font-medium text-center transition-all ${ 
              (isLoading || isDeleting) 
              ? 'bg-purple-100 text-purple-400 cursor-not-allowed pointer-events-none' 
              : 'bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow' 
            }`}
            aria-disabled={isLoading || isDeleting}
            onClick={(e) => { if (isLoading || isDeleting) e.preventDefault(); }}
          >
            Edit
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting || isLoading}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              isDeleting
                ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow'
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
      
      {/* Error messages */}
      {(statusError || deleteError) && (
        <div className="px-5 pb-4">
          {statusError && <p className="text-red-600 text-sm">{statusError}</p>}
          {deleteError && <p className="text-red-600 text-sm">{deleteError}</p>}
        </div>
      )}
    </div>
  );
};

export default BookCard;