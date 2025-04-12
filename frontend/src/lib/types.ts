export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  location: string;
  contact: string; // Assuming contact is a string (e.g., email or phone)
  ownerId: string; // Assuming ownerId is stored
  status: 'available' | 'rented' | 'unavailable'; // Example statuses
  coverImageUrl?: string; // Optional image URL
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Seeker';
  // Add other user fields if necessary
}