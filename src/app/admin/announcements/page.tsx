'use client';

import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type ModalKind = 'announcement' | null;

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

export default function AdminAnnouncementsPage() {
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'COMMUNITY' as 'COMMUNITY' | 'UTILITY' | 'FINANCE' | 'SECURITY' | 'OTHER',
  });

  const loadData = async () => {
    try {
      const announcementData = await apiClient.get(API_ENDPOINTS.admin.announcements);
      setAnnouncements(announcementData);
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

  const getReadPercentage = (readCount?: number, totalReaders?: number) => {
    if (!totalReaders || totalReaders === 0) return 0;
    return Math.round(((readCount || 0) / totalReaders) * 100);
  };

  const openCreateModal = () => {
    setModalKind('announcement');
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await submitAnnouncement();
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

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">CONTROL CENTER</p>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">Announcements</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Broadcast once. Reach every home, every phone.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New announcement
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      )}

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
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429a1 1 0 00.725-.725l5.951-1.429a1 1 0 001.169-1.409l-7-14z" />
                          </svg>
                          PINNED
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{announcement.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{announcement.content}</p>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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

      {modalKind && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76806F]">NEW BROADCAST</p>
                <h2 className="mt-2 text-2xl font-serif font-semibold text-slate-900">Create Announcement</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Publish a notice to residents and security in your building.
                </p>
              </div>
              <button onClick={closeModal} className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-[#E9E2CF]">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
    </main>
  );
}
