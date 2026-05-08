'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import AlertBoldIcon from '@/assets/icons/alert-bold.svg';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'security' | 'safety' | 'maintenance' | 'emergency' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
  attachments?: string[];
}

export default function SecurityIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'security' as Incident['type'],
    severity: 'medium' as Incident['severity'],
    location: '',
    attachments: [] as File[]
  });

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.security.incidents);
        setIncidents(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'from-rose-500 to-pink-500';
      case 'safety':
        return 'from-amber-500 to-orange-500';
      case 'maintenance':
        return 'from-blue-600 to-indigo-600';
      case 'emergency':
        return 'from-red-600 to-rose-600';
      case 'other':
        return 'from-slate-500 to-slate-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-600 to-rose-600';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'from-slate-500 to-slate-600';
      case 'investigating':
        return 'from-blue-600 to-indigo-600';
      case 'resolved':
        return 'from-emerald-500 to-teal-500';
      case 'closed':
        return 'from-slate-600 to-slate-700';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIncident: Omit<Incident, 'id' | 'reportedBy' | 'reportedAt' | 'status' | 'assignedTo' | 'resolvedAt' | 'resolution'> = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      severity: formData.severity,
      location: formData.location,
      attachments: formData.attachments.map(file => file.name)
    };

    const submitIncident = async () => {
      try {
        const data = await apiClient.post(API_ENDPOINTS.security.incidents, newIncident);
        setIncidents([data, ...incidents]);
        setFormData({
          title: '',
          description: '',
          type: 'security',
          severity: 'medium',
          location: '',
          attachments: []
        });
        setShowForm(false);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    submitIncident();
  };

  const updateIncidentStatus = (id: string, newStatus: 'investigating' | 'resolved' | 'closed', resolution?: string) => {
    const submitUpdate = async () => {
      try {
        const updatedIncident = await apiClient.request(API_ENDPOINTS.security.updateIncident(id), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus, resolution })
        });
        setIncidents(incidents.map(incident => 
          incident.id === id ? updatedIncident : incident
        ));
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    submitUpdate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        attachments: Array.from(e.target.files)
      });
    }
  };

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Incident Management</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className={`${cormorant.className} text-4xl font-semibold leading-none tracking-tight text-[#173326] lg:text-[4.5rem] lg:leading-[0.9]`}>Incident Reporting</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
            >
              Report Incident
            </button>
          </div>
          <p className="max-w-2xl text-[15px] leading-7 text-[#637062]">
            Track, manage, and resolve security incidents with comprehensive reporting and status monitoring.
          </p>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Report Incident Form */}
        {showForm && (
          <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
            <h2 className={`${cormorant.className} mb-4 text-3xl font-semibold tracking-tight text-[#173326]`}>Report New Incident</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  placeholder="Brief description of the incident"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                  Detailed Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  rows={4}
                  placeholder="Provide detailed information about the incident"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                    Incident Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Incident['type'] })}
                    className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  >
                    <option value="security">Security</option>
                    <option value="safety">Safety</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                    Severity Level *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as Incident['severity'] })}
                    className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  placeholder="Where did the incident occur?"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                {formData.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.attachments.map((file, index) => (
                      <p key={index} className="text-xs text-slate-600">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
                >
                  Report Incident
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
        ) : incidents.length > 0 ? (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${getTypeColor(incident.type)} text-white shadow-sm`}>
                    <AlertBoldIcon className="h-5 w-5" fill="none" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{incident.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                          >
                            {incident.type?.toUpperCase() || 'SECURITY'}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                          >
                            {incident.severity?.toUpperCase() || 'MEDIUM'}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                          >
                            {incident.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {incident.status === 'open' && (
                          <button
                            onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                            className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition"
                          >
                            Start Investigation
                          </button>
                        )}
                        {incident.status === 'investigating' && (
                          <button
                            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                            className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {incident.status === 'resolved' && (
                          <button
                            onClick={() => updateIncidentStatus(incident.id, 'closed')}
                            className="rounded-full bg-slate-600 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition"
                          >
                            Close Case
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-slate-600">{incident.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-medium">Location:</span> {incident.location}
                      </div>
                      <div>
                        <span className="font-medium">Reported by:</span> {incident.reportedBy}
                      </div>
                      <div>
                        <span className="font-medium">Reported at:</span> {new Date(incident.reportedAt).toLocaleString()}
                      </div>
                      {incident.assignedTo && (
                        <div>
                          <span className="font-medium">Assigned to:</span> {incident.assignedTo}
                        </div>
                      )}
                      {incident.resolvedAt && (
                        <div>
                          <span className="font-medium">Resolved at:</span> {new Date(incident.resolvedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {incident.resolution && (
                      <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-sm font-medium text-emerald-900">Resolution:</p>
                        <p className="text-sm text-emerald-800">{incident.resolution}</p>
                      </div>
                    )}
                    {incident.attachments && incident.attachments.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {incident.attachments.map((attachment, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                            >
                              {attachment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-[#F6F2E8] p-12 text-center shadow-sm backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
              <AlertBoldIcon className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true" />
            </div>
            <p className="text-slate-600 font-medium">No incidents reported</p>
            <p className="mt-2 text-sm text-slate-500">Report your first incident to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
            >
              Report Your First Incident
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
