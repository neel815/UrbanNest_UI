'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { checking, error, logout } = useAuthGuard('resident');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">UrbanNest</p>
            <p className="text-lg font-semibold text-slate-900">Resident Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/resident/dashboard"
              className={
                pathname === '/resident/dashboard'
                  ? 'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
              }
            >
              Dashboard
            </Link>
            <Link
              href="/resident/announcements"
              className={
                pathname === '/resident/announcements'
                  ? 'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
              }
            >
              Announcements
            </Link>
            <Link
              href="/resident/maintenance"
              className={
                pathname === '/resident/maintenance'
                  ? 'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
              }
            >
              Maintenance
            </Link>
            <Link
              href="/resident/visitors"
              className={
                pathname === '/resident/visitors'
                  ? 'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
              }
            >
              Visitors
            </Link>
            <Link
              href="/resident/payments"
              className={
                pathname === '/resident/payments'
                  ? 'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
              }
            >
              Payments
            </Link>
            <Link
              href="/resident/community"
              className={
                pathname === '/resident/community'
                  ? 'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                  : 'rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200'
              }
            >
              Community
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : checking ? (
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