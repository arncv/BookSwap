'use client';

import React, { useState, FormEvent, useEffect, useRef, ChangeEvent } from 'react'; // Added useEffect, useRef, ChangeEvent
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Added useRouter

// Define Book interface (consider moving to shared types)
interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  location: string;
  contact: string;
  ownerId: string;
  status: 'Available' | 'Rented/Exchanged';
}

interface AddBookFormProps {
  initialData?: Book; // Optional initial data for editing
  bookId?: string;    // Optional book ID for editing
}

const AddBookForm: React.FC<AddBookFormProps> = ({ initialData, bookId }) => { // Destructure props
  const { user } = useAuth();
  const router = useRouter(); // Initialize router
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState(user?.email || ''); // Default to user email if available
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // For API errors
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({}); // For client-side validation
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null); // State for the cover image file
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

  // Effect to pre-fill form when initialData is provided (for editing)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAuthor(initialData.author);
      setGenre(initialData.genre || '');
      setLocation(initialData.location);
      setContact(initialData.contact);
      // Don't set ownerId or status here, they are handled separately
    }
    // Reset contact to user email only if NOT editing and user exists
    else if (user) {
        setContact(user.email || '');
    }
  }, [initialData, user]); // Depend on initialData and user

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0]);
    } else {
      setCoverImageFile(null);
    }
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!title.trim()) {
      errors.title = 'Title is required.';
      isValid = false;
    }
    if (!author.trim()) {
      errors.author = 'Author is required.';
      isValid = false;
    }
    if (!location.trim()) {
      errors.location = 'Location is required.';
      isValid = false;
    }
    if (!contact.trim()) {
      errors.contact = 'Contact information is required.';
      isValid = false;
    }
    // Optional: Add validation for file type/size here if needed later
    // if (coverImageFile) { ... }

    setValidationErrors(errors);
    return isValid;
  };

  // --- Input Change Handler ---
   const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { // Added HTMLTextAreaElement if needed
    setter(e.target.value);
    // Clear validation error for this field when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
     // Clear general API error when user starts typing in any field
     if (error) setError(null);
     if (success) setSuccess(null);
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous API error
    setSuccess(null);
    setValidationErrors({}); // Clear previous validation errors

    if (!validateForm()) {
      return; // Stop if validation fails
    }

    // Authorization check (slightly different for edit vs add)
    if (!user || user.role !== 'Owner') {
      setError('Access Denied: You must be logged in as an Owner.');
      return;
    }
    // If editing, ensure the user owns the book (ownerId check happens on backend, but good practice)
    if (bookId && initialData && user.id !== initialData.ownerId) {
        setError('Access Denied: You do not own this book.');
        return;
    }

    // Validation is now handled by validateForm() above

    setIsLoading(true);

    // Prepare data - ownerId is only needed for POST (add)
    // For PUT (edit), ownerId check is done server-side via header/book data
    const bookPayload = {
      title,
      author,
      genre: genre || undefined, // Send undefined if empty, backend might handle optional fields better
      location,
      contact,
    };

    // Define isEditing before it's used
    const isEditing = !!bookId;
    const apiUrl = isEditing ? `http://localhost:3001/api/books/${bookId}` : 'http://localhost:3001/api/books';
    const apiMethod = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          // Add mock user ID header required by backend for POST/PUT/PATCH/DELETE
          'x-user-id': user.id, // Always include user ID if logged in
          // Add real Authorization header if implemented later
          // 'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(isEditing ? bookPayload : { ...bookPayload, ownerId: user.id }), // Add ownerId only for POST
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isEditing ? 'Failed to update book' : 'Failed to add book'));
      }

      const resultData = await response.json(); // Get response data for both add/update

      // --- Start: Image Upload Logic ---
      let finalBookId = bookId; // Use existing bookId if editing
      if (!isEditing && resultData.id) {
        finalBookId = resultData.id; // Use the new ID from the add book response
      }

      if (coverImageFile && finalBookId) {
        const formData = new FormData();
        formData.append('coverImage', coverImageFile);

        // Nested try-catch for image upload to handle its errors separately
        try {
          const imageUploadResponse = await fetch(`http://localhost:3001/api/books/${finalBookId}/cover`, {
            method: 'POST',
            headers: {
              // Don't set 'Content-Type': 'multipart/form-data', browser does it with boundary
              'x-user-id': user.id, // Include mock user ID header
            },
            body: formData,
          });

          if (!imageUploadResponse.ok) {
            const imageErrorData = await imageUploadResponse.json();
            // Append image upload error to the main success message or handle differently
            setError(prevError => (prevError ? prevError + ` | Image upload failed: ${imageErrorData.message || 'Unknown error'}` : `Image upload failed: ${imageErrorData.message || 'Unknown error'}`));
            // Optionally, don't block the main success message:
            setSuccess((isEditing ? 'Book updated' : 'Book added') + ' (but cover upload failed).');
          } else {
             setSuccess((isEditing ? 'Book updated successfully!' : 'Book added successfully!') + ' Cover uploaded.');
          }
        } catch (uploadErr: unknown) { // Changed type to unknown
           // Type guard for error message
           const uploadErrMsg = uploadErr instanceof Error ? uploadErr.message : 'Network error';
           setError(prevError => (prevError ? prevError + ` | Image upload error: ${uploadErrMsg}` : `Image upload error: ${uploadErrMsg}`));
           setSuccess((isEditing ? 'Book updated' : 'Book added') + ' (but cover upload failed).');
        }
      } else {
         // If no image file was selected or no book ID, just show the initial success message
         setSuccess(isEditing ? 'Book updated successfully!' : 'Book added successfully!');
      }
      // --- End: Image Upload Logic ---


      if (isEditing) {
        // Redirect after successful update (image upload might have failed but book data is updated)
        router.push('/dashboard');
      } else {
        // Clear the form only after adding a new book
        setTitle('');
        setAuthor('');
        setGenre('');
        setLocation('');
        setContact(user?.email || ''); // Reset contact for next add
        setCoverImageFile(null); // Clear the file state
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset the file input element
        }
      }

    } catch (err: unknown) { // Changed type to unknown
      // Type guard for error message
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!bookId; // Define isEditing in the component scope for JSX access

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800"> {/* Increased spacing */}
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
        {isEditing ? 'Edit Book Details' : 'Add a New Book'}
      </h2>
      {/* Display API Error prominently */}
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 border border-red-300" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={handleInputChange(setTitle, 'title')}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${validationErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {validationErrors.title && <p className="text-red-600 text-sm mt-1">{validationErrors.title}</p>} {/* Adjusted error style */}
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="author"
          value={author}
          onChange={handleInputChange(setAuthor, 'author')}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${validationErrors.author ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {validationErrors.author && <p className="text-red-600 text-sm mt-1">{validationErrors.author}</p>} {/* Adjusted error style */}
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre</label>
        <input
          type="text"
          id="genre"
          value={genre}
          onChange={handleInputChange(setGenre, 'genre')} // No validation needed, but clear errors
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {/* No validation error display for optional field */}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={handleInputChange(setLocation, 'location')}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${validationErrors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {validationErrors.location && <p className="text-red-600 text-sm mt-1">{validationErrors.location}</p>} {/* Adjusted error style */}
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">Cover Image</label>
        <input
          type="file"
          id="coverImage"
          ref={fileInputRef} // Assign ref
          onChange={handleFileChange} // Use the new handler
          accept="image/*" // Accept only image files
          className="mt-1 block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-indigo-50 file:text-indigo-700
                     hover:file:bg-indigo-100"
        />
        {coverImageFile && <p className="text-xs text-gray-500 mt-1">Selected: {coverImageFile.name}</p>}
      </div>

      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Info (e.g., email/phone) <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="contact"
          value={contact}
          onChange={handleInputChange(setContact, 'contact')}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${validationErrors.contact ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {validationErrors.contact && <p className="text-red-600 text-sm mt-1">{validationErrors.contact}</p>} {/* Adjusted error style */}
      </div>

      {/* Success Message Display */}
      {success && (
        <div className="p-3 my-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800 border border-green-300" role="alert">
          <span className="font-medium">Success:</span> {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !user || user.role !== 'Owner'}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {isLoading ? (isEditing ? 'Updating Book...' : 'Adding Book...') : (isEditing ? 'Update Book' : 'Add Book')}
      </button>
    </form>
  );
};

export default AddBookForm;