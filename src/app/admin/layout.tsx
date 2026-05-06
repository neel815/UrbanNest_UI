'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useAuthGuard } from '@/hooks/useAuthGuard';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { checking, error, logout, user } = useAuthGuard('admin');

  const nav = useMemo(
    () => [
      { href: '/admin/dashboard', label: 'Dashboard', icon: '/assets/admin/dashboard.svg' },
      { href: '/admin/residents', label: 'Residents', icon: '/assets/admin/residents.svg' },
      { href: '/admin/units', label: 'Units', icon: '/assets/admin/maintenance.svg' },
      { href: '/admin/security', label: 'Security Guards', icon: '/assets/admin/security.svg' },
      { href: '/admin/announcements', label: 'Announcements', icon: '/assets/admin/announcements.svg' },
      { href: '/admin/payments', label: 'Payments & Dues', icon: '/assets/admin/maintenance.svg' },
      { href: '/admin/maintenance', label: 'Maintenance', icon: '/assets/admin/maintenance.svg' },
      { href: '/admin/settings', label: 'Settings', icon: '/assets/admin/settings.svg' },
    ] satisfies NavItem[],
    [],
  );

  return (
    <div className="min-h-screen bg-[#F8F4E7] text-[#173326]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="flex w-full flex-col border-b border-[#E6E0CF] bg-[#F7F3E8] px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-[320px] lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center gap-3">
            <Image src="/assets/system-admin/logo.svg" alt="UrbanNest" width={48} height={48} priority unoptimized />
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#173326]">UrbanNest</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#7A7F70]">Society OS</p>
            </div>
          </div>

          <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#E9BF73] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#173326] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#173326]" />
            Admin
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8A8F81]">Overview</p>
            <nav className="mt-4 flex flex-col gap-3">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'flex items-center gap-4 rounded-2xl px-4 py-4 text-[15px] font-semibold transition',
                      active
                        ? 'bg-[#0F5B35] text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)]'
                        : 'text-[#596154] hover:bg-[#FBF8EF] hover:text-[#173326] hover:shadow-[0_8px_20px_rgba(23,51,38,0.06)]',
                    ].join(' ')}
                  >
                    <Image src={item.icon} alt="" width={20} height={20} aria-hidden="true" className={active ? 'brightness-0 invert' : ''} unoptimized />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto hidden lg:block">
            <div className="rounded-[28px] border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-4 shadow-[0_8px_30px_rgba(23,51,38,0.05)]">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F7F4E8]">
                  {(user?.full_name || 'A').split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#173326]">{user?.full_name ?? 'Admin User'}</p>
                  <p className="truncate text-xs text-[#7A7F70]">{user?.email ?? 'admin@urbannest.com'}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#E6E0CF] bg-[#FBF8EF] text-[#0F5B35] shadow-sm"
                  aria-label="Sign out"
                >
                  <Image src="/assets/system-admin/signout.svg" alt="" width={22} height={22} aria-hidden="true" unoptimized />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 lg:hidden">
            <div className="rounded-[28px] border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F7F4E8]">
                    {(user?.full_name || 'A').split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#173326]">{user?.full_name ?? 'Admin User'}</p>
                    <p className="text-xs text-[#7A7F70]">{user?.email ?? 'admin@urbannest.com'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#E6E0CF] bg-white text-[#0F5B35] shadow-sm"
                  aria-label="Sign out"
                >
                  <Image src="/assets/system-admin/signout.svg" alt="" width={22} height={22} aria-hidden="true" unoptimized />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#E6E0CF] bg-[#F8F4E7]/90 backdrop-blur">
            <div className="flex items-center gap-4 px-5 py-4 lg:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-3 shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
                  <Image src="/assets/system-admin/search.svg" alt="" width={18} height={18} aria-hidden="true" unoptimized />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#173326] outline-none placeholder:text-[#9AA092]"
                  placeholder="Search residents, units, guards..."
                  aria-label="Search residents, units, guards"
                />
              </div>

              <button
                type="button"
                className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#E6E0CF] bg-[#FBF8EF] shadow-[0_8px_24px_rgba(23,51,38,0.04)]"
                aria-label="Notifications"
              >
                <Image src="/assets/system-admin/bell.svg" alt="" width={22} height={22} aria-hidden="true" unoptimized />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#E3A84D] ring-2 ring-[#FBF8EF]" />
              </button>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
            {error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>
            ) : checking ? (
              <div className="space-y-4 rounded-3xl border border-[#E6E0CF] bg-[#FBF8EF] p-6 shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
                <div className="h-5 w-40 animate-pulse rounded-full bg-[#E6E0CF]" />
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="h-28 animate-pulse rounded-[28px] bg-[#E9E2CF]" />
                  <div className="h-28 animate-pulse rounded-[28px] bg-[#E9E2CF]" />
                  <div className="h-28 animate-pulse rounded-[28px] bg-[#E9E2CF]" />
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

