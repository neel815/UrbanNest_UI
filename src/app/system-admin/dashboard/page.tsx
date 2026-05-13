'use client';

import Link from 'next/link';
import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { useSystemAdminUser } from '@/context/system-admin-user-context';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import ListCompactIcon from '@/assets/icons/list-compact.svg';
import ShieldIcon from '@/assets/icons/shield.svg';
import UsersGroupIcon from '@/assets/icons/users-group.svg';
import ShieldCheckIcon from '@/assets/icons/shield-check.svg';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

type Stats = {
  total_users: number;
  total_admins: number;
  total_residents: number;
  total_security: number;
  residents_joined_last_30_days: number;
};

type ActivityItem = {
  initials: string;
  title: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning';
};

type SocietyItem = {
  name: string;
  units: number;
  occupancy_percent: number;
};

const fallbackActivity: ActivityItem[] = [
  { initials: 'RM', title: 'Rohan Mehta invited a new admin', timestamp: '2m ago', level: 'info' },
  { initials: 'PG', title: 'Palm Grove HOA upgraded to Pro plan', timestamp: '1h ago', level: 'success' },
  { initials: 'AK', title: 'Arjun Kapoor suspended admin account', timestamp: '3h ago', level: 'warning' },
];

const fallbackSocieties: SocietyItem[] = [
  { name: 'Skyline Towers', units: 420, occupancy_percent: 92 },
  { name: 'Palm Grove', units: 286, occupancy_percent: 81 },
  { name: 'Lotus Residency', units: 198, occupancy_percent: 74 },
];

function StatIcon({ name, active }: { name: 'shield' | 'users' | 'guard' | 'id'; active?: boolean }) {
  if (name === 'shield') {
    return (
      <ShieldIcon className="h-5 w-5" fill="none" aria-hidden="true" />
    );
  }

  if (name === 'users') {
    return (
      <UsersGroupIcon
        className={`h-5 w-5 ${active ? 'text-white' : ''}`}
        fill="none"
        aria-hidden="true"
        style={active ? { color: '#FFFFFF' } : undefined}
      />
    );
  }

  if (name === 'guard') {
    return (
      <ShieldCheckIcon className="h-5 w-5" fill="none" aria-hidden="true" />
    );
  }

  return (
    <ListCompactIcon className="h-5 w-5" fill="none" aria-hidden="true" />
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [societies, setSocieties] = useState<SocietyItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useSystemAdminUser();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, activityData, societiesData] = await Promise.all([
          apiClient.get(API_ENDPOINTS.systemAdmin.dashboardStats),
          apiClient.get(API_ENDPOINTS.systemAdmin.dashboardActivity),
          apiClient.get(API_ENDPOINTS.systemAdmin.topSocieties),
        ]);

        setStats(statsData);
        setActivity(Array.isArray(activityData) ? activityData : []);
        setSocieties(Array.isArray(societiesData) ? societiesData : []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const displayName = user?.full_name?.split(' ')?.[0] || 'Priya';
  const safeActivity = Array.isArray(activity) ? activity : [];
  const safeSocieties = Array.isArray(societies) ? societies : [];

  const cards = [
    {
      title: 'Total Admins',
      value: stats?.total_admins ?? 0,
      subtitle: 'Across 32 societies',
      icon: 'shield' as const,
      active: true,
    },
    {
      title: 'Residents',
      value: stats?.total_residents ?? 0,
      subtitle: 'Active this month',
      icon: 'users' as const,
      active: false,
    },
    {
      title: 'Security Guards',
      value: stats?.total_security ?? 0,
      subtitle: 'Registered platform-wide',
      icon: 'guard' as const,
      active: false,
    },
    {
      title: 'Total Users',
      value: stats?.total_users ?? 0,
      subtitle: 'Includes all roles',
      icon: 'id' as const,
      active: false,
    },
  ];

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Control Center</p>
          <h1 className={`${cormorant.className} text-5xl leading-[0.9] font-semibold tracking-tight text-[#173326] lg:text-[4.5rem]`}>
            Hello, {displayName}.
          </h1>
          <p className="max-w-2xl text-[16px] leading-7 text-[#637062]">
            A calm, complete view of every society, guard, and resident running on UrbanNest.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-[#D9D1BC] bg-white px-5 py-3 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.05)]">
            Export report
          </button>
          <Link 
            href="/system-admin/admins"
            className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
          >
            + Invite admin
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
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
                <p className={`mt-3 text-sm ${card.active ? 'text-[#DDE9DF]' : 'text-[#647061]'}`}>
                  {card.subtitle}
                </p>
              </div>

              <div className={`grid h-12 w-12 place-items-center rounded-full ${card.active ? 'bg-white/8 text-[#F7F4E8]' : 'bg-[#E4EDE6] text-[#0F5B35]'}`}>
                <StatIcon name={card.icon} active={card.active} />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold">
              <span className={card.active ? 'text-[#C9D7CC]' : 'text-[#677062]'}>vs last month</span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <article className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <div className="flex items-center justify-between border-b border-[#E4DDCB] px-6 py-5">
            <div>
              <h2 className={`${cormorant.className} text-3xl font-semibold text-[#173326]`}>Platform Activity</h2>
              <p className="text-sm text-[#6A7264]">Recent events across every society</p>
            </div>
            <span className="text-[#7D8577]">◔</span>
          </div>

          <div className="divide-y divide-[#E8E1CF]">
            {(safeActivity.length > 0 ? safeActivity : fallbackActivity).map((item) => (
              <div key={`${item.title}-${item.timestamp}`} className="flex items-center gap-4 px-6 py-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E4EDE6] text-sm font-semibold text-[#0F5B35]">
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-[#173326]">
                    <span className="font-semibold">{item.title.split(' ')[0]} </span>
                    {item.title.slice(item.title.indexOf(' ') + 1)}
                  </p>
                  <p className="text-sm text-[#6A7264]">{item.timestamp}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    item.level === 'success'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.level === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#E6EFE9] text-[#0F5B35]'
                  }`}
                >
                  {item.level}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <div className="border-b border-[#E4DDCB] px-6 py-5">
            <h2 className={`${cormorant.className} text-3xl font-semibold text-[#173326]`}>Top Societies</h2>
            <p className="text-sm text-[#6A7264]">By active residents</p>
          </div>

          <div className="space-y-6 px-6 py-6">
            {(safeSocieties.length > 0 ? safeSocieties : fallbackSocieties).map((item) => (
              <div key={item.name}>
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E4EDE6] text-[#0F5B35]">
                    <StatIcon name="users" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#173326]">{item.name}</p>
                        <p className="text-sm text-[#6A7264]">{item.units} units</p>
                      </div>
                      <p className="text-lg font-semibold text-[#173326]">{item.occupancy_percent}%</p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#E8E1CF]">
                      <div
                        className="h-2 rounded-full bg-[#0F5B35]"
                        style={{ width: `${Math.min(100, item.occupancy_percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
