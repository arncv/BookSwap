'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext'; // Assuming AuthContext is in src/context

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if finished loading and no user is logged in
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  // If user is null after loading, the useEffect hook should have redirected.
  // Render null or a placeholder while redirecting.
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      <p className="text-xl mb-8 text-gray-600">Welcome back, <span className="font-semibold">{user.name}</span>!</p>

      {user.role === 'Owner' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg shadow-sm mb-6" role="alert">
          <h2 className="text-lg font-semibold mb-2">Owner Actions</h2>
          <p className="mb-3">As an Owner, you can manage your book listings.</p>
          <Link href="/add-book" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out">
            Add New Book
          </Link>
          {/* Future: Link to view/manage own listings */}
        </div>
      )}

      {user.role === 'Seeker' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-sm mb-6" role="alert">
          <h2 className="text-lg font-semibold mb-2">Seeker Actions</h2>
          <p className="mb-3">As a Seeker, you can discover and browse books available for exchange.</p>
          <Link href="/" className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out">
            Browse All Books
          </Link>
          {/* Future: Link to saved searches or requested books */}
        </div>
      )}

      {/* Placeholder for future dashboard widgets/content */}
      <div className="mt-8 p-4 border-dashed border-2 border-gray-300 rounded-lg">
        <p className="text-center text-gray-400">More dashboard features coming soon...</p>
      </div>
    </div>
  );
}