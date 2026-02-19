'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { AuthStatus } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === AuthStatus.UNAUTHENTICATED) {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === AuthStatus.LOADING) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#059467] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (status === AuthStatus.UNAUTHENTICATED) {
    return null;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}
