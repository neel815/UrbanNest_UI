'use client';

import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type ActiveTab = 'announcements' | 'events';
type ModalKind = 'announcement' | 'event' | null;

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

type Event = {
  id: string;
  building_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('announcements');
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    event_date: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    try {
      const [announcementData, eventData] = await Promise.all([
        apiClient.get(API_ENDPOINTS.admin.announcements),
        apiClient.get(API_ENDPOINTS.admin.events),
      ]);
      setAnnouncements(announcementData);
      setEvents(eventData);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const priorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-700 ring-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 ring-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
    }
  };

  const openCreateModal = () => {
    setModalKind(activeTab === 'announcements' ? 'announcement' : 'event');
  };

  const closeModal = () => setModalKind(null);

  const submitAnnouncement = async () => {
    const payload = {
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
    };

    const data = await apiClient.post(API_ENDPOINTS.admin.announcements, payload);
    setAnnouncements([data, ...announcements]);
    setAnnouncementForm({ title: '', content: '', priority: 'medium' });
    closeModal();
  };

  const submitEvent = async () => {
    const payload = {
      title: eventForm.title,
      description: eventForm.description || null,
      location: eventForm.location || null,
      event_date: eventForm.event_date,
    };

    const data = await apiClient.post(API_ENDPOINTS.admin.events, payload);
    setEvents([data, ...events]);
    setEventForm({ title: '', description: '', location: '', event_date: new Date().toISOString().split('T')[0] });
    closeModal();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (modalKind === 'announcement') {
        await submitAnnouncement();
      } else if (modalKind === 'event') {
        await submitEvent();
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.admin.deleteAnnouncement(id));
      setAnnouncements(announcements.filter((item) => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm('Archive this event?')) return;
    try {
      await apiClient.delete(API_ENDPOINTS.admin.deleteEvent(id));
      setEvents(events.filter((item) => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Building communications</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Announcements & Events</h1>
          <button
            onClick={openCreateModal}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {activeTab === 'announcements' ? 'Create Announcement' : 'Create Event'}
          </button>
        </div>
        <p className="max-w-2xl text-slate-600">
          Publish notices and community events for the current building only.
        </p>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'announcements' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'events' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Events
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      ) : activeTab === 'announcements' ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{announcement.title}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-slate-600">{announcement.content}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${priorityStyle(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(announcement.published_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteAnnouncement(announcement.id)}
                      className="rounded-full bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Event Date</th>
                <th className="px-6 py-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((eventItem) => (
                <tr key={eventItem.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{eventItem.title}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-slate-600">{eventItem.description || 'No description provided.'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{eventItem.location || 'Not specified'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(eventItem.event_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteEvent(eventItem.id)}
                      className="rounded-full bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalKind && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {modalKind === 'announcement' ? 'Create Announcement' : 'Create Event'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {modalKind === 'announcement'
                    ? 'Publish a notice to residents and security in your building.'
                    : 'Share an upcoming building event with residents.'}
                </p>
              </div>
              <button onClick={closeModal} className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {modalKind === 'announcement' ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                    <input
                      required
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                      placeholder="Building notice title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Content</label>
                    <textarea
                      required
                      rows={5}
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                      placeholder="Announcement details"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                    <input
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                      placeholder="Event title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows={4}
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                      placeholder="Optional event description"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
                      <input
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="Clubhouse, lobby, etc."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Event Date</label>
                      <input
                        type="date"
                        required
                        value={eventForm.event_date}
                        onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
