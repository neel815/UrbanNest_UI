'use client';

import Image from 'next/image';
import { Cormorant_Garamond } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import ResidentsWhiteIcon from '@/assets/icons/residents-white.svg';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

type AdminStats = {
  total_residents: number;
  total_security: number;
  total_managed_users: number;
  residents_joined_last_30_days: number;
  security_joined_last_30_days: number;
  building_name?: string | null;
};

type ManagedUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  published_at: string;
  created_at: string;
};

function StatIcon({ name }: { name: 'residents' | 'security' | 'users' | 'trend' }) {
  if (name === 'residents') {
    return <ResidentsWhiteIcon className="h-5 w-5" fill="none" aria-hidden="true" />;
  }

  const src =
    name === 'security'
      ? '/assets/admin/card-security.svg'
      : name === 'users'
        ? '/assets/admin/card-users.svg'
        : '/assets/admin/card-trend.svg';

  return <Image src={src} alt="" width={20} height={20} aria-hidden="true" unoptimized />;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const delta = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(delta / 60000), 0);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [residents, setResidents] = useState<ManagedUser[]>([]);
  const [security, setSecurity] = useState<ManagedUser[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsData, residentsData, securityData, announcementsData] = await Promise.all([
          apiClient.get(API_ENDPOINTS.admin.dashboardStats),
          apiClient.get(API_ENDPOINTS.admin.residents),
          apiClient.get(API_ENDPOINTS.admin.security),
          apiClient.get(API_ENDPOINTS.admin.announcements),
        ]);

        setStats(statsData);
        setResidents(Array.isArray(residentsData) ? residentsData : []);
        setSecurity(Array.isArray(securityData) ? securityData : []);
        setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const recentUsers = useMemo(
    () =>
      [...residents, ...security]
        .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))
        .slice(0, 3)
        .map((user) => ({
          id: user.id,
          title: user.role === 'resident' ? 'New resident onboarding' : 'Security guard added',
          detail: `${user.full_name} · ${user.email} · ${formatRelativeTime(user.created_at)}`,
          level: user.role === 'security' ? ('warning' as const) : ('info' as const),
          initials: getInitials(user.full_name),
        })),
    [residents, security],
  );

  const cards = [
    {
      title: 'Residents',
      subtitle: 'Across the property',
      value: stats?.total_residents ?? 0,
      footnote: `${stats?.residents_joined_last_30_days ?? 0} joined in 30 days`,
      trend: `+${stats?.residents_joined_last_30_days ?? 0}`,
      icon: 'residents' as const,
      active: true,
    },
    {
      title: 'Security Guards',
      subtitle: 'Registered and active',
      value: stats?.total_security ?? 0,
      footnote: `${stats?.security_joined_last_30_days ?? 0} joined in 30 days`,
      trend: `+${stats?.security_joined_last_30_days ?? 0}`,
      icon: 'security' as const,
      active: false,
    },
    {
      title: 'Managed Users',
      subtitle: 'Residents + security',
      value: stats?.total_managed_users ?? 0,
      footnote: 'Live from backend',
      trend: 'Live',
      icon: 'users' as const,
      active: false,
    },
    {
      title: 'Joined This Month',
      subtitle: 'New onboarding',
      value: stats?.residents_joined_last_30_days ?? 0,
      footnote: 'Resident growth in the last 30 days',
      trend: 'Monthly',
      icon: 'trend' as const,
      active: false,
    },
  ];

  const latestAnnouncement = useMemo(
    () =>
      [...announcements].sort(
        (left, right) =>
          Date.parse(right.published_at || right.created_at) -
          Date.parse(left.published_at || left.created_at),
      )[0] || null,
    [announcements],
  );

  return (
    <main className="space-y-8">
      <div className="space-y-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-[#76806F]">Control Center</p>
            <h1 className={`${cormorant.className} text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl`}>
              {stats?.building_name ?? 'Skyline Towers'}
            </h1>
            <p className="max-w-2xl text-[16px] leading-7 text-[#637062]">
              A warm, living view of the homes, residents, and security under your care.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/announcements"
              className="rounded-full border border-[#D9D1BC] bg-white px-5 py-3 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.05)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Broadcast
            </Link>
            <Link
              href="/admin/residents"
              className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
            >
              + Add resident
            </Link>
          </div>
        </section>

        {error && error !== 'Admin profile not found' && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>
        )}

        <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr_1fr_1fr]">
          {cards.map((card) => (
            <article
              key={card.title}
              className={`rounded-[28px] border p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] ${
                card.active
                  ? 'border-[#1A5A36] bg-[linear-gradient(145deg,#0F5B35,#0A3B24)] text-[#F7F4E8]'
                  : 'border-[#E4DDCB] bg-[#FBF8EF] text-[#173326]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${card.active ? 'text-[#D0E4D5]' : 'text-[#7D8577]'}`}>
                    {card.title}
                  </p>
                  <div className={`${cormorant.className} mt-3 text-[3rem] leading-none font-semibold tracking-tight`}>
                    {loading ? <span className="inline-block h-12 w-20 animate-pulse rounded-full bg-current/10" /> : card.value.toLocaleString()}
                  </div>
                  <p className={`mt-3 text-sm ${card.active ? 'text-[#DDE9DF]' : 'text-[#647061]'}`}>{card.subtitle}</p>
                </div>

                <div className={`grid h-12 w-12 place-items-center rounded-full ${card.active ? 'bg-white/10 text-white' : 'bg-[#E4EDE6] text-[#0F5B35]'}`}>
                  <StatIcon name={card.icon} />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-sm font-semibold">
                <span
                  className={`rounded-full px-3 py-1 ${
                    card.active
                      ? 'bg-white/10 text-[#F7F4E8]'
                      : card.title.includes('Security')
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {card.trend}
                </span>
                <span className={card.active ? 'text-[#C9D7CC]' : 'text-[#677062]'}>vs last month</span>
              </div>

              <p className={`mt-3 text-sm ${card.active ? 'text-[#DDE9DF]' : 'text-[#647061]'}`}>{card.footnote}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
          <article className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
            <div className="flex items-center justify-between border-b border-[#E4DDCB] px-6 py-5">
              <div>
                <h2 className={`${cormorant.className} text-3xl font-semibold text-[#173326]`}>Pending Actions</h2>
                <p className="text-sm text-[#6A7264]">Things that need your attention today</p>
              </div>
              <span className="text-[#7D8577]">↗</span>
            </div>

            <div className="divide-y divide-[#E8E1CF]">
              {(recentUsers.length > 0 ? recentUsers : []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E4EDE6] text-sm font-semibold text-[#0F5B35]">
                    {item.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] text-[#173326]">
                      <span className="font-semibold">{item.title.split(' ')[0]} </span>
                      {item.title.slice(item.title.indexOf(' ') + 1)}
                    </p>
                    <p className="text-sm text-[#6A7264]">{item.detail}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      item.level === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-[#E6EFE9] text-[#0F5B35]'
                    }`}
                  >
                    {item.level}
                  </span>
                </div>
              ))}
              {recentUsers.length === 0 && !loading && (
                <div className="px-6 py-10 text-sm text-[#6A7264]">No recent resident or security additions yet.</div>
              )}
            </div>
          </article>

          <article className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
            <div className="border-b border-[#E4DDCB] px-6 py-5">
              <h2 className={`${cormorant.className} text-3xl font-semibold text-[#173326]`}>Latest Announcements</h2>
              <p className="text-sm text-[#6A7264]">Most recently posted update</p>
            </div>

            <div className="px-6 py-6">
              {latestAnnouncement ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#F3E7D2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6C5B32]">
                    {latestAnnouncement.priority}
                  </div>
                  <h3 className="text-2xl font-semibold leading-tight text-[#173326]">{latestAnnouncement.title}</h3>
                  <p className="text-sm leading-6 text-[#6A7264]">{latestAnnouncement.content}</p>
                  <p className="text-sm leading-6 text-[#6A7264]">
                    Posted {formatRelativeTime(latestAnnouncement.published_at || latestAnnouncement.created_at)}
                  </p>
                  <Link
                    href="/admin/announcements"
                    className="inline-flex rounded-full border border-[#D9D1BC] bg-white px-5 py-3 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.05)] transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    View announcements
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-[#6A7264]">No announcements available.</p>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

