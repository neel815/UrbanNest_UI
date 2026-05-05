'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

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
};

type ManagedUnit = {
  id: string;
  unit_number: string;
  floor: number | null;
  plot_number: string | null;
  status: string;
  resident_name?: string | null;
};

const createMode = (process.env.NEXT_PUBLIC_ADMIN_CREATE_MODE as 'invite' | 'direct' | undefined) ?? 'invite';

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'R'
  );
}

function getJoinedYear(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.getFullYear();
}

export default function AdminResidentsPage() {
  const endpoint = API_ENDPOINTS.admin.residents;
  const inviteEndpoint = API_ENDPOINTS.admin.inviteResident;
  const unitsEndpoint = API_ENDPOINTS.admin.units;

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [units, setUnits] = useState<ManagedUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [unitId, setUnitId] = useState('');
  const [resetLink, setResetLink] = useState('');

  const loadUnits = useCallback(async () => {
    const data = await apiClient.get(unitsEndpoint);
    setUnits(data);
  }, [unitsEndpoint]);

  const loadUsers = useCallback(async () => {
    const data = await apiClient.get(endpoint);
    setUsers(data);
  }, [endpoint]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([loadUsers(), loadUnits()]);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [loadUnits, loadUsers]);

  const residentUnitMap = useMemo(() => {
    const map = new Map<string, ManagedUnit>();
    units.forEach((unit) => {
      if (unit.resident_name) {
        map.set(unit.resident_name.trim().toLowerCase(), unit);
      }
    });
    return map;
  }, [units]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const unit = residentUnitMap.get(user.full_name.trim().toLowerCase());
      const unitLabel = unit?.unit_number ?? '';
      return (
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        unitLabel.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery, residentUnitMap]);

  const getUnitLabel = (user: ManagedUser) => {
    const unit = residentUnitMap.get(user.full_name.trim().toLowerCase());
    return unit?.unit_number ?? 'Unit not assigned';
  };

  const resetCreateForm = () => {
    setFullName('');
    setEmail('');
      setPhoneNumber('');
    setPassword('');
    setUnitId('');
  };

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setResetLink('');

    try {
      if (!unitId) {
        throw new Error('Please select a unit');
      }

      if (createMode === 'invite') {
        const data = await apiClient.post(inviteEndpoint, {
          full_name: fullName,
          email,
                    phone_number: phoneNumber || null,
          unit_id: unitId,
        });
        setMessage(data.message || 'Resident invited successfully.');
        setResetLink(data.reset_link || '');
      } else {
        await apiClient.post(endpoint, {
                    phone_number: phoneNumber || null,
          full_name: fullName,
          email,
          password,
          unit_id: unitId,
        });
        setMessage('Resident created successfully.');
      }

      resetCreateForm();
      setShowCreateForm(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">HOME DIRECTORY</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">Residents</h1>
            <button
              type="button"
              onClick={() => setShowCreateForm((current) => !current)}
              className="rounded-2xl bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
            >
              + Add resident
            </button>
          </div>
          <p className="max-w-2xl text-slate-600">Every home, every person. Search, add and stay in touch.</p>
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

        {showCreateForm && (
          <div className="rounded-2xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-slate-900">
              {createMode === 'invite' ? 'Invite Resident' : 'Add Resident'}
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Plot / House Number
                </label>
                <select
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  value={unitId}
                  onChange={(event) => setUnitId(event.target.value)}
                  required
                >
                  <option value="">Select a vacant plot / house</option>
                  {units
                    .filter((unit) => unit.status === 'vacant')
                    .map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unit_number}
                      </option>
                    ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex gap-2">
                <button className="inline-flex items-center justify-center rounded-xl bg-[#0F5B35] px-5 py-2.5 text-sm font-semibold text-[#F7F4E8] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]">
                  {createMode === 'invite' ? 'Invite Resident' : 'Add Resident'}
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

        {resetLink && (
          <div className="rounded-2xl border border-[#E4DDCB] bg-[#FBF8EF] px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Activation link</p>
            <p className="mt-2 break-all font-medium text-slate-900">{resetLink}</p>
          </div>
        )}

        <div className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div className="relative w-full max-w-xl">
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A7F70]" fill="none" aria-hidden="true">
                <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, flat or email"
                className="w-full rounded-2xl border border-[#D8D0BC] bg-[#F6F2E8] py-3 pl-12 pr-4 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
              />
            </div>
            <p className="shrink-0 text-sm font-semibold text-[#6A7264]">
              {loading ? 'Loading...' : `${filteredUsers.length} of ${users.length}`}
            </p>
          </div>

          {filteredUsers.length === 0 && !loading ? (
            <div className="px-6 py-8 text-sm text-slate-600">No residents found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-3xl border border-[#D8D0BC] bg-[#FBF8EF] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-[#004D2D] text-2xl font-semibold text-[#F7F4E8]">
                        {getInitials(user.full_name)}
                      </div>
                      <div>
                        <h3 className="text-3xl font-semibold tracking-tight text-[#173326]">{user.full_name}</h3>
                        <p className="text-sm text-[#6A7264]">Since {getJoinedYear(user.created_at)}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-[#BED8C6] bg-[#E5F1E9] px-3 py-1 text-xs font-semibold text-[#2F7A45]">
                      Resident
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-[#4D5B53]">
                    <p className="flex items-center gap-2 text-base">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#657469]" fill="none" aria-hidden="true">
                        <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {getUnitLabel(user)}
                    </p>
                    <p className="flex items-center gap-2 text-base">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#657469]" fill="none" aria-hidden="true">
                        <path d="M22 16.92V21a1 1 0 0 1-1.09 1A19.86 19.86 0 0 1 3 5.09 1 1 0 0 1 4 4h4.09a1 1 0 0 1 1 .75l.7 2.8a1 1 0 0 1-.27.95L8.1 9.9a16 16 0 0 0 6 6l1.4-1.42a1 1 0 0 1 .95-.27l2.8.7a1 1 0 0 1 .75 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {user.phone_number || 'Not provided'}
                    </p>
                    <p className="flex items-center gap-2 text-base">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#657469]" fill="none" aria-hidden="true">
                        <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m22 7-10 7L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {user.email}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `mailto:${user.email}`;
                      }}
                      className="rounded-full border border-[#D8D0BC] bg-[#FBF8EF] px-4 py-2 text-sm font-semibold text-[#173326] hover:bg-[#F2EEE2]"
                    >
                      Message
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-[#F7F4E8] hover:bg-[#0B4B2C]"
                    >
                      View
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
