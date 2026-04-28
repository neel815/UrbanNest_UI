'use client';

import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'social' | 'meeting' | 'sports' | 'educational';
  attendees: number;
  maxAttendees?: number;
  isRegistered: boolean;
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'general' | 'complaints' | 'suggestions' | 'marketplace';
  replies: number;
  lastActivity: string;
}

export default function CommunityPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'forum'>('events');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsData, forumData] = await Promise.all([
          apiClient.get(API_ENDPOINTS.resident.events),
          apiClient.get(API_ENDPOINTS.resident.forumPosts)
        ]);
        setEvents(eventsData);
        setForumPosts(forumData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'social':
        return 'from-purple-500 to-pink-500';
      case 'meeting':
        return 'from-blue-600 to-indigo-600';
      case 'sports':
        return 'from-emerald-500 to-teal-500';
      case 'educational':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general':
        return 'from-slate-500 to-slate-600';
      case 'complaints':
        return 'from-rose-500 to-pink-500';
      case 'suggestions':
        return 'from-emerald-500 to-teal-500';
      case 'marketplace':
        return 'from-blue-600 to-indigo-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const toggleEventRegistration = (eventId: number) => {
    const submitRegistration = async () => {
      try {
        const updatedEvent = await apiClient.post(`${API_ENDPOINTS.resident.events}/${eventId}/register`, {});
        setEvents(events.map(event => 
          event.id === eventId ? updatedEvent : event
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update registration');
      }
    };

    submitRegistration();
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Community</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Community Hub</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Connect with neighbors, join events, and participate in community discussions.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-2 shadow-sm backdrop-blur">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'events'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'forum'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Discussion Forum
            </button>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
        ) : activeTab === 'events' && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getEventTypeColor(event.type || 'general')}`} />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {event.type?.toUpperCase() || 'GENERAL'}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-600">{event.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {event.time}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {event.location}
                      </div>
                      <div>
                        <span className="font-medium">Attendees:</span> {event.attendees}
                        {event.maxAttendees && ` / ${event.maxAttendees}`}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => toggleEventRegistration(event.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                        event.isRegistered
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {event.isRegistered ? 'Registered' : 'Register'}
                    </button>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : activeTab === 'forum' && forumPosts.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Discussion Forum</h2>
                <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition hover:-translate-y-0.5">
                  New Post
                </button>
              </div>
            </div>
            
            {forumPosts.map((post) => (
              <div
                key={post.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getCategoryColor(post.category || 'general')}`} />
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${getCategoryColor(post.category || 'general')} text-white shadow-sm`}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.003 9.003 0 00-8.682-4.947 9.82 9.82 0 00-8.682 4.947C4.03 16.418 0 12.418 0 8c0-4.418 4.03-8 9-8a9.003 9.003 0 018.682 4.947 9.82 9.82 0 018.682-4.947C21.97 16.418 26 12.418 26 8c0-4.418-4.03-8-9-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {post.category?.toUpperCase() || 'GENERAL'}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-600">{post.content}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      <span>By {post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.replies} replies</span>
                      <span>•</span>
                      <span>Last activity: {post.lastActivity}</span>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true">
                <path
                  d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">
              {activeTab === 'events' ? 'No upcoming events at this time' : 'No discussion posts yet'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === 'events' 
                ? 'Check back later for community events.' 
                : 'Be the first to start a conversation!'
              }
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
