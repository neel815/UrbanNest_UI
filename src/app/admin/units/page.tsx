'use client';

import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from 'react';

import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { adminUnitApi, apiClient, getApiErrorMessage } from '@/utils/api';

type UnitRow = {
  id: string;
  building_id: string;
  unit_number: string;
  floor: number | null;
  plot_number: string | null;
  status: string;
  resident_name: string | null;
};

type UnitFormState = {
  unit_number: string;
  floor: string;
  plot_number: string;
  status: string;
};

const emptyForm: UnitFormState = {
  unit_number: '',
  floor: '',
  plot_number: '',
  status: 'vacant',
};

const unitStatuses = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
];

function formatStatus(status: string) {
  if (status === 'vacant') return 'Vacant';
  if (status === 'occupied') return 'Occupied';
  return 'Maintenance';
}

function UnitModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  submitLabel,
  buildingType,
}: {
  title: string;
  form: UnitFormState;
  setForm: Dispatch<SetStateAction<UnitFormState>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  submitLabel: string;
  buildingType: string | null;
}) {
  const isApartmentTower = buildingType === 'apartment_tower';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[28px] border border-[#E6E0CF] bg-[#FBF8EF] p-6 shadow-[0_24px_80px_rgba(23,51,38,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E0CF] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7D8577]">Units</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#173326]">{title}</h2>
            {buildingType && (
              <p className="mt-1 text-xs text-[#7D8577]">
                Building Type: <span className="font-semibold capitalize">{buildingType.replace(/_/g, ' ')}</span>
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-1.5 text-sm font-semibold text-[#173326]">
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Unit / Plot / House Number</label>
            <input
              className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
              value={form.unit_number}
              onChange={(event) => setForm((current) => ({ ...current, unit_number: event.target.value }))}
              required
            />
          </div>

          {isApartmentTower ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Floor Number</label>
              <input
                type="number"
                className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
                value={form.floor}
                onChange={(event) => setForm((current) => ({ ...current, floor: event.target.value }))}
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Plot Number</label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-white px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
                value={form.plot_number}
                onChange={(event) => setForm((current) => ({ ...current, plot_number: event.target.value }))}
                placeholder="e.g., A1, B2"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#7D8577]">Status</label>
            <select
              className="mt-2 w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:border-[#0F5B35] focus:ring-2 focus:ring-[#0F5B35]/10"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              {unitStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <button className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)]">
              {submitLabel}
            </button>
            <button type="button" onClick={onClose} className="rounded-full border border-[#D8D0BC] bg-[#F6F2E8] px-5 py-3 text-sm font-semibold text-[#173326]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitRow | null>(null);
  const [form, setForm] = useState<UnitFormState>(emptyForm);
  const [buildingType, setBuildingType] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUnitId, setDeletingUnitId] = useState<string>('');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const loadUnits = async () => {
    const data = await apiClient.get(adminUnitApi.list);
    setUnits(data);
  };

  const loadBuildingInfo = async () => {
    try {
      const data = await apiClient.get('/api/admin/building-info');
      setBuildingType(data.building_type);
    } catch (err) {
      console.error('Failed to load building info:', err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadBuildingInfo();
        await loadUnits();
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const openCreateModal = () => {
    setError('');
    setMessage('');
    setForm(emptyForm);
    setShowCreateModal(true);
  };

  const openEditModal = (unit: UnitRow) => {
    setError('');
    setMessage('');
    setEditingUnit(unit);
    setForm({
      unit_number: unit.unit_number,
      floor: unit.floor === null ? '' : String(unit.floor),
      plot_number: unit.plot_number === null ? '' : unit.plot_number,
      status: unit.status,
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingUnit(null);
    setForm(emptyForm);
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const isApartmentTower = buildingType === 'apartment_tower';
      await apiClient.post(adminUnitApi.create, {
        unit_number: form.unit_number,
        floor: isApartmentTower ? (form.floor ? Number(form.floor) : null) : null,
        plot_number: !isApartmentTower ? (form.plot_number || null) : null,
        status: form.status,
      });
      setMessage('Unit created successfully.');
      closeModal();
      await loadUnits();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUnit) return;
    setError('');
    setMessage('');
    try {
      const isApartmentTower = buildingType === 'apartment_tower';
      await apiClient.patch(adminUnitApi.update(editingUnit.id), {
        unit_number: form.unit_number,
        floor: isApartmentTower ? (form.floor ? Number(form.floor) : null) : null,
        plot_number: !isApartmentTower ? (form.plot_number || null) : null,
        status: form.status,
      });
      setMessage('Unit updated successfully.');
      closeModal();
      await loadUnits();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDeleteClick = (unitId: string) => {
    setDeletingUnitId(unitId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setError('');
    setMessage('');
    try {
      await apiClient.delete(adminUnitApi.delete(deletingUnitId));
      setMessage('Unit deleted successfully.');
      setShowDeleteDialog(false);
      setDeletingUnitId('');
      await loadUnits();
    } catch (err) {
      setError(getApiErrorMessage(err));
      setShowDeleteDialog(false);
    }
  };

  const vacantCount = useMemo(() => units.filter((unit) => unit.status === 'vacant').length, [units]);

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.42em] text-[#76806F]">Building Control</p>
          <h1 className="mt-3 text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">Units</h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[#637062]">Manage building units, occupancy, and resident assignment from the admin portal.</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
        >
          + Add Unit
        </button>
      </section>

      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}
      {message && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</div>}

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7D8577]">Total Units</p>
          <p className="mt-3 text-4xl font-semibold text-[#173326]">{loading ? '—' : units.length}</p>
        </article>
        <article className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7D8577]">Vacant Units</p>
          <p className="mt-3 text-4xl font-semibold text-[#173326]">{loading ? '—' : vacantCount}</p>
        </article>
        <article className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7D8577]">Occupied Units</p>
          <p className="mt-3 text-4xl font-semibold text-[#173326]">{loading ? '—' : units.length - vacantCount}</p>
        </article>
      </section>

      <section className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
        <div className="flex items-center justify-between border-b border-[#E4DDCB] px-6 py-5">
          <div>
            <h2 className="text-3xl font-semibold text-[#173326]">Unit Directory</h2>
            <p className="text-sm text-[#6A7264]">{loading ? 'Loading units...' : `${units.length} units total`}</p>
          </div>
          <p className="text-sm text-[#6A7264]">Only vacant units can be assigned to new residents.</p>
        </div>

        {units.length === 0 && !loading ? (
          <div className="px-6 py-10 text-sm text-[#6A7264]">No units found in this building.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F6F1E5] text-xs font-semibold uppercase tracking-[0.2em] text-[#7D8577]">
                <tr>
                  <th className="px-6 py-3 text-left">Unit Number</th>
                  <th className="px-6 py-3 text-left">Floor</th>
                  <th className="px-6 py-3 text-left">Plot Number</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Resident Name</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1CF]">
                {units.map((unit) => (
                  <tr key={unit.id}>
                    <td className="px-6 py-4 font-semibold text-[#173326]">{unit.unit_number}</td>
                    <td className="px-6 py-4 text-[#6A7264]">{unit.floor ?? '—'}</td>
                    <td className="px-6 py-4 text-[#6A7264]">{unit.plot_number ?? '—'}</td>
                    <td className="px-6 py-4 text-[#6A7264]">{formatStatus(unit.status)}</td>
                    <td className="px-6 py-4 text-[#6A7264]">{unit.resident_name ?? '—'}</td>
                    <td className="px-6 py-4">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={() => setOpenActionMenuId((prev) => (prev === unit.id ? null : unit.id))}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#66716A] transition hover:border-slate-300 hover:text-[#1D3027]"
                          aria-label={`Open actions menu for unit ${unit.unit_number}`}
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                            <circle cx="12" cy="5" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="12" cy="19" r="1.8" />
                          </svg>
                        </button>

                        {openActionMenuId === unit.id && (
                         <div className="absolute bottom-full right-0 z-10 mb-2 w-[150px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl">
                            <button
                              type="button"
                              onClick={() => {
                                openEditModal(unit);
                                setOpenActionMenuId(null);
                              }}
                              className="w-full px-4 py-3 text-left text-[15px] text-[#495853] transition hover:bg-slate-50 hover:text-[#20332A]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteClick(unit.id);
                                setOpenActionMenuId(null);
                              }}
                              className="w-full px-4 py-3 text-left text-[15px] text-[#CC4343] transition hover:bg-slate-50 hover:text-[#A63434]"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreateModal && (
        <UnitModal
          title="Add Unit"
          form={form}
          setForm={setForm}
          onSubmit={submitCreate}
          onClose={closeModal}
          submitLabel="Create Unit"
          buildingType={buildingType}
        />
      )}

      {editingUnit && (
        <UnitModal
          title={`Edit Unit ${editingUnit.unit_number}`}
          form={form}
          setForm={setForm}
          onSubmit={submitEdit}
          onClose={closeModal}
          submitLabel="Save Changes"
          buildingType={buildingType}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Unit?"
        message="This unit will be permanently deleted. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeletingUnitId('');
        }}
        isDangerous
      />
    </main>
  );
}
