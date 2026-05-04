'use client';

import Link from 'next/link';
import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

type ResidentStats = {
  announcements_count: number;
  pending_maintenance: number;
  active_visitors: number;
  total_due: number;
};

type ResidentProfile = {
  full_name?: string;
  unit_number?: string;
  building_name?: string;
  society_name?: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  building_id: string | null;
  author_user_id: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
};

type MaintenanceRequest = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  lastUpdated: string;
};

type Visitor = {
  id: string;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  expected_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'denied';
  vehicle_number: string | null;
  resident_id: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

type Payment = {
  id: number;
  type: 'maintenance' | 'parking' | 'utilities' | 'other';
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string | null;
  paymentMethod?: string | null;
};

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  building_id: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type TodayItem = {
  time: string;
  title: string;
  level: 'success' | 'info' | 'warning';
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateLabel(value?: string) {
  if (!value) return 'Today';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name?: string | null) {
  if (!name) return 'A';

  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'A'
  );
}

function QuickActionIcon({ name }: { name: 'visitor' | 'complaint' | 'dues' | 'news' }) {
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

    case 'complaint':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M10.3 4.3c.4-1.8 2.9-1.8 3.4 0a1.7 1.7 0 0 0 2.6 1.1c1.5-.9 3.3.8 2.4 2.3a1.7 1.7 0 0 0 1.1 2.6c1.7.4 1.7 2.9 0 3.3a1.7 1.7 0 0 0-1.1 2.6c.9 1.5-.8 3.3-2.3 2.4a1.7 1.7 0 0 0-2.6 1.1c-.5 1.7-2.9 1.7-3.4 0a1.7 1.7 0 0 0-2.6-1.1c-1.5.9-3.3-.8-2.4-2.3a1.7 1.7 0 0 0-1.1-2.6c-1.7-.4-1.7-2.9 0-3.3a1.7 1.7 0 0 0 1.1-2.6c-.9-1.5.8-3.3 2.3-2.4.6.4 1.4.1 1.7-.6Z" stroke={stroke} strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke={stroke} strokeWidth="1.9" />
        </svg>
      );

    case 'dues':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <rect x="5" y="4.5" width="14" height="15" rx="2.5" stroke={stroke} strokeWidth="1.9" />
          <path d="M8 9h8M8 12.5h5M8 16h4" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
          <path d="M15.5 7.5h1" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.7V5a2 2 0 1 0-4 0v.3A6 6 0 0 0 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export default function ResidentDashboardPage() {
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [stats, setStats] = useState<ResidentStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [me, dashboardStats, announcementsData, maintenanceData, visitorsData, paymentsData, eventsData] = await Promise.all([
          apiClient.get(API_ENDPOINTS.auth.me),
          apiClient.get(API_ENDPOINTS.resident.dashboardStats),
          apiClient.get(API_ENDPOINTS.resident.announcements),
          apiClient.get(API_ENDPOINTS.resident.maintenance),
          apiClient.get(API_ENDPOINTS.resident.visitors),
          apiClient.get(API_ENDPOINTS.resident.payments),
          apiClient.get(API_ENDPOINTS.resident.events),
        ]);

        setProfile(me);
        setStats(dashboardStats);
        setAnnouncements(announcementsData);
        setMaintenance(maintenanceData);
        setVisitors(visitorsData);
        setPayments(paymentsData);
        setEvents(eventsData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const todayItems: TodayItem[] = [
    ...visitors.slice(0, 2).map((visitor) => ({
      time: visitor.check_in_time || formatDateLabel(visitor.expected_date),
      title: visitor.purpose ? `${visitor.visitor_name} · ${visitor.purpose}` : visitor.visitor_name,
      level: visitor.status === 'checked_in' ? ('success' as const) : ('info' as const),
    })),
    ...maintenance.slice(0, 1).map((request) => ({
      time: formatDateLabel(request.lastUpdated),
      title: request.title,
      level: request.status === 'completed' ? ('success' as const) : ('warning' as const),
    })),
    ...announcements.slice(0, 1).map((announcement) => ({
      time: formatDateLabel(announcement.published_at),
      title: announcement.title,
      level: 'info' as const,
    })),
  ];

  const upcomingEvent = events[0] ?? null;
  const duePayment = payments.find((payment) => payment.status === 'pending' || payment.status === 'overdue') ?? null;
  const displayName = profile?.full_name?.split(' ')?.[0];
  const locationLine = [profile?.unit_number, profile?.building_name || profile?.society_name]
    .filter(Boolean)
    .join(' · ');
  const currentTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
  const currentDateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const welcomeMetaLine = [currentTime, locationLine, currentDateLabel].filter(Boolean).join(' · ');
  const hasUpcomingEvent = Boolean(upcomingEvent);
  const eventDateLabel = upcomingEvent?.event_date ? new Date(upcomingEvent.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }) : '';
  const heroTitle = upcomingEvent?.title || '';
  const heroDescription = upcomingEvent?.description || '';
  const duesAmount = duePayment ? duePayment.amount : stats?.total_due ?? 0;
  const dueDateLabel = duePayment?.dueDate ? formatDateLabel(duePayment.dueDate) : 'soon';

  return (
    <main className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Control Center</p>
        <h1 className={`${cormorant.className} text-4xl font-semibold tracking-tight text-[#173326] lg:text-[4.5rem]`}>
          Welcome home, {displayName}.
        </h1>
        <p className="text-[15px] text-[#637062]">{welcomeMetaLine}</p>
      </section>

      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}

      {hasUpcomingEvent && (
        <section className="rounded-[32px] bg-[linear-gradient(145deg,#0F5B35,#0A3B24_60%,#062A1A)] px-6 py-6 shadow-[0_18px_50px_rgba(15,91,53,0.22)] lg:px-8 lg:py-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#DCE8D8]">
                <span className="h-2 w-2 rounded-full bg-[#E3A84D]" />
                Upcoming event
              </div>
              <h2 className={`${cormorant.className} mt-5 text-3xl font-semibold leading-[1.05] tracking-tight text-[#F7F4E8] lg:text-[3.6rem]`}>
                {heroTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#DDE9DF]">
                {eventDateLabel}{heroDescription ? ` · ${heroDescription}` : ''}
                {upcomingEvent?.location ? ` · ${upcomingEvent.location}` : ''}
              </p>
            </div>

            <Link
              href="/resident/community"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-[#F7F4E8] ring-1 ring-white/10 transition hover:bg-white/16"
            >
              View community
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { href: '/resident/visitors', title: 'Pre-approve visitor', subtitle: 'Guest, cab or delivery', icon: 'visitor' as const },
          { href: '/resident/maintenance', title: 'Raise complaint', subtitle: `${stats?.pending_maintenance ?? 0} open requests`, icon: 'complaint' as const },
          { href: '/resident/payments', title: 'Pay dues', subtitle: `${formatCurrency(duesAmount)} due ${dueDateLabel}`, icon: 'dues' as const },
          { href: '/resident/announcements', title: "What's new", subtitle: `${stats?.announcements_count ?? announcements.length} unread`, icon: 'news' as const },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex min-h-[168px] flex-col justify-between rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-5 shadow-[0_10px_30px_rgba(23,51,38,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(23,51,38,0.09)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#E4EDE6] text-[#0F5B35]">
                <QuickActionIcon name={card.icon} />
              </div>
              <span className="text-2xl leading-none text-[#788179] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">→</span>
            </div>
            <div>
              <h3 className={`${cormorant.className} text-[1.8rem] font-semibold tracking-tight text-[#173326]`}>{card.title}</h3>
              <p className="mt-1 text-sm text-[#667065]">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
        <article className="overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <div className="flex items-center justify-between border-b border-[#E4DDCB] px-6 py-5">
            <div>
              <h2 className={`${cormorant.className} text-3xl font-semibold text-[#173326]`}>Today</h2>
              <p className="text-sm text-[#6A7264]">A quick pulse of what has happened so far</p>
            </div>
            <span className="text-[#7D8577]">↗</span>
          </div>

          <div className="divide-y divide-[#E8E1CF]">
            {loading ? (
              <div className="space-y-0 px-6 py-5">
                <div className="h-4 w-1/3 animate-pulse rounded-full bg-[#E6E0CF]" />
                <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-[#E6E0CF]" />
                <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-[#E6E0CF]" />
              </div>
            ) : todayItems.length > 0 ? (
              todayItems.map((item) => (
                <div key={`${item.time}-${item.title}`} className="flex items-center gap-4 px-6 py-5">
                  <div className="w-20 shrink-0 text-sm font-medium text-[#6A7264]">{item.time}</div>
                  <div className="min-w-0 flex-1 text-[15px] text-[#173326]">{item.title}</div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
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
              ))
            ) : (
              <div className="px-6 py-10 text-sm text-[#6A7264]">No recent resident activity from the backend yet.</div>
            )}
          </div>
        </article>

        <aside className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <h2 className={`${cormorant.className} text-3xl font-semibold text-[#173326]`}>Dues Summary</h2>
          <p className="mt-5 text-4xl font-semibold tracking-tight text-[#173326]">
            {loading ? <span className="inline-block h-10 w-32 animate-pulse rounded-full bg-[#E6E0CF]" /> : formatCurrency(duesAmount)}
          </p>
          <p className="mt-2 text-sm text-[#667065]">due by {dueDateLabel}</p>

          <Link
            href="/resident/payments"
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
          >
            Pay now
          </Link>

          <div className="mt-6 rounded-[24px] border border-[#E4DDCB] bg-white/80 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A8F81]">Snapshot</p>
                <p className="mt-2 text-sm text-[#667065]">
                  {stats?.active_visitors ?? 0} active visitors and {stats?.pending_maintenance ?? 0} pending maintenance requests.
                </p>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E4EDE6] text-sm font-semibold text-[#0F5B35]">
                {getInitials(profile?.full_name || 'Resident User')}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}