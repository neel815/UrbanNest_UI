'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    apiClient
      .get(API_ENDPOINTS.auth.me)
      .then((me: { role: string; full_name: string }) => {
        if (me.role === 'system_admin') {
          router.replace('/system-admin/dashboard');
          return;
        }
        if (me.role === 'admin') {
          router.replace('/admin/dashboard');
          return;
        }
        if (me.role === 'resident') {
          router.replace('/resident/dashboard');
          return;
        }
        setRole(me.role);
        setName(me.full_name);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        router.replace('/login');
      });
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 shadow-md">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Welcome to UrbanNest</h1>
          <p className="mt-3 text-gray-600">
            {name ? `Hi ${name}. ` : ''}You are signed in{role ? ` as ${role.replace('_', ' ')}` : ''}. This is your landing page after login or signup.
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
