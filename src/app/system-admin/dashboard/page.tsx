'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { useSystemAdminUser } from '@/context/system-admin-user-context';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

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

function StatIcon({ name }: { name: 'shield' | 'users' | 'guard' | 'id' }) {
  if (name === 'shield') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 22s7-3.8 7-9.8V5.5L12 3l-7 2.5v6.7c0 6 7 9.8 7 9.8Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === 'users') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M9 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.9" />
        <path d="M16.5 10.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" stroke="currentColor" strokeWidth="1.9" />
        <path d="M4.5 19v-1c0-2.5 2-4.5 4.5-4.5h0c2.5 0 4.5 2 4.5 4.5v1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M13.5 18v-1c0-1.9 1.5-3.4 3.4-3.4h.2c1.9 0 3.4 1.5 3.4 3.4v1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'guard') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M12 3l7 3v5.2c0 4.4-3 8.4-7 9.8-4-1.4-7-5.4-7-9.8V6l7-3Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M9.5 12h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="5" y="4.5" width="14" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="9" cy="7.5" r="1" fill="currentColor" />
    </svg>
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
        setActivity(activityData);
        setSocieties(societiesData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const displayName = user?.full_name?.split(' ')?.[0] || 'Priya';
  const cards = [
    {
      title: 'Total Admins',
      value: stats?.total_admins ?? 0,
      subtitle: 'Across 32 societies',
      trend: '+12%',
      icon: 'shield' as const,
      active: true,
    },
    {
      title: 'Residents',
      value: stats?.total_residents ?? 0,
      subtitle: 'Active this month',
      trend: '+4.2%',
      icon: 'users' as const,
      active: false,
    },
    {
      title: 'Security Guards',
      value: stats?.total_security ?? 0,
      subtitle: 'Registered platform-wide',
      trend: '+2.1%',
      icon: 'guard' as const,
      active: false,
    },
    {
      title: 'Total Users',
      value: stats?.total_users ?? 0,
      subtitle: 'Includes all roles',
      trend: '-0.4%',
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
          <button className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)]">
            + Invite admin
          </button>
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
                <StatIcon name={card.icon} />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold">
              <span className={`rounded-full px-3 py-1 ${card.active ? 'bg-white/10 text-[#F7F4E8]' : card.trend.startsWith('-') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {card.trend}
              </span>
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
            {(activity.length > 0 ? activity : fallbackActivity).map((item) => (
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
            {(societies.length > 0 ? societies : fallbackSocieties).map((item) => (
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
