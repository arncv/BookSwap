'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
interface AuthFormProps {
  formType: 'login' | 'register';
  onSuccess?: () => void; // Optional callback for successful action
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, onSuccess }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Owner' | 'Seeker'>('Seeker'); // Default role
  const { login, register, isLoading, error: apiError, user } = useAuth(); // Rename error to apiError, get user
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter(); // Initialize router

  // Redirect on successful login
  useEffect(() => {
    if (formType === 'login' && user && !apiError && !isLoading) {
      // Redirect logic after successful login
      router.push('/dashboard'); // Or wherever you want to redirect
    }
    // No automatic redirect needed for registration success in this component
  }, [user, apiError, isLoading, formType, router]);


  // --- Validation ---
  const validateEmail = (email: string): boolean => {
    // Simple regex for basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = 'Email is required.';
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required.';
      isValid = false;
    }

    if (formType === 'register') {
      if (!name) {
        errors.name = 'Name is required.';
        isValid = false;
      }
      if (!mobile) {
        errors.mobile = 'Mobile number is required.';
        isValid = false;
      }
      // Add more specific mobile validation if needed (e.g., length, format)
    }

    setValidationErrors(errors);
    return isValid;
  };

  // --- Input Change Handler ---
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    // Clear validation error for this field when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Optionally clear general API error as well, or keep it until next submit
    // if (apiError) {
    //   // Need a way to clear apiError in AuthContext or handle it here
    // }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationErrors({}); // Clear previous validation errors

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    let success = false;
    if (formType === 'login') {
      await login(email, password);
      // Login success/redirect is now handled by the useEffect hook watching the user state
    } else {
      success = await register(name, mobile, email, password, role);
      if (success && onSuccess) {
        onSuccess(); // Call the success callback for registration redirect
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto p-6 border rounded-lg shadow-md bg-white"> {/* Increased spacing, added bg */}
      <h2 className="text-2xl font-semibold text-center mb-6">
        {formType === 'login' ? 'Login' : 'Register'}
      </h2>

      {formType === 'register' && (
        <>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleInputChange(setName, 'name')}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${validationErrors.name ? 'border-red-500' : 'border-purple-100'}`}
            />
            {validationErrors.name && <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>} {/* Adjusted error style */}
          </div>
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium mb-1">Mobile</label>
            <input
              type="tel" // Use tel for mobile numbers
              id="mobile"
              value={mobile}
              onChange={handleInputChange(setMobile, 'mobile')}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${validationErrors.mobile ? 'border-red-500' : 'border-purple-100'}`}
            />
            {validationErrors.mobile && <p className="text-red-600 text-sm mt-1">{validationErrors.mobile}</p>} {/* Adjusted error style */}
          </div>
        </>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleInputChange(setEmail, 'email')}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${validationErrors.email ? 'border-red-500' : 'border-purple-100'}`}
        />
        {validationErrors.email && <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>} {/* Adjusted error style */}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={handleInputChange(setPassword, 'password')}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${validationErrors.password ? 'border-red-500' : 'border-purple-100'}`}
        />
        {validationErrors.password && <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>} {/* Adjusted error style */}
      </div>

      {formType === 'register' && (
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="Seeker"
                checked={role === 'Seeker'}
                onChange={() => setRole('Seeker')}
                className="mr-1 focus:ring-purple-500 h-4 w-4 text-purple-600 border-purple-100"
              />
              Book Seeker
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="Owner"
                checked={role === 'Owner'}
                onChange={() => setRole('Owner')}
                className="mr-1 focus:ring-purple-500 h-4 w-4 text-purple-600 border-purple-100"
              />
              Book Owner
            </label>
          </div>
        </div>
      )}

      {/* Display API Error (distinct from validation errors) */}
      {apiError && <p className="text-red-600 text-sm text-center mt-4 bg-red-100 p-2 rounded border border-red-300">{apiError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : (formType === 'login' ? 'Login' : 'Register')}
      </button>
    </form>
  );
};

export default AuthForm;