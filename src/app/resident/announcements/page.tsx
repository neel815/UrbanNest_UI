'use client';

import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

interface Announcement {
  id: string;
  building_id: string | null;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  author_user_id: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.resident.announcements);
        setAnnouncements(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const getPriorityColor = (priority: string) => {
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
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Communications</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Announcements</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F6F2E8] px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {announcements.length} total
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Stay updated with the latest news and important information from building management.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-[#F6F2E8] p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="group relative overflow-hidden rounded-2xl border border-[#D8D0BC] bg-[#F6F2E8] p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 ${announcement.priority === 'high' ? 'bg-rose-500' : announcement.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
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
                        <h3 className="text-lg font-semibold text-slate-900">{announcement.title}</h3>
                        <p className="mt-2 text-slate-600">{announcement.content}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${getPriorityColor(announcement.priority || 'medium')}`}
                      >
                        {announcement.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      <span>{new Date(announcement.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-[#F6F2E8] p-12 text-center shadow-sm backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true">
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No announcements at this time</p>
            <p className="mt-2 text-sm text-slate-500">Check back later for updates from building management.</p>
          </div>
        )}
      </div>
    </main>
  );
}
