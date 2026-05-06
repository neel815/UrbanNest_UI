'use client';

import { useEffect, useMemo, useState } from 'react';

import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled';

type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: MaintenanceStatus;
  resident_id: string;
  resident_name?: string | null;
  unit_id?: string | null;
  unit_number?: string | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
};

const tabs: { key: MaintenanceStatus; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function AdminMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<MaintenanceStatus>('open');
  const [resolveTarget, setResolveTarget] = useState<MaintenanceRequest | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelingRequestId, setCancelingRequestId] = useState<string>('');
  const [cancelingRequest, setCancelingRequest] = useState<MaintenanceRequest | null>(null);

  const loadRequests = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.admin.maintenance);
      setRequests(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(
    () => requests.filter((request) => request.status === activeTab),
    [activeTab, requests],
  );

  const getPriorityStyle = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-700 ring-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 ring-amber-200';
      case 'low':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  };

  const getStatusStyle = (status: MaintenanceStatus) => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-800 ring-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 ring-blue-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 ring-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  };

  const categoryLabel = (category: string) => category.charAt(0).toUpperCase() + category.slice(1);

  const refreshAfterAction = async (message: string) => {
    setSuccess(message);
    await loadRequests();
  };

  const startWork = async (requestId: string) => {
    setError('');
    setSuccess('');
    try {
      await apiClient.patch(API_ENDPOINTS.admin.maintenanceStart(requestId), {});
      await refreshAfterAction('Request marked as in progress.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const cancelRequest = async () => {
    if (!cancelingRequest) return;
    
    setError('');
    setSuccess('');
    try {
      await apiClient.patch(API_ENDPOINTS.admin.maintenanceCancel(cancelingRequest.id), {});
      await refreshAfterAction('Request cancelled.');
      setShowCancelDialog(false);
      setCancelingRequest(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setShowCancelDialog(false);
      setCancelingRequest(null);
    }
  };

  const onCancelClick = (request: MaintenanceRequest) => {
    setCancelingRequest(request);
    setShowCancelDialog(true);
  };

  const openResolveModal = (request: MaintenanceRequest) => {
    setResolveTarget(request);
    setResolutionNote('');
  };

  const submitResolution = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resolveTarget) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.patch(API_ENDPOINTS.admin.maintenanceResolve(resolveTarget.id), {
        resolution_note: resolutionNote,
      });
      setResolveTarget(null);
      setResolutionNote('');
      await refreshAfterAction('Request resolved.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">CONTROL CENTER</p>
          <h1 className="mt-1 text-4xl font-serif tracking-tight text-slate-900 lg:text-6xl">Maintenance Requests</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Track open issues for your building and move requests through the approved workflow.</p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-2 shadow-sm">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'rounded-2xl px-4 py-2.5 text-sm font-semibold transition',
                  active ? 'bg-[#0F5B35] text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)]' : 'text-slate-600 hover:bg-[#E9E2CF]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}
        {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{success}</div>}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF]" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No {activeTab.replace('_', ' ')} requests</p>
          <p className="mt-2 text-sm text-slate-600">Requests for this status will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <article key={request.id} className="rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#E9BF73] px-3 py-1 text-xs font-semibold text-[#173326]">
                      {request.resident_name || 'Resident'}
                      {request.unit_number ? ` • Unit ${request.unit_number}` : ''}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-[#D8D0BC]">
                      {categoryLabel(request.category)}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityStyle(request.priority)}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusStyle(request.status)}`}>
                      {request.status === 'in_progress' ? 'In Progress' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">{request.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{request.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span>Created {new Date(request.created_at).toLocaleDateString()}</span>
                    {request.resolved_at && <span>Resolved {new Date(request.resolved_at).toLocaleDateString()}</span>}
                  </div>
                  {request.status === 'resolved' && request.resolution_note && (
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Resolution Note</p>
                      <p className="mt-2 text-sm text-emerald-900">{request.resolution_note}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  {activeTab === 'open' && (
                    <>
                      <button
                        type="button"
                        onClick={() => startWork(request.id)}
                        className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-[#F7F4E8] transition hover:bg-[#0B4B2C]"
                      >
                        Start Work
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelClick(request)}
                        className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {activeTab === 'in_progress' && (
                    <>
                      <button
                        type="button"
                        onClick={() => openResolveModal(request)}
                        className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-[#F7F4E8] transition hover:bg-[#0B4B2C]"
                      >
                        Mark Resolved
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelClick(request)}
                        className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {resolveTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76806F]">RESOLUTION NOTE</p>
                <h2 className="mt-2 text-2xl font-serif font-semibold text-slate-900">Add resolution note</h2>
              </div>
              <button
                type="button"
                onClick={() => setResolveTarget(null)}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-[#E9E2CF]"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitResolution} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Resolution Note</label>
                <textarea
                  required
                  rows={5}
                  value={resolutionNote}
                  onChange={(event) => setResolutionNote(event.target.value)}
                  className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                  placeholder="Describe how the issue was resolved"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  className="rounded-full border border-[#D8D0BC] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#FBF8EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-[#F7F4E8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Submit Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={showCancelDialog}
        title="Cancel Request?"
        message="This maintenance request will be marked as cancelled. This action cannot be undone."
        onConfirm={cancelRequest}
        onCancel={() => {
          setShowCancelDialog(false);
          setCancelingRequest(null);
        }}
        isDangerous
        confirmLabel="Cancel Request"
      />
    </main>
  );
}
