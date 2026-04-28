'use client';

import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';

interface Visitor {
  id: number;
  name: string;
  purpose: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  status: 'expected' | 'checked_in' | 'checked_out' | 'rejected';
  contactNumber: string;
  vehicleNumber?: string;
  hostName: string;
  hostUnit: string;
  approvedBy?: string;
  notes?: string;
}

export default function SecurityVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    contactNumber: '',
    vehicleNumber: '',
    hostName: '',
    hostUnit: '',
    notes: ''
  });

  useEffect(() => {
    apiClient
      .get('/api/security/visitors')
      .then(setVisitors)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expected':
        return 'from-amber-500 to-orange-500';
      case 'checked_in':
        return 'from-emerald-500 to-teal-500';
      case 'checked_out':
        return 'from-slate-500 to-slate-600';
      case 'rejected':
        return 'from-rose-500 to-pink-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVisitor: Omit<Visitor, 'id' | 'timeIn' | 'timeOut' | 'status' | 'approvedBy'> = {
      name: formData.name,
      purpose: formData.purpose,
      date: new Date().toISOString().split('T')[0],
      contactNumber: formData.contactNumber,
      vehicleNumber: formData.vehicleNumber || undefined,
      hostName: formData.hostName,
      hostUnit: formData.hostUnit,
      notes: formData.notes || undefined
    };

    apiClient
      .post('/api/security/visitors', newVisitor)
      .then((data: Visitor) => {
        setVisitors([data, ...visitors]);
        setFormData({
          name: '',
          purpose: '',
          contactNumber: '',
          vehicleNumber: '',
          hostName: '',
          hostUnit: '',
          notes: ''
        });
        setShowForm(false);
      })
      .catch((err: Error) => setError(err.message));
  };

  const updateVisitorStatus = (id: number, newStatus: 'checked_in' | 'checked_out' | 'rejected') => {
    apiClient
      .request(`/api/security/visitors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      .then((updatedVisitor: Visitor) => {
        setVisitors(visitors.map(visitor => 
          visitor.id === id ? updatedVisitor : visitor
        ));
      })
      .catch((err: Error) => setError(err.message));
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Visitor Management</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Visitor Access Control</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition hover:-translate-y-0.5"
            >
              Register Visitor
            </button>
          </div>
          <p className="max-w-2xl text-slate-600">
            Manage visitor registrations, approvals, and access control for building security.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {showForm && (
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Register New Visitor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Visitor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Purpose of Visit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="e.g., Personal visit, Delivery, Maintenance"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Host Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hostName}
                    onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="Resident name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Host Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hostUnit}
                    onChange={(e) => setFormData({ ...formData, hostUnit: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="A-101, B-205, etc."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="e.g., ABC-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="Additional information"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition hover:-translate-y-0.5"
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
        ) : visitors.length > 0 ? (
          <div className="space-y-4">
            {visitors.map((visitor) => (
              <div
                key={visitor.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getStatusColor(visitor.status)}`} />
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${getStatusColor(visitor.status)} text-white shadow-sm`}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
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
                        <h3 className="text-lg font-semibold text-slate-900">{visitor.name}</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-slate-600">
                            <span className="font-medium">Purpose:</span> {visitor.purpose}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Host:</span> {visitor.hostName} ({visitor.hostUnit})
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Contact:</span> {visitor.contactNumber}
                          </p>
                          {visitor.vehicleNumber && (
                            <p className="text-slate-600">
                              <span className="font-medium">Vehicle:</span> {visitor.vehicleNumber}
                            </p>
                          )}
                          {visitor.notes && (
                            <p className="text-slate-600">
                              <span className="font-medium">Notes:</span> {visitor.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                        >
                          {visitor.status?.replace('_', ' ').toUpperCase() || 'EXPECTED'}
                        </span>
                        {visitor.status === 'expected' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateVisitorStatus(visitor.id, 'checked_in')}
                              className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                            >
                              Check In
                            </button>
                            <button
                              onClick={() => updateVisitorStatus(visitor.id, 'rejected')}
                              className="rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {visitor.status === 'checked_in' && (
                          <button
                            onClick={() => updateVisitorStatus(visitor.id, 'checked_out')}
                            className="rounded-full bg-slate-600 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      <span>Date: {new Date(visitor.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Time In: {visitor.timeIn}</span>
                      {visitor.timeOut && (
                        <>
                          <span>•</span>
                          <span>Time Out: {visitor.timeOut}</span>
                        </>
                      )}
                      {visitor.approvedBy && (
                        <>
                          <span>•</span>
                          <span>Approved by: {visitor.approvedBy}</span>
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
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true">
                <path
                  d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
