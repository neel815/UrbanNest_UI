'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

interface Visitor {
  id: string;
  name: string;
  purpose: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  status: 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'denied';
  contactNumber: string;
  hostName: string;
  hostUnit: string;
  approvedBy?: string;
}

type VisitorTab = 'pending' | 'approved' | 'inside' | 'history';

export default function SecurityVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<VisitorTab>('pending');
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    contactNumber: '',
    hostName: '',
    hostUnit: '',
  });

  const loadVisitors = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.security.visitors);
      setVisitors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVisitors();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-amber-500 to-orange-500';
      case 'approved':
        return 'from-blue-500 to-indigo-500';
      case 'checked_in':
        return 'from-emerald-500 to-teal-500';
      case 'checked_out':
        return 'from-slate-500 to-slate-600';
      case 'denied':
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
      hostName: formData.hostName,
      hostUnit: formData.hostUnit,
    };

    const submitVisitor = async () => {
      try {
        setError('');
        setSuccessMessage('');
        const data = await apiClient.post(API_ENDPOINTS.security.visitors, newVisitor);
        setVisitors([data, ...visitors]);
        setFormData({
          name: '',
          purpose: '',
          contactNumber: '',
          hostName: '',
          hostUnit: '',
        });
        setShowForm(false);
        setSuccessMessage('Visitor registered successfully.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to register visitor');
      }
    };

    submitVisitor();
  };

  const runVisitorAction = async (
    visitorId: string,
    endpointBuilder: (id: string) => string,
    successText: string,
  ) => {
    try {
      setError('');
      setSuccessMessage('');
      await apiClient.request(endpointBuilder(visitorId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      await loadVisitors();
      setSuccessMessage(successText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update visitor');
    }
  };

  const tabs: { key: VisitorTab; label: string; count: number }[] = [
    { key: 'pending', label: 'Pending', count: visitors.filter((v) => v.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: visitors.filter((v) => v.status === 'approved').length },
    { key: 'inside', label: 'Inside', count: visitors.filter((v) => v.status === 'checked_in').length },
    {
      key: 'history',
      label: 'History',
      count: visitors.filter((v) => v.status === 'checked_out' || v.status === 'denied').length,
    },
  ];

  const visibleVisitors = visitors.filter((visitor) => {
    if (activeTab === 'pending') return visitor.status === 'pending';
    if (activeTab === 'approved') return visitor.status === 'approved';
    if (activeTab === 'inside') return visitor.status === 'checked_in';
    return visitor.status === 'checked_out' || visitor.status === 'denied';
  });

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Visitor Management</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className={`${cormorant.className} text-4xl font-semibold tracking-tight text-[#173326] lg:text-[4.5rem]`}>Visitor Access Control</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
            >
              Register Visitor
            </button>
          </div>
          <p className="max-w-2xl text-[15px] text-[#637062]">
            Manage visitor registrations, approvals, and access control for building security.
          </p>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {successMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-[#173326] text-white shadow-[0_8px_20px_rgba(23,51,38,0.2)]'
                  : 'border border-[#D9D1BC] bg-white text-[#173326] hover:bg-[#FBF8EF]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {showForm && (
          <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
            <h2 className={`${cormorant.className} mb-4 text-3xl font-semibold tracking-tight text-[#173326]`}>Register New Visitor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                    Visitor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                  Purpose of Visit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  placeholder="e.g., Personal visit, Delivery, Maintenance"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                    Host Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hostName}
                    onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                    className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                    placeholder="Resident name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                    Host Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hostUnit}
                    onChange={(e) => setFormData({ ...formData, hostUnit: e.target.value })}
                    className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                    placeholder="A-101, B-205, etc."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
                >
                  Register Visitor
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-[#D9D1BC] bg-white px-5 py-3 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.05)] transition hover:-translate-y-0.5 hover:bg-[#FBF8EF]"
                >
                  Cancel
                </button>
              </div>
            </form>
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-[#F6F2E8] p-6 shadow-sm">
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
        ) : visibleVisitors.length > 0 ? (
          <div className="space-y-4">
            {visibleVisitors.map((visitor) => (
              <div
                key={visitor.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-[#F6F2E8] p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
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
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                        >
                          {visitor.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                        {visitor.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => runVisitorAction(visitor.id, API_ENDPOINTS.security.visitorApprove, 'Visitor approved successfully.')}
                              className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => runVisitorAction(visitor.id, API_ENDPOINTS.security.visitorDeny, 'Visitor denied successfully.')}
                              className="rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 transition"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                        {visitor.status === 'approved' && (
                          <button
                            onClick={() => runVisitorAction(visitor.id, API_ENDPOINTS.security.visitorCheckin, 'Visitor checked in successfully.')}
                            className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition"
                          >
                            Check In
                          </button>
                        )}
                        {visitor.status === 'checked_in' && (
                          <button
                            onClick={() => runVisitorAction(visitor.id, API_ENDPOINTS.security.visitorCheckout, 'Visitor checked out successfully.')}
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
            <p className="text-slate-600 font-medium">No visitors in this tab</p>
            <p className="mt-2 text-sm text-slate-500">Try another status tab or register a new visitor.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition hover:-translate-y-0.5"
            >
              Register Visitor
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
