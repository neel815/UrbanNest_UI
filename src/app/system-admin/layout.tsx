'use client';

import { Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SystemAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  const nav = useMemo(
    () => [
      {
        href: '/system-admin/dashboard',
        label: 'Dashboard',
        icon: 'M3 10.5 12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 21v-10.5Z',
      },
      {
        href: '/system-admin/admins',
        label: 'Admins',
        icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.13a4 4 0 0 1 0 7.75M20 21v-2a4 4 0 0 0-3-3.87M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
      },
      {
        href: '/system-admin/settings',
        label: 'Settings',
        icon: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a7.6 7.6 0 0 0-1.7-1l-.4-2.7H9.1l-.4 2.7a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.4L4.6 13a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1L2.5 16.6l2 3.4 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.7h5.8l.4-2.7a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.4L19.4 15Z',
      },
    ],
    [],
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    apiClient
      .get(API_ENDPOINTS.auth.me)
      .then((me: { role: string }) => {
        if (me.role !== 'system_admin') {
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
    <div className={spaceGrotesk.className}>
      <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(37,99,235,0.12),transparent_40%),radial-gradient(900px_circle_at_90%_20%,rgba(16,185,129,0.10),transparent_45%),linear-gradient(to_bottom,rgba(15,23,42,0.03),rgba(15,23,42,0.01))]">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M4 10.5 12 3l8 7.5V21a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 21v-10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 22.5V14.5h5v8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">UrbanNest</p>
                <p className="text-lg font-semibold text-slate-900 leading-none">System Admin</p>
              </div>
            </div>

            <nav className="hidden items-center gap-2 md:flex">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? 'inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm'
                        : 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200'
                    }
                  >
                    <NavIcon d={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200 sm:inline-flex"
              >
                Back to app
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-6 pb-4 md:hidden">
            <div className="flex flex-wrap gap-2">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? 'inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                        : 'inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
                    }
                  >
                    <NavIcon d={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-8">
          {checking ? (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

