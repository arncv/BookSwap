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
    <div className="bg-white dark:bg-purple-900 p-6 rounded-xl shadow-md mb-8 border border-purple-100 dark:border-purple-800"> 
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h3 className="text-lg font-bold text-purple-900 dark:text-white">Find Your Next Book</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label htmlFor="title" className="flex items-center text-sm font-medium text-purple-700 dark:text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Book Title
          </label>
          <div className="relative">
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => handleInputChange(e, setTitle)}
              placeholder="Search by title..."
              className="w-full px-4 py-3 pl-10 border border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all sm:text-sm dark:bg-purple-800 dark:border-purple-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="genre" className="flex items-center text-sm font-medium text-purple-700 dark:text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Genre
          </label>
          <div className="relative">
            <input
              type="text"
              id="genre"
              name="genre"
              value={genre}
              onChange={(e) => handleInputChange(e, setGenre)}
              placeholder="Fiction, Non-fiction, etc..."
              className="w-full px-4 py-3 pl-10 border border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all sm:text-sm dark:bg-purple-800 dark:border-purple-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="location" className="flex items-center text-sm font-medium text-purple-700 dark:text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={(e) => handleInputChange(e, setLocation)}
              placeholder="City, neighborhood, etc..."
              className="w-full px-4 py-3 pl-10 border border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all sm:text-sm dark:bg-purple-800 dark:border-purple-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-purple-500 dark:text-purple-400 italic">
        <p>Results update as you type. Try searching for your favorite author or genre.</p>
      </div>
    </div>
  );
};


export default FilterForm;