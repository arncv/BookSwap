'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import AuthForm from '@/components/AuthForm';
// No need to import useAuth here unless checking state directly

const RegisterPage: React.FC = () => {
  const router = useRouter();

  // Define the callback function for successful registration
  const handleRegisterSuccess = () => {
    console.log('Registration successful, redirecting to login...');
    router.push('/login'); // Redirect to login page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Pass formType and the onSuccess callback */}
      <AuthForm formType="register" onSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default RegisterPage;