'use client';

import { FormEvent, useEffect, useState } from 'react';
import ImageUploadField from '../../../components/ImageUploadField';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type ManagedUser = {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  role: string;
  profile_image?: string | null;
  created_at: string;
  must_reset_password?: boolean;
  is_active?: boolean;
};

type ManagedUnit = {
  id: string;
  unit_number: string;
  floor: number | null;
  plot_number: string | null;
  status: string;
  resident_name?: string | null;
};

export default function AdminSecurityPage() {
  const roleTitle = 'Security Guards';
  const roleDescription = 'Shift-by-shift clarity for the team keeping everyone safe.';
  const endpoint = API_ENDPOINTS.admin?.security || '/api/admin/security';
  const createMode = (process.env.NEXT_PUBLIC_ADMIN_CREATE_MODE as 'invite' | 'direct' | undefined) ?? 'invite';
  const inviteEndpoint = API_ENDPOINTS.admin.inviteSecurity;
  const showCreateImageUpload = false;
  const showUnitSelect = false;
  const unitsEndpoint = API_ENDPOINTS.admin.units;

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [totalGuards, setTotalGuards] = useState(0);
  const [onDutyNow, setOnDutyNow] = useState(0);
  const [activeShifts, setActiveShifts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [unitId, setUnitId] = useState('');
  const [units, setUnits] = useState<ManagedUnit[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');

  function getInitials(name: string) {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'G'
    );
  }

  const loadUnits = async () => {
    if (!showUnitSelect || !unitsEndpoint) return;
    const data = await apiClient.get(unitsEndpoint);
    setUnits(data);
  };

  const loadUsers = async () => {
    const data = await apiClient.get(endpoint);
    setUsers(data);
    setTotalGuards(data.length);
  };

  const loadStats = async () => {
    try {
      const stats = await apiClient.get(API_ENDPOINTS.admin.securityStats);
      setTotalGuards(stats.total_security ?? 0);
      setOnDutyNow(stats.on_duty_now ?? 0);
      setActiveShifts(stats.active_shifts ?? 0);
    } catch (err) {
      // ignore - keep previous values
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([loadUsers(), loadUnits(), loadStats()]);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [endpoint]);

  const resetCreateForm = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setProfileImage('');
    setUnitId('');
    setShowCreateForm(false);
  };

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (createMode === 'invite') {
        if (!inviteEndpoint) {
          throw new Error('Invite endpoint is not configured');
        }
        if (showUnitSelect && !unitId) {
          throw new Error('Please select a unit');
        }
        const data = await apiClient.post(inviteEndpoint, {
          full_name: fullName,
          email,
          phone_number: phoneNumber || null,
          profile_image: profileImage || null,
          unit_id: showUnitSelect ? unitId : null,
        });
        setMessage(data.message || `${roleTitle.slice(0, -1)} invited successfully.`);
      } else {
        if (showUnitSelect && !unitId) {
          throw new Error('Please select a unit');
        }
        await apiClient.post(endpoint, {
          full_name: fullName,
          email,
          phone_number: phoneNumber || null,
          password,
          profile_image: profileImage || null,
          unit_id: showUnitSelect ? unitId : null,
        });
        setMessage(`${roleTitle.slice(0, -1)} created successfully.`);
      }
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
    setEditPhoneNumber(user.phone_number || '');
    setEditPassword('');
    setEditProfileImage(user.profile_image || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFullName('');
    setEditEmail('');
    setEditPhoneNumber('');
    setEditPassword('');
    setEditProfileImage('');
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
        phone_number: editPhoneNumber || null,
        password: editPassword || null,
        profile_image: editProfileImage || null,
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
        {/* Header */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">CONTROL CENTER</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">{roleTitle}</h1>
              <p className="max-w-2xl text-slate-600">{roleDescription}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm((current) => !current)}
              className="rounded-2xl bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
            >
              + Onboard guard
            </button>
          </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#D8D0BC] bg-[#FBF8EF] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6A7264]">Total Guards</p>
            <p className="mt-3 text-5xl font-semibold text-[#173326]">{totalGuards}</p>
          </div>
          <div className="rounded-3xl border border-[#D8D0BC] bg-[#FBF8EF] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6A7264]">On Duty Now</p>
            <p className="mt-3 text-5xl font-semibold text-[#173326]">{onDutyNow}</p>
          </div>
          <div className="rounded-3xl border border-[#D8D0BC] bg-[#FBF8EF] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6A7264]">Active Shifts</p>
            <p className="mt-3 text-5xl font-semibold text-[#173326]">{activeShifts}</p>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="rounded-2xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-slate-900">
              {createMode === 'invite' ? 'Invite Security Guard' : 'Add Security Guard'}
            </p>
            <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Full name</label>
                <input
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Phone Number</label>
                <input
                  type="tel"
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              {createMode === 'direct' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Password</label>
                  <input
                    type="password"
                    minLength={8}
                    className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              )}

              <div className="sm:col-span-2 flex gap-2">
                <button className="inline-flex items-center justify-center rounded-xl bg-[#0F5B35] px-5 py-2.5 text-sm font-semibold text-[#F7F4E8] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]">
                  {createMode === 'invite' ? 'Invite Guard' : 'Add Guard'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Today's Roster */}
        <div className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-sm backdrop-blur">
          <div className="border-b border-slate-200 px-6 py-4">
            <p className="text-sm font-semibold text-slate-900">Today's Roster</p>
            <p className="text-xs text-[#6A7264]">Tuesday · April 28, 2026</p>
          </div>

          {users.length === 0 && !loading ? (
            <div className="px-6 py-8 text-sm text-slate-600">No guards found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-[#FBF8EF]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#6A7264]">GUARD</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#6A7264]">POST</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#6A7264]">SHIFT</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#6A7264]">STATUS</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#6A7264]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30">
                  {users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-[#F6F2E8]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#004D2D] text-lg font-semibold text-[#F7F4E8]">
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#173326]">{user.full_name}</p>
                            <p className="text-xs text-[#6A7264]">{user.phone_number || 'Not provided'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6A7264]">
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#657469]" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Main Gate
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6A7264]">
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#657469]" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          06:00 - 14:00
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.must_reset_password ? (
                          <span className="inline-flex items-center rounded-full border border-[#F5D0D0] bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#9B2C2C]">
                            Pending
                          </span>
                        ) : user.is_active ? (
                          <span className="inline-flex items-center rounded-full border border-[#BED8C6] bg-[#E5F1E9] px-3 py-1 text-xs font-semibold text-[#2F7A45]">
                            • On Duty
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            Off Duty
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="text-[#0F5B35] hover:text-[#0B4B2C] font-semibold text-sm"
                          >
                            Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(user.id)}
                            className="text-rose-600 hover:text-rose-700 font-semibold text-sm"
                          >
                            Remove
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

        {/* Edit Form */}
        {editingId && (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-slate-900">Edit Guard</p>
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
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Phone Number</label>
                <input
                  type="tel"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={editPhoneNumber}
                  onChange={(event) => setEditPhoneNumber(event.target.value)}
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

