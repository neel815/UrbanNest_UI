'use client';

import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  lastUpdated: string;
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.resident.maintenance);
        setRequests(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-amber-500 to-orange-500';
      case 'in_progress':
        return 'from-blue-600 to-indigo-600';
      case 'completed':
        return 'from-emerald-500 to-teal-500';
      case 'cancelled':
        return 'from-rose-500 to-pink-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-rose-500 to-pink-500';
      case 'medium':
        return 'from-amber-500 to-orange-500';
      case 'low':
        return 'from-emerald-500 to-teal-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: Omit<MaintenanceRequest, 'id' | 'date' | 'lastUpdated'> = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'pending'
    };

    const submitRequest = async () => {
      try {
        const data = await apiClient.post(API_ENDPOINTS.resident.maintenance, newRequest);
        setRequests([data, ...requests]);
        setFormData({ title: '', description: '', category: 'plumbing', priority: 'medium' });
        setShowForm(false);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    submitRequest();
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Services</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Maintenance Requests</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition hover:-translate-y-0.5"
            >
              New Request
            </button>
          </div>
          <p className="max-w-2xl text-slate-600">
            Submit and track maintenance requests for your unit.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {showForm && (
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Submit New Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  rows={3}
                  placeholder="Detailed description of the maintenance issue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition hover:-translate-y-0.5"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getStatusColor(request.status || 'pending')}`} />
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${getStatusColor(request.status || 'pending')} text-white shadow-sm`}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{request.title}</h3>
                        <p className="mt-2 text-slate-600">{request.description}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                        >
                          {request.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                        >
                          {request.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      <span className="capitalize">Category: {request.category}</span>
                      <span>•</span>
                      <span>Created: {new Date(request.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Updated: {new Date(request.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true">
                <path
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No maintenance requests found</p>
            <p className="mt-2 text-sm text-slate-500">Submit your first maintenance request to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition hover:-translate-y-0.5"
            >
              Submit Your First Request
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
