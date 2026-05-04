'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

interface PatrolRound {
  id: string;
  guardName: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'scheduled';
  route: string;
  checkpoints: PatrolCheckpoint[];
  incidents: number;
  notes?: string;
}

interface PatrolCheckpoint {
  id: number;
  name: string;
  location: string;
  checkedAt?: string;
  status: 'pending' | 'checked' | 'missed';
  notes?: string;
}

interface PatrolRoute {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  checkpoints: string[];
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
}

export default function SecurityPatrolPage() {
  const [patrolRounds, setPatrolRounds] = useState<PatrolRound[]>([]);
  const [patrolRoutes, setPatrolRoutes] = useState<PatrolRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'rounds' | 'routes' | 'schedule'>('rounds');
  const [showStartForm, setShowStartForm] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roundsData, routesData] = await Promise.all([
          apiClient.get(API_ENDPOINTS.security.patrolRounds),
          apiClient.get(API_ENDPOINTS.security.patrolRoutes)
        ]);
        setPatrolRounds(roundsData);
        setPatrolRoutes(routesData);
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
      case 'in_progress':
        return 'from-blue-600 to-indigo-600';
      case 'completed':
        return 'from-emerald-500 to-teal-500';
      case 'scheduled':
        return 'from-amber-500 to-orange-500';
      case 'active':
        return 'from-emerald-500 to-teal-500';
      case 'inactive':
        return 'from-slate-500 to-slate-600';
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

  const startPatrolRound = (routeId: string) => {
    const submitPatrol = async () => {
      try {
        const newRound = await apiClient.post(API_ENDPOINTS.security.patrolRounds, { routeId });
        setPatrolRounds([newRound, ...patrolRounds]);
        setShowStartForm(false);
        setSelectedRoute('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start patrol');
      }
    };

    submitPatrol();
  };

  const completePatrolRound = (roundId: string) => {
    const finishPatrol = async () => {
      try {
        const updatedRound = await apiClient.request(API_ENDPOINTS.security.completePatrolRound(roundId), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        setPatrolRounds(patrolRounds.map(round => 
          round.id === roundId ? updatedRound : round
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete patrol');
      }
    };

    finishPatrol();
  };

  const checkCheckpoint = (roundId: string, checkpointId: number, notes?: string) => {
    const submitCheckpoint = async () => {
      try {
        const updatedRound = await apiClient.post(API_ENDPOINTS.security.checkCheckpoint(roundId, checkpointId), { notes });
        setPatrolRounds(patrolRounds.map(round => 
          round.id === roundId ? updatedRound : round
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update checkpoint');
      }
    };

    submitCheckpoint();
  };

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Patrol Operations</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className={`${cormorant.className} text-4xl font-semibold leading-none tracking-tight text-[#173326] lg:text-[4.5rem] lg:leading-[0.9]`}>Security Patrol</h1>
            <button
              onClick={() => setShowStartForm(!showStartForm)}
              className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
            >
              Start New Patrol
            </button>
          </div>
          <p className="max-w-2xl text-[15px] leading-7 text-[#637062]">
            Manage security patrol rounds, monitor checkpoint completion, and track incident reporting.
          </p>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Start Patrol Form */}
        {showStartForm && (
          <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0F5B35] to-[#1D6A44]" />
            <h2 className={`${cormorant.className} mb-4 text-3xl font-semibold tracking-tight text-[#173326]`}>Start New Patrol Round</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">
                  Select Patrol Route *
                </label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                >
                  <option value="">Choose a route...</option>
                  {patrolRoutes.filter(route => route.isActive).map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name} ({route.estimatedDuration} min)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startPatrolRound(selectedRoute)}
                  disabled={selectedRoute === ''}
                  className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Patrol
                </button>
                <button
                  onClick={() => {
                    setShowStartForm(false);
                    setSelectedRoute('');
                  }}
                  className="rounded-full border border-[#D9D1BC] bg-white px-5 py-3 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.05)] transition hover:-translate-y-0.5 hover:bg-[#FBF8EF]"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-2 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('rounds')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'rounds'
                  ? 'bg-[#0F5B35] text-[#F7F4E8]'
                  : 'text-[#637062] hover:bg-[#F4F0E4]'
              }`}
            >
              Active Rounds
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'routes'
                  ? 'bg-[#0F5B35] text-[#F7F4E4]'
                  : 'text-[#637062] hover:bg-[#F4F0E4]'
              }`}
            >
              Patrol Routes
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'schedule'
                  ? 'bg-[#0F5B35] text-[#F7F4E4]'
                  : 'text-[#637062] hover:bg-[#F4F0E4]'
              }`}
            >
              Schedule
            </button>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
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
        ) : activeTab === 'rounds' && patrolRounds.length > 0 ? (
          <div className="space-y-4">
            {patrolRounds.map((round) => (
              <div
                key={round.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getStatusColor(round.status)}`} />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{round.route}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {round.status?.replace('_', ' ').toUpperCase() || 'IN_PROGRESS'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-slate-600">
                        <span className="font-medium">Guard:</span> {round.guardName}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Start Time:</span> {new Date(round.startTime).toLocaleString()}
                      </p>
                      {round.endTime && (
                        <p className="text-slate-600">
                          <span className="font-medium">End Time:</span> {new Date(round.endTime).toLocaleString()}
                        </p>
                      )}
                      <p className="text-slate-600">
                        <span className="font-medium">Checkpoints:</span> {round.checkpoints.filter(cp => cp.status === 'checked').length}/{round.checkpoints.length}
                      </p>
                      {round.incidents > 0 && (
                        <p className="text-slate-600">
                          <span className="font-medium">Incidents:</span> {round.incidents}
                        </p>
                      )}
                      {round.notes && (
                        <p className="text-slate-600">
                          <span className="font-medium">Notes:</span> {round.notes}
                        </p>
                      )}
                    </div>
                    
                    {/* Checkpoints */}
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-slate-700">Checkpoints:</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {round.checkpoints.map((checkpoint) => (
                          <div
                            key={checkpoint.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${
                                checkpoint.status === 'checked' ? 'bg-emerald-500' :
                                checkpoint.status === 'missed' ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              <span className="text-sm text-slate-700">{checkpoint.name}</span>
                            </div>
                            {round.status === 'in_progress' && checkpoint.status === 'pending' && (
                              <button
                                onClick={() => checkCheckpoint(round.id, checkpoint.id)}
                                className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                              >
                                Check
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {round.status === 'in_progress' && (
                      <button
                        onClick={() => completePatrolRound(round.id)}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Complete Round
                      </button>
                    )}
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : activeTab === 'routes' && patrolRoutes.length > 0 ? (
          <div className="space-y-4">
            {patrolRoutes.map((route) => (
              <div
                key={route.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getPriorityColor(route.priority)}`} />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{route.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {route.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                      >
                        {route.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-slate-600">{route.description}</p>
                      <p className="text-slate-600">
                        <span className="font-medium">Duration:</span> {route.estimatedDuration} minutes
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Checkpoints:</span> {route.checkpoints.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : activeTab === 'schedule' ? (
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
            <p className="text-slate-600 font-medium">Patrol Schedule Coming Soon</p>
            <p className="mt-2 text-sm text-slate-500">Advanced scheduling features will be available in the next update.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true">
                <path
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">
              {activeTab === 'rounds' ? 'No active patrol rounds' : 'No patrol routes configured'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === 'rounds' 
                ? 'Start a new patrol round to begin monitoring security checkpoints.' 
                : 'Configure patrol routes to define security monitoring paths.'
              }
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
