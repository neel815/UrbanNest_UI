'use client';

import { useEffect, useState } from 'react';

import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import ClockIcon from '@/assets/icons/clock.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import PinIcon from '@/assets/icons/pin.svg';

type TabKind = 'announcements' | 'events';
type ModalKind = 'announcement' | 'event' | null;

type Announcement = {
  id: string;
  building_id: string | null;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  category?: 'COMMUNITY' | 'UTILITY' | 'FINANCE' | 'SECURITY' | 'OTHER';
  is_pinned?: boolean;
  read_count?: number;
  total_readers?: number;
  author_user_id: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
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

export default function AdminAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<TabKind>('announcements');
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string>('');
  const [deletingType, setDeletingType] = useState<'announcement' | 'event'>('announcement');

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'COMMUNITY' as 'COMMUNITY' | 'UTILITY' | 'FINANCE' | 'SECURITY' | 'OTHER',
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getReadPercentage = (readCount?: number, totalReaders?: number) => {
    if (!totalReaders || totalReaders === 0) return 0;
    return Math.round(((readCount || 0) / totalReaders) * 100);
  };

  const openCreateModal = (kind: 'announcement' | 'event') => {
    setModalKind(kind);
  };

  const closeModal = () => setModalKind(null);

  const submitAnnouncement = async () => {
    const payload = {
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
      category: announcementForm.category,
    };

    const data = await apiClient.post(API_ENDPOINTS.admin.announcements, payload);
    setAnnouncements([data, ...announcements]);
    setAnnouncementForm({ title: '', content: '', priority: 'medium', category: 'COMMUNITY' });
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
    setEventForm({ title: '', description: '', location: '', event_date: '' });
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

  const deleteItem = () => {
    const handleDelete = async () => {
      try {
        if (deletingType === 'announcement') {
          await apiClient.delete(API_ENDPOINTS.admin.deleteAnnouncement(deletingId));
          setAnnouncements(announcements.filter((item) => item.id !== deletingId));
        } else {
          await apiClient.delete(API_ENDPOINTS.admin.deleteEvent(deletingId));
          setEvents(events.filter((item) => item.id !== deletingId));
        }
        setShowDeleteDialog(false);
        setDeletingId('');
      } catch (err) {
        setError(getApiErrorMessage(err));
        setShowDeleteDialog(false);
      }
    };
    return handleDelete();
  };

  const onDeleteClick = (id: string, type: 'announcement' | 'event') => {
    setDeletingId(id);
    setDeletingType(type);
    setShowDeleteDialog(true);
  };

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">CONTROL CENTER</p>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">
              {activeTab === 'announcements' ? 'Announcements' : 'Events'}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              {activeTab === 'announcements'
                ? 'Broadcast once. Reach every home, every phone.'
                : 'Schedule and manage community events'}
            </p>
          </div>
          <button
            onClick={() => openCreateModal(activeTab === 'announcements' ? 'announcement' : 'event')}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
          >
            <PlusIcon className="h-5 w-5" fill="currentColor" />
            {activeTab === 'announcements' ? 'New announcement' : 'Create event'}
          </button>
        </div>
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
            <div className="rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-sm">
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-32 animate-pulse rounded-2xl bg-[#E9E2CF]" />
                ))}
              </div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-12 text-center shadow-sm">
              <p className="text-slate-600">No announcements yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const readPercentage = getReadPercentage(announcement.read_count, announcement.total_readers);
                return (
                  <div key={announcement.id} className="rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getCategoryColor(announcement.category)}`}>
                            {announcement.category || 'OTHER'}
                          </span>
                          {announcement.is_pinned && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E9BF73] px-3 py-1 text-xs font-semibold text-[#173326]">
                              <PinIcon className="h-3.5 w-3.5" fill="currentColor" />
                              PINNED
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-slate-900">{announcement.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{announcement.content}</p>
                      </div>
                      <button
                        onClick={() => onDeleteClick(announcement.id, 'announcement')}
                        className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-slate-500">
                          <ClockIcon className="h-4 w-4" fill="none" stroke="currentColor" />
                          {getTimeAgo(announcement.published_at)}
                        </span>
                        <span className="font-semibold text-[#0F5B35]">
                          {announcement.read_count || 0} / {announcement.total_readers || 0} read
                        </span>
                      </div>
                      <div className="w-full rounded-full bg-slate-200 h-2 overflow-hidden">
                        <div
                          className="h-full bg-[#0F5B35] transition-all duration-300"
                          style={{ width: `${readPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <>
          {loading ? (
            <div className="rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-sm">
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-32 animate-pulse rounded-2xl bg-[#E9E2CF]" />
                ))}
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-12 text-center shadow-sm">
              <p className="text-slate-600">No events created yet. Click "Create event" to add one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
                      {event.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="mt-2 text-sm text-slate-500">📍 {event.location}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteClick(event.id, 'event')}
                      className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 flex-shrink-0"
                    >
                      Delete
                    </button>
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
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {modalKind && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76806F]">
                  {modalKind === 'announcement' ? 'NEW BROADCAST' : 'NEW EVENT'}
                </p>
                <h2 className="mt-2 text-2xl font-serif font-semibold text-slate-900">
                  {modalKind === 'announcement' ? 'Create Announcement' : 'Create Event'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {modalKind === 'announcement'
                    ? 'Publish a notice to residents and security in your building.'
                    : 'Schedule a new community event'}
                </p>
              </div>
              <button onClick={closeModal} className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-[#E9E2CF]">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {modalKind === 'announcement' ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Title</label>
                    <input
                      required
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                      placeholder="Building notice title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Category</label>
                    <select
                      value={announcementForm.category}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value as 'COMMUNITY' | 'UTILITY' | 'FINANCE' | 'SECURITY' | 'OTHER' })}
                      className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                    >
                      <option value="COMMUNITY">Community</option>
                      <option value="UTILITY">Utility</option>
                      <option value="FINANCE">Finance</option>
                      <option value="SECURITY">Security</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Content</label>
                    <textarea
                      required
                      rows={5}
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                      placeholder="Announcement details"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Priority</label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
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
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Event Title</label>
                    <input
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                      placeholder="Event name"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Description</label>
                    <textarea
                      rows={3}
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                      placeholder="Event details (optional)"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Location</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                      placeholder="e.g. Central Lawn, Clubhouse"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Event Date & Time</label>
                    <input
                      required
                      type="datetime-local"
                      value={eventForm.event_date}
                      onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                      className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-[#D8D0BC] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#FBF8EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-[#F7F4E8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title={deletingType === 'announcement' ? 'Delete Announcement?' : 'Delete Event?'}
        message={deletingType === 'announcement' 
          ? 'This announcement will be permanently deleted. This action cannot be undone.'
          : 'This event will be permanently deleted. This action cannot be undone.'}
        onConfirm={deleteItem}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeletingId('');
        }}
        isDangerous
      />
    </main>
  );
}
