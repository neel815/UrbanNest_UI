'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    apiClient
      .get(API_ENDPOINTS.auth.me)
      .then((me: { role: string }) => {
        if (me.role !== 'security') {
          router.replace('/dashboard');
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        router.replace('/login');
      });
  }, [router]);

  const onLogout = () => {
    localStorage.removeItem('access_token');
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">UrbanNest</p>
            <p className="text-lg font-semibold text-slate-900">Security Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/security/dashboard"
              className={
                pathname === '/security/dashboard'
                  ? 'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
              }
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {checking ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
