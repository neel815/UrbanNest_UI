'use client';

import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import UserIcon from '@/assets/icons/user.svg';

interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  expected_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  vehicle_number: string | null;
  status: 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'denied';
  resident_id: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    visitor_name: '',
    purpose: '',
    expected_date: new Date().toISOString().split('T')[0],
    visitor_phone: '',
    vehicle_number: ''
  });

  useEffect(() => {
    const loadVisitors = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.resident.visitors);
        setVisitors(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadVisitors();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-amber-500 to-orange-500';
      case 'approved':
        return 'from-blue-500 to-cyan-500';
      case 'checked_in':
        return 'from-emerald-500 to-teal-500';
      case 'checked_out':
        return 'from-slate-500 to-slate-600';
      case 'denied':
        return 'from-rose-500 to-red-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      visitor_name: formData.visitor_name,
      visitor_phone: formData.visitor_phone || null,
      purpose: formData.purpose || null,
      expected_date: formData.expected_date,
      vehicle_number: formData.vehicle_number || null
    };

    const submitVisitor = async () => {
      try {
        const data = await apiClient.post(API_ENDPOINTS.resident.visitors, payload);
        setVisitors([data, ...visitors]);
        setFormData({
          visitor_name: '',
          purpose: '',
          expected_date: new Date().toISOString().split('T')[0],
          visitor_phone: '',
          vehicle_number: ''
        });
        setShowForm(false);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    submitVisitor();
  };

  const updateVisitorStatus = (id: string, newStatus: 'checked_in' | 'checked_out') => {
    const submitStatus = async () => {
      try {
        const updatedVisitor = await apiClient.request(`${API_ENDPOINTS.resident.visitors}/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        });
        setVisitors(visitors.map(visitor => 
          visitor.id === id ? updatedVisitor : visitor
        ));
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    submitStatus();
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Access Control</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Visitor Management</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 over:bg-[#0B4B2C]"
            >
              Register Visitor
            </button>
          </div>
          <p className="max-w-2xl text-slate-600">
            Pre-register visitors and track their entry and exit times.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {showForm && (
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-[#FBF8EF] p-6 shadow-sm backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Register New Visitor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1">
                    Visitor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.visitor_name}
                    onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-[#F6F2E8]"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.visitor_phone}
                    onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                    className="w-full rounded-lg border bg-[#F6F2E8] border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-1">
                  Purpose of Visit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full rounded-lg border bg-[#F6F2E8] border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="e.g., Personal visit, Delivery, Maintenance"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1">
                    Expected Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expected_date}
                    onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                    className="w-full rounded-lg border bg-[#F6F2E8] border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-1">
                  Vehicle Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  className="w-full rounded-lg border bg-[#F6F2E8] border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="e.g., ABC-1234"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 over:bg-[#0B4B2C]"
                >
                  Register Visitor
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
              <div key={i} className="rounded-2xl border border-slate-200 bg-[#FBF8EF] p-6 shadow-sm">
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
        ) : visitors.length > 0 ? (
          <div className="space-y-4">
            {visitors.map((visitor) => (
              <div
                key={visitor.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-[#FBF8EF] p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${getStatusColor(visitor.status || 'pending')} text-white shadow-sm`}>
                    <UserIcon className="h-5 w-5" fill="none" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{visitor.visitor_name}</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-slate-600">
                            <span className="font-medium">Purpose:</span> {visitor.purpose || 'Not specified'}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Contact:</span> {visitor.visitor_phone || 'Not provided'}
                          </p>
                          {visitor.vehicle_number && (
                            <p className="text-slate-600">
                              <span className="font-medium">Vehicle:</span> {visitor.vehicle_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium border bg-[#FBF8EF] backdrop-blur`}
                        >
                          {visitor.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                        {visitor.status === 'approved' && (
                          <button
                            onClick={() => updateVisitorStatus(visitor.id, 'checked_in')}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                          >
                            Check In
                          </button>
                        )}
                        {visitor.status === 'checked_in' && (
                          <button
                            onClick={() => updateVisitorStatus(visitor.id, 'checked_out')}
                            className="rounded-full bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      <span>Date: {new Date(visitor.expected_date).toLocaleDateString()}</span>
                      {visitor.check_in_time && (
                        <>
                          <span>•</span>
                          <span>Checked In: {new Date(visitor.check_in_time).toLocaleTimeString()}</span>
                        </>
                      )}
                      {visitor.check_out_time && (
                        <>
                          <span>•</span>
                          <span>Checked Out: {new Date(visitor.check_out_time).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-[#FBF8EF] p-12 text-center shadow-sm backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true" />
            </div>
            <p className="text-slate-600 font-medium">No visitors registered</p>
            <p className="mt-2 text-sm text-slate-500">Register your first visitor to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition hover:-translate-y-0.5"
            >
              Register Your First Visitor
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
