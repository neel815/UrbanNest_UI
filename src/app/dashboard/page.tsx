'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const currentRole = localStorage.getItem('current_role');

    if (!token) {
      router.replace('/login');
      return;
    }

    setRole(currentRole);
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 shadow-md">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Welcome to UrbanNest</h1>
          <p className="mt-3 text-gray-600">
            You are signed in{role ? ` as ${role.replace('_', ' ')}` : ''}. This is your landing page after login or signup.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700">
              Back to login
            </Link>
            <Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white">
              Create another account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
