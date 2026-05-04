'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type Announcement = {
  id: string;
  building_id: string | null;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  author_user_id: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export default function SecurityAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.security.announcements);
        setAnnouncements(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const priorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-700 ring-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 ring-amber-200';
      case 'low':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  };

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Security bulletin</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className={`${cormorant.className} text-4xl font-semibold tracking-tight text-[#173326] lg:text-[4.5rem]`}>Announcements</h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D1BC] bg-[#FBF8EF] px-3 py-1.5 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
            <span className="h-2 w-2 rounded-full bg-[#0F5B35]" />
            {announcements.length} total
          </div>
        </div>
        <p className="max-w-2xl text-[15px] text-[#637062]">Read-only announcements for the building assigned to your security profile.</p>
      </div>

      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
              <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,51,38,0.08)]"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0F5B35] text-white shadow-[0_10px_26px_rgba(15,91,53,0.16)]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#173326]">{announcement.title}</h3>
                      <p className="mt-2 text-[#637062]">{announcement.content}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${priorityClass(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                    <span>{new Date(announcement.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-12 text-center shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
          <p className="font-medium text-[#637062]">No announcements available</p>
        </div>
      )}
    </main>
  );
}
