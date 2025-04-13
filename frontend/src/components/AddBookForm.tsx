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
  const [contact, setContact] = useState(''); // Initialize empty, set in useEffect
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
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display API Error and Success messages inline */}
        <div className="flex flex-col space-y-2">
          {error && (
            <div className="p-2 text-xs text-red-700 bg-red-50 rounded-lg border-l-4 border-red-500" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error:</span> {error}
              </div>
            </div>
          )}
          
          {success && (
            <div className="p-2 text-xs text-green-700 bg-green-50 rounded-lg border-l-4 border-green-500" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Success:</span> {success}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 bg-white/50 p-3 rounded-lg shadow-sm border border-purple-50">
          {/* Title field - full width */}
          <div className="col-span-2">
            <label htmlFor="title" className="block text-xs font-medium text-purple-700">Book Title <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleInputChange(setTitle, 'title')}
                required
                placeholder="Enter book title"
                className={`pl-7 block w-full px-2 py-1.5 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm ${validationErrors.title ? 'border-red-500' : 'border-purple-200'} hover:border-purple-300`}
              />
            </div>
            {validationErrors.title && <p className="text-red-600 text-xs">{validationErrors.title}</p>}
          </div>

          {/* Author and Genre fields - side by side */}
          <div>
            <label htmlFor="author" className="block text-xs font-medium text-purple-700">Author <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="author"
                value={author}
                onChange={handleInputChange(setAuthor, 'author')}
                required
                placeholder="Author's name"
                className={`pl-7 block w-full px-2 py-1.5 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm ${validationErrors.author ? 'border-red-500' : 'border-purple-200'} hover:border-purple-300`}
              />
            </div>
            {validationErrors.author && <p className="text-red-600 text-xs">{validationErrors.author}</p>}
          </div>

          <div>
            <label htmlFor="genre" className="block text-xs font-medium text-purple-700">Genre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <select
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="pl-7 block w-full px-2 py-1.5 bg-white border border-purple-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm appearance-none hover:border-purple-300"
              >
                <option value="">Select genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-fiction">Non-fiction</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Self-help">Self-help</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Location and Contact fields - side by side */}
          <div>
            <label htmlFor="location" className="block text-xs font-medium text-purple-700">Location <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="location"
                value={location}
                onChange={handleInputChange(setLocation, 'location')}
                required
                placeholder="City or campus location"
                className={`pl-7 block w-full px-2 py-1.5 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm ${validationErrors.location ? 'border-red-500' : 'border-purple-200'} hover:border-purple-300`}
              />
            </div>
            {validationErrors.location && <p className="text-red-600 text-xs">{validationErrors.location}</p>}
          </div>

          <div>
            <label htmlFor="contact" className="block text-xs font-medium text-purple-700">Contact Info <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="text"
                id="contact"
                value={contact}
                onChange={handleInputChange(setContact, 'contact')}
                required
                placeholder="Email or phone number"
                className={`pl-7 block w-full px-2 py-1.5 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm ${validationErrors.contact ? 'border-red-500' : 'border-purple-200'} hover:border-purple-300`}
              />
            </div>
            {validationErrors.contact && <p className="text-red-600 text-xs">{validationErrors.contact}</p>}
          </div>

          {/* Cover Image - simplified */}
          <div className="col-span-2">
            <label htmlFor="coverImage" className="block text-xs font-medium text-purple-700">Cover Image</label>
            <div className="mt-1 flex justify-center px-3 py-2 border border-purple-200 border-dashed rounded-md bg-purple-50/30 hover:bg-purple-50 hover:border-purple-300 transition duration-200 ease-in-out">
              <div className="space-y-1 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex text-xs text-gray-600">
                  <label htmlFor="coverImage" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none">
                    <span>Upload</span>
                    <input
                      type="file"
                      id="coverImage"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
              </div>
            </div>
            {coverImageFile && (
              <div className="mt-1 flex items-center text-xs text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Selected: {coverImageFile.name}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !user || user.role !== 'Owner'}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating Book...' : 'Adding Book...'}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isEditing ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
                {isEditing ? 'Update Book' : 'Add Book'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;