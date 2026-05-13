'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import ImageUploadField from '../../../components/ImageUploadField';

export default function AdminSettingsPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.auth.me);
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setProfileImage(data.profile_image || '');
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiClient.put(API_ENDPOINTS.auth.updateProfile, {
        full_name: fullName,
        profile_image: profileImage || null,
      });
      setMessage('Settings updated');
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Update failed');
    }
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Preferences</p>
          <h1 className="text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">Settings</h1>
          <p className="max-w-2xl text-slate-600">
            Update your admin profile information and upload an avatar.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#E4DDCB] bg-[#FBF8EF]  p-6 shadow-sm backdrop-blur lg:col-span-2">
            <p className="text-sm font-semibold text-slate-900">Account</p>
            <p className="mt-1 text-sm text-slate-600">Personal details for your admin account.</p>

            <form onSubmit={onSave} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Your name
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Admin User"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Email (read-only)
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                  value={email}
                  disabled
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Profile image"
                  value={profileImage}
                  onChange={setProfileImage}
                  disabled={loading}
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-sm text-slate-600">
                  {loading ? 'Loading current settings...' : 'Review your changes, then save.'}
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-xl bg-[#0F5B35] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0B4B2C] disabled:opacity-60"
                  disabled={loading}
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-[#1A5A36] bg-[linear-gradient(145deg,#0F5B35,#0A3B24)] text-[#F7F4E8] p-6 shadow-[0_10px_30px_rgba(15,91,53,0.18)]">
            <p className="text-sm font-semibold text-white/90">Tip</p>
            <p className="mt-2 text-lg font-semibold leading-snug">Use clear profile photos.</p>
            <p className="mt-2 text-sm text-white/80">
              Square images look best in cards and navigation badges across the admin portal.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

