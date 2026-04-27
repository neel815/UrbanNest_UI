'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

export default function DashboardPage() {
  const router = useRouter();
  const [resolving, setResolving] = useState(true);

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
        if (me.role === 'security') {
          router.replace('/security/dashboard');
          return;
        }
        router.replace('/login');
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        router.replace('/login');
      })
      .finally(() => {
        setResolving(false);
      });
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full rounded-2xl bg-white p-8 text-center shadow-md">
          <p className="text-sm font-medium text-gray-600">
            {resolving ? 'Redirecting to your dashboard...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    </main>
  );
}
