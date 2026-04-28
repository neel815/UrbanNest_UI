'use client';

import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';

interface DashboardStats {
  activeVisitors: number;
  pendingApprovals: number;
  incidentsToday: number;
  patrolRounds: number;
  accessAlerts: number;
  totalEntries: number;
}

export default function SecurityDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiClient.get('/api/security/dashboard-stats');
        setStats(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    {
      title: 'Active Visitors',
      subtitle: 'Currently on premises',
      value: stats?.activeVisitors ?? 0,
      accent: 'from-emerald-500 to-teal-500',
      icon: 'M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    },
    {
      title: 'Pending Approvals',
      subtitle: 'Awaiting verification',
      value: stats?.pendingApprovals ?? 0,
      accent: 'from-amber-500 to-orange-500',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z',
    },
    {
      title: 'Incidents Today',
      subtitle: 'Reported events',
      value: stats?.incidentsToday ?? 0,
      accent: 'from-rose-500 to-pink-500',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z',
    },
    {
      title: 'Patrol Rounds',
      subtitle: 'Completed today',
      value: stats?.patrolRounds ?? 0,
      accent: 'from-blue-600 to-indigo-600',
      icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    },
    {
      title: 'Access Alerts',
      subtitle: 'Security notifications',
      value: stats?.accessAlerts ?? 0,
      accent: 'from-violet-600 to-fuchsia-600',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
    {
      title: 'Total Entries',
      subtitle: 'Today\'s access count',
      value: stats?.totalEntries ?? 0,
      accent: 'from-slate-600 to-slate-700',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
  ];

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Security Operations</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Security Dashboard</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Monitor security operations, manage visitor access, and track incident reports in real-time.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Quick Actions</p>
                <p className="text-xs text-slate-500">Common security tasks</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href="/security/visitors"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Check-in Visitor</p>
                <p className="mt-1 text-sm text-slate-600">Register new guest access.</p>
              </a>
              <a
                href="/security/access-control"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Access Control</p>
                <p className="mt-1 text-sm text-slate-600">Manage entry permissions.</p>
              </a>
              <a
                href="/security/patrol"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Start Patrol</p>
                <p className="mt-1 text-sm text-slate-600">Begin security rounds.</p>
              </a>
              <a
                href="/security/incidents"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Report Incident</p>
                <p className="mt-1 text-sm text-slate-600">Log security events.</p>
              </a>
            </div>
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Recent Activity</p>
                <p className="text-xs text-slate-500">Latest security events</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-sm text-slate-600">John Smith checked in</p>
                <p className="text-xs text-slate-500">2 min ago</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <p className="text-sm text-slate-600">Patrol round completed</p>
                <p className="text-xs text-slate-500">15 min ago</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <p className="text-sm text-slate-600">Access alert at Gate B</p>
                <p className="text-xs text-slate-500">1 hour ago</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <p className="text-sm text-slate-600">Visitor approved: Sarah Johnson</p>
                <p className="text-xs text-slate-500">2 hours ago</p>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
          </div>
        </div>
      </div>
    </main>
  );
}
