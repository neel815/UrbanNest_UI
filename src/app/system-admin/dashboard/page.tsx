'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type Stats = {
  total_users: number;
  total_admins: number;
  total_residents: number;
  total_security: number;
  residents_joined_last_30_days: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.systemAdmin.dashboardStats)
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Residents Joined',
      subtitle: 'Last 30 days',
      value: stats?.residents_joined_last_30_days ?? 0,
      accent: 'from-emerald-500 to-teal-500',
      icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    },
    {
      title: 'Total Residents',
      subtitle: 'All time',
      value: stats?.total_residents ?? 0,
      accent: 'from-blue-600 to-indigo-600',
      icon: 'M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2M8 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    },
    {
      title: 'Total Admins',
      subtitle: 'Active & invited',
      value: stats?.total_admins ?? 0,
      accent: 'from-violet-600 to-fuchsia-600',
      icon: 'M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    },
    {
      title: 'Total Security',
      subtitle: 'All time',
      value: stats?.total_security ?? 0,
      accent: 'from-amber-500 to-orange-500',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
    },
    {
      title: 'Total Users',
      subtitle: 'All roles',
      value: stats?.total_users ?? 0,
      accent: 'from-slate-700 to-slate-900',
      icon: 'M21 21v-2a4 4 0 0 0-3-3.87M7 21v-2a4 4 0 0 1 4-4h2M16 3.13a4 4 0 0 1 0 7.75M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    },
  ];

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Overview</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live stats
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            A quick pulse of your community. Invite admins, update branding, and keep an eye on growth.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                  <p className="text-xs text-slate-500">{card.subtitle}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d={card.icon}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <p className="text-4xl font-semibold tracking-tight text-slate-900">
                  {loading ? <span className="inline-block h-10 w-16 animate-pulse rounded bg-slate-200" /> : card.value}
                </p>
                <p className="text-xs font-semibold text-slate-500">UrbanNest</p>
              </div>

              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur lg:col-span-2">
            <p className="text-sm font-semibold text-slate-900">Next steps</p>
            <p className="mt-1 text-sm text-slate-600">
              Common actions you can take right now.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href="/system-admin/admins"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Invite an admin</p>
                <p className="mt-1 text-sm text-slate-600">Create an admin account and share a setup link.</p>
              </a>
              <a
                href="/system-admin/settings"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Update branding</p>
                <p className="mt-1 text-sm text-slate-600">Change app name and profile image URL.</p>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-white/90">Tip</p>
            <p className="mt-2 text-lg font-semibold leading-snug">
              Keep your admin list lean and intentional.
            </p>
            <p className="mt-2 text-sm text-white/70">
              Invite only the roles you need. Admins get access to resident and security management features.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15">
              Secure by default
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
