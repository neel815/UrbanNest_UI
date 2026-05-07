'use client';

import Link from 'next/link';
import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useMemo, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

interface DashboardStats {
  activeVisitors: number;
  pendingApprovals: number;
  incidentsToday: number;
  patrolRounds: number;
  accessAlerts: number;
  totalEntries: number;
}

type SecurityUser = {
  full_name?: string;
  email?: string;
};

type SecurityVisitor = {
  id: string;
  name: string;
  purpose: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  status: string;
  contactNumber: string;
  vehicleNumber: string | null;
  hostName: string;
  hostUnit: string;
  approvedBy: string | null;
  notes: string | null;
};

type SecurityIncident = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  location: string;
  reportedBy: string;
  reportedAt: string;
  status: string;
};

type SecurityPatrolRound = {
  id: string;
  guardName: string;
  startTime: string;
  endTime: string | null;
  status: string;
  route: string;
  incidents: number;
};

type SecurityAccessLog = {
  id: string;
  accessPoint: string;
  personName: string;
  personType: string;
  accessType: string;
  timestamp: string;
  status: string;
  method: string;
};

type QuickAction = {
  href: string;
  title: string;
  subtitle: string;
  icon: 'visitor' | 'incident' | 'log';
};

type ActivityItem = {
  time: string;
  title: string;
  subtitle: string;
  status: 'approved' | 'pending' | 'alert';
};

function QuickActionIcon({ name }: { name: QuickAction['icon'] }) {
  const stroke = '#0F5B35';

  switch (name) {
    case 'visitor':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M9 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke={stroke} strokeWidth="1.9" />
          <path d="M16.5 10.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" stroke={stroke} strokeWidth="1.9" />
          <path d="M4.5 19v-1c0-2.5 2-4.5 4.5-4.5h0c2.5 0 4.5 2 4.5 4.5v1" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case 'incident':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v9a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function formatTimeLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function SecurityDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<SecurityUser | null>(null);
  const [visitors, setVisitors] = useState<SecurityVisitor[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [patrolRounds, setPatrolRounds] = useState<SecurityPatrolRound[]>([]);
  const [accessLogs, setAccessLogs] = useState<SecurityAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profile, statsData, visitorData, incidentData, patrolData, accessLogData] = await Promise.all([
          apiClient.get(API_ENDPOINTS.auth.me),
          apiClient.get(API_ENDPOINTS.security.dashboardStats),
          apiClient.get(API_ENDPOINTS.security.visitors),
          apiClient.get(API_ENDPOINTS.security.incidents),
          apiClient.get(API_ENDPOINTS.security.patrolRounds),
          apiClient.get(API_ENDPOINTS.security.logs),
        ]);

        setUser(profile);
        setStats(statsData);
        setVisitors(visitorData);
        setIncidents(incidentData);
        setPatrolRounds(patrolData);
        setAccessLogs(accessLogData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statsCards: Array<{
    title: string;
    subtitle: string;
    value: number;
    icon: QuickAction['icon'];
    dark: boolean;
  }> = [
    {
      title: 'Entries Today',
      subtitle: 'Live gate traffic',
      value: stats?.totalEntries ?? 0,
      icon: 'visitor',
      dark: true,
    },
    {
      title: 'Pending Approvals',
      subtitle: 'Awaiting resident action',
      value: stats?.pendingApprovals ?? 0,
      icon: 'log',
      dark: false,
    },
    {
      title: 'Deliveries',
      subtitle: 'Current visitor queue',
      value: stats?.activeVisitors ?? 0,
      icon: 'visitor',
      dark: false,
    },
    {
      title: 'Incidents (7D)',
      subtitle: 'Open incident count',
      value: stats?.incidentsToday ?? 0,
      icon: 'incident',
      dark: false,
    },
  ];

  const quickActions: QuickAction[] = [
    { href: '/security/visitors', title: 'Check-in visitor', subtitle: 'Scan ID, notify resident', icon: 'visitor' },
    { href: '/security/incidents', title: 'Report incident', subtitle: 'Log any suspicious activity', icon: 'incident' },
    { href: '/security/logs', title: 'Entry log', subtitle: 'See the live gate log', icon: 'log' },
  ];

  const activity: ActivityItem[] = useMemo(() => {
    return [
      ...visitors.slice(0, 2).map((visitor): ActivityItem => ({
        time: visitor.timeIn || visitor.date,
        title: visitor.name,
        subtitle: `${visitor.hostUnit} · ${visitor.purpose || 'Visitor'}`,
        status:
          visitor.status === 'denied'
            ? 'alert'
            : visitor.status === 'pending'
            ? 'pending'
            : 'approved',
      })),
      ...incidents.slice(0, 1).map((incident): ActivityItem => ({
        time: incident.reportedAt,
        title: incident.title,
        subtitle: `${incident.type} · ${incident.location}`,
        status: incident.status === 'resolved' || incident.status === 'closed' ? 'approved' : 'alert',
      })),
      ...patrolRounds.slice(0, 1).map((round): ActivityItem => ({
        time: round.startTime,
        title: round.route,
        subtitle: `${round.guardName} · ${round.status.replace('_', ' ')}`,
        status: round.status === 'completed' ? 'approved' : 'pending',
      })),
      ...accessLogs.slice(0, 1).map((log): ActivityItem => ({
        time: log.timestamp,
        title: `${log.personName} · ${log.accessPoint}`,
        subtitle: `${log.accessType} · ${log.method}`,
        status: log.status === 'granted' ? 'approved' : log.status === 'alert' ? 'alert' : 'pending',
      })),
    ].slice(0, 4);
  }, [accessLogs, incidents, patrolRounds, visitors]);

  const displayName = user?.full_name || 'Security Guard';
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Control Center</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className={`${cormorant.className} text-4xl font-semibold tracking-tight text-[#173326] lg:text-[4.75rem]`}>
              Main Gate, 06:00 - 14:00
            </h1>
            <p className="text-[15px] text-[#637062]">{currentDate} - {displayName} on duty at {currentTime}.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBD7] px-4 py-2 text-sm font-semibold text-[#3A8B58]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7BC48A]" />
            On duty
          </div>
        </div>
      </section>

      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className={[
              'group relative overflow-hidden rounded-[28px] border p-5 shadow-[0_8px_24px_rgba(23,51,38,0.04)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,51,38,0.08)]',
              card.dark ? 'border-[#0B4B2C] bg-[#0C4A2C] text-[#F5F1E4]' : 'border-[#D8D0BC] bg-[#FBF8EF] text-[#173326]',
            ].join(' ')}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={card.dark ? 'text-sm font-semibold text-[#D7E7D8]' : 'text-sm font-semibold text-[#637062]'}>{card.title}</p>
                <p className={card.dark ? 'text-xs text-[#B7C8B8]' : 'text-xs text-[#7A7F70]'}>{card.subtitle}</p>
              </div>
              <div className={card.dark ? 'grid h-12 w-12 place-items-center rounded-full bg-[#1B6037] text-white' : 'grid h-12 w-12 place-items-center rounded-full bg-[#E8EFE8] text-[#0F5B35]'}>
                <QuickActionIcon name={card.icon} />
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <p className={card.dark ? 'text-4xl font-semibold tracking-tight text-[#F5F1E4]' : 'text-4xl font-semibold tracking-tight text-[#173326]'}>
                {loading ? <span className={card.dark ? 'inline-block h-10 w-16 animate-pulse rounded bg-white/15' : 'inline-block h-10 w-16 animate-pulse rounded bg-[#E6E0CF]'} /> : card.value}
              </p>
              <p className={card.dark ? 'text-xs font-semibold text-[#A6C5AA]' : 'text-xs font-semibold text-[#7A7F70]'}>UrbanNest</p>
            </div>
            <div className={card.dark ? 'pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white/6 blur-2xl transition group-hover:bg-white/10' : 'pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10'} />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group relative overflow-hidden rounded-[28px] border border-[#D8D0BC] bg-[#FBF8EF] p-6 shadow-[0_8px_24px_rgba(23,51,38,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,51,38,0.08)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#E8EFE8] text-[#0F5B35] shadow-sm">
                <QuickActionIcon name={action.icon} />
              </div>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#6C7368] transition group-hover:translate-x-0.5" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mt-6 space-y-1">
              <h2 className={`${cormorant.className} text-3xl font-semibold tracking-tight text-[#173326]`}>{action.title}</h2>
              <p className="text-[15px] text-[#637062]">{action.subtitle}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="group relative overflow-hidden rounded-[30px] border border-[#D8D0BC] bg-[#FBF8EF] shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
        <div className="border-b border-[#E6E0CF] px-6 py-5">
          <h2 className={`${cormorant.className} text-3xl font-semibold tracking-tight text-[#173326]`}>Live gate activity</h2>
          <p className="text-sm text-[#637062]">Real-time items from visitors, incidents, patrols, and access logs</p>
        </div>

        {loading ? (
          <div className="space-y-4 px-6 py-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-[20px] border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-4">
                <div className="h-4 w-20 animate-pulse rounded bg-[#E6E0CF]" />
                <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-[#E6E0CF]" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#E6E0CF]" />
              </div>
            ))}
          </div>
        ) : activity.length > 0 ? (
          <div className="divide-y divide-[#E6E0CF]">
            {activity.map((item) => (
              <div key={`${item.time}-${item.title}`} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 px-6 py-4">
                <div className="text-sm font-semibold text-[#637062]">{formatTimeLabel(item.time)}</div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-[#173326]">{item.title}</p>
                  <p className="truncate text-sm text-[#637062]">{item.subtitle}</p>
                </div>
                <div
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold',
                    item.status === 'approved'
                      ? 'bg-[#DCEBD7] text-[#3A8B58]'
                      : item.status === 'pending'
                        ? 'bg-[#F6E7CF] text-[#B8741A]'
                        : 'bg-[#F3E0E0] text-[#B24B4B]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'h-2.5 w-2.5 rounded-full',
                      item.status === 'approved' ? 'bg-[#7BC48A]' : item.status === 'pending' ? 'bg-[#E6A84B]' : 'bg-[#D46A6A]',
                    ].join(' ')}
                  />
                  {item.status === 'approved' ? 'Approved' : item.status === 'pending' ? 'Pending' : 'Alert'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center text-[#637062]">No live activity yet.</div>
        )}
      </section>
    </main>
  );
}