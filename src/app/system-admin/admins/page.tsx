'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type AdminItem = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  must_reset_password: boolean;
};

export default function AdminListPage() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAdmins = async () => {
    const data = await apiClient.get(API_ENDPOINTS.systemAdmin.admins);
    setAdmins(data);
  };

  useEffect(() => {
    loadAdmins()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const onAddAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setResetLink('');
    try {
      const data = await apiClient.post(API_ENDPOINTS.systemAdmin.inviteAdmin, {
        full_name: fullName,
        email,
      });
      setMessage(data.message);
      setResetLink(data.reset_link);
      setFullName('');
      setEmail('');
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add admin failed');
    }
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">People</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Admins</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-slate-900" />
              System access
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Invite admins to help manage residents and security. New admins receive a password setup link.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Invite admin</p>
                <p className="mt-1 text-sm text-slate-600">Create an admin user and generate a password setup link.</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.13a4 4 0 0 1 0 7.75M20 21v-2a4 4 0 0 0-3-3.87M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <form onSubmit={onAddAdmin} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Full name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="admin@urbannest.com"
                  type="email"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Action
                </label>
                <button
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Invite admin
                </button>
              </div>
            </form>

            {message && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {message}
              </div>
            )}
            {resetLink && (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Password setup link</p>
                <p className="mt-2 break-all font-medium text-slate-900">{resetLink}</p>
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {error}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-700 to-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-white/90">Guideline</p>
            <p className="mt-2 text-lg font-semibold leading-snug">Use unique admin emails.</p>
            <p className="mt-2 text-sm text-white/75">
              Invite admins with email addresses they control. If they lose access, they can’t complete password setup.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 ring-1 ring-white/15">
              Setup links expire in 24 hours
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Admin directory</p>
              <p className="mt-1 text-sm text-slate-600">All admins created in the system.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              {loading ? 'Loading...' : `${admins.length} total`}
            </div>
          </div>

          {admins.length === 0 && !loading ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path
                    d="M12 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM20 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">No admins yet</p>
              <p className="mt-1 text-sm text-slate-600">Use the invite form to create your first admin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {admins.map((a) => (
                    <tr key={a.id} className="bg-white/50 hover:bg-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
                            {(a.full_name || 'A')
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((s) => s[0]?.toUpperCase())
                              .join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{a.full_name}</p>
                            <p className="text-xs text-slate-500">Admin</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{a.email}</td>
                      <td className="px-6 py-4 text-slate-700">{new Date(a.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {a.must_reset_password ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                            Pending setup
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
