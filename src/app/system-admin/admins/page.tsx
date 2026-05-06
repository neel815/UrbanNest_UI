'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type BuildingItem = {
  id: string;
  name: string;
  address: string;
};

type AdminItem = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  must_reset_password: boolean;
  building_id?: string | null;
  building_name?: string | null;
  profile_image?: string | null;
};

type StatusFilter = 'all' | 'active' | 'pending' | 'suspended';

function getInitials(fullName: string) {
  return (
    fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'A'
  );
}

function formatJoinedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusMeta(admin: AdminItem) {
  if (admin.must_reset_password) {
    return {
      key: 'pending' as const,
      label: 'Pending',
      className: 'border-amber-200 bg-amber-50 text-amber-800',
      dotClassName: 'bg-amber-500',
    };
  }

  return {
    key: 'active' as const,
    label: 'Active',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dotClassName: 'bg-emerald-500',
  };
}

export default function AdminListPage() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [buildingLoading, setBuildingLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminItem | null>(null);

  const loadAdmins = async () => {
    const data = await apiClient.get(API_ENDPOINTS.systemAdmin.admins);
    setAdmins(data);
  };

  const loadBuildings = async () => {
    const data = await apiClient.get(API_ENDPOINTS.systemAdmin.buildings);
    setBuildings(data);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([loadAdmins(), loadBuildings()]);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
        setBuildingLoading(false);
      }
    };

    initialize();
  }, []);

  const onAddAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setInviting(true);
    try {
      const data = await apiClient.post(API_ENDPOINTS.systemAdmin.inviteAdmin, {
        full_name: fullName,
        email,
        building_id: buildingId,
      });
      setMessage(data.message);
      setFullName('');
      setEmail('');
      setBuildingId('');
      setIsInviteOpen(false);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add admin failed');
    } finally {
      setInviting(false);
    }
  };

  const onDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    setError('');
    setMessage('');
    setDeletingId(adminToDelete.id);

    try {
      const data = await apiClient.delete(API_ENDPOINTS.systemAdmin.deleteAdmin(adminToDelete.id));
      setMessage(data.message || `${adminToDelete.full_name} deleted`);
      setShowDeleteDialog(false);
      setAdminToDelete(null);
      await loadAdmins();
    } catch (err) {
      setError(getApiErrorMessage(err));
      setShowDeleteDialog(false);
      setAdminToDelete(null);
    } finally {
      setDeletingId('');
    }
  };

  const onDeleteClick = (admin: AdminItem) => {
    setAdminToDelete(admin);
    setShowDeleteDialog(true);
  };

  const selectedBuilding = buildings.find((building) => building.id === buildingId);

  const filteredAdmins = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return admins.filter((admin) => {
      const status = getStatusMeta(admin).key;
      const matchesSearch =
        !query ||
        admin.full_name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        (admin.building_name || '').toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || statusFilter === status || (statusFilter === 'suspended' && false);

      return matchesSearch && matchesStatus;
    });
  }, [admins, searchTerm, statusFilter]);

  const renderInviteForm = () => (
    <form onSubmit={onAddAdmin} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#7A7F70]">
            Full name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-2xl border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-3 text-sm text-[#173326] outline-none transition placeholder:text-[#9AA092] focus:border-[#0F5B35] focus:bg-white focus:ring-4 focus:ring-[#0F5B35]/10"
            placeholder="Jane Doe"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#7A7F70]">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-3 text-sm text-[#173326] outline-none transition placeholder:text-[#9AA092] focus:border-[#0F5B35] focus:bg-white focus:ring-4 focus:ring-[#0F5B35]/10"
            placeholder="admin@urbannest.io"
            type="email"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#7A7F70]">
          Society
        </label>
        <select
          value={buildingId}
          onChange={(e) => setBuildingId(e.target.value)}
          className="w-full rounded-2xl border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-3 text-sm text-[#173326] outline-none transition focus:border-[#0F5B35] focus:bg-white focus:ring-4 focus:ring-[#0F5B35]/10"
          required
          disabled={buildingLoading || buildings.length === 0}
        >
          <option value="">Select a society</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name} - {building.address}
            </option>
          ))}
        </select>
        {selectedBuilding && (
          <p className="mt-2 text-xs text-[#7A7F70]">Assigning admin access to {selectedBuilding.name}.</p>
        )}
        {buildings.length === 0 && !buildingLoading && (
          <p className="mt-2 text-xs text-amber-700">Add a building first before inviting admins.</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsInviteOpen(false)}
          className="rounded-full border border-[#E6E0CF] px-4 py-2.5 text-sm font-semibold text-[#596154] transition hover:bg-white"
        >
          Cancel
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F5B35] px-5 py-2.5 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={buildingLoading || buildings.length === 0 || inviting}
        >
          {inviting ? 'Inviting...' : 'Invite admin'}
        </button>
      </div>
    </form>
  );

  return (
    <main className="space-y-6 lg:space-y-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#7A7F70]">Control Center</p>
          <div>
            <h1 className="font-serif text-4xl leading-none tracking-[-0.04em] text-[#173326] lg:text-6xl">Admins</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#596154] lg:text-base">
              Invite new society owners, manage permissions, and keep the platform tidy.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessage('');
            setError('');
            setIsInviteOpen(true);
          }}
          className="inline-flex items-center gap-2 self-start rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
        >
          <span className="text-lg leading-none">+</span>
          Invite admin
        </button>
      </section>

      {(message || error) && (
        <section className="space-y-3">
          {message && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {error}
            </div>
          )}
        </section>
      )}

      <section className="rounded-[32px] border border-[#E6E0CF] bg-[#FBF8EF] shadow-[0_20px_60px_rgba(23,51,38,0.06)]">
        <div className="flex flex-col gap-4 border-b border-[#E6E0CF] px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-[#E6E0CF] bg-[#F8F4E7]/90 px-4 py-3 shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#7A7F70]" fill="none" aria-hidden="true">
              <path
                d="m21 21-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-[#173326] outline-none placeholder:text-[#9AA092]"
              placeholder="Search by name, email or society"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search admins"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-[#E6E0CF] bg-[#F8F4E7]/90 p-1 shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
              {(['all', 'active', 'pending', 'suspended'] as const).map((option) => {
                const label = option === 'all' ? 'All' : option[0].toUpperCase() + option.slice(1);
                const active = statusFilter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatusFilter(option)}
                    className={[
                      'rounded-full px-3.5 py-2 text-sm font-medium transition',
                      active
                        ? 'bg-[#0F5B35] text-[#F7F4E8] shadow-[0_8px_18px_rgba(15,91,53,0.18)]'
                        : 'text-[#596154] hover:bg-[#F3EFE3]',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#E6E0CF] bg-[#F8F4E7]/90 px-4 py-3 text-sm font-medium text-[#596154] shadow-[0_8px_24px_rgba(23,51,38,0.04)] transition hover:bg-[#F3EFE3]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M3 5h18M6 12h12M10 19h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              More filters
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-b-[32px]">
          {loading ? (
            <div className="space-y-3 px-4 py-5 lg:px-6">
              <div className="h-12 animate-pulse rounded-2xl bg-[#E9E2CF]" />
              <div className="h-12 animate-pulse rounded-2xl bg-[#E9E2CF]" />
              <div className="h-12 animate-pulse rounded-2xl bg-[#E9E2CF]" />
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#0F5B35] text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)]">
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
              <p className="mt-4 text-sm font-semibold text-[#173326]">No admins match this filter</p>
              <p className="mt-1 text-sm text-[#596154]">Try a different search term or status chip.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#F4F0E4]">
                  <tr className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6C756C]">
                    <th className="px-7 py-4">Admin</th>
                    <th className="px-5 py-4">Society</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-7 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0CF]">
                  {filteredAdmins.map((admin) => {
                    const status = getStatusMeta(admin);
                    return (
                      <tr key={admin.id} className="bg-[#FBF8EF] transition hover:bg-[#F7F3E8]">
                        <td className="px-7 py-5">
                          <div className="flex items-center gap-4">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#00522D] text-sm font-semibold text-[#F7F4E8]">
                              {getInitials(admin.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[16px] font-semibold leading-tight text-[#122B20]">{admin.full_name}</p>
                              <p className="truncate text-[13px] text-[#53605A]">{admin.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="inline-flex items-center gap-2 text-[16px] text-[#1F3128]">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#6D756F]" fill="none" aria-hidden="true">
                              <path
                                d="M4 20V6.8c0-.42.22-.81.58-1.02l6.8-3.9a1.25 1.25 0 0 1 1.24 0l6.8 3.9c.36.21.58.6.58 1.02V20M7 20V12h10v8M10 8.5h4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="truncate max-w-[220px]">{admin.building_name || 'Unassigned'}</span>
                          </div>
                        </td>


                        <td className="px-5 py-5">
                          <span className={[
                            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-semibold leading-none',
                            status.className,
                          ].join(' ')}>
                            <span className={['h-2 w-2 rounded-full', status.dotClassName].join(' ')} />
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-[16px] text-[#4A5752]">{formatJoinedAt(admin.created_at)}</td>

                        <td className="px-7 py-5">
                          <div className="flex items-center justify-end">
                            <div className="relative inline-flex">
                              <button
                                type="button"
                                onClick={() => setOpenActionMenuId((prev) => (prev === admin.id ? null : admin.id))}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#66716A] transition hover:border-slate-300 hover:text-[#1D3027]"
                                aria-label={`Open actions menu for ${admin.full_name}`}
                              >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                                  <circle cx="12" cy="5" r="1.8" />
                                  <circle cx="12" cy="12" r="1.8" />
                                  <circle cx="12" cy="19" r="1.8" />
                                </svg>
                              </button>

                              {openActionMenuId === admin.id && (
                                <div className="absolute right-0 top-full z-10 mt-2 w-[160px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMessage(`Suspend is not available yet for ${admin.full_name}.`);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-4 py-3 text-left text-[15px] text-[#495853] transition hover:bg-slate-50 hover:text-[#20332A]"
                                  >
                                    Suspend
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteClick(admin);
                                      setOpenActionMenuId(null);
                                    }}
                                    disabled={deletingId === admin.id}
                                    className="w-full px-4 py-3 text-left text-[15px] text-[#CC4343] transition hover:bg-slate-50 hover:text-[#A63434] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {deletingId === admin.id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173326]/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-[#E6E0CF] bg-[#FBF8EF] p-6 shadow-[0_30px_80px_rgba(23,51,38,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7A7F70]">Invite admin</p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] text-[#173326]">Create access</h2>
                <p className="mt-2 text-sm text-[#596154]">
                  New admins will receive a password setup link tied to the selected society.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#E6E0CF] bg-white text-[#596154] transition hover:text-[#173326]"
                aria-label="Close invite form"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-6">{renderInviteForm()}</div>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Admin?"
        message={`${adminToDelete?.full_name} will be permanently deleted. This action cannot be undone.`}
        onConfirm={onDeleteAdmin}
        onCancel={() => {
          setShowDeleteDialog(false);
          setAdminToDelete(null);
        }}
        isDangerous
      />
    </main>
  );
}
