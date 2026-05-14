'use client';

import { createPortal } from 'react-dom';
import { FormEvent, useEffect, useState } from 'react';
import ImageUploadField from '../../../components/ImageUploadField';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import ClockSmallIcon from '@/assets/icons/clock-small.svg';
import MoreVerticalIcon from '@/assets/icons/more-vertical.svg';
import CircleIcon from '@/assets/icons/circle.svg';

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
  shift?: string | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  assigned_gate?: string | null;
  assigned_building_name?: string | null;
  badge_number?: string | null;
};

type ManagedUnit = {
  id: string;
  unit_number: string;
  floor: number | null;
  plot_number: string | null;
  status: string;
  resident_name?: string | null;
};

const shiftOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
  { value: 'rotating', label: 'Rotating' },
] as const;

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
  const [shift, setShift] = useState('rotating');
  const [shiftStartTime, setShiftStartTime] = useState('');
  const [shiftEndTime, setShiftEndTime] = useState('');
  const [assignedGate, setAssignedGate] = useState('');
  const [unitId, setUnitId] = useState('');
  const [units, setUnits] = useState<ManagedUnit[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [editShift, setEditShift] = useState('rotating');
  const [editShiftStartTime, setEditShiftStartTime] = useState('');
  const [editShiftEndTime, setEditShiftEndTime] = useState('');
  const [editAssignedGate, setEditAssignedGate] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string>('');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [deletingId, setDeletingId] = useState<string>('');

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

  const formatShiftLabel = (shift?: string | null) => {
    if (!shift) return 'To be assigned';
    return shift
      .replace(/_/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(' ');
  };

  const loadUnits = async () => {
    if (!showUnitSelect || !unitsEndpoint) return;
    const data = await apiClient.get(unitsEndpoint);
    setUnits(Array.isArray(data) ? data : []);
  };

  const loadUsers = async () => {
    const data = await apiClient.get(endpoint);
    const safeUsers = Array.isArray(data) ? data : [];
    setUsers(safeUsers);
    setTotalGuards(safeUsers.length);
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
    setShift('rotating');
    setShiftStartTime('');
    setShiftEndTime('');
    setAssignedGate('');
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
          shift,
          shift_start_time: shiftStartTime || null,
          shift_end_time: shiftEndTime || null,
          assigned_gate: assignedGate || null,
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
          shift,
          shift_start_time: shiftStartTime || null,
          shift_end_time: shiftEndTime || null,
          assigned_gate: assignedGate || null,
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
    setEditShift(user.shift || 'rotating');
    setEditShiftStartTime(user.shift_start_time || '');
    setEditShiftEndTime(user.shift_end_time || '');
    setEditAssignedGate(user.assigned_gate || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFullName('');
    setEditEmail('');
    setEditPhoneNumber('');
    setEditPassword('');
    setEditProfileImage('');
    setEditShift('rotating');
    setEditShiftStartTime('');
    setEditShiftEndTime('');
    setEditAssignedGate('');
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
        shift: editShift,
        shift_start_time: editShiftStartTime || null,
        shift_end_time: editShiftEndTime || null,
        assigned_gate: editAssignedGate || null,
      });
      setMessage(`${roleTitle.slice(0, -1)} updated successfully.`);
      cancelEdit();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const onDelete = async () => {
    setError('');
    setMessage('');
    try {
      if (!deletingUserId) {
        setError('No user selected to delete.');
        setShowDeleteDialog(false);
        return;
      }
      setDeletingId(deletingUserId);
      await apiClient.delete(`${endpoint}/${deletingUserId}`);
      setMessage(`${roleTitle.slice(0, -1)} deleted successfully.`);
      if (editingId === deletingUserId) {
        cancelEdit();
      }
      setShowDeleteDialog(false);
      setDeletingUserId('');
      setDeletingId('');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setShowDeleteDialog(false);
      setDeletingId('');
    }
  };

  const onDeleteClick = (userId: string) => {
    setDeletingUserId(userId);
    setShowDeleteDialog(true);
  };

  useEffect(() => {
    if (!openActionMenuId) return;

    const closeMenu = () => {
      setOpenActionMenuId(null);
      setActionMenuAnchor(null);
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const menuElement = document.getElementById('security-action-menu');

      if (actionMenuAnchor?.contains(target)) return;
      if (menuElement?.contains(target)) return;
      closeMenu();
    };

    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    document.addEventListener('mousedown', onPointerDown);

    return () => {
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [actionMenuAnchor, openActionMenuId]);

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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Shift</label>
                <select
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  value={shift}
                  onChange={(event) => setShift(event.target.value)}
                >
                  {shiftOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Shift Start Time</label>
                <input
                  type="time"
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  value={shiftStartTime}
                  onChange={(event) => setShiftStartTime(event.target.value)}
                  placeholder="e.g. 06:00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Shift End Time</label>
                <input
                  type="time"
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  value={shiftEndTime}
                  onChange={(event) => setShiftEndTime(event.target.value)}
                  placeholder="e.g. 14:00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Assigned Gate/Location</label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  value={assignedGate}
                  onChange={(event) => setAssignedGate(event.target.value)}
                  placeholder="e.g. Main Gate, East Gate"
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F6F2E8]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#004D2D] text-lg font-semibold text-[#F7F4E8]">
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#173326]">{user.full_name}</p>
                            <p className="text-xs text-[#6A7264]">{user.phone_number || 'Not provided'}</p>
                            <p className="text-xs text-[#6A7264]">
                              {user.badge_number ? `Badge #${user.badge_number}` : 'Badge not assigned'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6A7264]">
                        <div className="flex items-center gap-2">
                          <CircleIcon className="h-4 w-4 text-[#657469]" fill="none" />
                          {user.assigned_building_name || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#6A7264]">
                        <div className="flex items-center gap-2">
                          <ClockSmallIcon className="h-4 w-4 text-[#657469]" fill="none" />
                          {formatShiftLabel(user.shift)}
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
                        <div className="flex w-full items-center justify-center">
                          <div className="relative flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(event) => {
                                setActionMenuAnchor(event.currentTarget as HTMLElement);
                                setOpenActionMenuId((prev) => (prev === user.id ? null : user.id));
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#66716A] transition hover:border-slate-300 hover:text-[#1D3027]"
                              aria-label={`Open actions menu for ${user.full_name}`}
                            >
                              <MoreVerticalIcon className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                            </button>

                            {openActionMenuId === user.id && actionMenuAnchor && typeof document !== 'undefined' &&
                              createPortal(
                                (() => {
                                  const rect = actionMenuAnchor.getBoundingClientRect();
                                  const menuWidth = 150;
                                  const gap = 8;
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const spaceAbove = rect.top;
                                  const openAbove = spaceBelow < 120 && spaceAbove > spaceBelow;
                                  const top = openAbove ? rect.top - gap : rect.bottom + gap;
                                  const left = Math.min(
                                    Math.max(rect.right - menuWidth, 12),
                                    window.innerWidth - menuWidth - 12,
                                  );

                                  return (
                                    <div
                                      id="security-action-menu"
                                      style={{
                                        top,
                                        left,
                                        width: menuWidth,
                                        position: 'fixed',
                                        transform: openAbove ? 'translateY(-100%)' : 'none',
                                      }}
                                      className="z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          startEdit(user);
                                          setOpenActionMenuId(null);
                                          setActionMenuAnchor(null);
                                        }}
                                        className="w-full px-4 py-3 text-left text-[15px] text-[#495853] transition hover:bg-slate-50 hover:text-[#20332A]"
                                      >
                                        Assign
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteClick(user.id);
                                          setOpenActionMenuId(null);
                                          setActionMenuAnchor(null);
                                        }}
                                        disabled={deletingId === user.id}
                                        className="w-full px-4 py-3 text-left text-[15px] text-[#CC4343] transition hover:bg-slate-50 hover:text-[#A63434] disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {deletingId === user.id ? 'Deleting...' : 'Remove'}
                                      </button>
                                    </div>
                                  );
                                })(),
                                document.body,
                              )}
                          </div>
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
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Shift</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={editShift}
                  onChange={(event) => setEditShift(event.target.value)}
                >
                  {shiftOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Shift Start Time</label>
                <input
                  type="time"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={editShiftStartTime}
                  onChange={(event) => setEditShiftStartTime(event.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Shift End Time</label>
                <input
                  type="time"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={editShiftEndTime}
                  onChange={(event) => setEditShiftEndTime(event.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Assigned Gate/Location</label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={editAssignedGate}
                  onChange={(event) => setEditAssignedGate(event.target.value)}
                  placeholder="e.g. Main Gate, East Gate"
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

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Security Guard?"
        message="This security guard will be permanently deleted. This action cannot be undone."
        onConfirm={onDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeletingUserId('');
        }}
        isDangerous
      />
    </main>
  );
}

