'use client';

import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';

interface AccessPoint {
  id: number;
  name: string;
  type: 'gate' | 'door' | 'elevator' | 'parking';
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'alert';
  lastAccess: string;
  accessCount: number;
  restrictions: string[];
}

interface AccessLog {
  id: number;
  accessPoint: string;
  personName: string;
  personType: 'resident' | 'visitor' | 'staff' | 'delivery';
  accessType: 'entry' | 'exit';
  timestamp: string;
  status: 'granted' | 'denied' | 'alert';
  method: 'keycard' | 'biometric' | 'pin' | 'manual';
}

export default function SecurityAccessControlPage() {
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'points' | 'logs'>('points');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pointsData, logsData] = await Promise.all([
          apiClient.get('/api/security/access-points'),
          apiClient.get('/api/security/access-logs')
        ]);
        setAccessPoints(pointsData);
        setAccessLogs(logsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'from-emerald-500 to-teal-500';
      case 'inactive':
        return 'from-slate-500 to-slate-600';
      case 'maintenance':
        return 'from-amber-500 to-orange-500';
      case 'alert':
        return 'from-rose-500 to-pink-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getAccessStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'from-emerald-500 to-teal-500';
      case 'denied':
        return 'from-rose-500 to-pink-500';
      case 'alert':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getPersonTypeColor = (type: string) => {
    switch (type) {
      case 'resident':
        return 'from-blue-600 to-indigo-600';
      case 'visitor':
        return 'from-emerald-500 to-teal-500';
      case 'staff':
        return 'from-violet-600 to-fuchsia-600';
      case 'delivery':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const toggleAccessPoint = (id: number) => {
    apiClient
      .request(`/api/security/access-points/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then((updatedPoint: AccessPoint) => {
        setAccessPoints(accessPoints.map(point => 
          point.id === id ? updatedPoint : point
        ));
      })
      .catch((err: Error) => setError(err.message));
  };

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Access Control</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Access Management</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              System Online
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Monitor and control building access points, manage entry permissions, and review access logs.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-2 shadow-sm backdrop-blur">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('points')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'points'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Access Points
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'logs'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Access Logs
            </button>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
        </div>

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
        ) : activeTab === 'points' && accessPoints.length > 0 ? (
          <div className="space-y-4">
            {accessPoints.map((point) => (
              <div
                key={point.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getStatusColor(point.status)}`} />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{point.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {point.type?.toUpperCase() || 'GATE'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {point.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-slate-600">
                        <span className="font-medium">Location:</span> {point.location}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Last Access:</span> {new Date(point.lastAccess).toLocaleString()}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Access Count Today:</span> {point.accessCount}
                      </p>
                      {point.restrictions.length > 0 && (
                        <p className="text-slate-600">
                          <span className="font-medium">Restrictions:</span> {point.restrictions.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleAccessPoint(point.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                        point.status === 'active'
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {point.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : activeTab === 'logs' && accessLogs.length > 0 ? (
          <div className="space-y-4">
            {accessLogs.map((log) => (
              <div
                key={log.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getAccessStatusColor(log.status)}`} />
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${getAccessStatusColor(log.status)} text-white shadow-sm`}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{log.personName}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {log.personType?.toUpperCase() || 'RESIDENT'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {log.accessType?.toUpperCase() || 'ENTRY'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {log.status?.toUpperCase() || 'GRANTED'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-slate-600">
                        <span className="font-medium">Access Point:</span> {log.accessPoint}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Method:</span> {log.method || 'keycard'}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Time:</span> {new Date(log.timestamp).toLocaleString()}
                      </p>
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">
              {activeTab === 'points' ? 'No access points configured' : 'No access logs available'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === 'points' 
                ? 'Configure access points to monitor building entry and exit.' 
                : 'Access logs will appear here as people use the access control system.'
              }
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
