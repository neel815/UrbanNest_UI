'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useAuthGuard } from '@/hooks/useAuthGuard';

type NavItem = {
  href: string;
  label: string;
  icon: 'dashboard' | 'visitors' | 'entries' | 'incidents' | 'shift';
};

function NavIcon({ name, active }: { name: NavItem['icon']; active?: boolean }) {
  const stroke = active ? '#F5F1E4' : '#6C7368';

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
        </svg>
      );
    case 'entries':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v9a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'incidents':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M9 4v16M15 4v16" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
          <path d="M4 7h16M4 17h16" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
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
      .join('') || 'RS'
  );
}

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { checking, error, logout, user } = useAuthGuard('security');

  const nav = useMemo(
    () => [
      { href: '/security/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { href: '/security/visitors', label: 'Visitor Entry', icon: 'visitors' },
      { href: '/security/logs', label: 'Entry Log', icon: 'entries' },
      { href: '/security/incidents', label: 'Incidents', icon: 'incidents' },
      { href: '/security/patrol', label: 'My Shift', icon: 'shift' },
    ] satisfies NavItem[],
    [],
  );

  return (
    <div className="min-h-screen bg-[#F8F4E7] text-[#173326]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="flex w-full flex-col border-b border-[#E6E0CF] bg-[#F7F3E8] px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-[314px] lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0F5B35] text-white shadow-[0_10px_26px_rgba(15,91,53,0.22)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M12 4 4 11v9h16v-9l-8-7Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
                <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#173326]">UrbanNest</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#7A7F70]">Society OS</p>
            </div>
          </div>

          <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#FFECEC] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D14C4C] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#D14C4C]" />
            Security
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
                      'relative flex items-center gap-4 rounded-2xl px-4 py-4 text-[15px] font-semibold transition',
                      active
                        ? 'bg-[#0F5B35] text-[#F5F1E4] shadow-[0_12px_28px_rgba(15,91,53,0.18)] before:absolute before:left-0 before:top-1/2 before:h-8 before:w-1 before:-translate-y-1/2 before:rounded-r-full'
                        : 'text-[#596154] hover:bg-[#FBF8EF] hover:text-[#173326] hover:shadow-[0_8px_20px_rgba(23,51,38,0.06)]',
                    ].join(' ')}
                  >
                    <NavIcon name={item.icon} active={active} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto hidden lg:block">
            <div className="rounded-[28px] border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-4 shadow-[0_8px_30px_rgba(23,51,38,0.05)]">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F5F1E4]">
                  {getInitials(user?.full_name || 'Security Guard')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#173326]">{user?.full_name || 'Ravi Sharma'}</p>
                  <p className="truncate text-xs text-[#7A7F70]">{user?.email || 'ravi.s@skyline.io'}</p>
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
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F5F1E4]">
                    {getInitials(user?.full_name || 'Security Guard')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#173326]">{user?.full_name || 'Ravi Sharma'}</p>
                    <p className="text-xs text-[#7A7F70]">{user?.email || 'ravi.s@skyline.io'}</p>
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
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#E6A84B] ring-2 ring-[#FBF8EF]" />
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