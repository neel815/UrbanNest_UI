'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type BuildingItem = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  building_type: 'apartment_tower' | 'row_house_tenement' | 'bungalow' | 'villa';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

type BuildingFormState = {
  name: string;
  address: string;
  description: string;
  building_type: 'apartment_tower' | 'row_house_tenement' | 'bungalow' | 'villa';
  status: 'active' | 'inactive';
};

const initialForm: BuildingFormState = {
  name: '',
  address: '',
  description: '',
  building_type: 'apartment_tower',
  status: 'active',
};

const buildingTypes = [
  { value: 'apartment_tower', label: 'Apartment Tower' },
  { value: 'row_house_tenement', label: 'Row House Tenement' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'villa', label: 'Villa' },
];

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<BuildingItem | null>(null);

  const loadBuildings = async () => {
    const data = await apiClient.get(API_ENDPOINTS.systemAdmin.buildings);
    setBuildings(data);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadBuildings();
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const stats = useMemo(
    () => ({
      total: buildings.length,
      active: buildings.filter((building) => building.status === 'active').length,
      inactive: buildings.filter((building) => building.status === 'inactive').length,
    }),
    [buildings],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        address: form.address,
        description: form.description || null,
        building_type: form.building_type,
        status: form.status,
      };

      if (editingId) {
        await apiClient.patch(`${API_ENDPOINTS.systemAdmin.buildings}/${editingId}`, payload);
        setMessage('Building updated successfully.');
      } else {
        await apiClient.post(API_ENDPOINTS.systemAdmin.buildings, payload);
        setMessage('Building created successfully.');
      }

      resetForm();
      await loadBuildings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (building: BuildingItem) => {
    setEditingId(building.id);
    setForm({
      name: building.name,
      address: building.address,
      description: building.description || '',
      building_type: building.building_type,
      status: building.status,
    });
    setMessage('');
    setError('');
  };

  const onDelete = async () => {
    if (!buildingToDelete) return;
    
    setError('');
    setMessage('');
    try {
      await apiClient.delete(`${API_ENDPOINTS.systemAdmin.buildings}/${buildingToDelete.id}`);
      setMessage('Building deleted successfully.');
      if (editingId === buildingToDelete.id) {
        resetForm();
      }
      setShowDeleteDialog(false);
      setBuildingToDelete(null);
      await loadBuildings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setShowDeleteDialog(false);
      setBuildingToDelete(null);
    }
  };

  const onDeleteClick = (building: BuildingItem) => {
    setBuildingToDelete(building);
    setShowDeleteDialog(true);
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Societies</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">Buildings</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FBF8EF] px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Building registry
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Create, update, and remove buildings from the system. Admin assignment depends on these records.
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              label: 'Total Buildings',
              value: stats.total,
              subtitle: 'Across the platform',
              trend: `${stats.active} active`,
              active: true,
            },
            {
              label: 'Active',
              value: stats.active,
              subtitle: 'Ready for assignment',
              trend: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%',
              active: false,
            },
            {
              label: 'Inactive',
              value: stats.inactive,
              subtitle: 'Hidden from assignment',
              trend: stats.total > 0 ? `${Math.round((stats.inactive / stats.total) * 100)}%` : '0%',
              active: false,
            },
          ].map((item) => (
            <article
              key={item.label}
              className={`rounded-[28px] border p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] ${
                item.active
                  ? 'border-[#1A5A36] bg-[linear-gradient(145deg,#0F5B35,#0A3B24)] text-[#F7F4E8]'
                  : 'border-[#E4DDCB] bg-[#FBF8EF] text-[#173326]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${item.active ? 'text-[#D0E4D5]' : 'text-[#7D8577]'}`}>
                    {item.label}
                  </p>
                  <div className={`${cormorant.className} mt-3 text-[3rem] leading-none font-semibold tracking-tight`}>
                    {loading ? <span className="inline-block h-12 w-20 animate-pulse rounded-full bg-current/10" /> : item.value.toLocaleString()}
                  </div>
                  <p className={`mt-3 text-sm ${item.active ? 'text-[#DDE9DF]' : 'text-[#647061]'}`}>{item.subtitle}</p>
                </div>

                <div className={`grid h-12 w-12 place-items-center rounded-full ${item.active ? 'bg-white/8 text-[#F7F4E8]' : 'bg-[#E4EDE6] text-[#0F5B35]'}`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d="M4 20V7.8c0-.54.29-1.03.75-1.3l7-4c.45-.26 1.05-.26 1.5 0l6 4c.46.27.75.76.75 1.3V20M7 20V12h10v8M10 12V8h4v4"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-sm font-semibold">
                <span
                  className={`rounded-full px-3 py-1 ${
                    item.active
                      ? 'bg-white/10 text-[#F7F4E8]'
                      : item.label === 'Inactive'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {item.trend}
                </span>
                <span className={item.active ? 'text-[#C9D7CC]' : 'text-[#677062]'}>of total</span>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#173326]">{editingId ? 'Edit building' : 'Create building'}</p>
                <p className="mt-1 text-sm text-[#6A7264]">
                  Keep the registry accurate so admin assignment and dashboard stats remain in sync.
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E4EDE6] text-[#0F5B35]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M4 20V7.8c0-.54.29-1.03.75-1.3l7-4c.45-.26 1.05-.26 1.5 0l6 4c.46.27.75.76.75 1.3V20M7 20V12h10v8M10 12V8h4v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Building name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
                  placeholder="Skyline Towers"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Building type</label>
                <select
                  value={form.building_type}
                  onChange={(event) => setForm((current) => ({ ...current, building_type: event.target.value as any }))}
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
                  required
                >
                  {buildingTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as 'active' | 'inactive' }))}
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Address</label>
                <input
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
                  placeholder="123 Main Street, Downtown"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-2 min-h-28 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
                  placeholder="Optional notes about the society or building."
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-[#0F5B35] px-5 py-2.5 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update building' : 'Create building'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center rounded-xl border border-[#D9D1BC] bg-white px-5 py-2.5 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.05)]"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-[28px] border border-[#1A5A36] bg-[linear-gradient(145deg,#0F5B35,#0A3B24)] text-[#F7F4E8] p-6 shadow-[0_10px_30px_rgba(15,91,53,0.18)]">
            <p className="text-sm font-semibold text-white/90">System rule</p>
            <p className="mt-2 text-lg font-semibold leading-snug">Buildings control admin assignment.</p>
            <p className="mt-2 text-sm text-white/70">
              Deleting a building is blocked when admins are still assigned to it.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#E4DDCB] px-6 py-4">
            <div>
              <p className={`${cormorant.className} text-3xl font-semibold text-[#173326]`}>Building directory</p>
              <p className="mt-1 text-sm text-[#6A7264]">Manage active and inactive societies from one place.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D1BC] bg-white px-3 py-1.5 text-sm font-semibold text-[#173326]">
              {loading ? 'Loading...' : `${buildings.length} total`}
            </div>
          </div>

          {buildings.length === 0 && !loading ? (
            <div className="px-6 py-10 text-center text-sm text-[#6A7264]">No buildings found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F4F0E4]">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">
                    <th className="px-6 py-4">Building</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Updated</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1CF]">
                  {buildings.map((building) => (
                    <tr key={building.id} className="bg-[#FBF8EF] hover:bg-white/60">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#173326]">{building.name}</p>
                          <p className="mt-1 max-w-sm text-xs text-[#6A7264]">{building.description || 'No description added.'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#173326]">{building.address}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                          {building.building_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            building.status === 'active'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {building.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#173326]">{new Date(building.updated_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(building)}
                            className="rounded-lg border border-[#D9D1BC] bg-white px-3 py-1.5 text-xs font-semibold text-[#173326]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteClick(building)}
                            className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
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
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Building?"
        message={`${buildingToDelete?.name} will be permanently deleted. This action cannot be undone.`}
        onConfirm={onDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setBuildingToDelete(null);
        }}
        isDangerous
      />
    </main>
  );
}
