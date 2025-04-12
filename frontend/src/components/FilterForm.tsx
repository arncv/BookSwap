'use client';

import React, { useState } from 'react';

interface FilterFormProps {
  onFilterChange: (filters: { title: string; location: string; genre: string }) => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ onFilterChange }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [genre, setGenre] = useState('');

  // Basic debouncing implementation
  let debounceTimeout: NodeJS.Timeout;
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    setter(value);

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      // Determine which filter changed based on the input name
      if (e.target.name === 'title') {
        onFilterChange({ title: value, location, genre });
      } else if (e.target.name === 'location') {
        onFilterChange({ title, location: value, genre });
      } else if (e.target.name === 'genre') {
        onFilterChange({ title, location, genre: value });
      }
    }, 500); // Adjust debounce delay as needed (e.g., 500ms)
  };


  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6"> {/* Updated container style */}
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Filter Books</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"> {/* Added dark text */}
            Filter by Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => handleInputChange(e, setTitle)}
            placeholder="Enter book title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" /* Added dark styles */
          />
        </div>
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"> {/* Added dark text */}
            Filter by Genre
          </label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={genre}
            onChange={(e) => handleInputChange(e, setGenre)}
            placeholder="Enter genre..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" /* Added dark styles */
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"> {/* Added dark text */}
            Filter by Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={location}
            onChange={(e) => handleInputChange(e, setLocation)}
            placeholder="Enter location..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" /* Added dark styles */
          />
        </div>
      </div>
      {/* Optional: Add an explicit "Apply Filters" button if debouncing isn't preferred */}
      {/* <button
        onClick={handleApplyFilters}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Apply Filters
      </button> */}
    </div>
  );
};

export default FilterForm;