'use client';

import { FormEvent, useEffect, useState } from 'react';

import ImageUploadField from './ImageUploadField';
import { apiClient } from '@/utils/api';

type ManagedUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  profile_image_url?: string | null;
  created_at: string;
};

type AdminRoleCrudPageProps = {
  roleTitle: string;
  roleDescription: string;
  endpoint: string;
};

export default function AdminRoleCrudPage({ roleTitle, roleDescription, endpoint }: AdminRoleCrudPageProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editProfileImageUrl, setEditProfileImageUrl] = useState('');

  const loadUsers = async () => {
    const data = await apiClient.get(endpoint);
    setUsers(data);
  };

  useEffect(() => {
    loadUsers()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [endpoint]);

  const resetCreateForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setProfileImageUrl('');
  };

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiClient.post(endpoint, {
        full_name: fullName,
        email,
        password,
        profile_image_url: profileImageUrl || null,
      });
      setMessage(`${roleTitle.slice(0, -1)} created successfully.`);
      resetCreateForm();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  const startEdit = (user: ManagedUser) => {
    setEditingId(user.id);
    setEditFullName(user.full_name);
    setEditEmail(user.email);
    setEditPassword('');
    setEditProfileImageUrl(user.profile_image_url || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFullName('');
    setEditEmail('');
    setEditPassword('');
    setEditProfileImageUrl('');
  };

  const onUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    setError('');
    setMessage('');
    try {
      await apiClient.put(`${endpoint}/${editingId}`, {
        full_name: editFullName,
        email: editEmail,
        password: editPassword || null,
        profile_image_url: editProfileImageUrl || null,
      });
      setMessage(`${roleTitle.slice(0, -1)} updated successfully.`);
      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const onDelete = async (userId: string) => {
    const confirmed = window.confirm(`Delete this ${roleTitle.slice(0, -1).toLowerCase()}?`);
    if (!confirmed) return;
    setError('');
    setMessage('');
    try {
      await apiClient.delete(`${endpoint}/${userId}`);
      setMessage(`${roleTitle.slice(0, -1)} deleted successfully.`);
      if (editingId === userId) {
        cancelEdit();
      }
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Management</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{roleTitle}</h1>
          <p className="max-w-2xl text-slate-600">{roleDescription}</p>
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

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold text-slate-900">Add {roleTitle.slice(0, -1)}</p>
          <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Full name</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Email</label>
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Password</label>
              <input
                type="password"
                minLength={8}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadField label="Profile image" value={profileImageUrl} onChange={setProfileImageUrl} />
            </div>

            <div className="sm:col-span-2">
              <button className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800">
                Add {roleTitle.slice(0, -1)}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <p className="text-sm font-semibold text-slate-900">{roleTitle} Directory</p>
            <p className="text-sm text-slate-600">{loading ? 'Loading...' : `${users.length} total`}</p>
          </div>

          {users.length === 0 && !loading ? (
            <div className="px-6 py-8 text-sm text-slate-600">No {roleTitle.toLowerCase()} found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {users.map((user) => (
                    <tr key={user.id} className="bg-white/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{user.full_name}</td>
                      <td className="px-6 py-4 text-slate-700">{user.email}</td>
                      <td className="px-6 py-4 text-slate-700">{new Date(user.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(user.id)}
                            className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {editingId && (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-slate-900">Edit {roleTitle.slice(0, -1)}</p>
            <form onSubmit={onUpdate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Full name</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={editFullName}
                  onChange={(event) => setEditFullName(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  New password (optional)
                </label>
                <input
                  type="password"
                  minLength={8}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={editPassword}
                  onChange={(event) => setEditPassword(event.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploadField label="Profile image" value={editProfileImageUrl} onChange={setEditProfileImageUrl} />
              </div>

              <div className="sm:col-span-2 flex gap-2">
                <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Save changes</button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}