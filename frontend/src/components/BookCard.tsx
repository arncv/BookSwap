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
    <div className="border rounded-lg p-4 shadow-md mb-4 bg-white dark:bg-gray-800 overflow-hidden"> {/* Added dark bg, overflow */}
      {/* Wrap text content for spacing */}
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{book.title}</h3>
      {book.coverImageUrl && (
        <div className="relative w-full h-48 mb-3"> {/* Container for Image */}
          <Image
            src={`http://localhost:3001${book.coverImageUrl}`}
            alt={`Cover for ${book.title}`}
            fill // Use fill to cover the container
            style={{ objectFit: 'cover' }} // Use style for objectFit with fill
            className="rounded-t-lg" // Apply rounding to Image
            onError={(e) => {
              // Hide the image element if the image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
              // Optionally log the error or show a placeholder
              console.error(`Failed to load image: ${(e.target as HTMLImageElement).src}`);
            }}
            priority={false} // Set priority based on whether it's LCP
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Example sizes, adjust as needed
          />
        </div>
      )}
        <p className="text-gray-700 dark:text-gray-300">Author: {book.author}</p>
        {book.genre && <p className="text-gray-600 dark:text-gray-400">Genre: {book.genre}</p>}
        <p className="text-gray-600 dark:text-gray-400">Location: {book.location}</p>
        <p className="text-gray-600 dark:text-gray-400">Contact: {book.contact}</p>
      {/* Use ternary for conditional owner info */}
      {book.ownerInfo ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Owner: {book.ownerInfo.name} ({book.ownerInfo.email})</p>
            {book.ownerInfo.mobile && <p>Mobile: {book.ownerInfo.mobile}</p>}
          </div>
        ) : null}
      </div> {/* End of text content wrapper */}
      <div className="flex items-center justify-between mt-2">
        <span className={`px-2 py-1 rounded text-sm ${book.status === 'Available' ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}> {/* Added dark status styles */}
          Status: {book.status}
        </span>
        {isOwner && ( // Only show buttons if the current user is the owner
          // Wrapper div for owner buttons
          <div className="flex space-x-2"> {/* Added flex and spacing for owner buttons */}
            {/* Status Toggle Button */}
            <button
              onClick={handleToggleStatus}
              disabled={isLoading || isDeleting} // Also disable if deleting
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : book.status === 'Available'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isLoading
                ? 'Updating...'
                : book.status === 'Available'
                ? 'Mark as Rented/Exchanged'
                : 'Mark as Available'}
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting || isLoading} // Disable if deleting or updating status
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${ /* Removed ml-2 */
                isDeleting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>

            {/* Edit Link/Button (Updated for Next.js 13+ App Router) */}
            <Link
              href={`/edit-book/${book.id}`}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${ (isLoading || isDeleting) ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none' : 'bg-blue-500 hover:bg-blue-600 text-white' }`} /* Removed ml-2 */
              aria-disabled={isLoading || isDeleting} // Add aria-disabled for accessibility
              onClick={(e) => { if (isLoading || isDeleting) e.preventDefault(); }} // Prevent navigation if disabled
            >
              Edit
            </Link>
          </div> // End of wrapper div for owner buttons
        )} {/* End of isOwner conditional block */}
      </div> {/* End of outer flex container */}
      {/* Display Status Update Error */}
      {statusError && <p className="text-red-600 text-sm mt-1">{statusError}</p>} {/* Adjusted error style */}
      {/* Display Delete Error */}
      {deleteError && <p className="text-red-600 text-sm mt-1">{deleteError}</p>} {/* Adjusted error style */}
    </div>
  );
};

export default BookCard;