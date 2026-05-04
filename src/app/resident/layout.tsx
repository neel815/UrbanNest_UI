'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useAuthGuard } from '@/hooks/useAuthGuard';

type NavItem = {
  href: string;
  label: string;
  icon: 'dashboard' | 'visitors' | 'maintenance' | 'announcements' | 'dues' | 'profile';
};

function SidebarIcon({ name, active }: { name: NavItem['icon']; active?: boolean }) {
  const stroke = active ? '#F7F4E8' : '#5C6457';

  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M4 11.5 12 4l8 7.5" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 10.5V20h11V10.5" stroke={stroke} strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M10 20v-5h4v5" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'visitors':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M9 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke={stroke} strokeWidth="1.9" />
          <path d="M16.5 10.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" stroke={stroke} strokeWidth="1.9" />
          <path d="M4.5 19v-1c0-2.5 2-4.5 4.5-4.5h0c2.5 0 4.5 2 4.5 4.5v1" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
          <path d="M13.5 18v-1c0-1.9 1.5-3.4 3.4-3.4h.2c1.9 0 3.4 1.5 3.4 3.4v1" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case 'maintenance':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 3l7 3v5.5c0 4.3-3 8.2-7 9.5-4-1.3-7-5.2-7-9.5V6l7-3Z" stroke={stroke} strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M9.5 12h5" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
          <path d="M12 8.7v.1" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'announcements':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.7V5a2 2 0 1 0-4 0v.3A6 6 0 0 0 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'dues':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" stroke={stroke} strokeWidth="1.9" />
          <path d="M8 9.2h8M8 12.5h5M8 15.8h4" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
          <path d="M15.5 7.5h1" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" stroke={stroke} strokeWidth="1.9" />
          <path d="M4.5 19a7.5 7.5 0 0 1 15 0" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
  }
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'R'
  );
}

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { checking, error, logout, user } = useAuthGuard('resident');

  const nav = useMemo(
    () => [
      { href: '/resident/dashboard', label: 'Home', icon: 'dashboard' },
      { href: '/resident/visitors', label: 'Visitors', icon: 'visitors' },
      { href: '/resident/maintenance', label: 'Maintenance', icon: 'maintenance' },
      { href: '/resident/announcements', label: 'Announcements', icon: 'announcements' },
      { href: '/resident/payments', label: 'Dues', icon: 'dues' },
      { href: '/resident/community', label: 'Profile', icon: 'profile' },
    ] satisfies NavItem[],
    [],
  );

  return (
    <div className="min-h-screen bg-[#F8F4E7] text-[#173326]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="flex w-full flex-col border-b border-[#E6E0CF] bg-[#F7F3E8] px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-[320px] lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0F5B35] text-white shadow-[0_10px_26px_rgba(15,91,53,0.22)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M12 4 4 11v9h16v-9l-8-7Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
                <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 11.5h6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#173326]">UrbanNest</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#7A7F70]">Society OS</p>
            </div>
          </div>

          <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#DDF0DD] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0F5B35] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#0F5B35]" />
            Resident
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8A8F81]">Overview</p>
            <nav className="mt-4 flex flex-col gap-3">
              {nav.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
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
                    <SidebarIcon name={item.icon} active={active} />
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
                  {getInitials(user?.full_name || 'Resident User')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#173326]">{user?.full_name || 'Resident User'}</p>
                  <p className="truncate text-xs text-[#7A7F70]">{user?.email || 'resident@urbannest.com'}</p>
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
                    {getInitials(user?.full_name || 'Resident User')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#173326]">{user?.full_name || 'Resident User'}</p>
                    <p className="text-xs text-[#7A7F70]">{user?.email || 'resident@urbannest.com'}</p>
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
                <div className="h-16 animate-pulse rounded-[28px] bg-[#E9E2CF]" />
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