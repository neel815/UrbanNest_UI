'use client';

import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type ResidentStats = {
  announcements_count: number;
  pending_maintenance: number;
  active_visitors: number;
  total_due: number;
};

export default function ResidentDashboardPage() {
  const [name, setName] = useState('Resident');
  const [stats, setStats] = useState<ResidentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const me = await apiClient.get(API_ENDPOINTS.auth.me);
        setName(me.full_name || 'Resident');
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        if (err.message.includes('Authentication required')) {
          setError('Please log in to access your dashboard.');
        } else if (err.message.includes('Network error')) {
          setError('Unable to connect to the server. Please check your internet connection.');
        } else {
          setError(err.message);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const dashboardStats = await apiClient.get(API_ENDPOINTS.resident.dashboardStats);
        setStats(dashboardStats);
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        if (err.message.includes('Authentication required')) {
          setError('Please log in to access your dashboard.');
        } else if (err.message.includes('Network error')) {
          setError('Unable to connect to the server. Please check your internet connection.');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const cards = [
    {
      title: 'Announcements',
      subtitle: 'Building updates',
      value: stats?.announcements_count ?? 0,
      accent: 'from-amber-500 to-orange-500',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
    {
      title: 'Maintenance',
      subtitle: 'Pending requests',
      value: stats?.pending_maintenance ?? 0,
      accent: 'from-blue-600 to-indigo-600',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      title: 'Visitors',
      subtitle: 'Currently checked in',
      value: stats?.active_visitors ?? 0,
      accent: 'from-emerald-500 to-teal-500',
      icon: 'M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    },
    {
      title: 'Payments',
      subtitle: 'Total amount due',
      value: `$${stats?.total_due ?? 0}`,
      accent: 'from-violet-600 to-fuchsia-600',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
  ];

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Resident Portal</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome, {name}</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Manage your apartment living experience with announcements, maintenance requests, visitor management, and payments.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <p className="text-sm font-semibold text-slate-900">Quick actions</p>
            <p className="mt-1 text-sm text-slate-600">Jump into common resident workflows.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href="/resident/announcements"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">View announcements</p>
                <p className="mt-1 text-sm text-slate-600">Stay updated with building news.</p>
              </a>
              <a
                href="/resident/maintenance"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Request maintenance</p>
                <p className="mt-1 text-sm text-slate-600">Submit and track service requests.</p>
              </a>
              <a
                href="/resident/visitors"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Manage visitors</p>
                <p className="mt-1 text-sm text-slate-600">Register and track guest access.</p>
              </a>
              <a
                href="/resident/payments"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Pay dues</p>
                <p className="mt-1 text-sm text-slate-600">View and pay outstanding amounts.</p>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-white/90">Community</p>
            <p className="mt-2 text-lg font-semibold leading-snug">
              Connect with neighbors.
            </p>
            <p className="mt-2 text-sm text-white/70">
              Join events, participate in discussions, and stay engaged with your community.
            </p>
            <a
              href="/resident/community"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15 hover:bg-white/20"
            >
              Explore Community Hub
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}