'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

export default function SettingsPage() {
  const [appName, setAppName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.systemAdmin.settingsMe)
      .then((data) => {
        setAppName(data.app_name || '');
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setProfileImageUrl(data.profile_image_url || '');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await apiClient.put(API_ENDPOINTS.systemAdmin.settingsMe, {
        app_name: appName,
        full_name: fullName,
        profile_image_url: profileImageUrl || null,
      });
      setMessage('Settings updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Preferences</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Profile & branding
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Update your name and UrbanNest branding. Changes apply immediately for System Admin views.
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
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Account</p>
                <p className="mt-1 text-sm text-slate-600">Personal details for the current System Admin.</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <form onSubmit={onSave} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Application name
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="UrbanNest"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Your name
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="System Admin"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Email (read-only)
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                  value={email}
                  disabled
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Profile image URL
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-sm text-slate-600">
                  {loading ? 'Loading current settings...' : 'Review your changes, then save.'}
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
                  disabled={loading}
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-slate-900">Preview</p>
            <p className="mt-1 text-sm text-slate-600">How your profile image looks.</p>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-slate-900 text-white">
                {profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileImageUrl} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">
                    {(fullName || 'System Admin')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((s) => s[0]?.toUpperCase())
                      .join('')}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{fullName || 'System Admin'}</p>
                <p className="truncate text-sm text-slate-600">{email || 'admin@urbannest.com'}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-sm">
              <p className="text-sm font-semibold text-white/90">Branding tip</p>
              <p className="mt-2 text-sm text-white/80">
                Use a square image (at least 256x256) for the cleanest result across dashboards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
