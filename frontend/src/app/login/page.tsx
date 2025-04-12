'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if user is logged in and loading is finished
    if (user && !isLoading) {
      router.push('/dashboard'); // Redirect to dashboard page
    }
  }, [user, isLoading, router]);

  // Optional: Show loading state or prevent rendering form while checking auth/redirecting
  // if (isLoading || user) {
  //   return <div>Loading...</div>; // Or a spinner component
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <AuthForm formType="login" />
    </div>
  );
};

export default LoginPage;