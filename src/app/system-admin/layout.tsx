'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import TopSearchBar from '@/components/TopSearchBar';
import { SystemAdminUserProvider, useSystemAdminUser } from '@/context/system-admin-user-context';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import SettingsGearIcon from '@/assets/icons/settings-gear.svg';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  {
    href: '/system-admin/dashboard',
    label: 'Dashboard',
    icon: '/assets/system-admin/dashboard.svg',
  },
  {
    href: '/system-admin/admins',
    label: 'Admins',
    icon: '/assets/system-admin/admins.svg',
  },
  {
    href: '/system-admin/buildings',
    label: 'Buildings',
    icon: '/assets/system-admin/buildings.svg',
  },
  {
    href: '/system-admin/settings',
    label: 'Settings',
    icon: '/assets/system-admin/settings.svg',
  },
];

function SidebarIcon({ src, active }: { src: string; active?: boolean }) {
  if (src === '/assets/system-admin/settings.svg') {
    return (
      <SettingsGearIcon
        className={active ? 'h-5 w-5 brightness-0 invert' : 'h-5 w-5'}
        fill="none"
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={20}
      height={20}
      aria-hidden="true"
      className={active ? 'brightness-0 invert' : ''}
    />
  );
}

function SignOutIcon() {
  return <Image src="/assets/system-admin/signout.svg" alt="" width={22} height={22} aria-hidden="true" />;
}

function Avatar({ initials }: { initials: string }) {
  return <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F7F4E8]">{initials}</div>;
}

function SystemAdminSidebar({ logout }: { logout: () => void }) {
  const pathname = usePathname();
  const { user } = useSystemAdminUser();
  const initials =
    user?.full_name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'PS';

  return (
    <aside className="flex w-full flex-col border-b border-[#E6E0CF] bg-[#F7F3E8] px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-[320px] lg:border-b-0 lg:border-r lg:px-6">
      <div className="flex items-center gap-3">
        <Image src="/assets/system-admin/logo.svg" alt="UrbanNest" width={48} height={48} priority />
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#173326]">UrbanNest</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#7A7F70]">Society OS</p>
        </div>
      </div>

      <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#E9BF73] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#173326] shadow-sm">
        <span className="h-2 w-2 rounded-full bg-[#173326]" />
        System Admin
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8A8F81]">Overview</p>
        <nav className="mt-3 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-3 rounded-2xl px-4 py-2 text-[15px] font-semibold transition',
                  active
                    ? 'bg-[#0F5B35] text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)]'
                    : 'text-[#596154] hover:bg-[#FBF8EF] hover:text-[#173326] hover:shadow-[0_8px_20px_rgba(23,51,38,0.06)]',
                ].join(' ')}
              >
                <span>
                  <SidebarIcon src={item.icon} active={active} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto hidden lg:block">
        <div className="rounded-[28px] border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-4 shadow-[0_8px_30px_rgba(23,51,38,0.05)]">
          <div className="flex items-center gap-3">
            <Avatar initials={initials} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#173326]">{user?.full_name || 'Priya Shah'}</p>
              <p className="truncate text-xs text-[#7A7F70]">{user?.email || 'systemadmin@urbannest.com'}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#E6E0CF] bg-[#FBF8EF] text-[#0F5B35] shadow-sm"
              aria-label="Sign out"
            >
              <SignOutIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 lg:hidden">
        <div className="rounded-[28px] border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar initials={initials} />
              <div>
                <p className="text-sm font-semibold text-[#173326]">{user?.full_name || 'Priya Shah'}</p>
                <p className="text-xs text-[#7A7F70]">{user?.email || 'priya@urbannest.io'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#E6E0CF] bg-white text-[#0F5B35] shadow-sm"
              aria-label="Sign out"
            >
              <SignOutIcon />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SystemAdminContent({ children, loading, error }: { children: React.ReactNode; loading: boolean; error: string }) {
  const { loading: userLoading, error: userError } = useSystemAdminUser();

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-[#E6E0CF] bg-[#F8F4E7]/90 backdrop-blur">
        <div className="flex items-center gap-4 px-5 py-4 lg:px-8">
          <TopSearchBar />

          <button
            type="button"
            className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#E6E0CF] bg-[#FBF8EF] shadow-[0_8px_24px_rgba(23,51,38,0.04)]"
            aria-label="Notifications"
          >
            <Image src="/assets/system-admin/bell.svg" alt="" width={22} height={22} aria-hidden="true" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#E3A84D] ring-2 ring-[#FBF8EF]" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
        {error || userError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error || userError}
          </div>
        ) : loading || userLoading ? (
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
  );
}

export default function SystemAdminLayout({ children }: { children: React.ReactNode }) {
  const { checking, error, logout } = useAuthGuard('system_admin');

  return (
    <SystemAdminUserProvider>
      <div className="min-h-screen bg-[#F8F4E7] text-[#173326]">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
          <SystemAdminSidebar logout={logout} />
          <SystemAdminContent loading={checking} error={error}>
            {children}
          </SystemAdminContent>
        </div>
      </div>
    </SystemAdminUserProvider>
  );
}
