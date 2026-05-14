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
  photo_url?: string | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
};

type RequestFormState = {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  photo_url: string;
};

const categoryLabelMap: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  carpentry: 'Carpentry',
  cleaning: 'Cleaning',
  internet: 'Internet',
  other: 'Other',
};

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelingRequest, setCancelingRequest] = useState<MaintenanceRequest | null>(null);
  const [formData, setFormData] = useState<RequestFormState>({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
    photo_url: '',
  });

  const loadRequests = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.resident.maintenance);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const sortedRequests = useMemo(
    () => [...requests].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()),
    [requests],
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

  const handleCreateRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        photo_url: formData.photo_url || null,
      };
      await apiClient.post(API_ENDPOINTS.resident.maintenance, payload);
      setSuccess('Maintenance request submitted successfully.');
      setFormData({ title: '', description: '', category: 'plumbing', priority: 'medium', photo_url: '' });
      setShowModal(false);
      await loadRequests();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async () => {
    if (!cancelingRequest) return;
    
    setError('');
    setSuccess('');

    try {
      await apiClient.patch(API_ENDPOINTS.resident.maintenanceCancel(cancelingRequest.id), {});
      setSuccess('Maintenance request cancelled.');
      setShowCancelDialog(false);
      setCancelingRequest(null);
      await loadRequests();
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

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Services</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">Maintenance Requests</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Track repair and complaint tickets raised for your unit.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
          >
            New Request
          </button>
        </div>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-48 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedRequests.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No maintenance requests yet</p>
          <p className="mt-2 text-sm text-slate-600">Use New Request to submit a repair or complaint ticket.</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-5 rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0B4B2C]"
          >
            Submit Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRequests.map((request) => (
            <article key={request.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      {categoryLabelMap[request.category] || request.category}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPriorityStyle(request.priority)}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusStyle(request.status)}`}>
                      {request.status === 'in_progress'
                        ? 'In Progress'
                        : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-slate-900">{request.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{request.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span>Created {new Date(request.created_at).toLocaleDateString()}</span>
                    <span>Updated {new Date(request.updated_at).toLocaleDateString()}</span>
                  </div>
                  {request.status === 'resolved' && request.resolution_note && (
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Resolution Note</p>
                      <p className="mt-2 text-sm text-emerald-900">{request.resolution_note}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  {request.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => onCancelClick(request)}
                      className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">New Request</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Submit maintenance request</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  required
                  minLength={2}
                  maxLength={150}
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Short description of the issue"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  required
                  minLength={5}
                  rows={5}
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Describe the issue in detail"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="internet">Internet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(event) => setFormData({ ...formData, priority: event.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Photo URL</label>
                <input
                  value={formData.photo_url}
                  onChange={(event) => setFormData({ ...formData, photo_url: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="Optional image URL"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
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
