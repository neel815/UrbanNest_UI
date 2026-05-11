'use client';

import { useEffect, useState } from 'react';

import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import PlusIcon from '@/assets/icons/plus.svg';

type PatrolCheckpoint = {
  id: string;
  name: string;
  order_index: number;
};

type PatrolRoute = {
  id: string;
  name: string;
  description: string | null;
  building_id: string;
  is_active: boolean;
  checkpoints: PatrolCheckpoint[];
  created_at: string;
  updated_at: string;
};

type CheckpointDraft = {
  name: string;
};

export default function AdminPatrolRoutesPage() {
  const [routes, setRoutes] = useState<PatrolRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingRouteId, setDeletingRouteId] = useState('');

  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [checkpoints, setCheckpoints] = useState<CheckpointDraft[]>([{ name: '' }]);

  const loadRoutes = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.patrol.adminRoutesList);
      setRoutes(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const resetForm = () => {
    setRouteName('');
    setDescription('');
    setCheckpoints([{ name: '' }]);
    setShowCreateModal(false);
  };

  const openDeleteDialog = (routeId: string) => {
    setDeletingRouteId(routeId);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeletingRouteId('');
    setShowDeleteDialog(false);
  };

  const addCheckpoint = () => {
    setCheckpoints((current) => [...current, { name: '' }]);
  };

  const updateCheckpoint = (index: number, value: string) => {
    setCheckpoints((current) => current.map((checkpoint, currentIndex) => (currentIndex === index ? { name: value } : checkpoint)));
  };

  const removeCheckpoint = (index: number) => {
    setCheckpoints((current) => {
      if (current.length === 1) {
        return [{ name: '' }];
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const submitRoute = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const normalizedCheckpoints = checkpoints
        .map((checkpoint, index) => ({
          name: checkpoint.name.trim(),
          order_index: index + 1,
        }))
        .filter((checkpoint) => checkpoint.name.length > 0);

      if (!routeName.trim()) {
        throw new Error('Route name is required');
      }
      if (normalizedCheckpoints.length === 0) {
        throw new Error('Add at least one checkpoint');
      }
      if (normalizedCheckpoints.length !== checkpoints.length) {
        throw new Error('Checkpoint names cannot be empty');
      }

      const payload = {
        name: routeName.trim(),
        description: description.trim() || null,
        checkpoints: normalizedCheckpoints,
      };

      const createdRoute = await apiClient.post(API_ENDPOINTS.patrol.adminRoutesCreate, payload);
      setRoutes((current) => [createdRoute, ...current]);
      resetForm();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingRouteId) return;
    setSaving(true);
    setError('');
    try {
      await apiClient.delete(API_ENDPOINTS.patrol.adminRoutesDelete(deletingRouteId));
      setRoutes((current) => current.filter((route) => route.id !== deletingRouteId));
      closeDeleteDialog();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">CONTROL CENTER</p>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">Patrol Routes</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Define patrol paths for security guards to follow during their rounds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
          >
            <PlusIcon className="h-5 w-5" fill="currentColor" />
            Create Route
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-sm">
              <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : routes.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {routes.map((route) => (
            <article
              key={route.id}
              className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(23,51,38,0.1)]"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-[#173326]">{route.name}</h2>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {route.checkpoints.length} checkpoints
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#596154]">
                    {route.description || 'No description provided.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openDeleteDialog(route.id)}
                  className="rounded-full border border-[#D8D0BC] bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Checkpoints</p>
                <ol className="mt-3 space-y-3">
                  {route.checkpoints.map((checkpoint) => (
                    <li
                      key={checkpoint.id}
                      className="flex items-start gap-3 rounded-2xl border border-[#E6E0CF] bg-white px-4 py-3"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F7F4E8]">
                        {checkpoint.order_index}
                      </span>
                      <span className="pt-1 text-sm font-medium text-[#173326]">{checkpoint.name}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-12 text-center shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <p className="text-lg font-semibold text-[#173326]">No patrol routes created</p>
          <p className="mt-2 text-sm text-[#596154]">
            Create a route for security guards to follow during their rounds.
          </p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-40 bg-[#173326]/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto mt-4 w-full max-w-3xl overflow-hidden rounded-[32px] border border-[#E6E0CF] bg-[#FBF8EF] shadow-[0_24px_80px_rgba(23,51,38,0.22)]">
            <div className="border-b border-[#E6E0CF] px-6 py-5">
              <h2 className="text-2xl font-semibold text-[#173326]">Create Patrol Route</h2>
              <p className="mt-1 text-sm text-[#596154]">Add checkpoints in the order security should visit them.</p>
            </div>

            <form onSubmit={submitRoute} className="space-y-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Route Name</span>
                  <input
                    value={routeName}
                    onChange={(event) => setRouteName(event.target.value)}
                    className="w-full rounded-2xl border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] outline-none focus:border-[#0F5B35]"
                    placeholder="Night Patrol"
                    required
                  />
                </label>
                <label className="space-y-2 md:col-span-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Description</span>
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="w-full rounded-2xl border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] outline-none focus:border-[#0F5B35]"
                    placeholder="Optional route notes"
                  />
                </label>
              </div>

              <section className="rounded-[28px] border border-[#E6E0CF] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#173326]">Checkpoints</p>
                    <p className="text-xs text-[#596154]">Add locations in the order they should be visited.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addCheckpoint}
                    className="rounded-full border border-[#D8D0BC] bg-[#FBF8EF] px-4 py-2 text-sm font-semibold text-[#173326] transition hover:bg-[#F4F0E4]"
                  >
                    Add Checkpoint
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {checkpoints.map((checkpoint, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-2xl border border-[#E6E0CF] bg-[#FBF8EF] p-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F7F4E8]">
                        {index + 1}
                      </div>
                      <input
                        value={checkpoint.name}
                        onChange={(event) => updateCheckpoint(index, event.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] outline-none focus:border-[#0F5B35]"
                        placeholder="Main Gate"
                      />
                      <button
                        type="button"
                        onClick={() => removeCheckpoint(index)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#D8D0BC] bg-white text-[#7A463D] transition hover:bg-rose-50"
                        aria-label={`Remove checkpoint ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex flex-wrap justify-end gap-3 border-t border-[#E6E0CF] pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[#D8D0BC] bg-white px-5 py-3 text-sm font-semibold text-[#173326] transition hover:bg-[#F4F0E4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        title="Delete Patrol Route"
        message="This will deactivate the patrol route for your building. Security guards will no longer see it as active."
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
        isOpen={showDeleteDialog}
        isDangerous
        confirmLabel={saving ? 'Deleting...' : 'Delete Route'}
      />
    </main>
  );
}