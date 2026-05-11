'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import BellBoldIcon from '@/assets/icons/bell-bold.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import PinIcon from '@/assets/icons/pin.svg';

type TabKind = 'announcements' | 'events';

interface Announcement {
  id: string;
  building_id: string | null;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  category?: 'COMMUNITY' | 'UTILITY' | 'FINANCE' | 'SECURITY' | 'OTHER';
  is_pinned?: boolean;
  author_user_id: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface Event {
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
}

export default function AnnouncementsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKind) || 'announcements';
  
  const [activeTab, setActiveTab] = useState<TabKind>(initialTab);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [announcementData, eventData] = await Promise.all([
          apiClient.get(API_ENDPOINTS.resident.announcements),
          apiClient.get(API_ENDPOINTS.resident.events),
        ]);
        setAnnouncements(announcementData);
        setEvents(eventData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'COMMUNITY':
        return 'bg-emerald-100 text-emerald-700';
      case 'UTILITY':
        return 'bg-blue-100 text-blue-700';
      case 'FINANCE':
        return 'bg-amber-100 text-amber-700';
      case 'SECURITY':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Communications</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {activeTab === 'announcements' ? 'Announcements' : 'Events'}
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F6F2E8] px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {activeTab === 'announcements' ? announcements.length : events.length} total
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            {activeTab === 'announcements'
              ? 'Stay updated with the latest news and important information from building management.'
              : 'Check out upcoming events in your community.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 border-b border-[#E4DDCB]">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'announcements'
                ? 'border-b-2 border-[#0F5B35] text-[#0F5B35]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'events'
                ? 'border-b-2 border-[#0F5B35] text-[#0F5B35]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Events
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <>
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
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                    <div className="flex items-start gap-4">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                        <BellBoldIcon className="h-5 w-5" fill="none" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {announcement.category && (
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(announcement.category)}`}>
                                  {announcement.category}
                                </span>
                              )}
                              {announcement.is_pinned && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E9BF73] px-2 py-1 text-xs font-semibold text-[#173326]">
                                  <PinIcon className="h-3 w-3" fill="currentColor" />
                                  PINNED
                                </span>
                              )}
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">{announcement.title}</h3>
                            <p className="mt-2 text-slate-600">{announcement.content}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 flex-shrink-0 ${getPriorityColor(announcement.priority || 'medium')}`}>
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
                  <BellBoldIcon className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true" />
                </div>
                <p className="text-slate-600 font-medium">No announcements at this time</p>
                <p className="mt-2 text-sm text-slate-500">Check back later for updates from building management.</p>
              </div>
            )}
          </>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
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
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="group relative overflow-hidden rounded-2xl border border-[#D8D0BC] bg-[#F6F2E8] p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                    <div className="flex items-start gap-4">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E9BF73] text-[#173326] shadow-sm">
                        <CalendarIcon className="h-5 w-5" fill="none" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                          {event.description && (
                            <p className="mt-2 text-slate-600">{event.description}</p>
                          )}
                          {event.location && (
                            <p className="mt-2 text-sm text-slate-500">📍 {event.location}</p>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-slate-500">
                            <ClockIcon className="h-4 w-4" fill="none" stroke="currentColor" />
                            {formatEventDate(event.event_date)}
                          </span>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${event.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {event.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-[#F6F2E8] p-12 text-center shadow-sm backdrop-blur">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4 text-slate-400">
                  <CalendarIcon className="h-8 w-8" fill="none" aria-hidden="true" />
                </div>
                <p className="text-slate-600 font-medium">No events scheduled</p>
                <p className="mt-2 text-sm text-slate-500">Check back later for upcoming community events.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
