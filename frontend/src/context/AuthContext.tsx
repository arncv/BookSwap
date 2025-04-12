'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the User type based on expected data
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Seeker'; // Assuming these are the roles
  // Add other relevant user fields if needed
}

// Define the shape of the context state
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, mobile: string, email: string, password: string, role: 'Owner' | 'Seeker') => Promise<boolean>; // Returns true on success
  logout: () => void;
}

// Create the context with a default undefined value initially
export const AuthContext = createContext<AuthContextType | undefined>(undefined); // Export the context

// Define the props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Backend API Base URL (Consider moving to config)
const API_BASE_URL = 'http://localhost:3001/api/users'; // Corrected base path for user routes

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true to check session on load
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on initial load from localStorage
  useEffect(() => {
    setIsLoading(true); // Ensure loading is true while checking
    try {
      const storedUser = localStorage.getItem('bookSwapUser');
      if (storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (parseError) {
          console.error("Failed to parse user data from localStorage:", parseError);
          localStorage.removeItem('bookSwapUser'); // Clear invalid data
          setUser(null);
        }
      } else {
        setUser(null); // No user stored
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
      // Handle cases where localStorage might be disabled or unavailable
      setUser(null);
    } finally {
      setIsLoading(false); // Finished loading/checking session
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Assuming the backend returns the user object on successful login
      // Adjust based on your actual API response structure
      const loggedInUser: User = {
        // The backend login route returns user data directly in the root of the response object
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      setUser(loggedInUser);
      // Store user data in localStorage for persistence
      try {
        localStorage.setItem('bookSwapUser', JSON.stringify(loggedInUser));
      } catch (error) {
        console.error("Could not save user data to localStorage:", error);
        // Handle potential storage errors (e.g., quota exceeded)
      }

    } catch (err: unknown) { // Changed type to unknown
      // Type guard for error message
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during login.');
      setUser(null); // Clear user on error
      // localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, mobile: string, email: string, password: string, role: 'Owner' | 'Seeker'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Note: The register endpoint in backend is /api/users/register, which matches the corrected API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful, do not log in automatically
      return true; // Indicate success

    } catch (err: unknown) { // Changed type to unknown
       // Type guard for error message
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during registration.');
      return false; // Indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Clear session info from localStorage
    try {
      localStorage.removeItem('bookSwapUser');
    } catch (error) {
      console.error("Could not remove user data from localStorage:", error);
    }
    setUser(null);
    setError(null);
    // Optional: Call backend logout endpoint if necessary
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};